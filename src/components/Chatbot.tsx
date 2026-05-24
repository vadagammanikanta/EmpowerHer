import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Sparkles, Send, Bot, User, Trash2, HelpCircle, AlertCircle } from 'lucide-react';

interface ChatbotProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onClearHistory: () => void;
  isGenerating: boolean;
}

const FAQ_BUTTONS = [
  { text: "Why is my period irregular?", id: "irregular-why" },
  { text: "How can I get a regular period?", id: "irregular-solution" },
  { text: "What food can help my cycle stay regular?", id: "food-regular" },
  { text: "What exercises help with menstrual pain?", id: "exercise" },
  { text: "How can I relieve menstrual cramps?", id: "cramps" },
  { text: "What is PCOS?", id: "pcos" },
  { text: "What is PCOD?", id: "pcod" },
  { text: "Does stress affect my cycle?", id: "stress" }
];

export default function Chatbot({ chatHistory, onSendMessage, onClearHistory, isGenerating }: ChatbotProps) {
  const [userInput, setUserInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = userInput.trim();
    if (!cleanMsg) return;

    setErrorMessage('');
    setUserInput('');
    try {
      await onSendMessage(cleanMsg);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not communicate with your AI companion. Please verify server status.');
    }
  };

  const handleFAQClick = async (question: string) => {
    setErrorMessage('');
    try {
      await onSendMessage(question);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing FAQ routine.');
    }
  };

  // Helper function to render text with beautiful styling for basic lists and headers
  const formatBotText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Check for headers like ## or ###
      if (line.startsWith('## ') || line.startsWith('### ')) {
        const title = line.replace(/^#{2,3}\s+/, '');
        return (
          <h4 key={idx} className="text-sm font-bold text-gray-800 mt-3 mb-1 font-sans">
            {title}
          </h4>
        );
      }
      // Check for bold styling like **text**
      let formattedLine: React.ReactNode = line;
      if (line.includes('**')) {
        const parts = line.split('**');
        formattedLine = parts.map((part, pIdx) => (
          pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-[#763654]">{part}</strong> : part
        ));
      }
      // Check for bullet lists like * or -
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanContent = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-stone-600 leading-relaxed py-0.5">
            {formattedLine}
          </li>
        );
      }
      // Standard Paragraph
      return line.trim() === '' ? (
        <div key={idx} className="h-2" />
      ) : (
        <p key={idx} className="text-xs text-stone-600 leading-relaxed py-0.5">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div id="ai-chatbot" className="grid gap-6 lg:grid-cols-12 max-h-[700px]">
      
      {/* Suggestions and Info rail */}
      <div className="lg:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-5 w-5 text-pink-500 animate-pulse" />
            <h2 className="text-base font-bold text-gray-800 uppercase tracking-tight">FAQ Rapid Queries</h2>
          </div>
          <p className="text-xs text-gray-500">
            Click any question below to immediately prompt the clinical AI for supportive health recommendations:
          </p>

          <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {FAQ_BUTTONS.map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleFAQClick(faq.text)}
                disabled={isGenerating}
                className="w-full text-left rounded-xl bg-pink-50/50 hover:bg-pink-50 border border-pink-100/50 px-4 py-2.5 text-xs font-semibold text-gray-700 transition cursor-pointer disabled:opacity-50"
              >
                {faq.text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100/50 text-[11px] text-rose-800 rounded-xl space-y-1">
          <div className="flex items-start gap-1 font-bold">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>AI Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            Our AI assistant acts solely as an educational tracking helper. Please consult your physician for clinical diagnosis.
          </p>
        </div>
      </div>

      {/* Main Messaging console */}
      <div className="lg:col-span-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between h-[550px] md:h-[600px]">
        {/* Chat Console Header */}
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-500">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 leading-tight">EmpowerHer AI</h3>
              <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Google Gemini Active</span>
              </p>
            </div>
          </div>

          {chatHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition border border-transparent hover:border-red-100/50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Console</span>
            </button>
          )}
        </div>

        {/* Message Feeds */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
              <Sparkles className="h-12 w-12 text-pink-300 animate-pulse" />
              <h4 className="text-sm font-bold text-gray-700">Say Hello to AI Medical Copilot!</h4>
              <p className="text-xs max-w-sm">
                Ask about menstruation intervals, nutritional planning, PMS relief, fitness habits, and health symptoms.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-pink-500 text-white rounded-tr-none'
                    : 'bg-stone-50 border border-stone-100 rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <p className="text-xs font-sans whitespace-pre-line leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="space-y-1 font-sans">
                      {formatBotText(msg.text)}
                    </div>
                  )}
                  <span className={`block text-[9px] mt-1.5 ${msg.sender === 'user' ? 'text-pink-100/70 text-right' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center bg-gray-105 text-gray-600 animate-bounce">
                <Bot className="h-4 w-4 text-pink-400" />
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 rounded-tl-none flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Console Inputs */}
        <form onSubmit={handleSubmit} className="border-t border-gray-50 pt-3 flex gap-2">
          <input
            id="chatInput"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isGenerating}
            placeholder="Type your health questions here..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none disabled:opacity-50"
          />

          <button
            id="chatSendBtn"
            type="submit"
            disabled={isGenerating || !userInput.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {errorMessage && (
          <p className="text-[10px] text-red-500 font-semibold mt-1.5">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
