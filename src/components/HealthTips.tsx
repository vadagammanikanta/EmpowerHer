import React, { useState } from 'react';
import { Sparkles, Dumbbell, Apple, Heart, ChevronLeft, ChevronRight, Droplet, Coffee, Moon, TrendingUp, Compass } from 'lucide-react';

const TIPS_DATA = {
  menstruation: [
    { text: "Stay hydrated. Drinking enough water helps prevent bloating and reduce cramps.", icon: Droplet, accent: "text-pink-500 bg-pink-50" },
    { text: "Exercise regularly. Gentle exercises like walking can help reduce period discomfort.", icon: TrendingUp, accent: "text-purple-500 bg-purple-50" },
    { text: "Eat a balanced diet. Include foods rich in iron, such as spinach, to replenish iron lost during menstruation.", icon: Apple, accent: "text-rose-500 bg-rose-50" },
    { text: "Get enough sleep. Aim for at least 7-8 hours to help manage stress and regulate hormones.", icon: Moon, accent: "text-indigo-500 bg-indigo-50" },
    { text: "Avoid caffeine. Caffeine can worsen period symptoms, so try to limit coffee and soda.", icon: Coffee, accent: "text-amber-500 bg-amber-50" }
  ],
  fitness: [
    { text: "Engage in at least 150 minutes of moderate aerobic exercise each week to support cycle health.", icon: Dumbbell, accent: "text-blue-500 bg-blue-50" },
    { text: "Incorporate resistance and strength training exercises at least twice a week.", icon: TrendingUp, accent: "text-indigo-500 bg-indigo-50" },
    { text: "Stretch regularly to improve flexibility, posture, and reduce injury risk.", icon: Compass, accent: "text-sky-500 bg-sky-50" },
    { text: "Stay active throughout the day; consider walking or stair-climbing instead of commuting.", icon: Heart, accent: "text-emerald-500 bg-emerald-50" },
    { text: "Listen to your body; prioritize rest and recovery when feeling fatigued before cycles.", icon: Apple, accent: "text-purple-500 bg-purple-50" }
  ],
  nutrition: [
    { text: "Eat plenty of colorful fruits and vegetables for essential antioxidants and vitamins.", icon: Apple, accent: "text-emerald-500 bg-emerald-50" },
    { text: "Incorporate whole fiber grains into your diet for steady energy and blood glucose levels.", icon: TrendingUp, accent: "text-amber-500 bg-amber-50" },
    { text: "Choose healthy lean protein sources, such as beans, peas, seeds, fish, and nuts.", icon: Sparkles, accent: "text-rose-500 bg-rose-50" },
    { text: "Limit added sugars, hyper-processed sodium, and saturated fats to minimize cycle bloating.", icon: Coffee, accent: "text-red-500 bg-red-50" },
    { text: "Stay mindful of hydration ratios and nutrient distribution during bloating periods.", icon: Droplet, accent: "text-teal-500 bg-teal-50" }
  ]
};

export default function HealthTips() {
  const [category, setCategory] = useState<'menstruation' | 'fitness' | 'nutrition'>('menstruation');
  const [tipIndex, setTipIndex] = useState(0);

  const handleNext = () => {
    setTipIndex((prev) => (prev + 1) % TIPS_DATA[category].length);
  };

  const handlePrev = () => {
    setTipIndex((prev) => (prev - 1 + TIPS_DATA[category].length) % TIPS_DATA[category].length);
  };

  const selectCategory = (cat: 'menstruation' | 'fitness' | 'nutrition') => {
    setCategory(cat);
    setTipIndex(0);
  };

  const activeTips = TIPS_DATA[category];
  const activeTip = activeTips[tipIndex];
  const ActiveIcon = activeTip.icon;

  return (
    <div id="health-tips" className="space-y-6">
      {/* HEADER BAR */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Personalized Wellness & Health Guidelines</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select health categories below to cycle through curated recommendations from women's health specialists.
        </p>
      </div>

      {/* FILTER CHIPS */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
        <button
          onClick={() => selectCategory('menstruation')}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition tracking-tight border cursor-pointer ${
            category === 'menstruation'
              ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-100 hover:bg-pink-50/50'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Menstruation Tips</span>
        </button>

        <button
          onClick={() => selectCategory('fitness')}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition tracking-tight border cursor-pointer ${
            category === 'fitness'
              ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-100 hover:bg-purple-50/50'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Fitness Layouts</span>
        </button>

        <button
          onClick={() => selectCategory('nutrition')}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-sm transition tracking-tight border cursor-pointer ${
            category === 'nutrition'
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
              : 'bg-white text-gray-600 border-gray-100 hover:bg-emerald-50/50'
          }`}
        >
          <Apple className="h-4 w-4" />
          <span>Nutrition Guidelines</span>
        </button>
      </div>

      {/* GRAPHIC BANNER CARD & TIP CAROUSEL SLIDE */}
      <div className="grid gap-6 md:grid-cols-12 items-stretch">
        
        {/* GRAPHIC BANNER */}
        <div className={`md:col-span-5 rounded-2xl relative overflow-hidden p-8 text-white min-h-[220px] flex flex-col justify-between shadow-sm transition-all duration-300 ${
          category === 'menstruation' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
          category === 'fitness' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
          'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}>
          <div>
            <Sparkles className="h-8 w-8 text-white/30 animate-pulse mb-3" />
            <h3 className="text-2xl font-bold capitalize">{category} Health</h3>
            <p className="text-white/80 text-xs mt-2 leading-relaxed">
              Empowering lifestyle strategies to balance hormones and keep your physical system functioning smoothly during cycles.
            </p>
          </div>

          <p className="text-[10px] text-white/60 tracking-wider uppercase font-semibold">
            Section Category: {category}
          </p>

          <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[radial-gradient(circle_at_right_bottom,rgba(255,255,255,0.12)_0%,transparent_80%)] pointer-events-none" />
        </div>

        {/* INTERACTIVE CAROUSEL CONTAINER */}
        <div className="md:col-span-7 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Tip {tipIndex + 1} of {activeTips.length}
              </span>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activeTip.accent}`}>
                <ActiveIcon className="h-4 w-4" />
              </div>
            </div>

            {/* TIP TEXT WINDOW */}
            <p className="text-lg font-semibold tracking-tight leading-relaxed text-gray-800 transition duration-300">
              "{activeTip.text}"
            </p>
          </div>

          {/* SLIDER NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
            <div className="flex gap-1">
              {activeTips.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === tipIndex
                      ? 'w-6 bg-gray-800'
                      : 'w-1.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition p-1 cursor-pointer"
                title="Previous Tip"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition p-1 cursor-pointer"
                title="Next Tip"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
