import express from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// @google/genai SDK removed — using raw fetch for max key format compatibility
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// 1. Mongoose Database Schema Setup
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || '';
let isMongoConnected = false;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const LogSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  flow: { type: String, enum: ['light', 'medium', 'heavy'], default: 'medium' },
  symptoms: [{ type: String }],
  mood: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const LogModel = mongoose.models.Log || mongoose.model('Log', LogSchema);

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB Connected successfully!');
      isMongoConnected = true;
    })
    .catch(err => {
      console.error('MongoDB connection error. Falling back to robust local file storage:', err.message);
    });
} else {
  console.log('No MONGODB_URI configured. EmpowerHer is running in graceful, zero-config local JSON database preview mode.');
}

// ==========================================
// 2. Safe Fallback Database Handler for AI Studio Preview
// ==========================================
const DB_FILE_PATH = path.join(process.cwd(), 'data_db.json');

function readLocalLogs() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading local database file:', error);
  }
  return [];
}

function writeLocalLogs(logs) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local database file:', error);
  }
}

// ==========================================
// 3. Gemini REST API caller (SDK-free, max compatibility)
// ==========================================
async function callGemini(apiKey, contents, systemInstruction) {
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: Array.isArray(contents)
      ? contents
      : [{ role: 'user', parts: [{ text: contents }] }],
    generationConfig: { temperature: 0.7 }
  });

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  // Strategy 1: API key as query param (works for AIzaSy... keys)
  // Strategy 2: Bearer token (works for AQ. / OAuth2 tokens)
  const strategies = [
    (model) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      headers: { 'Content-Type': 'application/json' }
    }),
    (model) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
    }),
    (model) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }
    })
  ];

  for (const model of models) {
    for (const strategy of strategies) {
      const { url, headers } = strategy(model);
      try {
        const res = await fetch(url, { method: 'POST', headers, body });
        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`✓ Gemini success: model=${model}`);
            return text;
          }
        } else {
          const errJson = await res.json().catch(() => ({}));
          console.warn(`✗ ${model} [${res.status}]: ${errJson?.error?.message || 'unknown'}`);
        }
      } catch (err) {
        console.warn(`✗ ${model} fetch error:`, err.message);
      }
    }
  }

  const isAQToken = apiKey && apiKey.startsWith('AQ.');
  const errorMsg = isAQToken 
    ? 'The API key starting with "AQ." in your .env file is a temporary OAuth2 token and has expired. Please obtain a permanent API key starting with "AIzaSy" from Google AI Studio (https://aistudio.google.com/app/apikey) and configure it as GEMINI_API_KEY in .env.'
    : 'All Gemini models and authentication strategies failed. Please verify your GEMINI_API_KEY in the .env file and ensure it is a valid key from Google AI Studio (https://aistudio.google.com/app/apikey).';
  throw new Error(errorMsg);
}

async function callGroq(apiKey, messages) {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-8b-8192'];
  let lastError = 'All Groq models failed.';

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7
        })
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) {
          console.log(`✓ Groq success: model=${model}`);
          return text;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson?.error?.message || `HTTP error ${res.status}`;
        console.warn(`✗ Groq ${model} [${res.status}]: ${lastError}`);
      }
    } catch (err) {
      lastError = err.message;
      console.warn(`✗ Groq ${model} fetch error:`, err.message);
    }
  }

  throw new Error(`Groq API error: ${lastError}`);
}

// ==========================================
// 4. REST API Endpoints
// ==========================================

// GET all cycle logs
app.get('/api/logs', async (req, res) => {
  try {
    if (isMongoConnected) {
      const dbLogs = await LogModel.find().sort({ date: -1 });
      const logs = dbLogs.map(l => ({
        id: l._id.toString(),
        date: l.date,
        flow: l.flow,
        symptoms: l.symptoms,
        mood: l.mood,
        notes: l.notes
      }));
      return res.json(logs);
    } else {
      const logs = readLocalLogs().sort((a, b) => b.date.localeCompare(a.date));
      return res.json(logs);
    }
  } catch (error) {
    console.error('Error querying period logs:', error);
    res.status(500).json({ error: 'Failed to fetch cycle logs', details: error.message });
  }
});

// CREATE a new cycle log
app.post('/api/logs', async (req, res) => {
  try {
    const { date, flow, symptoms, mood, notes } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is a required field' });
    }

    if (isMongoConnected) {
      const newLogDoc = new LogModel({ date, flow, symptoms, mood, notes });
      await newLogDoc.save();
      return res.status(201).json({
        id: newLogDoc._id.toString(),
        date,
        flow,
        symptoms,
        mood,
        notes
      });
    } else {
      const currentLogs = readLocalLogs();
      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        date,
        flow: flow || 'medium',
        symptoms: symptoms || [],
        mood: mood || '',
        notes: notes || ''
      };
      currentLogs.push(newLog);
      writeLocalLogs(currentLogs);
      return res.status(201).json(newLog);
    }
  } catch (error) {
    console.error('Error creating period log:', error);
    res.status(500).json({ error: 'Failed to create cycle log', details: error.message });
  }
});

// DELETE a cycle log
app.delete('/api/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Log ID is required' });
    }

    if (isMongoConnected) {
      const result = await LogModel.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Log entry not found in MongoDB' });
      }
      return res.json({ success: true, message: 'Log entry deleted from MongoDB' });
    } else {
      const currentLogs = readLocalLogs();
      const filtered = currentLogs.filter(l => l.id !== id);
      if (filtered.length === currentLogs.length) {
        return res.status(404).json({ error: 'Log entry not found' });
      }
      writeLocalLogs(filtered);
      return res.json({ success: true, message: 'Log entry deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting period log:', error);
    res.status(500).json({ error: 'Failed to delete cycle log', details: error.message });
  }
});

// UPDATE a cycle log
app.put('/api/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, flow, symptoms, mood, notes } = req.body;
    if (!id) return res.status(400).json({ error: 'Log ID is required' });

    if (isMongoConnected) {
      const updated = await LogModel.findByIdAndUpdate(
        id,
        { date, flow, symptoms, mood, notes },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Log entry not found' });
      return res.json({ id: updated._id.toString(), date: updated.date, flow: updated.flow, symptoms: updated.symptoms, mood: updated.mood, notes: updated.notes });
    } else {
      const currentLogs = readLocalLogs();
      const idx = currentLogs.findIndex(l => l.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Log entry not found' });
      currentLogs[idx] = { ...currentLogs[idx], date: date || currentLogs[idx].date, flow: flow || currentLogs[idx].flow, symptoms: symptoms ?? currentLogs[idx].symptoms, mood: mood ?? currentLogs[idx].mood, notes: notes ?? currentLogs[idx].notes };
      writeLocalLogs(currentLogs);
      return res.json(currentLogs[idx]);
    }
  } catch (error) {
    console.error('Error updating period log:', error);
    res.status(500).json({ error: 'Failed to update cycle log', details: error.message });
  }
});

// POST chatbot query route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'No user message provided' });

    const systemInstruction = `You are the interactive health assistant for EmpowerHer, a period and cycle tracking website.
Your goal is to friendly, supportively, and accurately answer women's health, menstruation, ovulation, fitness, and nutrition questions.
1. Provide structured, clean, bulleted summaries that are easily digestible.
2. Maintain a compassionate, educational, professional, and positive tone.
3. Include elegant markdown-formatted structure (headings, bold text).
4. Do NOT give definitive medical diagnoses. Suggest consulting a healthcare professional for severe or persistent issues.
5. If the query is unrelated to health/wellness, politely redirect back to EmpowerHer topics.`;

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (groqKey && groqKey !== 'your_groq_api_key_here') {
      // Use Groq (OpenAI-compatible format)
      let messages = [
        { role: 'system', content: systemInstruction }
      ];
      if (history && Array.isArray(history)) {
        history.forEach(h => {
          messages.push({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.text
          });
        });
      }
      messages.push({ role: 'user', content: message });

      const aiResponseText = await callGroq(groqKey, messages);
      return res.json({ text: aiResponseText });
    } else if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      // Fallback to Gemini
      let contents;
      if (history && Array.isArray(history) && history.length > 0) {
        contents = [
          ...history.map((h) => ({ role: h.sender === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
          { role: 'user', parts: [{ text: message }] }
        ];
      } else {
        contents = [{ role: 'user', parts: [{ text: message }] }];
      }

      const aiResponseText = await callGemini(geminiKey, contents, systemInstruction);
      return res.json({ text: aiResponseText });
    } else {
      return res.status(400).json({
        error: 'No AI service configured',
        details: 'Please set either GROQ_API_KEY or GEMINI_API_KEY in your .env file.'
      });
    }

  } catch (error) {
    console.error('AI API call failure:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch response from AI Service',
      details: error.message
    });
  }
});

// GET health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongo: isMongoConnected });
});

// ==========================================
// 5. Host & Dev Server Orchestration
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite dev server middlewares
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EmpowerHer server booted successfully at http://localhost:${PORT}`);
  });
}

startServer();
