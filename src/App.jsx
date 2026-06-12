import React, { useEffect, useState, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import CycleLogs from './components/CycleLogs';
import HealthCheck from './components/HealthCheck';
import HealthTips from './components/HealthTips';
import Chatbot from './components/Chatbot';
import { Heart, Home, Calendar, ShieldCheck, HelpCircle, AlertCircle, RefreshCw, Sun, Moon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [systemLogsError, setSystemLogsError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('empowerher-dark') === 'true';
    } catch {
      return false;
    }
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('empowerher-dark', String(darkMode));
    } catch {}
  }, [darkMode]);

  // Fetch all logged cycle dates from the backend
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    setSystemLogsError('');
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error(`HTTP error ${response.status}: Failed to synchronize cycle logs`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error in fetching period logs:', error);
      setSystemLogsError(error.message || 'Connecting to backend...');
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Add a new cycle log
  const handleAddLog = async (newLog) => {
    setIsSubmittingLog(true);
    setSystemLogsError('');
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (!response.ok) throw new Error('Failed to create new log entry.');
      const savedLog = await response.json();
      setLogs(prev => [savedLog, ...prev]);
    } catch (error) {
      console.error('Error adding log entry:', error);
      setSystemLogsError(error.message || 'Could not save cycle log.');
      throw error;
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Edit an existing cycle log
  const handleEditLog = async (id, updatedLog) => {
    setSystemLogsError('');
    try {
      const response = await fetch(`/api/logs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLog),
      });
      if (!response.ok) throw new Error('Failed to update log entry.');
      const updated = await response.json();
      setLogs(prev => prev.map(l => l.id === id ? updated : l));
    } catch (error) {
      console.error('Error editing log entry:', error);
      setSystemLogsError(error.message || 'Could not update log.');
      throw error;
    }
  };

  // Delete a cycle log
  const handleDeleteLog = async (id) => {
    setSystemLogsError('');
    try {
      const response = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete log entry.');
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting log entry:', error);
      setSystemLogsError(error.message || 'Could not delete log.');
      throw error;
    }
  };

  // Gemini chat
  const handleSendChatMessage = async (userMessageText) => {
    setIsGeneratingChat(true);
    const now = new Date();
    const userMsg = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: userMessageText,
      timestamp: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText, history: chatHistory }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errDetails = errorData.details ? ` (${errorData.details})` : '';
        throw new Error((errorData.error || 'Server error calling AI backend.') + errDetails);
      }
      const replyData = await response.json();
      const botMsg = {
        id: 'msg_bot_' + Date.now(),
        sender: 'bot',
        text: replyData.text,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error communicating with Gemini:', error);
      const errorMsg = {
        id: 'msg_err_' + Date.now(),
        sender: 'bot',
        text: `⚠️ **AI Chat Error:** ${error.message}`,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
      throw error;
    } finally {
      setIsGeneratingChat(false);
    }
  };

  const handleClearChatHistory = () => setChatHistory([]);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Home', Icon: Home },
    { id: 'logs', label: 'Logs', Icon: Calendar },
    { id: 'tips', label: 'Health Tips', Icon: AlertCircle },
    { id: 'healthcheck', label: 'Health Check', Icon: ShieldCheck },
    { id: 'chatbot', label: 'Chatbot', Icon: HelpCircle },
  ];

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard logs={logs} isLoading={isLoadingLogs} onNavigate={setActiveTab} onRefresh={fetchLogs} />;
      case 'logs':
        return <CycleLogs logs={logs} onAddLog={handleAddLog} onEditLog={handleEditLog} onDeleteLog={handleDeleteLog} isSubmitting={isSubmittingLog} />;
      case 'healthcheck':
        return <HealthCheck logs={logs} />;
      case 'tips':
        return <HealthTips />;
      case 'chatbot':
        return <Chatbot chatHistory={chatHistory} onSendMessage={handleSendChatMessage} onClearHistory={handleClearChatHistory} isGenerating={isGeneratingChat} />;
      default:
        return <Dashboard logs={logs} isLoading={isLoadingLogs} onNavigate={setActiveTab} onRefresh={fetchLogs} />;
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* HEADER */}
      <div className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 cursor-pointer select-none">
              <div className="h-10 w-10 hero-gradient rounded-xl flex items-center justify-center text-white shadow-md shadow-pink-200/50">
                <Heart className="h-5 w-5 animate-pulse" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                EmpowerHer
              </span>
            </div>

            {/* Actions: Navigation Links & Dark Mode/Sync Toggle */}
            <div className="flex items-center gap-4">
              {/* Nav Menu */}
              <nav className="flex items-center space-x-1">
                {NAV_ITEMS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer select-none ${
                      activeTab === id
                        ? 'bg-pink-500 text-white shadow-sm shadow-pink-200'
                        : 'hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-950/40'
                    }`}
                    style={activeTab !== id ? { color: 'var(--text-secondary)' } : {}}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden md:inline">{label}</span>
                  </button>
                ))}
              </nav>

              {/* Sync + Dark Mode Toggle */}
              <div className="flex items-center gap-2">
                {isLoadingLogs && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded border" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </div>
                )}
                <button
                  id="darkModeToggle"
                  onClick={() => setDarkMode(d => !d)}
                  className="h-9 w-9 rounded-xl flex items-center justify-center border transition hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-500" />}
                </button>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ERROR BANNER */}
      {systemLogsError && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/50 p-2 text-center text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center justify-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{systemLogsError}</span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full animate-fade-in-up">
        {renderActiveSection()}
      </main>

      {/* FOOTER */}
      <footer className="border-t" style={{ backgroundColor: darkMode ? '#0d0b0c' : '#0f172a', borderColor: darkMode ? '#1c181a' : '#1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left items-start">
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="h-7 w-7 bg-pink-500/20 text-pink-400 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 shrink-0 animate-pulse" />
                </span>
                <span className="text-md font-extrabold text-slate-100 uppercase tracking-wider">EmpowerHer</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                A digital cycle tracking platform designed to support your menstrual health, reproductive tracking, and general lifestyle adjustments.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Medical Disclaimer</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto md:mx-0">
                Predictions and chatbot recommendations are for informational exploration only. Consult your OB-GYN for gynecological diagnosis.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Legal & Care</h4>
              <div className="flex flex-col space-y-2 text-xs text-slate-400">
                <a href="#privacy" className="hover:text-pink-400 transition">Privacy Policy</a>
                <a href="#terms" className="hover:text-pink-400 transition">Terms of Service</a>
                <div className="flex items-center justify-center md:justify-start gap-3 pt-2 text-slate-500">
                  <span className="hover:text-white cursor-pointer transition">Facebook</span>
                  <span className="hover:text-white cursor-pointer transition">Twitter</span>
                  <span className="hover:text-white cursor-pointer transition">Instagram</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} EmpowerHer Platform Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
