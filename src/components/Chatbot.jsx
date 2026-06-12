import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, Bot, User, Trash2, HelpCircle, AlertCircle, Copy, Check } from 'lucide-react';

const FAQ_BUTTONS = [
  { text: "Why is my period irregular?", id: "irregular-why" },
  { text: "How can I get a regular period?", id: "irregular-solution" },
  { text: "What food can help my cycle stay regular?", id: "food-regular" },
  { text: "What exercises help with menstrual pain?", id: "exercise" },
  { text: "How can I relieve menstrual cramps?", id: "cramps" },
  { text: "What is PCOS?", id: "pcos" },
  { text: "What is PCOD?", id: "pcod" },
  { text: "Does stress affect my cycle?", id: "stress" },
  { text: "What is the normal cycle length?", id: "normal-cycle" },
  { text: "How does ovulation work?", id: "ovulation" },
];

// Animated typing reveal for bot messages
function TypingMessage({ text, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const speed = text.length > 400 ? 8 : 14;
    const interval = setInterval(() => {
      idx.current += 3;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(interval);
        setDisplayed(text);
        onDone && onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 absolute top-2 right-2"
      title="Copy message"
    >
      {copied
        ? <Check className="h-3 w-3 text-emerald-500" />
        : <Copy className="h-3 w-3 text-gray-400" />
      }
    </button>
  );
}

function formatBotText(text) {
  return text.split('\n').map((line, idx) => {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const title = line.replace(/^#{2,3}\s+/, '');
      return <h4 key={idx} className="text-sm font-bold mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h4>;
    }
    let formattedLine = line;
    if (line.includes('**')) {
      const parts = line.split('**');
      formattedLine = parts.map((part, pIdx) =>
        pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-pink-700 dark:text-pink-300">{part}</strong> : part
      );
    }
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      return <li key={idx} className="ml-4 list-disc text-xs leading-relaxed py-0.5" style={{ color: 'var(--text-secondary)' }}>{formattedLine}</li>;
    }
    return line.trim() === '' ? (
      <div key={idx} className="h-2" />
    ) : (
      <p key={idx} className="text-xs leading-relaxed py-0.5" style={{ color: 'var(--text-secondary)' }}>{formattedLine}</p>
    );
  });
}

export default function Chatbot({ chatHistory, onSendMessage, onClearHistory, isGenerating }) {
  const [userInput, setUserInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [animatingMsgId, setAnimatingMsgId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  // Trigger typing animation for latest bot message
  useEffect(() => {
    const last = chatHistory[chatHistory.length - 1];
    if (last && last.sender === 'bot') {
      setAnimatingMsgId(last.id);
    }
  }, [chatHistory.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanMsg = userInput.trim();
    if (!cleanMsg) return;
    setErrorMessage('');
    setUserInput('');
    try { await onSendMessage(cleanMsg); }
    catch (err) { setErrorMessage(err.message || 'Could not reach AI.'); }
  };

  const handleFAQClick = async (question) => {
    setErrorMessage('');
    try { await onSendMessage(question); }
    catch (err) { setErrorMessage(err.message || 'Error.'); }
  };

  return (
    <div id="ai-chatbot" className="grid gap-6 lg:grid-cols-12">

      {/* FAQ Rail */}
      <div className="lg:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between lg:h-[580px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-pink-500" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Quick Questions</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Tap any question to instantly ask the AI:
          </p>
          <div className="grid grid-cols-1 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
            {FAQ_BUTTONS.map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleFAQClick(faq.text)}
                disabled={isGenerating}
                className="w-full text-left rounded-xl px-4 py-2.5 text-xs font-semibold border transition hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 disabled:opacity-50 active:scale-98"
                style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)', color: 'var(--text-secondary)' }}
              >
                {faq.text}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-xl space-y-1.5 border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
          <div className="flex items-start gap-1.5 font-bold text-[11px] text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>AI Disclaimer</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            EmpowerHer AI is educational only. Always consult a physician for clinical diagnosis.
          </p>
        </div>
      </div>

      {/* Chat Console */}
      <div className="lg:col-span-8 glass-card rounded-2xl p-6 flex flex-col justify-between h-[580px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-1" style={{ borderColor: 'var(--border-muted)' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl hero-gradient flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>EmpowerHer AI</h3>
              <p className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Gemini 2.0 Flash</span>
              </p>
            </div>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg border transition hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto my-3 space-y-4 pr-1">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="h-16 w-16 rounded-2xl hero-gradient flex items-center justify-center shadow-md">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
              <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Say Hello to AI Medical Copilot!</h4>
              <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>
                Ask about menstruation, nutrition, PMS relief, fitness habits, and health symptoms.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] animate-fade-in-up ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${
                  msg.sender === 'user' ? 'hero-gradient shadow-sm' : 'border'
                }`}
                style={msg.sender !== 'user' ? { backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : {}}
                >
                  {msg.sender === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />}
                </div>

                <div className={`relative group rounded-2xl p-4 ${
                  msg.sender === 'user'
                    ? 'hero-gradient text-white rounded-tr-none shadow-sm'
                    : 'rounded-tl-none border'
                }`}
                style={msg.sender !== 'user' ? { backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' } : {}}
                >
                  {msg.sender === 'user' ? (
                    <p className="text-xs whitespace-pre-line leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">
                      {msg.id === animatingMsgId
                        ? <TypingMessage text={msg.text} onDone={() => setAnimatingMsgId(null)} />
                        : formatBotText(msg.text)
                      }
                    </div>
                  )}
                  {msg.sender === 'bot' && <CopyButton text={msg.text} />}
                  <span className={`block text-[9px] mt-1.5 ${msg.sender === 'user' ? 'text-white/70 text-right' : ''}`}
                    style={msg.sender !== 'user' ? { color: 'var(--text-muted)' } : {}}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="flex gap-3 mr-auto max-w-[88%]">
              <div className="h-9 w-9 shrink-0 rounded-xl border flex items-center justify-center" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)' }}>
                <Bot className="h-4 w-4 text-pink-400" />
              </div>
              <div className="rounded-2xl rounded-tl-none border px-5 py-4 flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
                <span className="h-2 w-2 rounded-full bg-pink-400 typing-dot" />
                <span className="h-2 w-2 rounded-full bg-pink-400 typing-dot" />
                <span className="h-2 w-2 rounded-full bg-pink-400 typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t pt-3" style={{ borderColor: 'var(--border-muted)' }}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="chatInput"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isGenerating}
              placeholder="Ask anything about your health..."
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-400 disabled:opacity-50 transition"
              style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
            <button
              id="chatSendBtn"
              type="submit"
              disabled={isGenerating || !userInput.trim()}
              className="h-10 w-10 rounded-xl hero-gradient text-white flex items-center justify-center shadow-sm transition disabled:opacity-50 hover:shadow-md active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          {errorMessage && <p className="text-[10px] text-red-500 font-semibold mt-1.5">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}
