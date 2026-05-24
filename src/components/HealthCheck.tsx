import React, { useState, useEffect } from 'react';
import { LogEntry, HealthStatus } from '../types';
import { Check, ShieldCheck, ShieldAlert, Sparkles, HelpCircle, Activity, Heart, Calendar } from 'lucide-react';

interface HealthCheckProps {
  logs: LogEntry[];
}

export default function HealthCheck({ logs }: HealthCheckProps) {
  const [analysis, setAnalysis] = useState<HealthStatus>({
    status: 'Unknown',
    message: 'Loading physical analysis data...',
    description: 'Provide logs to configure evaluations.'
  });

  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number; scale: number }>>([]);

  // Generate floating coordinate nodes for the sparkle visual effect
  useEffect(() => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5, // percentage
      y: Math.random() * 80 + 10,
      delay: Math.random() * 3,
      scale: Math.random() * 0.6 + 0.6
    }));
    setSparkles(items);
  }, [analysis.status]);

  useEffect(() => {
    if (logs.length < 2) {
      setAnalysis({
        status: 'Unknown',
        message: 'Insufficient Cycle Data',
        description: `We need at least two cycle start logs to calculate intervals, variance, and regularity. Log your dates in the Logs panel to begin analysis.`
      });
      return;
    }

    // Sort chronologically
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate intervals (in days)
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1].date + 'T00:00:00');
      const d2 = new Date(sorted[i].date + 'T00:00:00');
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      intervals.push(diffDays);
    }

    // Compute mathematical average cycle duration
    const avgLength = Math.round(intervals.reduce((sum, val) => sum + val, 0) / intervals.length);

    // Compute mathematical max range difference
    const maxVal = Math.max(...intervals);
    const minVal = Math.min(...intervals);
    const variance = maxVal - minVal;

    let status: 'Regular' | 'Irregular' = 'Regular';
    let message = '';
    let description = '';

    // Standard clinical parameters: Normal cycles range from 21 to 35 days, and variance should be <= 5 days
    const isOutOfBounds = avgLength < 21 || avgLength > 35;
    const isHighlyVariable = variance > 5;

    if (isOutOfBounds || isHighlyVariable) {
      status = 'Irregular';
      message = 'Irregular Period Cycle Detected';
      
      const reasons: string[] = [];
      if (avgLength < 21) reasons.push(`average duration (${avgLength} days) is less than the typical 21-day bound`);
      if (avgLength > 35) reasons.push(`average duration (${avgLength} days) exceeds the typical 35-day limit`);
      if (isHighlyVariable) reasons.push(`cycle length varies considerably by up to ${variance} days between logs`);

      description = `Your menstrual cycle is classified as irregular because your ${reasons.join(' and ')}. Some variance is normal due to stress, weight adjustments, sleeping habits, or hormonal fluctuations, but we encourage monitoring and consulting a healthcare provider if this persist.`;
    } else {
      status = 'Regular';
      message = 'Regular Menstrual Cycle';
      description = `Congratulations! Your menstrual cycle shows excellent regularity. Your average cycle length is ${avgLength} days with a safe, natural variance of ${variance} days. Keep up your balanced physical health and tracking habits!`;
    }

    setAnalysis({
      status,
      message,
      description,
      averageCycleLength: avgLength,
      variance
    });

  }, [logs]);

  return (
    <div id="health-check" className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Menstrual Cycle Health Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">
          Dynamic calculations of cycle regularity parameters based on logged medical parameters.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Main Status Display with Dynamic Animations */}
        <div className="md:col-span-8 relative min-h-[340px] overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 shadow-sm flex flex-col justify-between">
          
          {/* BACKGROUND ANIMATION EFFECTS */}
          {analysis.status === 'Regular' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {sparkles.map((s) => (
                <div
                  key={s.id}
                  className="absolute animate-bounce text-pink-300 opacity-20"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: `scale(${s.scale})`,
                    animationDelay: `${s.delay}s`,
                    animationDuration: '4s'
                  }}
                >
                  <Sparkles className="h-6 w-6" />
                </div>
              ))}
            </div>
          )}

          {analysis.status === 'Irregular' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
              {sparkles.map((s) => (
                <div
                  key={s.id}
                  className="absolute text-amber-300 opacity-20 animate-pulse"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: `scale(${s.scale})`,
                    animationDelay: `${s.delay}s`,
                    animationDuration: '5s'
                  }}
                >
                  <HelpCircle className="h-6 w-6" />
                </div>
              ))}
            </div>
          )}

          {/* HEADINGS */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              {analysis.status === 'Regular' && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              )}
              {analysis.status === 'Irregular' && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <ShieldAlert className="h-6 w-6" />
                </div>
              )}
              {analysis.status === 'Unknown' && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 animate-pulse">
                  <Activity className="h-6 w-6" />
                </div>
              )}
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  analysis.status === 'Regular' ? 'bg-emerald-100 text-emerald-800' :
                  analysis.status === 'Irregular' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Status: {analysis.status}
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-1">{analysis.message}</h3>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
              {analysis.description}
            </p>
          </div>

          <div className="relative z-10 border-t border-gray-50 pt-4 mt-6 text-xs text-gray-500 flex gap-2 items-center bg-stone-50 p-3 rounded-lg border border-stone-100">
            <span className="text-sm">⚠️</span>
            <span>
              Disclaimer: Clinical evaluations are statistical projections. Regularity checks cannot substitute clinical assessments of reproductive hormones.
            </span>
          </div>
        </div>

        {/* Dynamic Analytics Side Panel */}
        <div className="md:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Analytical Parameters</h3>
            
            {logs.length < 2 ? (
              <div className="text-center py-8 text-gray-400 space-y-2">
                <Calendar className="h-8 w-8 text-gray-200 mx-auto" />
                <p className="text-xs">Add logs to track mathematical parameters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-gray-100 bg-stone-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-xs font-semibold text-gray-600 font-sans">Avg Cycle Length</span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-800">{analysis.averageCycleLength} days</span>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-100 bg-stone-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-rose-500" />
                    <span className="text-xs font-semibold text-gray-600 font-sans">Interval Variance</span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-800">{analysis.variance} days</span>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-100 bg-stone-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-gray-600 font-sans">Evaluated Cycles</span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-800">{logs.length - 1} cycles</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl bg-pink-50/50 hover:bg-pink-50 border border-pink-100/30 p-3 flex flex-col space-y-1">
            <h4 className="text-xs font-bold text-pink-800">Need Guidance to Regulate?</h4>
            <p className="text-[11px] text-pink-700">Explore fitness guidelines, water targets, and nutritional menus in the <strong>Health Tips</strong> panel!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
