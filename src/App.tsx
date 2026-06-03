import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Activity, 
  Droplet, 
  Flame, 
  ShieldAlert, 
  Stethoscope, 
  ChevronRight, 
  Send, 
  Upload, 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  Apple, 
  Clipboard, 
  Sparkles, 
  Trash2,
  Calendar,
  AlertTriangle,
  Award,
  RefreshCw,
  Scale,
  Bell,
  Pill
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import MedicationReminders from './components/MedicationReminders';
import { 
  Message, 
  MedicalReportAnalysis, 
  NutritionPlan, 
  FitnessPlan, 
  MedicineDetails 
} from './types';

export default function App() {
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Trackers States (BMIs, hydration, calories)
  const [bmiTracker, setBmiTracker] = useState<{ weight: string; height: string; bmi: number | null; status: string }>({
    weight: '70',
    height: '175',
    bmi: 22.9,
    status: 'Normal Weight'
  });
  const [waterTracker, setWaterTracker] = useState<{ current: number; target: number }>({
    current: 1250,
    target: 2500
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am MediCare AI, your clinical health assistant. I can help analyze mild symptoms, explain medical test results, help structure customized diets/workouts, or locate medication details. \n\nHow is your body feeling today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lab Report Analyzer State
  const [reportText, setReportText] = useState('');
  const [reportImage, setReportImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [reportFileName, setReportFileName] = useState<string>('');
  const [isReportAnalyzing, setIsReportAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalReportAnalysis | null>(null);
  const [reportError, setReportError] = useState('');

  // Nutrition Form State
  const [nutritionGoal, setNutritionGoal] = useState('General Fitness');
  const [nutritionRestrictions, setNutritionRestrictions] = useState('');
  const [nutritionAllergies, setNutritionAllergies] = useState('');
  const [isNutritionGenerating, setIsNutritionGenerating] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);

  // Fitness Form State
  const [fitnessGoal, setFitnessGoal] = useState('General Fitness');
  const [fitnessAge, setFitnessAge] = useState('30');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [fitnessDays, setFitnessDays] = useState(3);
  const [fitnessLocation, setFitnessLocation] = useState('Home/No Equipment');
  const [isFitnessGenerating, setIsFitnessGenerating] = useState(false);
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);

  // Medicine Finder State
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medAge, setMedAge] = useState('');
  const [medSymptoms, setMedSymptoms] = useState('');
  const [medDuration, setMedDuration] = useState('');
  const [medConditions, setMedConditions] = useState('');
  const [medAllergies, setMedAllergies] = useState('');
  const [isMedLookingUp, setIsMedLookingUp] = useState(false);
  const [medDetails, setMedDetails] = useState<MedicineDetails | null>(null);
  const [showMedForm, setShowMedForm] = useState(false);

  // General Status Display
  const [patientId] = useState('#MC-90821');

  // Auto Scroll Chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading]);

  // Handle Tab Navigation (from quick starters or tabs)
  const handleNavigation = (tab: string, initialPrompt?: string) => {
    setActiveTab(tab);
    if (initialPrompt) {
      if (tab === 'chat') {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newUserMsg: Message = {
          id: Math.random().toString(),
          role: 'user',
          text: initialPrompt,
          timestamp
        };
        setChatMessages(prev => [...prev, newUserMsg]);
        triggerChatApi([...chatMessages, newUserMsg]);
      } else if (tab === 'calculators' && initialPrompt.includes('Hydration')) {
        // Hydrate trigger
        setWaterTracker(prev => ({ ...prev, current: Math.min(prev.current + 250, prev.target) }));
      }
    }
  };

  // Chat API Call Trigger
  const triggerChatApi = async (history: Message[]) => {
    setIsChatLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: history.map(item => ({
            role: item.role,
            text: item.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Endpoint failed to reply.");
      }

      const data = await response.json();
      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergency: !!data.isEmergency
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          text: `⚠️ **Server connection offline.** Could not reach the Gemini Clinical Core. Please verify that your GEMINI_API_KEY is configured in the AI Studio Secrets panel.\n\nDetail: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Submit User Chat Message
  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: inputMessage,
      timestamp
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setInputMessage('');
    triggerChatApi(updatedHistory);
  };

  // Handle Lab Report Image Upload
  const handleReportImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setReportImage({
        data: result.split(',')[1], // strip the base64 preamble (e.g. data:image/png;base64)
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  // Submit Lab Report Analysis
  const handleRunReportAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim() && !reportImage) {
      setReportError("Please enter test report text or drop a report image.");
      return;
    }

    setReportError('');
    setIsReportAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: reportImage?.data || null,
          mimeType: reportImage?.mimeType || null,
          textInput: reportText || null
        })
      });

      if (!response.ok) {
        throw new Error("Report parsing server error.");
      }

      const resJson = await response.json();
      setAnalysisResult(resJson);
    } catch (err: any) {
      setReportError(`Failed to process: ${err.message || "Unknown server fault."}`);
    } finally {
      setIsReportAnalyzing(false);
    }
  };

  // Quick prepopulate text into analyzer
  const handleLoadSampleReportText = () => {
    setReportText(`HEMATOLOGY PANEL STUDY:
Hemoglobin: 12.5 g/dL (Reference Range: 13.5 - 17.5 g/dL) (Low)
White Cell Count: 7.2 x10^3/uL (Reference Range: 4.5 - 11.0 x10^3/uL) (Normal)
Platelet Count: 210 x10^3/uL (Reference Range: 150 - 450 x10^3/uL) (Normal)
Fasting Cholesterol: 235 mg/dL (Reference Range: < 200 mg/dL) (High)
Patient notes: Fasted 12 hours. Reports feeling slight exhaustion morning hours.`);
    setReportImage(null);
    setReportFileName('');
  };

  // Submit personalized Nutrition Planner Request
  const handleGenerateNutrition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNutritionGenerating(true);
    setNutritionPlan(null);

    // Calculate BMR and active values client-side to supply the TDEE baseline
    const w = parseFloat(bmiTracker.weight) || 70;
    const h = parseFloat(bmiTracker.height) || 175;
    const isMale = true; // baseline estimation
    const estBmr = isMale ? (10 * w) + (6.25 * h) - (5 * 30) + 5 : (10 * w) + (6.25 * h) - (5 * 30) - 161;
    const estTdee = Math.round(estBmr * 1.375); // light activity baseline

    try {
      const response = await fetch('/api/generate-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: nutritionGoal,
          restrictions: nutritionRestrictions || "None indicated",
          allergies: nutritionAllergies || "None indicated",
          bmr: estBmr,
          tdee: estTdee,
          currentWeight: bmiTracker.weight,
          targetWeight: nutritionGoal.includes('Loss') ? `${Math.max(w - 5, 45)}` : `${Math.min(w + 5, 120)}`,
          gender: isMale ? "Male" : "Female"
        })
      });

      if (!response.ok) throw new Error("Server nutrition API error");
      const nutritionData = await response.json();
      setNutritionPlan(nutritionData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsNutritionGenerating(false);
    }
  };

  // Submit Personalized Fitness Routine Builder Request
  const handleGenerateFitness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFitnessGenerating(true);
    setFitnessPlan(null);

    try {
      const response = await fetch('/api/generate-fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: fitnessGoal,
          age: fitnessAge,
          fitnessLevel: fitnessLevel,
          activeDaysCount: fitnessDays,
          preferredLocation: fitnessLocation
        })
      });

      if (!response.ok) throw new Error("Server fitness API error");
      const fitnessData = await response.json();
      setFitnessPlan(fitnessData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFitnessGenerating(false);
    }
  };

  // Medication Lookup logic
  const handleMedicineLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineSearch.trim()) return;

    if (!showMedForm) {
      // Prompt user for context form first to verify safety and ask age/symptoms as ordered by system workflow
      setShowMedForm(true);
      return;
    }

    setIsMedLookingUp(true);
    setMedDetails(null);

    try {
      const response = await fetch('/api/medicine-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: medicineSearch,
          symptomContext: `Age: ${medAge || 'N/A'}, Symptoms: ${medSymptoms || 'N/A'}, Duration: ${medDuration || 'N/A'}, Chronic Conditions: ${medConditions || 'None'}, Allergies: ${medAllergies || 'None'}`
        })
      });

      if (!response.ok) throw new Error("Server medicine details lookup error");
      const medicineData = await response.json();
      setMedDetails(medicineData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsMedLookingUp(false);
    }
  };

  // Quick reset for medicine query
  const handleResetMedicineSearch = () => {
    setMedicineSearch('');
    setMedDetails(null);
    setShowMedForm(false);
    setMedAge('');
    setMedSymptoms('');
    setMedDuration('');
    setMedConditions('');
    setMedAllergies('');
  };

  // Calculators logic
  const handleCalculateBmi = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(bmiTracker.weight);
    const h = parseFloat(bmiTracker.height) / 100; // to meters

    if (w > 0 && h > 0) {
      const bmiVal = w / (h * h);
      let stat = 'Normal Weight';
      if (bmiVal < 18.5) stat = 'Underweight';
      else if (bmiVal >= 25 && bmiVal < 30) stat = 'Overweight';
      else if (bmiVal >= 30) stat = 'Obese';

      setBmiTracker(prev => ({
        ...prev,
        bmi: bmiVal,
        status: stat
      }));
    }
  };

  const handleQuickAddWater = (amt: number) => {
    setWaterTracker(prev => ({
      ...prev,
      current: Math.min(prev.current + amt, prev.target)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="application-container">
      
      {/* Top Clinical Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0" id="global-navbar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-teal-700 transition-colors" onClick={() => setActiveTab('dashboard')}>
            <Stethoscope size={22} className="stroke-[2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none flex items-center gap-1.5">
              MediCare AI
              <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.5 rounded-md font-mono">3.5 Dual</span>
            </h1>
            <span className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">Clinical Intelligence Engine</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 border-r border-slate-200 pr-5">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-mono">Patient Status</p>
              <p className="text-xs font-bold text-slate-700 uppercase">{patientId}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-600">
              MC
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 font-mono">SERVER LIVE</span>
          </div>
        </div>
      </nav>

      {/* Main Grid Division */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative" id="layout-grid">
        
        {/* Left Side menu */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col p-5 shrink-0" id="left-sidebar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">Navigation Hub</span>
          
          <div className="space-y-1.5 mb-6">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'dashboard' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <Activity size={15} className={activeTab === 'dashboard' ? 'text-teal-600' : 'text-slate-400'} />
              Dashboard Overview
            </button>

            <button 
              onClick={() => setActiveTab('chat')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'chat' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <Heart size={15} className={activeTab === 'chat' ? 'text-teal-600' : 'text-slate-400'} />
              Symptom Checker Chat
            </button>

            <button 
              onClick={() => setActiveTab('report')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'report' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <FileText size={15} className={activeTab === 'report' ? 'text-teal-600' : 'text-slate-400'} />
              Lab Report Analyzer
            </button>

            <button 
              onClick={() => setActiveTab('nutrition')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'nutrition' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <Apple size={15} className={activeTab === 'nutrition' ? 'text-teal-600' : 'text-slate-400'} />
              Nutrition Planner
            </button>

            <button 
              onClick={() => setActiveTab('fitness')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'fitness' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <Calendar size={15} className={activeTab === 'fitness' ? 'text-teal-600' : 'text-slate-400'} />
              Fitness Routine Builder
            </button>

            <button 
              onClick={() => setActiveTab('medicine')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'medicine' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <Search size={15} className={activeTab === 'medicine' ? 'text-teal-600' : 'text-slate-400'} />
              Medicine Directory
            </button>

            <button 
              onClick={() => setActiveTab('medication-reminders')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'medication-reminders' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <Bell size={15} className={activeTab === 'medication-reminders' ? 'text-teal-600' : 'text-slate-400'} />
              Medication Reminders
            </button>

            <button 
              onClick={() => setActiveTab('calculators')} 
              className={`w-full text-left px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all text-slate-700 hover:bg-slate-50 cursor-pointer ${activeTab === 'calculators' ? 'bg-teal-50! text-teal-900! font-bold border-l-4 border-teal-600 pl-3.5' : ''}`}
            >
              <Scale size={15} className={activeTab === 'calculators' ? 'text-teal-600' : 'text-slate-400'} />
              Calculators & Trackers
            </button>
          </div>

          {/* Vitals Summary sidebar section */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono mt-1 hidden lg:block">Clinician Desk</span>
          <div className="space-y-2.5 hidden lg:block">
            <div className="p-3 bg-teal-50/50 border border-teal-100/50 rounded-2xl">
              <span className="text-[10px] text-teal-800 uppercase font-mono font-bold block">Heart Rate Tracker</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-extrabold text-teal-950">72</span>
                <span className="text-[10px] text-teal-700 font-mono">bpm (Safe Normal)</span>
              </div>
            </div>

            <div className="p-3 bg-teal-50/50 border border-teal-100/50 rounded-2xl">
              <span className="text-[10px] text-teal-800 uppercase font-mono font-bold block">Sleep Efficiency</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-extrabold text-teal-950">88%</span>
                <span className="text-[10px] text-teal-700 font-mono">Good Quality Baseline</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Central Component Panel */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8" id="central-view-port">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard 
                  onNavigate={handleNavigation} 
                  bmiTracker={bmiTracker} 
                  waterTracker={waterTracker} 
                />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-12rem)] min-h-[500px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Chat header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Empathetic Diagnostic Assistant</h3>
                      <p className="text-[10px] text-slate-500">Always complies with critical patient safety boundaries.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm("Reset chat log?")) {
                        setChatMessages([
                          {
                            id: 'welcome',
                            role: 'assistant',
                            text: "Hello! I am MediCare AI, your clinical health assistant. I can help analyze mild symptoms, explain medical test results, help structure customized diets/workouts, or locate medication details. \n\nHow is your body feeling today?",
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        ]);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Reset Chat Log"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                  {chatMessages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div 
                        key={msg.id || index}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isUser && (
                            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white shrink-0 flex items-center justify-center font-bold text-xs" style={{ minWidth: '32px' }}>
                              AI
                            </div>
                          )}
                          <div 
                            className={`p-4 rounded-3xl shadow-3xs text-xs md:text-sm leading-relaxed ${
                              isUser 
                                ? 'bg-teal-600 text-white rounded-tr-none' 
                                : msg.isEmergency 
                                  ? 'bg-rose-550 text-white border-none rounded-tl-none font-medium' 
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}
                          >
                            <span className="whitespace-pre-wrap">{msg.text}</span>
                            <div className={`text-[9px] mt-2 block text-right font-mono ${isUser || msg.isEmergency ? 'text-white/60' : 'text-slate-400'}`}>
                              {msg.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white shrink-0 flex items-center justify-center font-bold text-xs animate-pulse">
                          AI
                        </div>
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-slate-500 text-xs flex items-center gap-2">
                          <RefreshCw size={14} className="animate-spin text-teal-600" />
                          Processing diagnosis heuristics...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>

                {/* Prompt Wizard helpers */}
                <div className="border-t border-slate-100 px-6 py-2.5 bg-slate-50/50 flex flex-wrap gap-2 justify-center items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold font-mono tracking-wider mr-2">Symptom Form Wizard:</span>
                  <button 
                    onClick={() => setInputMessage("Age: 28, Gender: Male, Temp: Normal. I've had mild throbbing temples headache for 2 days now, severity 4/10. No allergies or conditions.")}
                    className="text-[10px] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/10 cursor-pointer"
                  >
                    📝 Headache Template
                  </button>
                  <button 
                    onClick={() => setInputMessage("Age: 35, Gender: Female. Experiencing 101.2°F fever, minor dry cough for 36 hours. Severity 5/10. Allergy to Penicillin.")}
                    className="text-[10px] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/10 cursor-pointer"
                  >
                    🤒 Dry Cough & Fever Template
                  </button>
                  <button 
                    onClick={() => setInputMessage("Age: 42, Gender: Male. Severe stomach bloating and reflux acid chest burning after heavy meals last 1 week. Severity 6/10.")}
                    className="text-[10px] bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/10 cursor-pointer"
                  >
                    🥑 Reflux Acid Template
                  </button>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChatMessage} className="p-4 bg-white border-t border-slate-250 flex items-center gap-3">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Briefly state symptoms, duration, severity, age..."
                    className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all shadow-inner"
                    disabled={isChatLoading}
                  />
                  <button 
                    type="submit" 
                    className="bg-slate-900 text-white rounded-xl p-3 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    disabled={isChatLoading || !inputMessage.trim()}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'report' && (
              <motion.div
                key="report"
                className="max-w-4xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                    <FileText size={24} className="text-teal-600" />
                    Clinical Lab Report Parse Assistant
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Paste blood panels or upload high-contrast medical reports. We'll identify hemoglobin count, thyroid, lipid targets, and flag high/low metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Parameter Panel */}
                  <div className="md:col-span-1 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4.5 shadow-3xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">INPUT METHOD</span>
                      
                      {/* Image uploader with supporting drag-and-drop actions */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Report Attachment</label>
                        <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/10 rounded-2xl p-4 transition-all text-center relative cursor-pointer group">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleReportImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <div className="space-y-1.5">
                            <Upload className="w-7 h-7 mx-auto text-slate-400 group-hover:text-teal-600 transition-colors" />
                            <p className="text-[11px] font-medium text-slate-600">
                              {reportFileName ? "Change Attachment" : "Drag-and-Drop or Select"}
                            </p>
                            <p className="text-[9px] text-slate-400">PDF, PNG, JPG files</p>
                          </div>
                        </div>

                        {reportFileName && (
                          <div className="bg-teal-50 text-teal-800 text-[10px] p-2.5 rounded-xl border border-teal-150 flex items-center justify-between">
                            <span className="truncate font-semibold max-w-[180px]">{reportFileName}</span>
                            <button 
                              onClick={() => { setReportFileName(''); setReportImage(null); }}
                              className="text-teal-600 hover:text-teal-900 bg-teal-100 rounded p-1"
                              title="Clear Attachment"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Text box option */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Or Paste Clean Text Logs</label>
                        <textarea 
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          placeholder="e.g. Hemoglobin 12.5 (Reference 13.5 - 17.5)..."
                          rows={6}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 shadow-inner resize-none"
                        ></textarea>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2.5 pt-1.5">
                        <button 
                          onClick={handleRunReportAnalysis}
                          disabled={isReportAnalyzing || (!reportText.trim() && !reportImage)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs md:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          {isReportAnalyzing ? (
                            <>
                              <RefreshCw size={14} className="animate-spin text-white" />
                              Parsing medical nodes...
                            </>
                          ) : (
                            <>
                              <Activity size={14} />
                              Run Report Analysis
                            </>
                          )}
                        </button>

                        <button 
                          onClick={handleLoadSampleReportText}
                          className="w-full text-center border border-slate-200 hover:bg-slate-50 font-medium text-[11px] text-slate-600 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          Load Sample Clinical Record
                        </button>
                      </div>

                      {reportError && (
                        <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-100 font-medium">
                          {reportError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Response / Table View Panel */}
                  <div className="md:col-span-2 space-y-4">
                    {analysisResult ? (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-6">
                        
                        {/* Summary Block */}
                        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase mr-1.5 font-mono">SUCCESSFULLY ANALYZED</span>
                            <h3 className="font-bold text-slate-950 text-base mt-1">Diagnostic Report Summary</h3>
                          </div>
                          
                          {analysisResult.patientInfo && (
                            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-wrap gap-x-3 gap-y-1">
                              <span><strong>Age:</strong> {analysisResult.patientInfo.age || "Unknown"}</span>
                              <span><strong>Gender:</strong> {analysisResult.patientInfo.gender || "Unknown"}</span>
                              <span><strong>Date:</strong> {analysisResult.patientInfo.date || "Unknown"}</span>
                            </div>
                          )}
                        </div>

                        {/* Lab Rows Table */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">EXTRACTED LAB RECORD VALUES</label>
                          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-550 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                                  <th className="p-3.5 pl-4 font-semibold">Test Name</th>
                                  <th className="p-3.5 font-semibold">Result Value</th>
                                  <th className="p-3.5 font-semibold">Reference Range</th>
                                  <th className="p-3.5 text-right pr-4 font-semibold">Assessment</th>
                                </tr>
                              </thead>
                              <tbody className="text-slate-700 divide-y divide-slate-50">
                                {analysisResult.results.map((row, idx) => {
                                  const isNormal = row.status === 'Normal';
                                  const isLow = row.status === 'Low';
                                  const isHigh = row.status === 'High';
                                  const isCritical = row.status === 'Critical';

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50">
                                      <td className="p-3.5 pl-4 font-semibold text-slate-900 border-none">{row.testName}</td>
                                      <td className="p-3.5 font-mono text-slate-700 border-none">{row.result}</td>
                                      <td className="p-3.5 font-mono text-slate-500 border-none">{row.referenceRange}</td>
                                      <td className="p-3.5 text-right pr-4 border-none">
                                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase font-mono ${
                                          isNormal ? 'bg-teal-50 text-teal-700' :
                                          isLow ? 'bg-amber-50 text-amber-700' :
                                          isHigh ? 'bg-orange-50 text-orange-700' :
                                          isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                          {row.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Interactive Heuristic Summaries */}
                        <div className="space-y-4">
                          <blockquote className="bg-stone-50 border-l-4 border-slate-700 p-4 rounded-r-2xl text-xs md:text-sm text-slate-700 leading-relaxed italic">
                            &ldquo;{analysisResult.summary}&rdquo;
                          </blockquote>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl space-y-2">
                              <span className="text-[10px] text-teal-800 uppercase font-mono font-bold block mb-1">Nutrition & Food Adjustments</span>
                              <ul className="text-xs text-slate-600 space-y-1.5 leading-snug">
                                {analysisResult.nutritionRecommendations.map((item, id) => (
                                  <li key={id} className="flex gap-1.5 items-start">
                                    <span className="text-teal-600 shrink-0">✓</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-4 bg-teal-50/30 border border-teal-100/50 rounded-2xl space-y-2">
                              <span className="text-[10px] text-teal-800 uppercase font-mono font-bold block mb-1">Lifestyle Modifications</span>
                              <ul className="text-xs text-slate-600 space-y-1.5 leading-snug">
                                {analysisResult.lifestyleRecommendations.map((item, id) => (
                                  <li key={id} className="flex gap-1.5 items-start">
                                    <span className="text-teal-600 shrink-0">✓</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {analysisResult.warningSigns?.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2">
                              <span className="text-[10px] text-rose-800 uppercase font-mono font-bold block flex items-center gap-1">
                                <AlertTriangle size={12} className="text-rose-600 shrink-0" />
                                CONTEXT SPECIFIC WARNING SIGNS
                              </span>
                              <ul className="text-xs text-rose-850 space-y-1 leading-snug">
                                {analysisResult.warningSigns.map((item, id) => (
                                  <li key={id} className="flex gap-1.5 items-start">
                                    <span className="text-rose-600 shrink-0">•</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-3xs flex flex-col justify-center items-center min-h-[350px]">
                        <FileText size={48} className="text-slate-300 stroke-[1.2]" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-700 text-sm">Waiting for Analysis Input</h4>
                          <p className="text-xs text-slate-400 max-w-sm">Provide laboratory numerical results in the left parameter card, and hit 'Run Report Analysis' to parse with clinical AI insights.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'nutrition' && (
              <motion.div
                key="nutrition"
                className="max-w-4xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                    <Apple size={24} className="text-teal-600 animate-bounce" style={{ animationDuration: '3s' }} />
                    Daily Customized Nutrition Assistant
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Establishes macronutrient and dietary fiber schedules. Integrates calorie target generation directly based on metabolic calculations.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Goal Configurator Card */}
                  <div className="lg:col-span-1 space-y-4">
                    <form onSubmit={handleGenerateNutrition} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4.5 shadow-3xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">NUTRITION CONFIGS</span>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Main Objective Goal</label>
                        <select 
                          value={nutritionGoal}
                          onChange={(e) => setNutritionGoal(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-3xs"
                        >
                          <option value="Weight Loss">Weight Loss (Mild Calorie Deficit)</option>
                          <option value="Weight Gain">Weight Gain (Caloric Surplus)</option>
                          <option value="Muscle Building">Muscle Building & Recovery</option>
                          <option value="General Fitness">General Metabolic Fitness</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Dietary Restrictions</label>
                        <input 
                          type="text" 
                          value={nutritionRestrictions}
                          onChange={(e) => setNutritionRestrictions(e.target.value)}
                          placeholder="e.g. Vegetarian, Keto, Halal, None..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 shadow-inner"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Known Allergies / Flags</label>
                        <input 
                          type="text" 
                          value={nutritionAllergies}
                          onChange={(e) => setNutritionAllergies(e.target.value)}
                          placeholder="e.g. Peanuts, Gluten, Dairy, Soy, None..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 shadow-inner"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isNutritionGenerating}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs md:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors pt-2.5"
                      >
                        {isNutritionGenerating ? (
                          <>
                            <RefreshCw size={14} className="animate-spin text-white" />
                            Calculating meals...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-amber-400" />
                            Generate Daily Menu Plan
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Daily plan output card */}
                  <div className="lg:col-span-2 space-y-4">
                    {nutritionPlan ? (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-6">
                        
                        {/* Nutrition target metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-b border-slate-100 pb-5">
                          <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-mono font-medium block">Daily Target</span>
                            <span className="text-lg font-extrabold text-slate-900">{nutritionPlan.dailyCalorieTarget}</span>
                            <span className="text-[8px] text-slate-550 block font-mono">kcal</span>
                          </div>
                          
                          <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-mono font-medium block">Protein</span>
                            <span className="text-lg font-extrabold text-teal-700">{nutritionPlan.macros.protein}g</span>
                            <span className="text-[8px] text-slate-550 block font-mono">Build & Repair</span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-mono font-medium block">Carbohydrates</span>
                            <span className="text-lg font-extrabold text-slate-700">{nutritionPlan.macros.carbs}g</span>
                            <span className="text-[8px] text-slate-550 block font-mono">Energy</span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-2xl text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-mono font-medium block">Fat</span>
                            <span className="text-lg font-extrabold text-slate-700">{nutritionPlan.macros.fat}g</span>
                            <span className="text-[8px] text-slate-550 block font-mono">Regulation</span>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
                            <span className="text-[9px] text-slate-400 uppercase font-mono font-medium block">Water</span>
                            <span className="text-lg font-extrabold text-sky-700">{nutritionPlan.waterIntakeLiters}L</span>
                            <span className="text-[8px] text-slate-550 block font-mono">Hydration Goal</span>
                          </div>
                        </div>

                        {/* Meal schedules */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">DAILY MEAL OUTLINE</h4>
                          
                          <div className="space-y-3">
                            {nutritionPlan.meals.map((meal, index) => (
                              <div key={index} className="border border-slate-100 hover:border-teal-100 rounded-2xl p-4 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-dashed border-slate-100 pb-2 mb-2">
                                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                                    {meal.mealName}
                                  </span>
                                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100/50">
                                    <span>{meal.calories} kcal</span>
                                    <span>•</span>
                                    <span>P: {meal.protein}g</span>
                                    <span>•</span>
                                    <span>C: {meal.carbs}g</span>
                                    <span>•</span>
                                    <span>F: {meal.fat}g</span>
                                    <span>•</span>
                                    <span>Fib: {meal.fiber}g</span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-sans">{meal.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nutrition Tips */}
                        <div className="bg-teal-50/20 border border-teal-150/40 rounded-2xl p-4.5 space-y-2">
                          <span className="text-[10px] text-teal-800 uppercase font-mono font-bold block mb-1">Dietitian-Approved Clinical Tips</span>
                          <ul className="text-xs text-slate-600 space-y-1.5 leading-snug">
                            {nutritionPlan.tips.map((tip, id) => (
                              <li key={id} className="flex gap-1.5 items-start">
                                <span className="text-teal-600 shrink-0">✓</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-3xs flex flex-col justify-center items-center min-h-[350px]">
                        <Apple size={48} className="text-slate-300 stroke-[1.2]" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-700 text-sm">No Nutrition Plan Formed</h4>
                          <p className="text-xs text-slate-400 max-w-sm">Select restriction and allergy credentials in the left configurator module, then select 'Generate Daily Menu Plan' to compile.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'fitness' && (
              <motion.div
                key="fitness"
                className="max-w-4xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                    <Calendar size={24} className="text-teal-600" />
                    Personal Physical Fitness Routine Builder
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Fosters balanced physical habits, cardiovascular adaptation, strength training patterns, and recovery. Sets exercises by set and rep values.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Parameter Entry box */}
                  <div className="lg:col-span-1 space-y-4">
                    <form onSubmit={handleGenerateFitness} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4.5 shadow-3xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">FITNESS PARAMETERS</span>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Primary Target Goal</label>
                        <select 
                          value={fitnessGoal}
                          onChange={(e) => setFitnessGoal(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-3xs"
                        >
                          <option value="Weight Loss">Weight Loss (Fat Burning)</option>
                          <option value="Weight Gain">Weight Gain (Bulk & Strength)</option>
                          <option value="Muscle Building">Hypertrophy & Muscle Building</option>
                          <option value="General Fitness">Cardiovascular Health & Recovery</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Age Context</label>
                        <input 
                          type="number" 
                          value={fitnessAge}
                          onChange={(e) => setFitnessAge(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 shadow-inner"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700 block text-xs">Activity Level</label>
                          <select 
                            value={fitnessLevel}
                            onChange={(e) => setFitnessLevel(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced Athlete</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700 block text-xs">Days/Week</label>
                          <select 
                            value={fitnessDays}
                            onChange={(e) => setFitnessDays(parseInt(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none"
                          >
                            <option value={2}>2 Days</option>
                            <option value={3}>3 Days</option>
                            <option value={4}>4 Days</option>
                            <option value={5}>5 Days</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">Training Location Preference</label>
                        <select 
                          value={fitnessLocation}
                          onChange={(e) => setFitnessLocation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none shadow-3xs"
                        >
                          <option value="Home/No Equipment">Home Floor (Calisthenics)</option>
                          <option value="Gym/Full Equipment">Commercial Gym (Dumbbell/Barbells)</option>
                          <option value="Outdoor/Tracks">Outdoor / Athletics Track</option>
                        </select>
                      </div>

                      <button 
                        type="submit"
                        disabled={isFitnessGenerating}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs md:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors pt-2.5"
                      >
                        {isFitnessGenerating ? (
                          <>
                            <RefreshCw size={14} className="animate-spin text-white" />
                            Calibrating calendar...
                          </>
                        ) : (
                          <>
                            <Calendar size={14} className="text-teal-400" />
                            Form Fitness Calendar Plan
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Program view panel */}
                  <div className="lg:col-span-2 space-y-4">
                    {fitnessPlan ? (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-6">
                        
                        <div className="border-b border-slate-100 pb-4">
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono mr-1.5">ROUTINE SUCCESS</span>
                          <h3 className="font-bold text-slate-950 text-base mt-1.5">Target Focus: {fitnessPlan.goal}</h3>
                          <p className="text-[11px] text-slate-400 leading-snug mt-1 border-t border-slate-50 pt-1.5 font-mono uppercase">CALORIC EXPAND METABOLIC: {fitnessPlan.dailyCalorieTarget} kcal/day target</p>
                        </div>

                        {/* Daily Exercise listings */}
                        <div className="space-y-6">
                          {fitnessPlan.weeklySchedule.map((dayPlan, idx) => (
                            <div key={idx} className="space-y-3">
                              <div className="bg-slate-100 border border-slate-200/50 rounded-xl px-4 py-2 flex justify-between items-center">
                                <span className="font-bold text-xs text-slate-800 font-mono uppercase">{dayPlan.day}</span>
                                <span className="text-[10px] text-slate-500 font-medium">{dayPlan.focus}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {dayPlan.exercises.map((exe, exIdx) => (
                                  <div key={exIdx} className="bg-slate-50/50 border border-slate-150/50 rounded-2xl p-4 hover:border-teal-150 hover:bg-white transition-all space-y-2">
                                    <div className="flex justify-between items-start gap-1">
                                      <span className="font-semibold text-slate-900 text-xs">{exe.name}</span>
                                      <div className="text-[9px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 rounded uppercase shrink-0">
                                        {exe.sets}s X {exe.reps}
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{exe.description}</p>
                                    <div className="text-[10px] text-slate-450 border-t border-slate-100 pt-1.5 flex justify-between">
                                      <span>Rest: {exe.restPeriod}</span>
                                      {exe.duration && exe.duration !== "N/A" && <span>Time: {exe.duration}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Fitness Recovery Advice */}
                        <div className="bg-stone-50 border border-stone-200 p-4.5 rounded-2xl space-y-2">
                          <span className="text-[10px] text-stone-800 uppercase font-mono font-bold block mb-1">Recommended Physical Recovery Guide</span>
                          <ul className="text-xs text-slate-600 space-y-1.2 leading-snug">
                            {fitnessPlan.recoveryTips.map((tip, id) => (
                              <li key={id} className="flex gap-1.5 items-start">
                                <span className="text-teal-600 shrink-0">✓</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-3xs flex flex-col justify-center items-center min-h-[350px]">
                        <Calendar size={48} className="text-slate-300 stroke-[1.2]" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-700 text-sm">No Fitness Calendar Formulated</h4>
                          <p className="text-xs text-slate-400 max-w-sm">Input the physical objective characteristics in the left panel, and click 'Form Fitness Calendar Plan' to compile custom workout schedules.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'medicine' && (
              <motion.div
                key="medicine"
                className="max-w-4xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                    <Search size={24} className="text-teal-600" />
                    Clinical Medicine & Active Ingredient Spotter
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Provides general descriptions, precautions, side effects, and active ingredients. Never suggests individual prescription dosages or replaces doctors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Search Bar column */}
                  <div className="md:col-span-1 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-3xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">DRUG SEARCH</span>
                      
                      <form onSubmit={handleMedicineLookup} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700 block">Medicine Brand or Chemical Name</label>
                          <input 
                            type="text" 
                            value={medicineSearch}
                            onChange={(e) => setMedicineSearch(e.target.value)}
                            placeholder="e.g. Ibuprofen, Metformin..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 shadow-inner"
                            disabled={isMedLookingUp}
                          />
                        </div>

                        {/* Safety context check as mandated */}
                        {showMedForm && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 pt-2.5 border-t border-slate-100"
                            id="safety-context-wizard"
                          >
                            <span className="text-[9px] text-teal-800 uppercase font-mono font-bold block mb-1">🏥 CLINICAL SAFETY INTAKE</span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-medium">Age</label>
                                <input 
                                  type="number" 
                                  placeholder="e.g. 35"
                                  value={medAge}
                                  onChange={(e) => setMedAge(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-medium">Duration</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. 3 days"
                                  value={medDuration}
                                  onChange={(e) => setMedDuration(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-medium">Underlying Symptoms</label>
                              <input 
                                type="text" 
                                placeholder="e.g. fever, headache"
                                value={medSymptoms}
                                onChange={(e) => setMedSymptoms(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-medium">Chronic Diseases / Medications</label>
                              <input 
                                type="text" 
                                placeholder="e.g. High BP, none"
                                value={medConditions}
                                onChange={(e) => setMedConditions(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-500 font-medium">Known Allergies</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Aspirin, none"
                                value={medAllergies}
                                onChange={(e) => setMedAllergies(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                              />
                            </div>
                          </motion.div>
                        )}

                        <div className="flex gap-2">
                          {showMedForm && (
                            <button 
                              type="button"
                              onClick={handleResetMedicineSearch}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                          <button 
                            type="submit"
                            disabled={isMedLookingUp || !medicineSearch.trim()}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs md:text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            {isMedLookingUp ? (
                              <>
                                <RefreshCw size={14} className="animate-spin text-white" />
                                Querying index...
                              </>
                            ) : showMedForm ? (
                              "Locate Chemical Profile"
                            ) : (
                              "Verify Safety Context"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Right clinical directory view */}
                  <div className="md:col-span-2 space-y-4">
                    {medDetails ? (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-6">
                        
                        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">{medDetails.category}</span>
                            <h3 className="font-extrabold text-slate-950 text-lg mt-1">{medDetails.name}</h3>
                          </div>
                        </div>

                        <div className="space-y-4 text-xs md:text-sm">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Primary Indicated Purpose</label>
                            <p className="text-slate-800 bg-slate-50 p-3 rounded-xl leading-relaxed">{medDetails.purpose}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">Common Clinical Uses</label>
                              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                                {medDetails.commonUses.map((use, idx) => <li key={idx}>{use}</li>)}
                              </ul>
                            </div>

                            <div className="space-y-1 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">Documented Side Effects</label>
                              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                                {medDetails.sideEffects.map((effect, idx) => <li key={idx}>{effect}</li>)}
                              </ul>
                            </div>
                          </div>

                          {medDetails.drugInteractions?.length > 0 && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Interactions with other drugs</label>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {medDetails.drugInteractions.map((inter, idx) => (
                                  <span key={idx} className="bg-orange-50 text-orange-800 text-[10px] px-2.5 py-1 rounded-full font-semibold border border-orange-100">
                                    {inter}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2.5 border-t border-slate-100 pt-4.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Precautions & Medical Context Warnings</label>
                            <ul className="text-xs text-slate-600 space-y-1.5 leading-snug">
                              {medDetails.precautions.map((prec, idx) => (
                                <li key={idx} className="flex gap-1.5 items-start text-xs text-slate-600">
                                  <span className="text-amber-600 shrink-0">⚠️</span>
                                  {prec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Precaution disclaimer as requested in Medicine Information module */}
                          <div className="p-4 bg-red-50 border border-red-100 rounded-3xl mt-2 flex gap-3.5 items-start">
                            <span className="text-lg">🚨</span>
                            <div className="space-y-1">
                              <span className="font-mono text-[9px] text-rose-800 font-bold block uppercase tracking-wider">DOSE PRE-REQUISITE NOTICE</span>
                              <p className="text-[11px] text-rose-900 leading-snug font-medium">
                                {medDetails.dosageWarning || "Never self-medicate with high-dose elements. Suggest consulting a pharmacist or general doctor directly. Prioritize clinical checkups."}
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-3xs flex flex-col justify-center items-center min-h-[350px]">
                        <Search size={48} className="text-slate-300 stroke-[1.2]" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-700 text-sm">No Medicine Selection Query</h4>
                          <p className="text-xs text-slate-400 max-w-sm">Enter the product's brand or chemical name inside the parameter search block, and click 'Verify Safety Context' to start.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'calculators' && (
              <motion.div
                key="calculators"
                className="max-w-4xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                    <Scale size={24} className="text-teal-600" />
                    Interactive Metabolic Calculators & Liquid Intake Trackers
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500">
                    Calculates Body Mass Index (BMI) and logs instant fluid levels with highly reactive physical progression rings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BMI Calculation Block */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-950 uppercase tracking-wider font-mono">Body Mass Index (BMI) Calculator</span>
                      <span className="bg-teal-50 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">Metabolic Baseline</span>
                    </div>

                    <form onSubmit={handleCalculateBmi} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-705">Weight (in kg)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={bmiTracker.weight}
                            onChange={(e) => setBmiTracker({ ...bmiTracker, weight: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500/20 text-slate-700 shadow-inner"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-705">Height (in cm)</label>
                          <input 
                            type="number" 
                            step="any"
                            value={bmiTracker.height}
                            onChange={(e) => setBmiTracker({ ...bmiTracker, height: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500/20 text-slate-700 shadow-inner"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs md:text-sm py-2 px-4 rounded-xl cursor-pointer transition-colors"
                      >
                        Calculate Metabolic BMI Index
                      </button>
                    </form>

                    {bmiTracker.bmi !== null && (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Calculated Value</span>
                          <span className="text-2xl font-extrabold text-slate-950">{bmiTracker.bmi.toFixed(1)}</span>
                        </div>

                        <div className="text-center sm:text-right space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Wellness Category</span>
                          <span className={`px-2.5 py-1 rounded font-bold text-[10px] uppercase font-mono ${
                            bmiTracker.status === 'Normal Weight' ? 'bg-teal-50 text-teal-800' :
                            bmiTracker.status === 'Underweight' ? 'bg-amber-50 text-amber-800' : 'bg-orange-50 text-orange-800 border border-orange-100'
                          }`}>
                            {bmiTracker.status}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reference metrics list */}
                    <div className="text-[11px] text-slate-450 space-y-1 leading-normal">
                      <p className="font-bold text-slate-500 uppercase font-mono text-[9px] mb-1">Standard clinical ranges:</p>
                      <p>• Underweight: Less than 18.5</p>
                      <p>• Normal weight: 18.5 – 24.9</p>
                      <p>• Overweight: 25.0 – 29.9</p>
                      <p>• Obese status: 30.0 or Higher</p>
                    </div>
                  </div>

                  {/* Water intake section */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-3xs space-y-5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-950 uppercase tracking-wider font-mono">Daily Hydration Intake Log</span>
                      <span className="bg-teal-50 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono">Metabolic Water</span>
                    </div>

                    <div className="py-2 flex flex-col items-center justify-center space-y-4">
                      {/* Interactive ring gauge */}
                      <div className="relative w-36 h-36 rounded-full flex items-center justify-center bg-sky-50 shadow-inner overflow-hidden border border-sky-100/35">
                        <div className="text-center z-10">
                          <span className="text-[10px] text-sky-700 font-bold uppercase font-mono block">Hydrated Log</span>
                          <span className="text-2xl font-extrabold text-slate-900 block font-mono">{(waterTracker.current / 1000).toFixed(2)} L</span>
                          <span className="text-[10px] text-slate-400 block">/ {(waterTracker.target / 1000).toFixed(2)} L</span>
                        </div>
                        {/* Fluid visual wave */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-sky-400/25 transition-all duration-500 text-sky-400"
                          style={{ height: `${(waterTracker.current / waterTracker.target) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleQuickAddWater(250)}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-850 font-bold text-[11px] py-1.5 px-3.5 rounded-lg border border-sky-200 cursor-pointer text-xs"
                        >
                          + 250ml Glass 🥛
                        </button>
                        <button 
                          onClick={() => handleQuickAddWater(500)}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-850 font-bold text-[11px] py-1.5 px-3.5 rounded-lg border border-sky-200 cursor-pointer text-xs"
                        >
                          + 500ml Bottle 💧
                        </button>
                        <button 
                          onClick={() => setWaterTracker({ ...waterTracker, current: 0 })}
                          className="text-stone-500 hover:text-stone-800 font-medium text-[10px] py-1.5 px-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-450 leading-normal text-center italic">
                      "Maintaining water intake above 2.50 Liters daily regulates internal cell pressure and preserves renal filtration baselines."
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'medication-reminders' && (
              <motion.div
                key="medication-reminders"
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MedicationReminders />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar: Reports Summary, Spotlight, Disclaimer */}
        <aside className="w-full lg:w-72 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col p-5 space-y-6 shrink-0" id="right-sidebar">
          
          {/* Mock active report summary to look exactly like the Sleek Interface screenshot */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-3xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest font-mono">Active Lab Report</h4>
              <span className="px-1.5 py-0.5 bg-blue-105 text-blue-700 text-[8px] font-bold rounded uppercase">Sample Patient</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] text-slate-400 uppercase font-mono font-bold">
                  <th className="pb-1 font-medium">Test</th>
                  <th className="pb-1 font-medium">Result</th>
                  <th className="pb-1 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-[10px] text-slate-700 font-sans">
                <tr className="border-b border-slate-50">
                  <td className="py-2.5 font-semibold text-slate-800">Hemoglobin</td>
                  <td className="py-2.5">12.5</td>
                  <td className="py-2.5 text-right font-bold text-amber-500 uppercase font-mono">Low</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="py-2.5 font-semibold text-slate-800">White Cell</td>
                  <td className="py-2.5">7.2</td>
                  <td className="py-2.5 text-right font-bold text-teal-600 uppercase font-mono">Normal</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="py-2.5 font-semibold text-slate-800">Platelets</td>
                  <td className="py-2.5">210</td>
                  <td className="py-2.5 text-right font-bold text-teal-600 uppercase font-mono">Normal</td>
                </tr>
              </tbody>
            </table>

            <button 
              onClick={() => setActiveTab('report')}
              className="w-full mt-2 py-2 text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Run Real Lab Report Analyzer →
            </button>
          </div>

          {/* Medicine Spotlight as shown in Sleek Interface */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-3xs space-y-3.5 flex-1 max-h-[300px]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">Medicine Spotlight</span>
              <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 text-[8px] font-bold rounded uppercase">Common OTC</span>
            </div>

            <div className="space-y-1">
              <h5 className="text-sm font-extrabold text-slate-900 leading-snug">Ibuprofen (Advil)</h5>
              <p className="text-[11px] text-slate-550 font-medium">Category: NSAID Pain Reliever</p>
            </div>

            <p className="text-[11px] text-slate-600 leading-normal font-sans">
              <strong>Common Uses:</strong> Reducing mild-to-moderate fever, relieving inflammation, muscle stiffness and headache strain.
            </p>

            <p className="text-[10px] text-amber-700 font-semibold leading-snug">
              ⚠️ <strong>Precautions:</strong> Avoid taking with active stomach ulcers or severe bronchial asthma context.
            </p>

            <button 
              onClick={() => { setActiveTab('medicine'); setMedicineSearch('Ibuprofen'); }}
              className="w-full text-center text-teal-600 text-[10px] uppercase font-mono font-bold hover:underline cursor-pointer"
            >
              Details & Ingredient Safety Info →
            </button>
          </div>

          {/* Sticky Mandatory Clinical Disclaimer at the bottom of the column */}
          <div className="p-4 bg-slate-100 hover:bg-slate-150/45 rounded-2xl border border-slate-200 mt-auto">
            <div className="flex gap-2 items-start">
              <span className="text-sm bg-amber-100/50 p-1 rounded-lg">⚠️</span>
              <p className="text-[10px] leading-relaxed text-slate-600 italic font-medium font-sans">
                <strong>Medical Disclaimer:</strong> I am an AI Health Assistant and not a licensed medical professional. The information I provide is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
