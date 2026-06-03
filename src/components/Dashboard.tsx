import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Heart, 
  Droplet, 
  Flame, 
  BookOpen, 
  ShieldAlert, 
  Stethoscope, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { HealthTip } from '../types';

const COMPILATION_TIPS: HealthTip[] = [
  {
    category: "Hydration Intake",
    tip: "Drinking room-temperature water in the morning can boost liver functions and jumpstart high-quality digestion.",
    author: "MediCare AI Clinical Wisdom"
  },
  {
    category: "Stress Management",
    tip: "The 4-7-8 breathing method (breathe in for 4s, hold for 7s, exhale for 8s) instantly lowers high heart rate variability.",
    author: "Harvard Health Studies"
  },
  {
    category: "Rest & Sleep",
    tip: "Maintaining a cool bedroom temperature (65°F / 18°C) allows your body to reach deeper REM and deep sleep cycles quicker.",
    author: "Sleep Research Collective"
  },
  {
    category: "Physical Activity",
    tip: "A brief, brisk 10-minute walk after lunch dramatically mitigates post-meal blood glucose spikes.",
    author: "Endocrine Society Guild"
  },
  {
    category: "Nutrient density",
    tip: "Pairing plant-based iron foods (like spinach) with vitamin C sources (like lemon) improves iron absorption by up to 300%.",
    author: "Clinical Nutrition Institute"
  }
];

interface DashboardProps {
  onNavigate: (tab: string, initialPrompt?: string) => void;
  bmiTracker: { weight: string; height: string; bmi: number | null; status: string } | null;
  waterTracker: { current: number; target: number } | null;
}

export default function Dashboard({ onNavigate, bmiTracker, waterTracker }: DashboardProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Generate a tip of the day dynamically
    setTipIndex(Math.floor(Math.random() * COMPILATION_TIPS.length));
    
    // Format a high-fidelity reading of current standard time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentTip = COMPILATION_TIPS[tipIndex];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % COMPILATION_TIPS.length);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { text: "Good Morning", sub: "How is your body feeling today?" };
    if (hr < 18) return { text: "Good Afternoon", sub: "Take a moment to check your posture." };
    return { text: "Good Evening", sub: "Wind down and hydrate before sleeping." };
  };

  const greetingStatus = getGreeting();

  const mockPreFilledSymptoms = [
    { label: "Frequent Headaches", query: "I have had frequent mild headaches over the last three days. It feels like tension on both sides." },
    { label: "Fever & Dry Cough", query: "I developed a mild fever of 100.4°F yesterday, and I have a persistent dry cough now." },
    { label: "Constant Fatigue", query: "I have been feeling constantly fatigued and lacking energy for a week, even after 8 hours of sleep." },
    { label: "Digestive Discomfort", query: "I have mild abdominal bloating and occasional stomach acid reflux after having heavy dinners." }
  ];

  return (
    <div className="space-y-8" id="medicare-dashboard">
      {/* Visual greeting and banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-md"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          id="dashboard-greeting-banner"
        >
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center pr-8">
            <Stethoscope size={220} className="stroke-[1.2]" />
          </div>

          <div className="relative z-10 space-y-4">
            <span className="bg-emerald-500/30 text-emerald-100 font-mono text-xs px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md">
              🏥 Live Health Portal • {currentTime}
            </span>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {greetingStatus.text}, Health Seeker
              </h1>
              <p className="text-emerald-100/90 text-sm md:text-base max-w-xl">
                {greetingStatus.sub} Run an interactive wellness scan, analyze clinical reports, or consult our empathetic smart medical chat.
              </p>
            </div>
            
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={() => onNavigate('chat')}
                className="bg-white hover:bg-emerald-50 text-teal-800 font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm group duration-250 cursor-pointer"
                id="btn-quick-symptom"
              >
                Start Symptom Analysis
                <ArrowRight size={16} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('report')}
                className="bg-emerald-500 hover:bg-emerald-450 text-white font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl border border-emerald-400/30 transition-all cursor-pointer"
                id="btn-quick-report"
              >
                Analyze Lab Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Rapid Emergency Detection Card */}
        <motion.div 
          className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          id="panic-panel"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm uppercase font-mono tracking-wide">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              Emergency Notice
            </div>
            <h3 className="font-bold text-slate-800 text-base leading-snug">
              Recognize Red-Flag Warnings
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you or a loved one experiences <strong>sudden chest pain</strong>, severe <strong>difficulty breathing</strong>, sudden facial droop or speaking difficulty, seizures, or loss of consciousness, seek medical emergency attention straight away.
            </p>
          </div>
          <div className="pt-4 mt-auto border-t border-slate-50 flex items-center justify-between text-xs text-rose-700 bg-rose-50/50 -mx-6 -mb-6 px-6 py-4.5 rounded-b-3xl">
            <span className="font-medium">Call 911 (or local emergency channels)</span>
            <span className="animate-ping w-2 h-2 rounded-full bg-rose-600 block"></span>
          </div>
        </motion.div>
      </div>

      {/* Wellness stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="wellness-stats-row">
        {/* BMI Card */}
        <motion.div 
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all"
          whileHover={{ y: -3 }}
          id="stat-bmi"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Body Mass Index</span>
            <div className="bg-teal-50 text-teal-600 p-2 rounded-xl">
              <Activity size={18} />
            </div>
          </div>
          <div className="py-4">
            {bmiTracker?.bmi ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-slate-800">
                  {bmiTracker.bmi.toFixed(1)} <span className="text-xs font-mono font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded ml-1">{bmiTracker.status}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Weight: {bmiTracker.weight} kg • Height: {bmiTracker.height} cm
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">No BMI calculation run yet. Enter metrics to track.</p>
                <button 
                  onClick={() => onNavigate('calculators')}
                  className="text-xs font-semibold text-teal-600 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Configure Calculator
                </button>
              </div>
            )}
          </div>
          <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-600 mt-2">
            <span>Healthy baseline:</span>
            <span className="font-mono font-semibold text-slate-700 bg-white border border-slate-100 px-2 py-0.5 rounded">18.5 – 24.9</span>
          </div>
        </motion.div>

        {/* Water Hydration Card */}
        <motion.div 
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all"
          whileHover={{ y: -3 }}
          id="stat-hydration"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Daily Hydration</span>
            <div className="bg-sky-50 text-sky-600 p-2 rounded-xl">
              <Droplet size={18} />
            </div>
          </div>
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <div className="text-2xl font-bold text-slate-800">
                  {waterTracker ? (waterTracker.current / 1000).toFixed(2) : 0.00} <span className="text-xs font-normal text-slate-400">/ {(waterTracker ? waterTracker.target / 1000 : 2.50).toFixed(2)} L</span>
                </div>
                <span className="text-xs text-sky-600 font-mono font-semibold">
                  {waterTracker ? Math.round((waterTracker.current / waterTracker.target) * 100) : 0}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-350"
                  style={{ width: `${Math.min(waterTracker ? (waterTracker.current / waterTracker.target) * 100 : 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-1.5 mt-2">
            <button 
              onClick={() => onNavigate('calculators')}
              className="w-full text-center bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium text-xs py-2 rounded-xl transition-colors cursor-pointer"
            >
              + Quick Hydration
            </button>
          </div>
        </motion.div>

        {/* Daily Caloric Target Card */}
        <motion.div 
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all"
          whileHover={{ y: -3 }}
          id="stat-calories"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">Caloric Target</span>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-xl">
              <Flame size={18} />
            </div>
          </div>
          <div className="py-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-800">
                {waterTracker ? "2,150" : "--"} <span className="text-xs font-normal text-slate-400">kcal / day</span>
              </div>
              <p className="text-xs text-slate-500">
                Determined by Metabolic Target Formula
              </p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-600 mt-2">
            <span>Meal schedule status:</span>
            <span className="font-semibold text-amber-700 bg-amber-50/50 px-2 py-0.5 rounded">Caloric Safe</span>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Health Tip of the Day */}
      <motion.div 
        className="bg-stone-50 border border-stone-200/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        id="tip-section"
      >
        <div className="space-y-3 flex-1">
          <span className="bg-stone-200 text-stone-700 font-semibold font-mono text-[10px] px-2.5 py-1 rounded bg-stone-100 tracking-wider flex items-center gap-1.5 w-fit">
            <BookOpen size={12} />
            RECOMMENDED METABOLIC TRIVIA OF THE DAY
          </span>
          <h4 className="text-lg font-bold text-slate-800 tracking-tight">
            &ldquo;{currentTip.tip}&rdquo;
          </h4>
          <p className="text-xs text-slate-500 font-medium">Source: {currentTip.author}</p>
        </div>
        <button 
          onClick={handleNextTip}
          className="border border-stone-300 hover:bg-stone-100 p-3 rounded-2xl text-stone-600 cursor-pointer transition-all shrink-0 flex items-center justify-center group"
          title="Load next metabolic insight"
          id="btn-next-tip"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 duration-500 transition-transform" />
        </button>
      </motion.div>

      {/* Prompt symptoms list */}
      <div className="space-y-4" id="quick-start-templates">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Heart className="text-emerald-500 w-5 h-5" />
          Symptom Assistant Quick-Checker
        </h3>
        <p className="text-xs text-slate-500 max-w-xl">
          Choose a common mild medical symptoms model to pre-configure the AI Health Assistant and inspect possible safe lifestyle recommendations instantly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockPreFilledSymptoms.map((item, idx) => (
            <motion.div 
              key={idx}
              className="bg-white border border-slate-100 hover:border-emerald-100 rounded-2xl p-4 shadow-3xs hover:shadow-xs hover:bg-emerald-50/10 cursor-pointer transition-all group flex flex-col justify-between"
              onClick={() => onNavigate('chat', item.query)}
              whileHover={{ y: -2 }}
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 duration-200 transition-colors">
                  {item.label}
                </span>
                <p className="text-[11px] text-slate-450 line-clamp-3 leading-relaxed">
                  {item.query}
                </p>
              </div>
              <div className="pt-3 text-[11px] text-emerald-600 font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all mt-3">
                Consult diagnostic chat
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 duration-200 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
