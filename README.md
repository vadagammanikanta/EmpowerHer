# EmpowerHer: Your Intelligent Period & Cycle Companion

EmpowerHer is a modern, high-fidelity full-stack web application designed to support women's reproductive health, cycle tracking, and physical wellness. This application transforms typical period tracking into an interactive experience featuring mathematical cycle regularity analysis, clinical physical guidelines, and a dynamic medical AI copilot powered by **Google Gemini**.



---

## 🌟 Core Features

-   **Dynamic Cycle Dashboard:** Keeps track of your reproductive rhythm. It computes chronological distance calculations, highlights milestones, and renders a visually engaging SVG progress countdown circle illustrating cycle completions.
-   **Cycle Logs & 12-Month Calendar Grid:** Log cycle start dates, flow levels, matching physical symptoms (bloating, cramps, fatigue, etc.), and custom personal notes. Features a fully custom 12-Month Calendar that highlights logged dates.
-   **Clinical Cycle Regularity Checks:** Evaluates logged intervals and variance against standard clinical parameters (typical 21-35 day durations with <= 5 days of variance) to inform you of regular or irregular cycle configurations, accompanied by high-contrast visual status boards.
-   **Specialist Health Guidelines:** Category-oriented carousels (Menstruation tips, Fitness loops, and Nutrition menus) packed with medical wellness strategies.
-   **Gemini-Powered AI Chatbot:** Multi-turn educational discussion partner. Ask customizable free-text symptoms queries or click fast-action buttons for instantaneous clinical summaries.

---

## 🛠️ The Tech Stack

-   **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide icons, ES Modules.
-   **Backend:** Express.js, TypeScript, Node.js.
-   **Database:** MongoDB Atlas (Mongoose Object Modeling) with built-in zero-config local JSON file fallback (`data_db.json`) for effortless development preview.
-   **Artificial Intelligence:** Google Gemini AI Model (via `@google/genai` TypeScript SDK).
-   **Bundler & Builder:** Vite + Esbuild.

---

## 🛫 Setup & Installation

### Prerequisite Checklist
Make sure you have Node.js (version 18+) and MongoDB installed locally, or secure a free database cluster on **MongoDB Atlas**.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd empowerher
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

# Google Gemini API Key (Required for AI Chatbot)
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"

# MongoDB Connection String (Required for Cloud Database)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/empowerher?retryWrites=true&w=majority"
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

For deployment (e.g., heroku, render, digitalocean, cloud run), use the automated bundler configured in `package.json`:

```bash
# Compiles React static files and bundles Express utilizing Esbuild into CJS
npm run build

# Boots the production-ready server
npm start
```

### Production Bundling Workflow
-   `npm run build` runs the standard Vite command resulting in high-density web assets inside `/dist`.
-   It uses **esbuild** to compile `server.ts` into a fully bundled, production-hardened CommonJS module named `/dist/server.cjs`. This avoids ES Module path resolution errors on remote machines.

---

## ⚠️ Medical Disclaimer
The statistics, countdown estimates, and AI model chatbot suggestions provided by this application are for general educational purposes only. They do not constitute formal medical evaluations and should not substitute assessment by an OB-GYN or standard clinical practitioner.
