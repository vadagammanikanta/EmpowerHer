import React, { useState } from 'react';
import { Calendar, Trash2, Plus, Pencil, X, Check } from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Cramps', 'Bloating', 'Fatigue', 'Headache', 'Mood Swings', 'Back Pain', 'Insomnia', 'Acne',
  'Nausea', 'Breast Tenderness', 'Hot Flashes', 'Spotting'
];

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😤', label: 'Irritable' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤗', label: 'Energized' },
];

function LogForm({ initial, onSubmit, onCancel, isSubmitting, submitLabel }) {
  const [logDate, setLogDate] = useState(initial?.date || new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState(initial?.flow || 'medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState(initial?.symptoms || []);
  const [mood, setMood] = useState(initial?.mood || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logDate) { setErrorMessage('Please select a valid date.'); return; }
    setErrorMessage('');
    try {
      await onSubmit({ date: logDate, flow, symptoms: selectedSymptoms, mood, notes });
      if (!initial) {
        setSelectedSymptoms([]);
        setMood('');
        setNotes('');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error saving log.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div>
        <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Start Date</label>
        <input
          id="dateInput"
          type="date"
          value={logDate}
          onChange={(e) => setLogDate(e.target.value)}
          required
          className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-400 transition"
          style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Flow */}
      <div>
        <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Flow Level</label>
        <div className="grid grid-cols-3 gap-2">
          {['light', 'medium', 'heavy'].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFlow(level)}
              className={`rounded-xl py-1.5 text-xs font-bold border transition active:scale-95 ${
                flow === level
                  ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
              }`}
              style={flow !== level ? { backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' } : {}}
            >
              {level === 'light' ? '💧 Light' : level === 'medium' ? '🩸 Medium' : '🔴 Heavy'}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Emoji Picker */}
      <div>
        <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Mood</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(({ emoji, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setMood(mood === emoji ? '' : emoji)}
              title={label}
              className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center border transition hover:scale-110 active:scale-95 ${
                mood === emoji
                  ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/30 shadow-sm ring-2 ring-pink-300'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: mood !== emoji ? 'var(--bg-muted)' : undefined }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Symptoms</label>
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 rounded-xl border" style={{ borderColor: 'var(--border-muted)' }}>
          {COMMON_SYMPTOMS.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border transition active:scale-95 ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'border-rose-100/80 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30'
                }`}
                style={!isSelected ? { backgroundColor: 'var(--bg-muted)' } : {}}
              >
                {symptom}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Personal Notes</label>
        <textarea
          placeholder="How are you feeling today?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-pink-400 resize-none h-16 transition"
          style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      {errorMessage && <p className="text-xs text-red-500 font-medium">{errorMessage}</p>}

      <div className="flex gap-2">
        <button
          id="submitLogBtn"
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-pink-500 hover:bg-pink-600 transition px-4 py-2.5 font-bold text-white shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
        >
          {initial ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{isSubmitting ? 'Saving...' : submitLabel}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-1 rounded-xl px-4 py-2.5 font-bold border transition active:scale-95"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

export default function CycleLogs({ logs, onAddLog, onEditLog, onDeleteLog, isSubmitting }) {
  const [editingLog, setEditingLog] = useState(null);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysOfWeek = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const currentYear = new Date().getFullYear();
  const loggedDatesSet = new Set(logs.map(l => l.date));

  // Predict next period dates for calendar highlights
  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  let predictedDates = new Set();
  if (sorted.length > 0) {
    let cycleLength = 28;
    if (sorted.length >= 2) {
      let total = 0, count = 0;
      for (let i = 1; i < sorted.length; i++) {
        const diff = Math.round((new Date(sorted[i].date) - new Date(sorted[i-1].date)) / 86400000);
        if (diff >= 15 && diff <= 45) { total += diff; count++; }
      }
      if (count > 0) cycleLength = Math.round(total / count);
    }
    const lastDate = new Date(sorted[sorted.length - 1].date + 'T00:00:00');
    for (let cycle = 1; cycle <= 3; cycle++) {
      const pred = new Date(lastDate);
      pred.setDate(pred.getDate() + cycleLength * cycle);
      const str = `${pred.getFullYear()}-${String(pred.getMonth() + 1).padStart(2, '0')}-${String(pred.getDate()).padStart(2, '0')}`;
      predictedDates.add(str);
    }
  }

  const handleEdit = async (updatedLog) => {
    await onEditLog(editingLog.id, updatedLog);
    setEditingLog(null);
  };

  return (
    <div id="cycle-logs" className="grid gap-8 lg:grid-cols-12">
      {/* Left Panel */}
      <div className="lg:col-span-4 space-y-6">

        {/* Add / Edit Form */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center">
              {editingLog ? <Pencil className="h-4 w-4 text-pink-500" /> : <Calendar className="h-4 w-4 text-pink-500" />}
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {editingLog ? 'Edit Period Log' : 'Add Period Log'}
            </h2>
          </div>
          <LogForm
            key={editingLog ? editingLog.id : 'new'}
            initial={editingLog}
            onSubmit={editingLog ? handleEdit : onAddLog}
            onCancel={editingLog ? () => setEditingLog(null) : null}
            isSubmitting={isSubmitting}
            submitLabel={editingLog ? 'Save Changes' : 'Add Log Entry'}
          />
        </div>

        {/* Log History */}
        <div className="glass-card rounded-2xl p-6 flex flex-col max-h-[480px]">
          <h3 className="text-sm font-bold uppercase tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>Cycle History</h3>
          {logs.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color: 'var(--text-muted)' }}>No logs recorded yet.</p>
          ) : (
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-2 transition ${
                    editingLog?.id === log.id ? 'border-pink-300 dark:border-pink-600 bg-pink-50/50 dark:bg-pink-900/20' : ''
                  }`}
                  style={editingLog?.id !== log.id ? { backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' } : {}}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {log.mood && <span className="text-base leading-none">{log.mood}</span>}
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {log.flow && (
                        <span className="text-[10px] font-bold uppercase bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 px-1.5 py-0.5 rounded">
                          {log.flow}
                        </span>
                      )}
                      {log.symptoms?.map(s => (
                        <span key={s} className="text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                    {log.notes && (
                      <p className="text-[11px] italic line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>"{log.notes}"</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => setEditingLog(editingLog?.id === log.id ? null : log)}
                      className="p-1 rounded-lg transition hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      style={{ color: editingLog?.id === log.id ? '#3b82f6' : 'var(--text-muted)' }}
                      title="Edit entry"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1 rounded-lg transition hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                      style={{ color: 'var(--text-muted)' }}
                      title="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 12-Month Calendar */}
      <div className="lg:col-span-8 glass-card rounded-2xl p-6 flex flex-col space-y-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>Full Year Tracker</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">{currentYear}</span>
          </h2>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="h-3 w-3 rounded bg-pink-500 inline-block" />
              Logged date
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="h-3 w-3 rounded border-2 border-dashed border-pink-400 inline-block" />
              Predicted
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 max-h-[720px] overflow-y-auto pr-1">
          {monthNames.map((mName, monthIdx) => {
            const firstDay = new Date(currentYear, monthIdx, 1);
            const daysInMonth = new Date(currentYear, monthIdx + 1, 0).getDate();
            const startDOW = firstDay.getDay();
            const paddingDays = Array(startDOW).fill(null);
            const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

            return (
              <div key={mName} className="p-3 rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
                <h4 className="text-sm font-bold text-pink-500 text-center uppercase tracking-tight mb-2 border-b pb-1" style={{ borderColor: 'var(--border-muted)' }}>
                  {mName}
                </h4>
                <div className="grid grid-cols-7 text-center text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  {daysOfWeek.map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5 text-center flex-1 justify-items-center">
                  {paddingDays.map((_, i) => <div key={`e-${i}`} className="w-6 h-6" />)}
                  {daysArr.map((dayNum) => {
                    const dateStr = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isLogged = loggedDatesSet.has(dateStr);
                    const isPredicted = predictedDates.has(dateStr);
                    return (
                      <div
                        key={dayNum}
                        className={`w-6 h-6 text-[10px] font-bold rounded flex items-center justify-center transition ${
                          isLogged
                            ? 'bg-pink-500 text-white shadow-sm ring-2 ring-pink-300 dark:ring-pink-700'
                            : isPredicted
                            ? 'border-2 border-dashed border-pink-400 text-pink-500 dark:border-pink-600 dark:text-pink-400'
                            : 'hover:bg-pink-50 dark:hover:bg-pink-900/20'
                        }`}
                        style={!isLogged && !isPredicted ? { color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' } : {}}
                        title={isLogged ? `Logged: ${dateStr}` : isPredicted ? `Predicted: ${dateStr}` : dateStr}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
