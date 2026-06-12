import React, { useState, useEffect } from 'react';
import { Sparkles, Dumbbell, Apple, Heart, ChevronLeft, ChevronRight, Droplet, Coffee, Moon, TrendingUp, Compass, Star, Grid, List } from 'lucide-react';

const TIPS_DATA = {
  menstruation: [
    { text: "Stay hydrated — drinking 8–10 glasses of water daily helps prevent bloating and reduce cramps.", icon: Droplet, accent: "text-pink-500 bg-pink-50 dark:bg-pink-900/30" },
    { text: "Gentle exercise like walking or yoga can significantly reduce period discomfort and improve mood.", icon: TrendingUp, accent: "text-purple-500 bg-purple-50 dark:bg-purple-900/30" },
    { text: "Eat iron-rich foods like spinach, lentils, and red meat to replenish iron lost during menstruation.", icon: Apple, accent: "text-rose-500 bg-rose-50 dark:bg-rose-900/30" },
    { text: "Aim for 7–8 hours of quality sleep to manage stress hormones and support cycle regulation.", icon: Moon, accent: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" },
    { text: "Limit caffeine and alcohol — both can worsen cramps and disrupt hormonal balance.", icon: Coffee, accent: "text-amber-500 bg-amber-50 dark:bg-amber-900/30" },
    { text: "Apply a heating pad to your lower abdomen for 15–20 minutes to naturally relieve cramp pain.", icon: Heart, accent: "text-red-500 bg-red-50 dark:bg-red-900/30" },
    { text: "Track your symptoms over multiple cycles — patterns help you anticipate and prepare better.", icon: Compass, accent: "text-teal-500 bg-teal-50 dark:bg-teal-900/30" },
    { text: "Magnesium-rich foods like dark chocolate, nuts, and seeds can help reduce PMS mood swings.", icon: Sparkles, accent: "text-violet-500 bg-violet-50 dark:bg-violet-900/30" },
  ],
  fitness: [
    { text: "Aim for at least 150 minutes of moderate aerobic exercise weekly — it directly benefits cycle health.", icon: Dumbbell, accent: "text-blue-500 bg-blue-50 dark:bg-blue-900/30" },
    { text: "Resistance and strength training 2–3 times per week boosts metabolism and hormonal balance.", icon: TrendingUp, accent: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" },
    { text: "Regular stretching improves pelvic flexibility, reduces cramp severity, and prevents injury.", icon: Compass, accent: "text-sky-500 bg-sky-50 dark:bg-sky-900/30" },
    { text: "Walking 10,000 steps daily significantly reduces PMS-related fatigue and mood dips.", icon: Heart, accent: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" },
    { text: "Listen to your body — rest and active recovery during your period is not laziness, it's smart.", icon: Moon, accent: "text-purple-500 bg-purple-50 dark:bg-purple-900/30" },
    { text: "Swimming is a low-impact full-body workout ideal for menstruation week when joints may feel tender.", icon: Droplet, accent: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30" },
    { text: "Core-strengthening exercises reduce lower-back pain associated with menstrual cycles.", icon: TrendingUp, accent: "text-orange-500 bg-orange-50 dark:bg-orange-900/30" },
    { text: "Yoga poses like child's pose, supine twist, and cat-cow relieve cramps during menstruation.", icon: Sparkles, accent: "text-pink-500 bg-pink-50 dark:bg-pink-900/30" },
  ],
  nutrition: [
    { text: "Eat a rainbow of fruits and vegetables daily — varied colors mean varied micronutrients and antioxidants.", icon: Apple, accent: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30" },
    { text: "Whole grains like oats, quinoa, and brown rice provide sustained energy and fiber for stable blood sugar.", icon: TrendingUp, accent: "text-amber-500 bg-amber-50 dark:bg-amber-900/30" },
    { text: "Lean protein from beans, fish, eggs, or tofu supports muscle repair and hormone production.", icon: Sparkles, accent: "text-rose-500 bg-rose-50 dark:bg-rose-900/30" },
    { text: "Limit processed foods and added sugars — they spike cortisol, worsening bloating and mood swings.", icon: Coffee, accent: "text-red-500 bg-red-50 dark:bg-red-900/30" },
    { text: "Omega-3 fatty acids from salmon, flaxseed, and walnuts reduce inflammation and period pain.", icon: Heart, accent: "text-teal-500 bg-teal-50 dark:bg-teal-900/30" },
    { text: "Vitamin D (from sunlight or supplements) supports hormonal balance and reduces menstrual pain.", icon: Dumbbell, accent: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30" },
    { text: "Probiotic-rich foods like yogurt and kimchi support gut health, which directly influences hormonal cycles.", icon: Droplet, accent: "text-green-500 bg-green-50 dark:bg-green-900/30" },
    { text: "Avoid excessive sodium — it causes water retention and worsens period bloating significantly.", icon: Moon, accent: "text-blue-500 bg-blue-50 dark:bg-blue-900/30" },
  ]
};

const CATEGORY_CONFIG = {
  menstruation: { label: 'Menstruation Tips', icon: Heart, gradient: 'from-pink-500 to-rose-600', activeClass: 'bg-pink-500 border-pink-500' },
  fitness: { label: 'Fitness', icon: Dumbbell, gradient: 'from-purple-500 to-indigo-600', activeClass: 'bg-purple-500 border-purple-500' },
  nutrition: { label: 'Nutrition', icon: Apple, gradient: 'from-emerald-500 to-teal-600', activeClass: 'bg-emerald-500 border-emerald-500' },
};

export default function HealthTips() {
  const [category, setCategory] = useState('menstruation');
  const [tipIndex, setTipIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('empowerher-fav-tips') || '{}'); }
    catch { return {}; }
  });

  const toggleFavorite = (key) => {
    setFavorites(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem('empowerher-fav-tips', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const selectCategory = (cat) => { setCategory(cat); setTipIndex(0); setViewAll(false); };
  const handleNext = () => setTipIndex((prev) => (prev + 1) % TIPS_DATA[category].length);
  const handlePrev = () => setTipIndex((prev) => (prev - 1 + TIPS_DATA[category].length) % TIPS_DATA[category].length);

  const activeTips = TIPS_DATA[category];
  const activeTip = activeTips[tipIndex];
  const ActiveIcon = activeTip.icon;
  const config = CATEGORY_CONFIG[category];
  const CatIcon = config.icon;

  return (
    <div id="health-tips" className="space-y-6">

      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Personalized Wellness & Health Guidelines</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Expert recommendations from women's health specialists across menstruation, fitness, and nutrition.
        </p>
      </div>

      {/* Category Chips */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => selectCategory(key)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-sm transition border cursor-pointer active:scale-95 ${
                category === key ? `${cfg.activeClass} text-white shadow-md` : 'border-gray-200 dark:border-gray-700 hover:border-pink-200'
              }`}
              style={category !== key ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' } : {}}
            >
              <Icon className="h-4 w-4" />
              <span>{cfg.label}</span>
            </button>
          );
        })}

        {/* View Toggle */}
        <button
          onClick={() => setViewAll(v => !v)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-sm border transition cursor-pointer active:scale-95"
          style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          title={viewAll ? 'Carousel View' : 'View All Tips'}
        >
          {viewAll ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          <span className="hidden sm:inline">{viewAll ? 'Carousel' : 'View All'}</span>
        </button>
      </div>

      {viewAll ? (
        /* ALL TIPS GRID */
        <div className="animate-fade-in-up">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeTips.map((tip, idx) => {
              const TipIcon = tip.icon;
              const favKey = `${category}-${idx}`;
              const isFav = favorites[favKey];
              return (
                <div key={idx} className="glass-card rounded-2xl p-5 flex flex-col gap-3 relative">
                  <div className="flex items-start justify-between">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tip.accent}`}>
                      <TipIcon className="h-4 w-4" />
                    </div>
                    <button
                      onClick={() => toggleFavorite(favKey)}
                      className="p-1 rounded-lg transition hover:scale-110 active:scale-90"
                      title={isFav ? 'Remove from favorites' : 'Save as favorite'}
                    >
                      <Star className={`h-4 w-4 transition ${isFav ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                    "{tip.text}"
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Tip {idx + 1} of {activeTips.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CAROUSEL VIEW */
        <div className="grid gap-6 md:grid-cols-12 items-stretch animate-fade-in-up">

          {/* Gradient Banner */}
          <div className={`md:col-span-5 rounded-2xl relative overflow-hidden p-8 text-white min-h-[220px] flex flex-col justify-between shadow-md bg-gradient-to-br ${config.gradient}`}>
            <div>
              <CatIcon className="h-10 w-10 text-white/30 mb-3" />
              <h3 className="text-2xl font-bold capitalize">{category} Health</h3>
              <p className="text-white/80 text-xs mt-2 leading-relaxed">
                Empowering lifestyle strategies to balance hormones and keep your body functioning optimally.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/60 tracking-wider uppercase font-bold">
                {activeTips.length} tips available
              </p>
              <div className="flex gap-1">
                {activeTips.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTipIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === tipIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[radial-gradient(circle_at_right_bottom,rgba(255,255,255,0.12)_0%,transparent_80%)] pointer-events-none" />
          </div>

          {/* Tip Card */}
          <div className="md:col-span-7 glass-card rounded-2xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Tip {tipIndex + 1} / {activeTips.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(`${category}-${tipIndex}`)}
                    className="p-1.5 rounded-lg transition hover:scale-110"
                    title={favorites[`${category}-${tipIndex}`] ? 'Unsave' : 'Save tip'}
                  >
                    <Star className={`h-4 w-4 transition ${favorites[`${category}-${tipIndex}`] ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  </button>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${activeTip.accent}`}>
                    <ActiveIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <p className="text-lg font-semibold tracking-tight leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                "{activeTip.text}"
              </p>
            </div>

            <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border-muted)' }}>
              <button
                onClick={() => setViewAll(true)}
                className="text-xs font-bold hover:text-pink-500 transition flex items-center gap-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <Grid className="h-3.5 w-3.5" />
                View All Tips
              </button>

              <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="flex h-10 w-10 items-center justify-center rounded-xl border transition hover:border-pink-300 hover:text-pink-500 active:scale-90"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-muted)' }}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={handleNext} className="flex h-10 w-10 items-center justify-center rounded-xl border transition hover:border-pink-300 hover:text-pink-500 active:scale-90"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-muted)' }}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
