import React, { useEffect, useState } from 'react';
import { LogEntry } from '../types';
import { Calendar, Flame, AlertCircle, Sparkles, Heart, RefreshCw, ChevronRight } from 'lucide-react';

interface DashboardProps {
  logs: LogEntry[];
  isLoading: boolean;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export default function Dashboard({ logs, isLoading, onNavigate, onRefresh }: DashboardProps) {
  const [nextPeriodInfo, setNextPeriodInfo] = useState<{
    lastDate: Date | null;
    nextDate: Date | null;
    daysLeft: number;
    completionPercentage: number;
  }>({
    lastDate: null,
    nextDate: null,
    daysLeft: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    if (logs.length === 0) {
      setNextPeriodInfo({ lastDate: null, nextDate: null, daysLeft: 0, completionPercentage: 0 });
      return;
    }

    // Sort logs chronologically to calculate cycle properties
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const mostRecentLogStr = sortedLogs[sortedLogs.length - 1].date;
    const lastPeriodDate = new Date(mostRecentLogStr + 'T00:00:00'); // Safe local timezone date parsing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate default or dynamic cycle length
    let cycleLength = 28;
    if (sortedLogs.length >= 2) {
      let totalDays = 0;
      let intervalsCount = 0;
      for (let i = 1; i < sortedLogs.length; i++) {
        const d1 = new Date(sortedLogs[i - 1].date + 'T00:00:00');
        const d2 = new Date(sortedLogs[i].date + 'T00:00:00');
        const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 15 && diffDays <= 45) { // reasonable menstruation cycle filter
          totalDays += diffDays;
          intervalsCount++;
        }
      }
      if (intervalsCount > 0) {
        cycleLength = Math.round(totalDays / intervalsCount);
      }
    }

    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);

    const msDiff = nextPeriodDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    // Calculate completion progress of current cycle
    const cycleStartMs = lastPeriodDate.getTime();
    const currentMs = today.getTime();
    const elapsedDays = Math.max(0, Math.round((currentMs - cycleStartMs) / (1000 * 60 * 60 * 24)));
    const completionPercentage = Math.min(100, Math.round((elapsedDays / cycleLength) * 100));

    setNextPeriodInfo({
      lastDate: lastPeriodDate,
      nextDate: nextPeriodDate,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      completionPercentage
    });
  }, [logs]);

  return (
    <div id="dashboard" className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4 animate-pulse text-pink-200" />
              </span>
              <span className="text-sm font-semibold tracking-wider uppercase text-pink-100">Welcome to EmpowerHer</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">Your Menstrual Health Companion</h1>
            <p className="max-w-md text-pink-100 text-sm md:text-base">
              Monitor your period cycle, obtain smart medical wellness tips, and access expert medical queries via artificial intelligence.
            </p>
          </div>
          <button 
            id="quickLogBtn"
            onClick={() => onNavigate('logs')}
            className="self-start md:self-auto flex items-center gap-1 rounded-xl bg-white px-5 py-3 font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50"
          >
            <span>Cycle Logging</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-2/3 bg-[radial-gradient(circle_at_right,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-gray-900">No Logs Recorded</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Log your last period date to calculate expectations, cycle states, and custom health insights.
          </p>
          <button
            id="getStartedBtn"
            onClick={() => onNavigate('logs')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-600 transition"
          >
            Log Your First Date
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Ring Countdown Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Cycle Countdown</h3>
              <Flame className="h-5 w-5 text-rose-500" />
            </div>
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative flex h-36 w-36 items-center justify-center">
                {/* Simplified SVG Ring Path */}
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className="stroke-gray-100"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className="stroke-pink-500 transition-all duration-500"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * nextPeriodInfo.completionPercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-gray-900">{nextPeriodInfo.daysLeft}</span>
                  <p className="text-xs font-semibold text-gray-500">Days Left</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">
                Cycle is {nextPeriodInfo.completionPercentage}% complete
              </p>
            </div>
            <div className="flex gap-2 items-center text-xs text-slate-500 border-t border-slate-50 pt-3">
              <AlertCircle className="h-3.5 w-3.5 text-pink-500" />
              <span>Assumes normal standard duration cycle checks.</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-4">Cycle Milestones</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Last Logged Date</p>
                    <p className="text-sm font-bold text-gray-800">
                      {nextPeriodInfo.lastDate ? nextPeriodInfo.lastDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <Heart className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Expected Next Period</p>
                    <p className="text-sm font-bold text-gray-800">
                      {nextPeriodInfo.nextDate ? nextPeriodInfo.nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-4 flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-pink-500">{logs.length} Total Logs Recorded</span>
              <button 
                onClick={onRefresh}
                className="flex items-center gap-1 hover:text-pink-600 transition"
                title="Sync logs"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Active Indicators</h3>
              <p className="text-xs text-gray-500">Check wellness metrics and obtain insights on cycle lengths.</p>
              
              <div className="space-y-2 mt-2">
                <div 
                  onClick={() => onNavigate('healthcheck')}
                  className="p-3 rounded-xl bg-pink-50/50 hover:bg-pink-50 border border-pink-100/50 cursor-pointer flex justify-between items-center transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                    <span className="text-sm font-semibold text-gray-700">Check Cycle Regularity</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-pink-500" />
                </div>

                <div 
                  onClick={() => onNavigate('chatbot')}
                  className="p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100/50 cursor-pointer flex justify-between items-center transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-semibold text-gray-700">Talk with AI Copilot</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-stone-50 p-3 flex gap-2 items-center text-xs text-stone-600">
              <span className="text-base">💡</span>
              <span>Need relief tips? Navigate to the <strong>Health Tips</strong> panel!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
