import React, { useState } from 'react';
import { LogEntry } from '../types';
import { Calendar, Trash2, Plus, Info, CheckCircle } from 'lucide-react';

interface CycleLogsProps {
  logs: LogEntry[];
  onAddLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

const COMMON_SYMPTOMS = [
  'Cramps', 'Bloating', 'Fatigue', 'Headache', 'Mood Swings', 'Back Pain', 'Insomnia', 'Acne'
];

export default function CycleLogs({ logs, onAddLog, onDeleteLog, isSubmitting }: CycleLogsProps) {
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDate) {
      setErrorMessage('Please select a valid date.');
      return;
    }

    setErrorMessage('');
    try {
      await onAddLog({
        date: logDate,
        flow,
        symptoms: selectedSymptoms,
        notes
      });
      // Reset form variables
      setSelectedSymptoms([]);
      setNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving your log.');
    }
  };

  // 12-Month Calendar Helper Structures
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const currentYear = new Date().getFullYear();

  // Create sets of dates that have logs
  const loggedDatesSet = new Set(logs.map(l => l.date));

  return (
    <div id="cycle-logs" className="grid gap-8 lg:grid-cols-12">
      {/* Logs Controls Panel (Input Form + Log List) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* NEW DATE LOG FORM */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-pink-500" />
            <h2 className="text-lg font-bold text-gray-800">Add Period Log</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label id="dateFieldLabel" className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
              <input
                id="dateInput"
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              />
            </div>

            {/* FLOW SELECTOR */}
            <div>
              <label id="flowLabel" className="block text-xs font-bold text-gray-500 uppercase mb-1">Flow Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'medium', 'heavy'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFlow(level)}
                    className={`rounded-lg py-1.5 text-xs font-bold border transition ${
                      flow === level
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* SYMPTOMS TOGGLE CHIPS */}
            <div>
              <label id="symptomsLabel" className="block text-xs font-bold text-gray-500 uppercase mb-1">Symptoms Match</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border border-slate-50 rounded-lg">
                {COMMON_SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-rose-50 px-2.5 text-rose-700 border-rose-100/50 hover:bg-rose-100/60'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NOTES */}
            <div>
              <label id="notesLabel" className="block text-xs font-bold text-gray-500 uppercase mb-1">Personal Notes</label>
              <textarea
                placeholder="How are you feeling today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none h-16"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
            )}

            <button
              id="submitLogBtn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-500 hover:bg-pink-600 transition px-4 py-2.5 font-bold text-white shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving Log...' : 'Add Log Entry'}</span>
            </button>
          </form>
        </div>

        {/* LOG HISTORY LIST */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col max-h-[420px]">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-3">Logged Cycles History</h3>
          
          {logs.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No recorded elements found.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-stone-50/50 hover:bg-stone-50 rounded-xl border border-stone-100 flex items-start justify-between gap-2 transition">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(log.date + 'T00:00:00').toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {log.flow && (
                        <span className="text-[10px] font-semibold uppercase bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">
                          Flow: {log.flow}
                        </span>
                      )}
                      {log.symptoms?.map(s => (
                        <span key={s} className="text-[10px] font-semibold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100/30">
                          {s}
                        </span>
                      ))}
                    </div>
                    {log.notes && (
                      <p className="text-[11px] text-gray-500 italic mt-1 bg-white p-1 rounded border border-gray-100 line-clamp-2">"{log.notes}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition"
                    title="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 12-Month Calendar Grid Panel */}
      <div className="lg:col-span-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>Full Year Tracker</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-100 text-pink-700">{currentYear}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Highlighted dates denote logged cycle start dates.</p>
        </div>

        {/* Calendars grid scrolling box */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 max-h-[720px] overflow-y-auto pr-1">
          {monthNames.map((mName, monthIdx) => {
            const firstDayOfMonth = new Date(currentYear, monthIdx, 1);
            const lastDayOfMonth = new Date(currentYear, monthIdx + 1, 0);
            const daysInMonth = lastDayOfMonth.getDate();
            const startDayOfWeek = firstDayOfMonth.getDay();

            // Assemble empty nodes before day 1
            const paddingDays = Array(startDayOfWeek).fill(null);
            
            // Assemble days
            const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);

            return (
              <div key={mName} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex flex-col">
                <h4 className="text-sm font-bold text-pink-600 text-center uppercase tracking-tight mb-2 border-b border-pink-100/50 pb-1">
                  {mName}
                </h4>

                {/* Week of days header */}
                <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 mb-1">
                  {daysOfWeek.map(d => <span key={d}>{d}</span>)}
                </div>

                {/* Calendar Days grid */}
                <div className="grid grid-cols-7 gap-1 text-center flex-1 align-middle justify-items-center">
                  {paddingDays.map((_, i) => (
                    <div key={`empty-${i}`} className="w-6 h-6" />
                  ))}
                  
                  {daysArr.map((dayNum) => {
                    const dateStr = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isHighlighted = loggedDatesSet.has(dateStr);

                    return (
                      <div
                        key={dayNum}
                        className={`w-6 h-6 text-[10px] font-bold rounded flex items-center justify-center transition ${
                          isHighlighted
                            ? 'bg-pink-500 text-white shadow-sm ring-2 ring-pink-150 animate-pulse'
                            : 'bg-white hover:bg-pink-50 text-gray-700 border border-slate-100'
                        }`}
                        title={isHighlighted ? `Period logged: ${dateStr}` : dateStr}
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
