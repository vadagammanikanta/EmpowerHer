import express from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

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

interface LocalLog {
  id: string;
  date: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  mood?: string;
  notes?: string;
}

function readLocalLogs(): LocalLog[] {
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

function writeLocalLogs(logs: LocalLog[]) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local database file:', error);
  }
}

// ==========================================
// 3. Lazy-initialized Google Gemini Client
// ==========================================
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined. Please verify it in Settings > Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
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
  } catch (error: any) {
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
      const newLog: LocalLog = {
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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Error deleting period log:', error);
    res.status(500).json({ error: 'Failed to delete cycle log', details: error.message });
  }
});

// POST chatbot query route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'No user message provided' });
    }

    const ai = getGeminiAI();
    
    const systemInstruction = `
You are the interactive health assistant for EmpowerHer, a period and cycle tracking website. 
Your goal is to friendly, supportively, and accurately answer women's health, menstruation, ovulation, fitness, and nutrition questions.
Adhere to the following clinical communication standards:
1. Provide structured, clean, bulleted summaries that are easily digestible.
2. Maintain a compassionate, educational, professional, and positive tone.
3. Include an elegant markdown-formatted structure (headings, bold text).
4. Do NOT give definitive medical diagnoses. Suggest consulting a healthcare professional for severe or persistent pain/irregularities.
5. If the query is completely unrelated to biology, healthcare, hygiene, wellness, physical wellness, or women's health, politely redirect the conversation back to EmpowerHer topics.
`;

    let contents: any = message;
    if (history && Array.isArray(history) && history.length > 0) {
      contents = [
        ...history.map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const aiResponseText = response.text || "I'm sorry, I encountered an issue formulating an answer. Please try again.";
    return res.json({ text: aiResponseText });

  } catch (error: any) {
    console.error('Gemini API call failure:', error);
    return res.status(500).json({
      error: 'Failed to fetch response from Gemini AI',
      details: error.message || 'Make sure your GEMINI_API_KEY is configured correctly.'
    });
  }
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
