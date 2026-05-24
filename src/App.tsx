import React, { useEffect, useState } from 'react';
import { LogEntry, ChatMessage } from './types';
import Dashboard from './components/Dashboard';
import CycleLogs from './components/CycleLogs';
import HealthCheck from './components/HealthCheck';
import HealthTips from './components/HealthTips';
import Chatbot from './components/Chatbot';
import { Heart, Home, Calendar, ShieldCheck, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(true);
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);
  const [isGeneratingChat, setIsGeneratingChat] = useState<boolean>(false);
  const [systemLogsError, setSystemLogsError] = useState<string>('');

  // Fetch all logged cycle dates from the backend
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    setSystemLogsError('');
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to synchronize cycle logs`);
      }
      const data = await response.json();
      setLogs(data);
    } catch (error: any) {
      console.error('Error in fetching period logs:', error);
      setSystemLogsError(error.message || 'Connecting to backend... Logs will fall back to local mode in case of latency.');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Run on initial load
  useEffect(() => {
    fetchLogs();
  }, []);

  // Post a new cycle log to the backend
  const handleAddLog = async (newLog: Omit<LogEntry, 'id'>) => {
    setIsSubmittingLog(true);
    setSystemLogsError('');
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLog),
      });
      if (!response.ok) {
        throw new Error('Failed to create new log entry.');
      }
      const savedLog = await response.json();
      setLogs(prev => [savedLog, ...prev]);
    } catch (error: any) {
      console.error('Error adding log entry:', error);
      setSystemLogsError(error.message || 'Could not save cycle log.');
      throw error;
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Delete a cycle log by ID
  const handleDeleteLog = async (id: string) => {
    setSystemLogsError('');
    try {
      const response = await fetch(`/api/logs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete log entry.');
      }
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch (error: any) {
      console.error('Error deleting log entry:', error);
      setSystemLogsError(error.message || 'Could not delete log.');
      throw error;
    }
  };

  // Call the Gemini API router for dynamic discussion
  const handleSendChatMessage = async (userMessageText: string) => {
    setIsGeneratingChat(true);
    
    // 1. Immediately append user's prompt to state feed
    const now = new Date();
    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: userMessageText,
      timestamp: now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);

    try {
      // 2. Fetch answer from backend Express proxy route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          history: chatHistory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error calling AI backend.');
      }

      const replyData = await response.json();
      
      // 3. Append bot replay to chat history feed
      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        sender: 'bot',
        text: replyData.text,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, botMsg]);

    } catch (error: any) {
      console.error('Error communicating with Gemini Chatbot route:', error);
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'bot',
        text: `⚠️ **AI Service Latency detected:** I'm having difficulty connecting to Google Gemini AI. Please verify your GEMINI_API_KEY environment variable. Error details: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
      throw error;
    } finally {
      setIsGeneratingChat(false);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            logs={logs}
            isLoading={isLoadingLogs}
            onNavigate={setActiveTab}
            onRefresh={fetchLogs}
          />
        );
      case 'logs':
        return (
          <CycleLogs
            logs={logs}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            isSubmitting={isSubmittingLog}
          />
        );
      case 'healthcheck':
        return <HealthCheck logs={logs} />;
      case 'tips':
        return <HealthTips />;
      case 'chatbot':
        return (
          <Chatbot
            chatHistory={chatHistory}
            onSendMessage={handleSendChatMessage}
            onClearHistory={handleClearChatHistory}
            isGenerating={isGeneratingChat}
          />
        );
      default:
        return (
          <Dashboard
            logs={logs}
            isLoading={isLoadingLogs}
            onNavigate={setActiveTab}
            onRefresh={fetchLogs}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col justify-between">
      
      {/* HEADER LAYOUT & NAVIGATION */}
      <div className="bg-white border-b border-gray-150 sticky top-0 z-50 shadow-sm">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Branding Logo */}
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="h-10 w-10 bg-gradient-to-tr from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-pink-200">
                <Heart className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                EmpowerHer
              </span>
            </div>

            {/* Sync spinner if indexing */}
            {isLoadingLogs && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-stone-50 px-2 py-1 rounded border border-stone-150">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Syncing Logs...</span>
              </div>
            )}
            
            {/* Nav Menu */}
            <nav className="flex items-center space-x-1 sm:space-x-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer select-none ${
                  activeTab === 'dashboard'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <Home className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Home</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer select-none ${
                  activeTab === 'logs'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('tips')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer select-none ${
                  activeTab === 'tips'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Health Tips</span>
              </button>

              <button
                onClick={() => setActiveTab('healthcheck')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer select-none ${
                  activeTab === 'healthcheck'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Health Check</span>
              </button>

              <button
                onClick={() => setActiveTab('chatbot')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer select-none ${
                  activeTab === 'chatbot'
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Chatbot</span>
              </button>
            </nav>
          </div>
        </header>
      </div>

      {/* SYSTEM WARNING BANNER IF OFFLINE OR DB ERR */}
      {systemLogsError && (
        <div className="bg-amber-50 border-b border-amber-100 p-2 text-center text-[11px] text-amber-800 font-semibold flex items-center justify-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{systemLogsError}</span>
        </div>
      )}

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {renderActiveSection()}
      </main>

      {/* ELEGANT COMPREHENSIVE FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left items-start">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="h-7 w-7 bg-pink-500/20 text-pink-400 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 shrink-0 animate-pulse" />
                </span>
                <span className="text-md font-extrabold text-slate-100 uppercase tracking-wider">EmpowerHer</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                EmpowerHer is a digital cycle tracking platform designed to support your menstrual health, reproductive tracking, and general lifestyle adjustments.
              </p>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Medical Disclaimer</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto md:mx-0">
                Any calculation models, predictions, statistical variances, or chatbot recommendations displayed are for informational exploration only. Consult your OB-GYN or licensed clinical provider for gynecological diagnosis.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Legal & Care</h4>
              <div className="flex flex-col space-y-2 text-xs">
                <a href="#privacy" className="hover:text-pink-500 transition">Privacy Policy</a>
                <a href="#terms" className="hover:text-pink-500 transition">Terms of Service</a>
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
