import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Pill, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { MedicationReminder, MedicationLog } from '../types';

export default function MedicationReminders() {
  // --- STATE ---
  const [reminders, setReminders] = useState<MedicationReminder[]>(() => {
    const local = localStorage.getItem('medi_reminders');
    if (local) {
      try { return JSON.parse(local); } catch (e) { console.error(e); }
    }
    // Pre-populate with some default reminders for realistic, premium starting state
    const defaults: MedicationReminder[] = [
      {
        id: 'r-1',
        name: 'Metformin',
        dosage: '500mg (1 Tablet)',
        frequency: 'Daily',
        times: ['08:00', '20:00'],
        category: 'Tablet',
        notes: 'Take with breakfasts and dinners to avoid stomach irritation',
        color: 'teal',
        isActive: true,
        startDate: '2026-06-01'
      },
      {
        id: 'r-2',
        name: 'Lisinopril',
        dosage: '10mg (1 Tablet)',
        frequency: 'Daily',
        times: ['07:00'],
        category: 'Tablet',
        notes: 'Take first thing in the morning empty stomach',
        color: 'blue',
        isActive: true,
        startDate: '2026-06-01'
      },
      {
        id: 'r-3',
        name: 'Atorvastatin',
        dosage: '20mg (1 Capsule)',
        frequency: 'Daily',
        times: ['21:30'],
        category: 'Capsule',
        notes: 'Take before sleep. Helps cholesterol metabolic regulation',
        color: 'indigo',
        isActive: true,
        startDate: '2026-06-01'
      },
      {
        id: 'r-4',
        name: 'Multi-Vitamin CoQ10',
        dosage: '1 Softgel',
        frequency: 'Daily',
        times: ['12:30'],
        category: 'Capsule',
        notes: 'General dietary health',
        color: 'amber',
        isActive: false,
        startDate: '2026-06-02'
      }
    ];
    return defaults;
  });

  const [logs, setLogs] = useState<MedicationLog[]>(() => {
    const local = localStorage.getItem('medi_logs');
    if (local) {
      try { return JSON.parse(local); } catch (e) { console.error(e); }
    }
    
    // Default logs for past 3 days (June 1, 2, 3) to show adherence dashboard right away!
    const todayStr = '2026-06-03';
    const yesStr = '2026-06-02';
    const beforeStr = '2026-06-01';

    const defaultLogs: MedicationLog[] = [
      // June 1 (Perfect attendance)
      { id: 'l-1', medicationId: 'r-1', medicationName: 'Metformin', dosage: '500mg', scheduledTime: '08:00', takenAt: '2026-06-01T08:05:00Z', date: beforeStr, status: 'Taken' },
      { id: 'l-2', medicationId: 'r-2', medicationName: 'Lisinopril', dosage: '10mg', scheduledTime: '07:00', takenAt: '2026-06-01T07:02:00Z', date: beforeStr, status: 'Taken' },
      { id: 'l-3', medicationId: 'r-1', medicationName: 'Metformin', dosage: '500mg', scheduledTime: '20:00', takenAt: '2026-06-01T20:10:00Z', date: beforeStr, status: 'Taken' },
      { id: 'l-4', medicationId: 'r-3', medicationName: 'Atorvastatin', dosage: '20mg', scheduledTime: '21:30', takenAt: '2026-06-01T21:35:00Z', date: beforeStr, status: 'Taken' },
      
      // June 2 (Missed Metformin dinner)
      { id: 'l-5', medicationId: 'r-1', medicationName: 'Metformin', dosage: '500mg', scheduledTime: '08:00', takenAt: '2026-06-02T08:12:00Z', date: yesStr, status: 'Taken' },
      { id: 'l-6', medicationId: 'r-2', medicationName: 'Lisinopril', dosage: '10mg', scheduledTime: '07:00', takenAt: '2026-06-02T07:15:00Z', date: yesStr, status: 'Taken' },
      { id: 'l-7', medicationId: 'r-1', medicationName: 'Metformin', dosage: '500mg', scheduledTime: '20:00', takenAt: '', date: yesStr, status: 'Missed' },
      { id: 'l-8', medicationId: 'r-3', medicationName: 'Atorvastatin', dosage: '20mg', scheduledTime: '21:30', takenAt: '2026-06-02T21:40:00Z', date: yesStr, status: 'Taken' },
      
      // June 3 (Today morning taken)
      { id: 'l-10', medicationId: 'r-2', medicationName: 'Lisinopril', dosage: '10mg', scheduledTime: '07:00', takenAt: '2026-06-03T07:08:00Z', date: todayStr, status: 'Taken' },
      { id: 'l-11', medicationId: 'r-1', medicationName: 'Metformin', dosage: '500mg', scheduledTime: '08:00', takenAt: '2026-06-03T08:15:00Z', date: todayStr, status: 'Taken' }
    ];
    return defaultLogs;
  });

  // Sound and Reminder Alerts State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    medName: string;
    dosage: string;
    time: string;
    notes?: string;
    color: string;
  } | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formCategory, setFormCategory] = useState('Tablet');
  const [formFrequency, setFormFrequency] = useState<'Daily' | 'Weekly' | 'Specific Days' | 'As Needed'>('Daily');
  const [formDays, setFormDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [formTimes, setFormTimes] = useState<string[]>(['08:00']);
  const [newTimeInput, setNewTimeInput] = useState('08:00');
  const [formNotes, setFormNotes] = useState('');
  const [formColor, setFormColor] = useState('teal');
  const [formDuration, setFormDuration] = useState('Ongoing');
  const [formError, setFormError] = useState('');

  // Toast / System State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');

  // Trigger test alarm state
  const [testTimerActive, setTestTimerActive] = useState(false);
  const [testCountdown, setTestCountdown] = useState(0);

  // --- LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('medi_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('medi_logs', JSON.stringify(logs));
  }, [logs]);

  // --- AUTO TOAST CLEAR ---
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- SYNTHESIZED AUDIO CHIME (Web Audio API) ---
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Fun double-chime medical notification melody
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc1.type = 'sine';

      osc2.frequency.setValueAtTime(523.25 / 2, ctx.currentTime); // Standard lower octave harmony
      osc2.type = 'triangle';

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Audio Context playback blocked or unsupported:", e);
    }
  };

  // --- CONSTANT CLOCK REMINDER EVALUATION ---
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const hour = now.getHours().toString().padStart(2, '0');
      const min = now.getMinutes().toString().padStart(2, '0');
      const currentHHMM = `${hour}:${min}`;
      const todayStr = '2026-06-03'; // Keeping compliance with mock date environment
      
      // Filter active reminders
      reminders.forEach(rem => {
        if (!rem.isActive) return;
        
        // Evaluate frequency
        if (rem.frequency === 'Specific Days' && rem.specificDays) {
          const dayOfWeek = now.getDay();
          if (!rem.specificDays.includes(dayOfWeek)) return;
        }

        // Check if any scheduled time matches current time exactly
        rem.times.forEach(scheduledTime => {
          if (scheduledTime === currentHHMM) {
            // Check if already logged (taken, skipped, missed) for today at this scheduled time
            const alreadyLogged = logs.some(l => 
              l.medicationId === rem.id && 
              l.scheduledTime === scheduledTime && 
              l.date === todayStr
            );

            // Recheck if currently activeAlert is already showing this reminder
            const isAlerting = activeAlert && activeAlert.id === rem.id && activeAlert.time === scheduledTime;

            if (!alreadyLogged && !isAlerting) {
              setActiveAlert({
                id: rem.id,
                medName: rem.name,
                dosage: rem.dosage,
                time: scheduledTime,
                notes: rem.notes,
                color: rem.color
              });
              playAlertChime();
            }
          }
        });
      });
    };

    // Run every 10 seconds to keep accuracy high
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [reminders, logs, activeAlert, soundEnabled]);

  // --- COUNTDOWN FOR TEST ALARM ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testTimerActive && testCountdown > 0) {
      timer = setTimeout(() => {
        setTestCountdown(prev => prev - 1);
      }, 1000);
    } else if (testTimerActive && testCountdown === 0) {
      setTestTimerActive(false);
      // Trigger random reminder from list or default
      const randomRem = reminders[Math.floor(Math.random() * reminders.length)] || {
        id: 'r-test',
        name: 'Snoozed Metformin',
        dosage: '500mg',
        times: ['12:00'],
        color: 'rose',
        notes: 'Test active warning. Simulating compliance trigger.'
      };

      setActiveAlert({
        id: randomRem.id,
        medName: randomRem.name,
        dosage: randomRem.dosage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: randomRem.notes,
        color: randomRem.color
      });
      playAlertChime();
    }
    return () => clearTimeout(timer);
  }, [testTimerActive, testCountdown, reminders]);

  const handleTriggerTestAlarm = () => {
    setTestCountdown(3);
    setTestTimerActive(true);
  };

  // --- ACTIONS ---
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Medication name is required.");
      return;
    }
    if (!formDosage.trim()) {
      setFormError("Dosage details are required (e.g. 1 Tablet).");
      return;
    }
    if (formTimes.length === 0) {
      setFormError("At least one target reminder time is required.");
      return;
    }

    const newReminder: MedicationReminder = {
      id: `r-${Date.now()}`,
      name: formName.trim(),
      dosage: formDosage.trim(),
      category: formCategory,
      frequency: formFrequency,
      specificDays: formFrequency === 'Specific Days' ? formDays : undefined,
      times: [...formTimes].sort(),
      notes: formNotes.trim() || undefined,
      color: formColor,
      isActive: true,
      startDate: '2026-06-03',
      endDate: formDuration === 'Ongoing' ? undefined : '2026-07-03'
    };

    setReminders(prev => [newReminder, ...prev]);
    setToastMessage(`✨ Reminder for ${formName} added successfully!`);
    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormDosage('');
    setFormCategory('Tablet');
    setFormFrequency('Daily');
    setFormNotes('');
    setFormColor('teal');
    setFormTimes(['08:00']);
    setFormError('');
    setIsAdding(false);
  };

  const handleToggleReminderActive = (id: string) => {
    setReminders(prev => prev.map(rem => {
      if (rem.id === id) {
        const nextState = !rem.isActive;
        setToastMessage(nextState ? `🔔 Reminder for ${rem.name} enabled.` : `🔕 Reminder for ${rem.name} paused.`);
        return { ...rem, isActive: nextState };
      }
      return rem;
    }));
  };

  const handleDeleteReminder = (id: string, name: string) => {
    if (confirm(`Are you sure you want to stop tracking reminders for ${name}?`)) {
      setReminders(prev => prev.filter(rem => rem.id !== id));
      setLogs(prev => prev.filter(l => l.medicationId !== id)); // Clean up logs
      setToastMessage(`🗑️ Reminder for ${name} deleted.`);
    }
  };

  // Log medication action (Taken / Skipped)
  const handleLogDose = (remId: string, name: string, dosage: string, scheduledTime: string, status: 'Taken' | 'Skipped') => {
    const todayStr = '2026-06-03';
    
    // Check if there is already a log for this specific schedule/time/date combo
    // If so, update it. If not, append is appropriate.
    const logIndex = logs.findIndex(l => 
      l.medicationId === remId && 
      l.scheduledTime === scheduledTime && 
      l.date === todayStr
    );

    const updatedLogs = [...logs];
    if (logIndex > -1) {
      updatedLogs[logIndex] = {
        ...updatedLogs[logIndex],
        status,
        takenAt: status === 'Taken' ? new Date().toISOString() : '',
      };
    } else {
      updatedLogs.push({
        id: `l-${Date.now()}`,
        medicationId: remId,
        medicationName: name,
        dosage,
        scheduledTime,
        takenAt: status === 'Taken' ? new Date().toISOString() : '',
        date: todayStr,
        status
      });
    }

    setLogs(updatedLogs);
    setToastMessage(status === 'Taken' ? `✅ Logged: Took ${name} at ${scheduledTime}` : `🟡 Logged: Skipped ${name} at ${scheduledTime}`);
    
    // Clear alert if it's currently showing this exact notification
    if (activeAlert && activeAlert.id === remId && activeAlert.time === scheduledTime) {
      setActiveAlert(null);
    }
  };

  const handleDismissAlert = (action: 'Taken' | 'Skipped' | 'Dismiss') => {
    if (!activeAlert) return;
    if (action === 'Taken' || action === 'Skipped') {
      handleLogDose(activeAlert.id, activeAlert.medName, activeAlert.dosage, activeAlert.time, action);
    } else {
      // Just temporarily close, creating missed record only if they don't log it
      setActiveAlert(null);
    }
  };

  const handleAddTimeInput = () => {
    if (!newTimeInput) return;
    if (formTimes.includes(newTimeInput)) {
      setFormError("Time already added in schedulers.");
      return;
    }
    setFormTimes(prev => [...prev, newTimeInput].sort());
    setFormError('');
  };

  const handleRemoveFormTime = (timeToRemove: string) => {
    if (formTimes.length === 1) {
      setFormError("At least one scheduled time is required.");
      return;
    }
    setFormTimes(prev => prev.filter(t => t !== timeToRemove));
  };

  // --- STATS CALCULATIONS ---
  // Calculates adherence score based on days where medication was scheduled vs taken.
  // We'll calculate over the active logs we have.
  const calculateAdherence = () => {
    const totalCount = logs.length;
    if (totalCount === 0) return 100;
    const takenCount = logs.filter(l => l.status === 'Taken').length;
    return Math.round((takenCount / totalCount) * 100);
  };

  const getDayComplianceSummary = (dateStr: string) => {
    const dayLogs = logs.filter(l => l.date === dateStr);
    if (dayLogs.length === 0) return 'no-data';
    
    const missedOrSkipped = dayLogs.some(l => l.status === 'Missed' || l.status === 'Skipped');
    const takenCount = dayLogs.filter(l => l.status === 'Taken').length;

    if (takenCount === dayLogs.length) return 'fully-compliant';
    if (takenCount > 0 && missedOrSkipped) return 'partial-compliant';
    return 'non-compliant';
  };

  // Get active schedule list for today chronologically
  const getTodaySchedule = () => {
    const todayStr = '2026-06-03';
    const dayOfWeek = 3; // June 3, 2026 is Wednesday (Wed = 3)
    
    const todayScheduleList: {
      remId: string;
      name: string;
      dosage: string;
      time: string;
      color: string;
      category: string;
      notes?: string;
      isActive: boolean;
      logStatus?: 'Taken' | 'Skipped' | 'Missed';
    }[] = [];

    reminders.forEach(rem => {
      // Frequency and active state filters
      if (rem.frequency === 'Specific Days' && rem.specificDays) {
        if (!rem.specificDays.includes(dayOfWeek)) return;
      }
      
      rem.times.forEach(time => {
        // Find existing log
        const log = logs.find(l => l.medicationId === rem.id && l.scheduledTime === time && l.date === todayStr);
        
        todayScheduleList.push({
          remId: rem.id,
          name: rem.name,
          dosage: rem.dosage,
          time,
          color: rem.color,
          category: rem.category,
          notes: rem.notes,
          isActive: rem.isActive,
          logStatus: log?.status
        });
      });
    });

    // Sort chronologically by HH:MM
    return todayScheduleList.sort((az, bz) => az.time.localeCompare(bz.time));
  };

  const getFilteredTodaySchedule = () => {
    const schedule = getTodaySchedule();
    if (filterType === 'all') return schedule;
    
    return schedule.filter(item => {
      const hour = parseInt(item.time.split(':')[0]);
      if (filterType === 'morning') return hour >= 5 && hour < 12;
      if (filterType === 'afternoon') return hour >= 12 && hour < 17;
      if (filterType === 'evening') return hour >= 17 && hour < 21;
      if (filterType === 'night') return hour >= 21 || hour < 5;
      return true;
    });
  };

  const todaySchedule = getFilteredTodaySchedule();
  const rawTodaySchedule = getTodaySchedule();
  const takenTodayCount = rawTodaySchedule.filter(s => s.logStatus === 'Taken').length;
  const totalTodayCount = rawTodaySchedule.filter(s => s.isActive).length;

  // Render Category Emoticon helpers
  const categoryEmoticon = (cat: string) => {
    switch (cat) {
      case 'Tablet': return '💊';
      case 'Capsule': return '💊';
      case 'Liquids': return '🧪';
      case 'Inhaler': return '💨';
      case 'Injection': return '💉';
      case 'Drops': return '💧';
      default: return '📦';
    }
  };

  const categoryLabelBg = (cat: string) => {
    switch (cat) {
      case 'Tablet': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Capsule': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Liquids': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Inhaler': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Injection': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Drops': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const colorClasses = (color: string) => {
    switch (color) {
      case 'teal': return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-150', iconBg: 'bg-teal-600', hoverBg: 'hover:bg-teal-100/50' };
      case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-150', iconBg: 'bg-blue-600', hoverBg: 'hover:bg-blue-100/50' };
      case 'indigo': return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-150', iconBg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-100/50' };
      case 'rose': return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-150', iconBg: 'bg-rose-600', hoverBg: 'hover:bg-rose-100/50' };
      case 'amber': return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-150', iconBg: 'bg-amber-500', hoverBg: 'hover:bg-amber-100/50' };
      case 'emerald': return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-150', iconBg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-100/50' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', iconBg: 'bg-slate-600', hoverBg: 'hover:bg-slate-100' };
    }
  };

  return (
    <div className="space-y-8" id="medication-manager-section">
      
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-lg flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alarm Siren Warning Interstitial */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            id="active-alarm-dialog"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-4 border-rose-500/20 text-center relative overflow-hidden space-y-6"
            >
              {/* Pulse waves */}
              <div className="absolute inset-0 -z-10 bg-rose-500/5 animate-pulse"></div>

              <div className="flex justify-center select-none">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 animate-bounce">
                  <Bell size={32} className="stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-rose-600 font-bold tracking-widest uppercase font-mono">🚨 CLINICAL ALARM REMINDER</span>
                <h3 className="text-xl font-extrabold text-slate-950 leading-snug">Time to take your {activeAlert.medName}!</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full font-mono text-xs text-slate-700">
                  <Clock size={12} />
                  Scheduled: {activeAlert.time}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-left space-y-2">
                <p className="text-xs text-slate-750">
                  <strong>Expected Dosage:</strong> {activeAlert.dosage}
                </p>
                {activeAlert.notes && (
                  <p className="text-xs text-slate-500 italic flex gap-1.5 items-start mt-1">
                    <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    Notes: {activeAlert.notes}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => handleDismissAlert('Taken')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 text-xs md:text-sm px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Check size={16} />
                  Mark as Taken
                </button>
                <button
                  onClick={() => handleDismissAlert('Skipped')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 text-xs md:text-sm px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <X size={16} />
                  Skip Dose
                </button>
              </div>

              <button
                onClick={() => handleDismissAlert('Dismiss')}
                className="w-full text-xs text-slate-400 font-bold hover:text-slate-600 py-1"
              >
                Dismiss Temporary Alert
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title & Diagnostic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <Bell size={24} className="text-teal-600 animate-swing" style={{ transformOrigin: 'top center' }} />
            Medication Reminders & Adherence Tracker
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
            Input medicine schedules, log daily ingestion checks, synthesize active alarms, and track medical compliance metrics with local safety reminders.
          </p>
        </div>

        {/* Audio Alert toggle & Alarm tester */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Diagnostic Test Countdown */}
          {testTimerActive ? (
            <div className="bg-rose-50 text-rose-800 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 border border-rose-100 font-mono">
              <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping"></span>
              Alarm Test in {testCountdown}s
            </div>
          ) : (
            <button
              onClick={handleTriggerTestAlarm}
              className="bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold py-2 px-3.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all border border-slate-950"
              title="Test the physical alert double-chime alarm immediately"
            >
              <Sparkles size={13} className="text-amber-400" />
              Test Fast Alarm (3s)
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
              soundEnabled 
                ? 'bg-teal-50 border-teal-200 text-teal-700' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title={soundEnabled ? "Siren alerts sound ON" : "Siren alerts MUTED"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Grid: 1/3 Adherence Statistics & Days, 2/3 Content listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
        
        {/* Left Adherence Dashboard Column (1/3 scale) */}
        <div className="space-y-6.5 lg:col-span-1">
          
          {/* Adherence Score Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-3xs space-y-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-mono">COMPLIANCE STATS</span>
            
            <div className="flex items-center gap-4.5">
              {/* Score percentage ring */}
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-teal-50 border border-teal-100 text-center">
                <div className="z-10">
                  <span className="text-xl font-extrabold text-slate-950 block leading-none font-mono">
                    {calculateAdherence()}%
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold block uppercase mt-0.5 font-sans">ADHERENCE</span>
                </div>
                {/* Visual arc */}
                <div 
                  className="absolute inset-[3px] rounded-full border-4 border-teal-500 border-r-transparent animate-pulse"
                  style={{ opacity: calculateAdherence() > 0 ? 1 : 0 }}
                ></div>
              </div>

              <div className="space-y-1 flex-1">
                <p className="text-xs font-semibold text-slate-800">Clinical Log Progress</p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  You logged <strong>{takenTodayCount}</strong> of <strong>{totalTodayCount}</strong> of today's scheduled doses.
                </p>
                {/* Health encouragement threshold */}
                <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                  calculateAdherence() >= 85 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                }`}>
                  {calculateAdherence() >= 85 ? '✨ HIGH ADHERENCE' : '🏥 WORK NEEDED'}
                </span>
              </div>
            </div>

            {/* Past 7 Days adherence heatmap tracker */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[9px] text-slate-450 font-bold uppercase font-mono tracking-wider block">Compliance Calendars (Past 7 Days):</span>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {[
                  { name: 'Th', date: '2026-05-28', label: '28' },
                  { name: 'Fr', date: '2026-05-29', label: '29' },
                  { name: 'Sa', date: '2026-05-30', label: '30' },
                  { name: 'Su', date: '2026-05-31', label: '31' },
                  { name: 'Mo', date: '2026-06-01', label: '1' },
                  { name: 'Tu', date: '5026-06-02', label: '2' },
                  { name: 'We', date: '2026-06-03', label: '3' },
                ].map((day, idx) => {
                  let indicatorBg = 'bg-slate-100 border-slate-200 text-slate-600';
                  let statusTip = 'No tracked reminders';

                  // Simulated compliance assessment:
                  if (day.label === '28' || day.label === '29' || day.label === '30' || day.label === '31') {
                    indicatorBg = 'bg-emerald-50 text-emerald-700 border-emerald-150 font-semibold';
                    statusTip = 'Fully compliant';
                  } else {
                    const trackingDate = day.label === '1' ? '2026-06-01' : day.label === '2' ? '2026-06-02' : '2026-06-03';
                    const comp = getDayComplianceSummary(trackingDate);
                    
                    if (comp === 'fully-compliant') {
                      indicatorBg = 'bg-emerald-500 text-white font-bold border-emerald-600';
                      statusTip = 'Perfect - All Taken';
                    } else if (comp === 'partial-compliant') {
                      indicatorBg = 'bg-amber-100 text-amber-800 border-amber-200 font-semibold';
                      statusTip = 'Partial - Missed some';
                    } else if (comp === 'non-compliant') {
                      indicatorBg = 'bg-rose-50 text-rose-700 border-rose-150 font-semibold';
                      statusTip = 'Alert - Critical skips';
                    } else {
                      indicatorBg = 'bg-slate-50 text-slate-400 border-slate-100';
                      statusTip = 'No recorded tracking logs';
                    }
                  }

                  return (
                    <div key={idx} className="space-y-1" title={statusTip}>
                      <span className="text-[10px] text-slate-400 font-semibold block">{day.name}</span>
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs text-center border-dashed leading-none transition-all ${indicatorBg}`}>
                        {day.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50/50 p-3.5 border border-slate-150/50 rounded-2xl text-[11px] text-slate-500 leading-normal font-sans">
              📍 <strong>Adherence Target:</strong> Clinical guidelines suggest preserving a score above <strong>85%</strong> for optimal pharmaceutical systemic absorption.
            </div>
          </div>

          {/* Quick Informational Guide */}
          <div className="bg-slate-550 border border-slate-200/60 rounded-3xl p-5 shadow-3xs space-y-3 mr-0.5">
            <div className="flex gap-2 items-start text-xs text-slate-600">
              <span className="text-base">💊</span>
              <div className="space-y-1 font-sans">
                <span className="font-bold text-slate-800 block text-xs">Self-Management Protocol</span>
                <p className="leading-snug text-slate-555">
                  Always use literal standard labels on medication. To verify potential food-drug interactions or side effects, query the <strong>Medicine Directory</strong> in the navigation menu.
                </p>
              </div>
            </div>
          </div>

          {/* Preset templates list for easy populating */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-3xs space-y-3.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-mono">QUICK THERAPEUTIC TEMPLATES</span>
            <span className="text-[11px] text-slate-500 block leading-tight">Click to template addition configs:</span>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  setFormName('Amlodipine Besylate');
                  setFormDosage('5mg (1 Tablet)');
                  setFormCategory('Tablet');
                  setFormFrequency('Daily');
                  setFormTimes(['08:00']);
                  setFormNotes('For calcium-channel block blood pressure tracking.');
                  setFormColor('blue');
                  setIsAdding(true);
                }}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/30 border border-slate-150 hover:border-teal-200 transition-all flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-705 group"
              >
                <span>☀️ Morning BP Capsule</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => {
                  setFormName('Ibuprofen');
                  setFormDosage('400mg (2 Tablets)');
                  setFormCategory('Tablet');
                  setFormFrequency('As Needed');
                  setFormTimes(['14:00']);
                  setFormNotes('Severe headache or joints swelling. Max 3 times/day.');
                  setFormColor('rose');
                  setIsAdding(true);
                }}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/30 border border-slate-150 hover:border-teal-200 transition-all flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-705 group"
              >
                <span>⚡ Pain Relief As Needed</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => {
                  setFormName('Multivitamin / Minerals');
                  setFormDosage('1 Capsule');
                  setFormCategory('Capsule');
                  setFormFrequency('Daily');
                  setFormTimes(['12:00']);
                  setFormNotes('Take following general lunch.');
                  setFormColor('amber');
                  setIsAdding(true);
                }}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/30 border border-slate-150 hover:border-teal-200 transition-all flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-705 group"
              >
                <span>🥗 Lunch Supplement</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Tabular/Grid Columns (2/3 scale) */}
        <div className="lg:col-span-2 space-y-6.5">
          
          {/* Main reminders action trigger block */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-3xs overflow-hidden">
            
            {/* Table or Action sub-bar */}
            <div className="p-5 border-b border-slate-150 flex flex-wrap items-center justify-between gap-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                <h3 className="font-bold text-slate-800 text-sm">Active Med Reminders & Intake List</h3>
              </div>
              
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isAdding ? <X size={14} /> : <Plus size={14} />}
                {isAdding ? "Collapse Form" : "Add Medication Reminder"}
              </button>
            </div>

            {/* Slide-down Add Medication Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-slate-200 bg-white overflow-hidden"
                >
                  <form onSubmit={handleAddReminder} className="p-5 md:p-6 space-y-4.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider font-mono">🆕 SCHEDULE REMINDERS CREATION</span>
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="text-slate-400 hover:text-slate-700 text-[10px]"
                      >
                        Clear Fields
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Medication Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lipitor, Metformin, Vitamin D..."
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700"
                        />
                      </div>

                      {/* Dosage input */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Dosage Strength (Quantity)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 500mg (1 Tablet), 10ml, 2 Puffs..."
                          value={formDosage}
                          onChange={(e) => setFormDosage(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Category */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Type Category</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 text-slate-700 h-10 cursor-pointer"
                        >
                          <option value="Tablet">Tablet 💊</option>
                          <option value="Capsule">Capsule 💊</option>
                          <option value="Liquids">Liquids 🧪</option>
                          <option value="Inhaler">Inhaler 💨</option>
                          <option value="Injection">Injection 💉</option>
                          <option value="Drops">Drops 💧</option>
                          <option value="Other">Other 📦</option>
                        </select>
                      </div>

                      {/* Frequency */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Ingestion Frequencies</label>
                        <select
                          value={formFrequency}
                          onChange={(e) => setFormFrequency(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 text-slate-700 h-10 cursor-pointer"
                        >
                          <option value="Daily">Everyday Daily</option>
                          <option value="Weekly">Once Weekly</option>
                          <option value="Specific Days">Selected Specific Days</option>
                          <option value="As Needed">As Needed (PRN)</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Treatment Duration</label>
                        <select
                          value={formDuration}
                          onChange={(e) => setFormDuration(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 text-slate-700 h-10 cursor-pointer"
                        >
                          <option value="Ongoing">Ongoing Preventive Treatment</option>
                          <option value="30Days">30-Day Course</option>
                        </select>
                      </div>

                    </div>

                    {/* Specific Days checklist selector */}
                    {formFrequency === 'Specific Days' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-2"
                      >
                        <label className="font-semibold text-slate-700 block">Specify Target Days of the Week:</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Sun', value: 0 },
                            { label: 'Mon', value: 1 },
                            { label: 'Tue', value: 2 },
                            { label: 'Wed', value: 3 },
                            { label: 'Thu', value: 4 },
                            { label: 'Fri', value: 5 },
                            { label: 'Sat', value: 6 }
                          ].map((dayItem) => {
                            const isSelected = formDays.includes(dayItem.value);
                            return (
                              <button
                                key={dayItem.value}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setFormDays(prev => prev.filter(d => d !== dayItem.value));
                                  } else {
                                    setFormDays(prev => [...prev, dayItem.value].sort());
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'bg-teal-500 text-white border-teal-600 shadow-sm' 
                                    : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {dayItem.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Time of Day reminder targets list */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <label className="font-semibold text-slate-700 block">Schedules Reminder Times:</label>
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="time"
                            value={newTimeInput}
                            onChange={(e) => setNewTimeInput(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg p-1.5 font-mono text-xs focus:ring-1"
                          />
                          <button
                            type="button"
                            onClick={handleAddTimeInput}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-2 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-0.5"
                          >
                            <Plus size={12} /> Add
                          </button>
                        </div>
                      </div>

                      {/* Display added times */}
                      <div className="flex flex-wrap gap-1.5">
                        {formTimes.map(time => (
                          <span 
                            key={time}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-150 rounded-lg text-xs font-mono font-medium text-slate-700 group shadow-3xs"
                          >
                            <Clock size={11} className="text-slate-400" />
                            {time}
                            <button
                              type="button"
                              onClick={() => handleRemoveFormTime(time)}
                              className="text-slate-400 hover:text-rose-500 ml-1 rounded font-bold"
                              title="Delete scheduled warning time"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Notes */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Special Directions / Instructions (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Take with water, Avoid dairy, Fasting..."
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700"
                        />
                      </div>

                      {/* Brand Pill color selection */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 block">Medicine Tag Theme Accent</label>
                        <div className="flex items-center gap-3.5 h-10">
                          {['teal', 'blue', 'indigo', 'rose', 'amber', 'emerald'].map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => setFormColor(col)}
                              className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative ${
                                col === 'teal' ? 'bg-teal-500 border-teal-650' :
                                col === 'blue' ? 'bg-blue-500 border-blue-650' :
                                col === 'indigo' ? 'bg-indigo-500 border-indigo-650' :
                                col === 'rose' ? 'bg-rose-500 border-rose-650' :
                                col === 'amber' ? 'bg-amber-500 border-amber-650' : 'bg-emerald-500 border-emerald-650'
                              } ${formColor === col ? 'scale-115 ring-2 ring-slate-400/30 ring-offset-2' : 'hover:scale-105 opacity-80'}`}
                            >
                              {formColor === col && (
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold">L</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {formError && (
                      <div className="p-3 bg-red-50 text-rose-800 rounded-xl border border-red-150 font-medium text-xs flex gap-1.5 items-center">
                        <AlertCircle size={14} className="text-rose-600 shrink-0" />
                        {formError}
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 pt-1.5 text-xs">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        Save Dynamic Reminder
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Time of Day filter header tag row */}
            <div className="px-5 py-3 border-b border-slate-150 flex flex-wrap gap-2 items-center text-xs bg-slate-50/20">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider mr-2">Hour Filters:</span>
              {[
                { label: '🌤️ All Day', value: 'all' },
                { label: ' صبح Morning (5a-12p)', value: 'morning' },
                { label: '☀️ Afternoon (12p-5p)', value: 'afternoon' },
                { label: '🌆 Evening (5p-9p)', value: 'evening' },
                { label: '🌙 Night (9p-5a)', value: 'night' }
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilterType(btn.value as any)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    filterType === btn.value
                      ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Reminders List body */}
            <div className="p-5 md:p-6 text-xs">
              
              {todaySchedule.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center min-h-[250px]">
                  <Pill size={40} className="text-slate-300 stroke-[1.2] animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-700 text-sm">No Active Medication Schedules Found</h4>
                    <p className="text-xs text-slate-400 max-w-sm">There are no reminders on target schedule matching the configured filters for today. Create some above!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">CHRONOLOGICAL REMINDERS & INTAKE CHECKS</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {todaySchedule.map((item, idx) => {
                      const colCls = colorClasses(item.color);
                      const isTaken = item.logStatus === 'Taken';
                      const isSkipped = item.logStatus === 'Skipped';
                      const isLogged = isTaken || isSkipped;

                      return (
                        <div 
                          key={`${item.remId}-${item.time}-${idx}`}
                          className={`border rounded-2.5xl p-4.5 transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                            isTaken ? 'bg-teal-50/20 border-teal-200/50' : 
                            isSkipped ? 'bg-slate-50 border-slate-200/80 opacity-70' :
                            'bg-white border-slate-200 hover:border-slate-300'
                          } ${colCls.hoverBg}`}
                        >
                          {/* Inner color highlight banner strip */}
                          <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${colCls.iconBg}`}></div>

                          <div className="space-y-2 pl-2">
                            
                            {/* Schedule info row */}
                            <div className="flex justify-between items-start gap-1.5">
                              <div>
                                <span className={`inline-flex items-center gap-1 border rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase font-mono ${categoryLabelBg(item.category)}`}>
                                  <span>{categoryEmoticon(item.category)}</span>
                                  {item.category}
                                </span>
                                <h4 className="font-extrabold text-slate-900 text-sm leading-tight mt-1.5">{item.name}</h4>
                                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">Dosage: {item.dosage}</span>
                              </div>

                              <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200/60 rounded-lg px-2 py-0.8 text-[11px]">
                                <Clock size={11} className="text-slate-500" />
                                {item.time}
                              </span>
                            </div>

                            {/* Notes/directions block */}
                            {item.notes && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50/10 p-2 border border-slate-150/40 rounded-xl leading-normal shrink-0">
                                Direc: {item.notes}
                              </p>
                            )}

                          </div>

                          {/* Action Log checkboxes list */}
                          <div className="pl-2 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                            
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                              <span className="text-[10px] text-slate-500 font-medium font-mono">{item.isActive ? "ACTIVE" : "PAUSED"}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isLogged ? (
                                <div className="flex items-center gap-2">
                                  {isTaken ? (
                                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 border border-teal-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                      ✓ INGESTED
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/70 border border-slate-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                      🟡 SKIPPED
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleLogDose(item.remId, item.name, item.dosage, item.time, 'Taken')}
                                    className="text-slate-400 hover:text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[10px]"
                                    title="Undo / Log Taken again"
                                  >
                                    Undo
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleLogDose(item.remId, item.name, item.dosage, item.time, 'Taken')}
                                    className="bg-teal-50 hover:bg-teal-200 text-teal-800 border border-teal-200 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-0.5 text-[11px]"
                                    title="Log medication taken today"
                                  >
                                    <Check size={12} /> Take
                                  </button>
                                  <button
                                    onClick={() => handleLogDose(item.remId, item.name, item.dosage, item.time, 'Skipped')}
                                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-medium px-2.5 py-1.5 rounded-xl cursor-pointer text-[11px]"
                                    title="Skip drug scheduled dose"
                                  >
                                    Skip
                                  </button>
                                </>
                              )}
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Manage Saved Core Medications Directory Grid Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-3xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-mono">MANAGE CREATED REMINDERS ({reminders.length})</span>
              <span className="bg-teal-50 text-teal-800 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase">Full Index</span>
            </div>

            {reminders.length === 0 ? (
              <p className="text-slate-450 text-center py-6">No medications created yet. Click 'Add Medication Reminder' to start.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reminders.map((rem) => {
                  const colCls = colorClasses(rem.color);
                  return (
                    <div key={rem.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/45 px-1.5 rounded-xl transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${colCls.bg} border ${colCls.border} flex items-center justify-center shrink-0`}>
                          <Pill size={15} className={colCls.text} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-slate-900 text-xs truncate leading-tight">{rem.name}</h5>
                          <span className="text-[10.5px] text-slate-500 font-medium font-mono text-[10px] block truncate mt-0.5">
                            {rem.dosage} • {rem.frequency} ({rem.times.join(', ')})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Pause button */}
                        <button
                          onClick={() => handleToggleReminderActive(rem.id)}
                          className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                            rem.isActive 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}
                          title={rem.isActive ? "Pause Reminders Alarm" : "Resume Reminders Alarm"}
                        >
                          {rem.isActive ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteReminder(rem.id, rem.name)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete medication from schedules"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
