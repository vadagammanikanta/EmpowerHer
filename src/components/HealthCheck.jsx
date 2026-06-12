import React, { useState, useEffect } from 'react';
import { Check, ShieldCheck, ShieldAlert, Sparkles, HelpCircle, Activity, Heart, Calendar, Zap, Moon } from 'lucide-react';

function MetricBar({ label, value, min, max, unit, color, icon: Icon }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const inRange = value >= 21 && value <= 35;
  return (
    <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{value} {unit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${inRange ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
        <span>{min}{unit}</span>
        <span className={`px-1.5 py-0.5 rounded ${inRange ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
          {inRange ? 'Normal' : 'Check'}
        </span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function HealthCheck({ logs }) {
  const [analysis, setAnalysis] = useState({
    status: 'Unknown',
    message: 'Loading analysis data...',
    description: 'Provide logs to configure evaluations.',
  });
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      delay: Math.random() * 3,
      scale: Math.random() * 0.6 + 0.6
    }));
    setSparkles(items);
  }, [analysis.status]);

  useEffect(() => {
    if (logs.length < 2) {
      setAnalysis({ status: 'Unknown', message: 'Insufficient Cycle Data', description: 'We need at least two cycle start logs to calculate intervals, variance, and regularity.' });
      return;
    }

    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1].date + 'T00:00:00');
      const d2 = new Date(sorted[i].date + 'T00:00:00');
      intervals.push(Math.round((d2 - d1) / 86400000));
    }

    const avgLength = Math.round(intervals.reduce((s, v) => s + v, 0) / intervals.length);
    const maxVal = Math.max(...intervals);
    const minVal = Math.min(...intervals);
    const variance = maxVal - minVal;
    const lutealPhase = avgLength - 14;

    // Next ovulation prediction
    const lastDate = new Date(sorted[sorted.length - 1].date + 'T00:00:00');
    const nextPeriod = new Date(lastDate);
    nextPeriod.setDate(lastDate.getDate() + avgLength);
    const ovulation = new Date(nextPeriod);
    ovulation.setDate(nextPeriod.getDate() - 14);

    const isOutOfBounds = avgLength < 21 || avgLength > 35;
    const isHighlyVariable = variance > 5;
    let status = 'Regular', message = '', description = '';

    if (isOutOfBounds || isHighlyVariable) {
      status = 'Irregular';
      message = 'Irregular Period Cycle Detected';
      const reasons = [];
      if (avgLength < 21) reasons.push(`average duration (${avgLength} days) is below the 21-day minimum`);
      if (avgLength > 35) reasons.push(`average duration (${avgLength} days) exceeds the 35-day limit`);
      if (isHighlyVariable) reasons.push(`cycle varies by up to ${variance} days between logs`);
      description = `Your cycle is classified as irregular because ${reasons.join(' and ')}. Some variation is natural due to stress, diet, or hormonal changes — monitor closely and consult a healthcare provider if it persists.`;
    } else {
      status = 'Regular';
      message = 'Regular Menstrual Cycle';
      description = `Your cycle shows excellent regularity! Average length: ${avgLength} days with a natural variance of ${variance} days. Keep up your healthy habits!`;
    }

    setAnalysis({ status, message, description, averageCycleLength: avgLength, variance, lutealPhase, ovulationDate: ovulation });
  }, [logs]);

  const formatDate = (d) => d ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <div id="health-check" className="space-y-6">

      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Menstrual Cycle Health Analysis</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Dynamic regularity analysis based on your logged cycle history.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">

        {/* Main Status Panel */}
        <div className="md:col-span-8 relative min-h-[340px] overflow-hidden glass-card rounded-2xl p-8 flex flex-col justify-between">

          {/* Background sparkles */}
          {analysis.status === 'Regular' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {sparkles.map((s) => (
                <div key={s.id} className="absolute animate-float text-pink-300 opacity-10"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `scale(${s.scale})`, animationDelay: `${s.delay}s` }}>
                  <Sparkles className="h-6 w-6" />
                </div>
              ))}
            </div>
          )}
          {analysis.status === 'Irregular' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {sparkles.map((s) => (
                <div key={s.id} className="absolute animate-pulse text-amber-300 opacity-10"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `scale(${s.scale})`, animationDelay: `${s.delay}s` }}>
                  <HelpCircle className="h-6 w-6" />
                </div>
              ))}
            </div>
          )}

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                analysis.status === 'Regular' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' :
                analysis.status === 'Irregular' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' :
                'bg-gray-100 dark:bg-gray-800 text-gray-400 animate-pulse'
              }`}>
                {analysis.status === 'Regular' ? <ShieldCheck className="h-7 w-7" /> :
                 analysis.status === 'Irregular' ? <ShieldAlert className="h-7 w-7" /> :
                 <Activity className="h-7 w-7" />}
              </div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${
                  analysis.status === 'Regular' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                  analysis.status === 'Irregular' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  Status: {analysis.status}
                </span>
                <h3 className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>{analysis.message}</h3>
              </div>
            </div>

            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {analysis.description}
            </p>

            {/* Ovulation Prediction */}
            {analysis.ovulationDate && (
              <div className="flex items-center gap-3 rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
                <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Estimated Next Ovulation</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>~{formatDate(analysis.ovulationDate)}</p>
                </div>
                {analysis.lutealPhase && (
                  <div className="ml-auto flex items-center gap-2 rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-muted)' }}>
                    <Moon className="h-4 w-4 text-violet-400" />
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Luteal Phase</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>~{analysis.lutealPhase} days</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative z-10 mt-4 text-xs flex gap-2 items-start rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)', color: 'var(--text-muted)' }}>
            <span className="text-sm shrink-0">⚠️</span>
            <span>Disclaimer: Statistical projections only. Regularity checks cannot substitute clinical hormone assessments.</span>
          </div>
        </div>

        {/* Metrics Side Panel */}
        <div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Cycle Metrics</h3>

            {logs.length < 2 ? (
              <div className="text-center py-8 space-y-2" style={{ color: 'var(--text-muted)' }}>
                <Calendar className="h-8 w-8 mx-auto opacity-30" />
                <p className="text-xs">Add at least 2 logs to see metrics.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <MetricBar
                  label="Avg Cycle Length"
                  value={analysis.averageCycleLength}
                  min={15} max={45} unit=" days"
                  color="text-pink-500" icon={Heart}
                />
                <MetricBar
                  label="Cycle Variance"
                  value={analysis.variance}
                  min={0} max={20} unit=" days"
                  color="text-rose-500" icon={Activity}
                />
                <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Evaluated Cycles</span>
                  </div>
                  <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{logs.length - 1}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl p-3 border space-y-1 hover:border-pink-200 transition" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-muted)' }}>
            <h4 className="text-xs font-bold text-pink-600 dark:text-pink-400">Need Guidance?</h4>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Check <strong>Health Tips</strong> for fitness, nutrition, and menstrual wellness advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
