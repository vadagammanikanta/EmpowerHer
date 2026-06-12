import React, { useEffect, useState } from 'react';
import { Calendar, Flame, AlertCircle, Sparkles, Heart, RefreshCw, ChevronRight, Droplet, Wind, Moon, Zap } from 'lucide-react';

// Determine the current cycle phase based on days elapsed
function getCyclePhase(elapsedDays, cycleLength) {
  const periodDuration = 5;
  const follicularEnd = Math.round(cycleLength * 0.4);
  const ovulatoryEnd = follicularEnd + 3;
  const lutealEnd = cycleLength;

  if (elapsedDays <= periodDuration) return { phase: 'Menstrual', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: Droplet, desc: 'Rest & recover' };
  if (elapsedDays <= follicularEnd) return { phase: 'Follicular', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300', icon: Wind, desc: 'Energy rising' };
  if (elapsedDays <= ovulatoryEnd) return { phase: 'Ovulatory', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Zap, desc: 'Peak energy' };
  return { phase: 'Luteal', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', icon: Moon, desc: 'Wind down' };
}

export default function Dashboard({ logs, isLoading, onNavigate, onRefresh }) {
  const [info, setInfo] = useState({
    lastDate: null,
    nextDate: null,
    ovulationDate: null,
    daysLeft: 0,
    completionPercentage: 0,
    cycleLength: 28,
    elapsedDays: 0,
  });
  const [topSymptoms, setTopSymptoms] = useState([]);
  const [topMood, setTopMood] = useState(null);

  useEffect(() => {
    if (logs.length === 0) {
      setInfo({ lastDate: null, nextDate: null, ovulationDate: null, daysLeft: 0, completionPercentage: 0, cycleLength: 28, elapsedDays: 0 });
      setTopSymptoms([]);
      setTopMood(null);
      return;
    }

    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const lastPeriodDate = new Date(sorted[sorted.length - 1].date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Dynamic cycle length calculation
    let cycleLength = 28;
    if (sorted.length >= 2) {
      let total = 0, count = 0;
      for (let i = 1; i < sorted.length; i++) {
        const d1 = new Date(sorted[i - 1].date + 'T00:00:00');
        const d2 = new Date(sorted[i].date + 'T00:00:00');
        const diff = Math.round((d2 - d1) / 86400000);
        if (diff >= 15 && diff <= 45) { total += diff; count++; }
      }
      if (count > 0) cycleLength = Math.round(total / count);
    }

    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);

    // Ovulation ~14 days before next period
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(nextPeriodDate.getDate() - 14);

    const daysLeft = Math.max(0, Math.ceil((nextPeriodDate - today) / 86400000));
    const elapsedDays = Math.max(0, Math.round((today - lastPeriodDate) / 86400000));
    const completionPercentage = Math.min(100, Math.round((elapsedDays / cycleLength) * 100));

    setInfo({ lastDate: lastPeriodDate, nextDate: nextPeriodDate, ovulationDate, daysLeft, completionPercentage, cycleLength, elapsedDays });

    // Symptom frequency
    const symCount = {};
    logs.forEach(l => (l.symptoms || []).forEach(s => { symCount[s] = (symCount[s] || 0) + 1; }));
    const sorted_sym = Object.entries(symCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
    setTopSymptoms(sorted_sym);

    // Mood frequency
    const moodCount = {};
    logs.forEach(l => { if (l.mood) moodCount[l.mood] = (moodCount[l.mood] || 0) + 1; });
    const topEntry = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
    setTopMood(topEntry ? topEntry[0] : null);
  }, [logs]);

  const phase = info.elapsedDays > 0 ? getCyclePhase(info.elapsedDays, info.cycleLength) : null;
  const PhaseIcon = phase?.icon;

  const formatDate = (d) => d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  if (isLoading) {
    return (
      <div id="dashboard" className="space-y-6">
        <div className="h-44 rounded-2xl shimmer" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard" className="space-y-6">

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient p-8 text-white shadow-lg shadow-pink-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 animate-pulse text-pink-200" />
              </span>
              <span className="text-sm font-semibold tracking-wider uppercase text-pink-100">Welcome to EmpowerHer</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white leading-tight">Your Menstrual<br />Health Companion</h1>
            <p className="max-w-md text-pink-100 text-sm">
              Monitor your cycle, get wellness tips, and access expert queries via AI.
            </p>
            {/* Cycle Phase Badge */}
            {phase && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur`}>
                <PhaseIcon className="h-3.5 w-3.5" />
                <span>{phase.phase} Phase — {phase.desc}</span>
              </div>
            )}
          </div>
          <button
            id="quickLogBtn"
            onClick={() => onNavigate('logs')}
            className="self-start md:self-auto flex items-center gap-1.5 rounded-xl bg-white px-5 py-3 font-bold text-pink-600 shadow-sm transition hover:bg-pink-50 hover:shadow-md active:scale-95"
          >
            <Calendar className="h-4 w-4" />
            <span>Log Cycle</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-2/3 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {logs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="h-16 w-16 rounded-2xl hero-gradient mx-auto flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No Logs Recorded Yet</h3>
          <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Log your last period date to unlock cycle countdown, ovulation predictions, and health insights.
          </p>
          <button
            id="getStartedBtn"
            onClick={() => onNavigate('logs')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-pink-600 transition active:scale-95"
          >
            Log Your First Date
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Ring Countdown Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Cycle Countdown</h3>
              <Flame className="h-5 w-5 text-rose-500" />
            </div>
            <div className="my-5 flex flex-col items-center justify-center">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="60" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-100 dark:text-gray-800" />
                  <circle
                    cx="72" cy="72" r="60"
                    stroke="url(#grad)" strokeWidth="10" fill="none"
                    strokeDasharray={376.99}
                    strokeDashoffset={376.99 - (376.99 * info.completionPercentage) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{info.daysLeft}</span>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Days Left</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000"
                    style={{ width: `${info.completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-pink-500">{info.completionPercentage}%</span>
              </div>
            </div>
            <div className="flex gap-2 items-center text-xs border-t pt-3" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-muted)' }}>
              <AlertCircle className="h-3.5 w-3.5 text-pink-400 shrink-0" />
              <span>Based on your logged cycle history</span>
            </div>
          </div>

          {/* Milestones + Ovulation Card */}
          <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>Cycle Milestones</h3>
              <div className="space-y-3">
                {[
                  { label: 'Last Logged Date', value: formatDate(info.lastDate), icon: Calendar, bg: 'bg-pink-50 dark:bg-pink-900/30', ic: 'text-pink-600' },
                  { label: 'Expected Next Period', value: formatDate(info.nextDate), icon: Heart, bg: 'bg-rose-50 dark:bg-rose-900/30', ic: 'text-rose-600' },
                  { label: 'Est. Ovulation Window', value: info.ovulationDate ? `~${formatDate(info.ovulationDate)}` : 'N/A', icon: Zap, bg: 'bg-amber-50 dark:bg-amber-900/30', ic: 'text-amber-600' },
                ].map(({ label, value, icon: Icon, bg, ic }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${ic} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3 flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-muted)', color: 'var(--text-muted)' }}>
              <span className="font-semibold text-pink-500">{logs.length} total logs</span>
              <button onClick={onRefresh} className="flex items-center gap-1 hover:text-pink-500 transition font-semibold">
                <RefreshCw className="h-3 w-3" />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Insights + Navigation Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Insights</h3>

              {/* Top Mood */}
              {topMood && (
                <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <span className="text-2xl">{topMood}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Most Common Mood</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Your mood streak this cycle</p>
                  </div>
                </div>
              )}

              {/* Top Symptoms */}
              {topSymptoms.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Top Symptoms</p>
                  <div className="space-y-2">
                    {topSymptoms.map(([sym, count]) => (
                      <div key={sym} className="flex items-center gap-2">
                        <span className="text-xs font-semibold w-20 shrink-0" style={{ color: 'var(--text-secondary)' }}>{sym}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-700"
                            style={{ width: `${Math.min(100, (count / logs.length) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-pink-500 w-5 text-right">{count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Nav Links */}
              <div className="space-y-2 pt-1">
                {[
                  { tab: 'healthcheck', label: 'Check Cycle Regularity', dot: 'bg-pink-500' },
                  { tab: 'chatbot', label: 'Talk with AI Copilot', dot: 'bg-rose-500 animate-pulse' },
                ].map(({ tab, label, dot }) => (
                  <div
                    key={tab}
                    onClick={() => onNavigate(tab)}
                    className="p-3 rounded-xl border cursor-pointer flex justify-between items-center transition hover:border-pink-200"
                    style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-pink-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-3 flex gap-2 items-center text-xs" style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
              <span className="text-base">💡</span>
              <span>Navigate to <strong>Health Tips</strong> for wellness recommendations!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
