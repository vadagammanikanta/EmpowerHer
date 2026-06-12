# EmpowerHer: Your Intelligent Period & Cycle Companion

🚀 **Live Demo:** [https://empowerher-o3bw.onrender.com/](https://empowerher-o3bw.onrender.com/)

EmpowerHer is a modern, high-fidelity full-stack web application designed to support women's reproductive health, cycle tracking, and physical wellness. This application transforms typical period tracking into an interactive experience featuring mathematical cycle regularity analysis, physical guidelines, and a ultra-fast medical AI copilot powered by **Groq** (with a **Google Gemini** fallback).

---

## 🌟 Core Features

- **Dynamic Cycle Dashboard:** Keeps track of your reproductive rhythm. It computes chronological distance calculations, highlights milestones, and renders a visually engaging SVG progress countdown circle illustrating cycle completions.
- **Cycle Logs & 12-Month Calendar Grid:** Log cycle start dates, flow levels, matching physical symptoms (bloating, cramps, fatigue, etc.), and custom personal notes. Features a fully custom 12-Month Calendar that highlights logged dates.
- **Clinical Cycle Regularity Checks:** Evaluates logged intervals and variance against standard clinical parameters (typical 21-35 day durations with <= 5 days of variance) to inform you of regular or irregular cycle configurations, accompanied by high-contrast visual status boards.
- **Specialist Health Guidelines:** Category-oriented carousels (Menstruation tips, Fitness loops, and Nutrition menus) packed with medical wellness strategies.
- **Groq-Powered AI Chatbot:** Multi-turn educational discussion partner. Ask customizable free-text symptoms queries or click fast-action buttons for instantaneous clinical summaries.
- **Premium Aesthetics:** Sleek design supporting responsive layouts, dark/light modes, and frosted glass components.

---

## 🛠️ The Tech Stack

- **Frontend:** React 19, JavaScript (ES Modules), Tailwind CSS v4, Lucide icons.
- **Backend:** Express.js, Node.js.
- **Database:** MongoDB Atlas (Mongoose Object Modeling) with built-in zero-config local JSON file fallback (`data_db.json`) for effortless development preview.
- **Artificial Intelligence:** Groq API (default model: `llama-3.3-70b-versatile`) for ultra-low latency responses, with automatic fallback to **Google Gemini API** (`gemini-1.5-flash`).
- **Bundler & Builder:** Vite + Express Dev Server.

---

## 🛫 Setup & Installation

### Prerequisite Checklist
Make sure you have Node.js (version 18+) installed. MongoDB is optional (falls back to local file storage if not configured).

### 1. Clone the Repository
```bash
git clone https://github.com/vadagammanikanta/EmpowerHer.git
cd EmpowerHer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add the following config keys:

```env
# Server Ingress Port (Optional - defaults to 3000)
PORT=3000

# Groq API Key (Preferred for ultra-fast AI Chatbot)
GROQ_API_KEY="YOUR_GROQ_API_KEY"

# Google Gemini API Key (Optional fallback)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# MongoDB Connection String (Optional - falls back to data_db.json if empty)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/empowerher"
```

---

## 🚀 Running the App Locally

### **Development Mode**
Launches the backend server and Vite frontend asset proxy in parallel mode with hot-reloading:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Production Build & Deployment

For deployment (e.g., Render, Railway, VPS), use the automated builder configured in `package.json`:

```bash
# Compiles React static files into /dist
npm run build

# Boots the production-ready Express server (which hosts the compiled static files)
npm start
```

---

## ⚠️ Medical Disclaimer
The statistics, countdown estimates, and AI model chatbot suggestions provided by this application are for general educational purposes only. They do not constitute formal medical evaluations and should not substitute assessment by an OB-GYN or standard clinical practitioner.
