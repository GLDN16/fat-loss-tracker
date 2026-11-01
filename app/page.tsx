// @ts-nocheck
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Flame,
  Dumbbell,
  Footprints,
  Droplets,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  Circle,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Settings,
  Award,
  Sparkles,
  Utensils,
  ShieldAlert,
  Shield,
  Clock,
  User,
  LogOut,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Trash2,
  History,
  Copy,
  Check,
  Cloud,
  CloudOff,
  BookOpen,
  Info,
  Target,
  HeartPulse,
  Heart,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart,
  BarChart2,
  BarChart3,
  X,
  XCircle,
  Trophy,
  Timer
} from 'lucide-react';

// เชื่อมต่อ Supabase โดยอัตโนมัติจาก Environment Variables ที่ตั้งไว้ใน Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddaofydnexklkxclwuqc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'emergency-fat-loss-pwa';

// --- HIGH VOLUME / LEAN PROTEIN PRESETS ---
const MEAL_PRESETS = [
  {
    id: 'p1',
    name: '200g Boiled Chicken Breast + 150g Rice + Steamed Broccoli',
    calories: 440,
    protein: 52,
    tags: ['Zero Oil / Water Sautéed', 'High Volume Greens', 'Protein Base']
  },
  {
    id: 'p2',
    name: '50g Rolled Oats (Water Base) + 2 Scoops Whey Isolate',
    calories: 420,
    protein: 55,
    tags: ['Zero Oil / Water Sautéed', 'Protein Base']
  },
  {
    id: 'p3',
    name: '250g Lean Cod / Tilapia + Giant Asparagus & Spinach Salad',
    calories: 320,
    protein: 56,
    tags: ['Zero Oil / Water Sautéed', 'High Volume Greens', 'Protein Base']
  },
  {
    id: 'p4',
    name: '6 Egg Whites + 2 Whole Eggs Scramble + 200g Zucchini',
    calories: 300,
    protein: 38,
    tags: ['Zero Oil / Water Sautéed', 'High Volume Greens', 'Protein Base']
  },
  {
    id: 'p5',
    name: '220g 96/4 Lean Ground Beef + 300g Cauliflower Rice',
    calories: 390,
    protein: 50,
    tags: ['Zero Oil / Water Sautéed', 'High Volume Greens', 'Protein Base']
  },
  {
    id: 'p6',
    name: '350g 0% Greek Yogurt + 1 Scoop Whey + 100g Fresh Berries',
    calories: 360,
    protein: 58,
    tags: ['Protein Base']
  }
];

const MEAL_TAGS = [
  'Zero Oil / Water Sautéed',
  'High Volume Greens',
  'Protein Base'
];

const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: 'Sedentary (Desk Job, <5k steps)', factor: 1.2 },
  light: { label: 'Lightly Active (1-3 gym workouts/wk)', factor: 1.375 },
  moderate: { label: 'Moderately Active (3-5 sessions + 10k steps)', factor: 1.55 },
  active: { label: 'Very Active (Hard lifting + 15k+ daily steps)', factor: 1.725 }
};

// --- PROTOCOL STATE BUILDER ---
const createEmptyDay = (dayNum) => ({
  day: dayNum,
  meals: {
    lunch: { completed: false, description: '', calories: 0, protein: 0, tags: [] },
    dinner: { completed: false, description: '', calories: 0, protein: 0, tags: [] }
  },
  waterMl: 0, // Target: 3000ml (3.0L)
  zeroLiquidSugarConfirmed: false,
  steps: 0,
  zone2Minutes: 0
});

const createInitialState = () => {
  const days = {};
  for (let i = 1; i <= 30; i++) {
    days[i] = createEmptyDay(i);
  }
  return {
    onboarded: false,
    profile: {
      age: 28,
      gender: 'male',
      height: 175,
      startWeight: 82,
      targetWeight: 78,
      activityLevel: 'moderate'
    },
    currentDay: 1,
    days,
    weeklyStrength: {
      1: [false, false, false, false],
      2: [false, false, false, false],
      3: [false, false, false, false],
      4: [false, false, false, false]
    },
    milestones: {
      7: { weight: '', completed: false, notes: '' },
      14: { weight: '', completed: false, notes: '' },
      21: { weight: '', completed: false, highStressOrInsomnia: false, notes: '' },
      28: { weight: '', completed: false, notes: '' },
      30: { weight: '', completed: false, notes: '' }
    }
  };
};

export default function App() {
  // --- AUTH & SYNC STATE ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('offline'); // 'synced' | 'saving' | 'offline' | 'error'
  const [syncTimestamp, setSyncTimestamp] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // --- APP STATE ---
  const [state, setState] = useState(() => {
    // Immediate local recovery fallback
    try {
      const local = localStorage.getItem('emergency_fatloss_cache');
      if (local) return JSON.parse(local);
    } catch (e) {
      console.warn("Local storage cache read fallback:", e);
    }
    return createInitialState();
  });

  // Navigation tab: 'today' | 'timeline' | 'milestones' | 'profile'
  const [activeTab, setActiveTab] = useState('today');

  // Modals & Panels
  const [presetModalTarget, setPresetModalTarget] = useState(null); // 'lunch' | 'dinner' | null
  const [activeMilestoneModal, setActiveMilestoneModal] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const isRemoteUpdate = useRef(false);

  // Toast Notification Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

// --- SUPABASE AUTH & CLOUD SYNC ---
  useEffect(() => {
    // 1. ตรวจสอบสถานะการล็อกอินปัจจุบัน
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // 2. ตรวจจับเหตุการณ์ Login / Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. ดึงข้อมูลจาก Cloud เมื่อมีผู้ใช้ล็อกอิน
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setSyncStatus('saving');
      try {
        const { data, error } = await supabase
          .from('user_tracker')
          .select('tracker_data')
          .eq('user_id', user.id)
          .single();

        if (data && data.tracker_data) {
          isRemoteUpdate.current = true;
          setState(data.tracker_data);
          setSyncStatus('synced');
          setSyncTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          showToast('ซิงก์ข้อมูลจากระบบคลาวด์เรียบร้อย');
        } else {
          // ผู้ใช้ใหม่: บันทึกข้อมูลตั้งต้นขึ้น Cloud
          await supabase.from('user_tracker').upsert({
            user_id: user.id,
            tracker_data: state,
            updated_at: new Date().toISOString(),
          });
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Fetch cloud data error:', err);
        setSyncStatus('error');
      }
    };

    fetchUserData();
  }, [user?.id]);

  // 4. บันทึกข้อมูลอัตโนมัติเมื่อมีการแก้ไข (Debounce 800ms)
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('emergency_fatloss_cache', JSON.stringify(state));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return;
    }

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const { error } = await supabase.from('user_tracker').upsert({
          user_id: user.id,
          tracker_data: state,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        setSyncStatus('synced');
        setSyncTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Save to cloud error:', err);
        setSyncStatus('error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [state, user]);

// --- SUPABASE CLOUD SYNC & AUTH ---
  useEffect(() => {
    // ตรวจสอบ session ทันทีที่เปิดเว็บ
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // ตรวจจับสถานะการ Login / Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ดึงข้อมูลของผู้ใช้เมื่อล็อกอินสำเร็จ
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setSyncStatus('saving');
      try {
        const { data, error } = await supabase
          .from('user_tracker')
          .select('tracker_data')
          .eq('user_id', user.id)
          .single();

        if (data && data.tracker_data) {
          isRemoteUpdate.current = true;
          setState(data.tracker_data);
          setSyncStatus('synced');
          setSyncTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          showToast('ซิงก์ข้อมูลจากระบบคลาวด์เรียบร้อย');
        } else {
          // หากเป็นผู้ใช้ใหม่ ให้บันทึก state ปัจจุบันขึ้นเป็นข้อมูลเริ่มต้น
          await supabase.from('user_tracker').upsert({
            user_id: user.id,
            tracker_data: state,
            updated_at: new Date().toISOString(),
          });
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Fetch cloud data error:', err);
        setSyncStatus('error');
      }
    };

    fetchUserData();
  }, [user?.id]);

  // บันทึกข้อมูลขึ้น Supabase อัตโนมัติเมื่อมีการเปลี่ยนแปลง (Debounce 0.8s)
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('emergency_fatloss_cache', JSON.stringify(state));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return;
    }

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const { error } = await supabase.from('user_tracker').upsert({
          user_id: user.id,
          tracker_data: state,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        setSyncStatus('synced');
        setSyncTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Save to cloud error:', err);
        setSyncStatus('error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [state, user]);

  // --- 3. CLOUD SAVE WITH LOCAL RECOVERY ---
  const saveState = (updater) => {
    setState((prevState) => {
      const nextState = typeof updater === 'function' ? updater(prevState) : updater;

      // Local storage instant cache
      try {
        localStorage.setItem('emergency_fatloss_cache', JSON.stringify(nextState));
      } catch (e) {
        console.warn("Local storage cache write:", e);
      }

      // Sync to Firestore if authenticated
      if (user && db && !isRemoteUpdate.current) {
        setSyncStatus('saving');
        const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'tracker_state');
        setDoc(userDocRef, { ...nextState, updatedAt: Date.now() }, { merge: true })
          .then(() => {
            setSyncStatus('synced');
            setSyncTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          })
          .catch((err) => {
            console.error("Cloud persist failed:", err);
            setSyncStatus('error');
          });
      }
      isRemoteUpdate.current = false;
      return nextState;
    });
  };

  // --- METABOLIC TARGETS (Mifflin-St Jeor) ---
  const metrics = useMemo(() => {
    const { age, gender, height, startWeight, targetWeight, activityLevel } = state.profile;
    const w = parseFloat(startWeight) || 75;
    const h = parseFloat(height) || 175;
    const a = parseFloat(age) || 28;

    const baseBmr = 10 * w + 6.25 * h - 5 * a;
    const bmr = Math.round(gender === 'male' ? baseBmr + 5 : baseBmr - 161);
    const factor = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.4;
    const tdee = Math.round(bmr * factor);

    // Emergency protocol: TDEE - 700 kcal, Protein = 2g / kg
    const dailyCalories = Math.max(1200, tdee - 700);
    const proteinTarget = Math.round(w * 2);

    return {
      bmr,
      tdee,
      dailyCalories,
      proteinTarget,
      plannedDeficit: 700,
      totalTargetLoss: Math.max(0, (w - (parseFloat(targetWeight) || w - 4)).toFixed(1))
    };
  }, [state.profile]);

  // Current Day & Week
  const currentDayData = state.days[state.currentDay] || createEmptyDay(state.currentDay);
  const currentWeek = Math.min(4, Math.ceil(state.currentDay / 7));

  // Daily Score %
  const calculateDayScore = (d) => {
    if (!d) return 0;
    let score = 0;
    if (d.meals.lunch.completed) score += 20;
    if (d.meals.dinner.completed) score += 20;
    if ((d.waterMl || 0) >= 2500) score += 20;
    if (d.zeroLiquidSugarConfirmed) score += 20;
    if ((d.steps || 0) >= 10000) score += 20;
    return score;
  };

  const todayScore = calculateDayScore(currentDayData);

  // Latest Scale Weight
  const latestWeight = useMemo(() => {
    const checkDays = [30, 28, 21, 14, 7];
    for (const d of checkDays) {
      const w = parseFloat(state.milestones[d]?.weight);
      if (!isNaN(w) && w > 0) return w;
    }
    return parseFloat(state.profile.startWeight);
  }, [state.milestones, state.profile.startWeight]);

  // Adaptive Diagnostic Flags
  const adaptiveAlerts = useMemo(() => {
    const alerts = [];
    const w1 = parseFloat(state.milestones[7]?.weight);
    const startW = parseFloat(state.profile.startWeight);

    if (!isNaN(w1) && w1 > 0) {
      const drop = startW - w1;
      if (drop < 1.0) {
        alerts.push({
          id: 'w1-steps',
          type: 'amber',
          title: 'Week 1 Adaptive Trigger: +2,500 Steps Escalation',
          desc: `Weight drop was ${drop.toFixed(1)}kg (< 1.0kg target). DO NOT lower food calories further. Preserve your metabolic rate by increasing daily steps to 12,500-15,000 to expand the deficit through NEAT.`
        });
      }
    }

    if (state.milestones[21]?.highStressOrInsomnia) {
      alerts.push({
        id: 'w3-cortisol',
        type: 'rose',
        title: 'Week 3 CNS & Cortisol Stabilizer Triggered',
        desc: 'Sleep disruption / severe fatigue detected. Hold your current calorie floor and step count steady. Shift dinner carbs slightly higher to replenish serotonin and support sleep architecture.'
      });
    }

    return alerts;
  }, [state.milestones, state.profile.startWeight]);

  // --- ACTION HANDLERS ---
  const updateCurrentDay = (updater) => {
    saveState((prev) => {
      const cur = prev.days[prev.currentDay] || createEmptyDay(prev.currentDay);
      const updated = typeof updater === 'function' ? updater(cur) : updater;
      return {
        ...prev,
        days: { ...prev.days, [prev.currentDay]: updated }
      };
    });
  };

  const handleMealField = (mealKey, field, val) => {
    updateCurrentDay((d) => ({
      ...d,
      meals: {
        ...d.meals,
        [mealKey]: { ...d.meals[mealKey], [field]: val }
      }
    }));
  };

  const toggleMealTag = (mealKey, tag) => {
    updateCurrentDay((d) => {
      const tags = d.meals[mealKey].tags || [];
      const has = tags.includes(tag);
      return {
        ...d,
        meals: {
          ...d.meals,
          [mealKey]: {
            ...d.meals[mealKey],
            tags: has ? tags.filter((t) => t !== tag) : [...tags, tag]
          }
        }
      };
    });
  };

  const applyPreset = (mealKey, preset) => {
    updateCurrentDay((d) => ({
      ...d,
      meals: {
        ...d.meals,
        [mealKey]: {
          completed: true,
          description: preset.name,
          calories: preset.calories,
          protein: preset.protein,
          tags: [...preset.tags]
        }
      }
    }));
    setPresetModalTarget(null);
    showToast(`Applied preset to ${mealKey === 'lunch' ? 'Lunch' : 'Dinner'}`);
  };

  const toggleStrengthDay = (weekNum, sessionIdx) => {
    saveState((prev) => {
      const arr = [...(prev.weeklyStrength[weekNum] || [false, false, false, false])];
      arr[sessionIdx] = !arr[sessionIdx];
      return {
        ...prev,
        weeklyStrength: { ...prev.weeklyStrength, [weekNum]: arr }
      };
    });
  };

  const updateMilestone = (dayKey, field, val) => {
    saveState((prev) => ({
      ...prev,
      milestones: {
        ...prev.milestones,
        [dayKey]: {
          ...prev.milestones[dayKey],
          [field]: val,
          completed: true
        }
      }
    }));
  };

// Google Sign-In Handler (Supabase)
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      showToast("เข้าสู่ระบบไม่สำเร็จ: " + (err.message || ""));
    }
  };

  // Sign out Handler (Supabase)
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      showToast("ออกจากระบบแล้ว");
      setShowAccountModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // ONBOARDING SCREEN
  if (!state.onboarded || showProfileModal) {
    return (
      <OnboardingModal
        profile={state.profile}
        metrics={metrics}
        isEditing={state.onboarded}
        onClose={() => setShowProfileModal(false)}
        onSave={(newProfile) => {
          saveState((prev) => ({ ...prev, onboarded: true, profile: newProfile }));
          setShowProfileModal(false);
          showToast("Profile & Metabolic Targets updated.");
        }}
      />
    );
  }

  // Daily Totals
  const consumedCalories =
    (Number(currentDayData.meals.lunch.calories) || 0) +
    (Number(currentDayData.meals.dinner.calories) || 0);
  const consumedProtein =
    (Number(currentDayData.meals.lunch.protein) || 0) +
    (Number(currentDayData.meals.dinner.protein) || 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24 md:pb-12 selection:bg-emerald-500 selection:text-zinc-950">
      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-full text-xs font-black shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Protocol Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
              <Flame className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  30-Day Emergency Fat Loss
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-none">
                Aggressive Body Recomp • 4-Week Lean Mass Armor
              </p>
            </div>
          </div>

          {/* Sync & Account Controls */}
          <div className="flex items-center gap-2">
            {/* Realtime Cloud Sync Status Indicator */}
            <button
              onClick={() => setShowAccountModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : syncStatus === 'saving'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
              title="Click to view Account & Cloud Sync details"
            >
              {syncStatus === 'saving' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {syncStatus === 'synced'
                  ? `Synced ${syncTimestamp || ''}`
                  : syncStatus === 'saving'
                  ? 'Syncing...'
                  : 'Local Only'}
              </span>
            </button>

            {/* Profile Avatar / Settings Trigger */}
            <button
              onClick={() => setShowAccountModal(true)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-300 transition"
              title="User Account & Cloud Sync"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HORIZONTAL DAY SCRUBBER (Mobile Friendly) */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 py-2 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => saveState((p) => ({ ...p, currentDay: Math.max(1, p.currentDay - 1) }))}
            disabled={state.currentDay <= 1}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Quick 7-Day Window View centered around current day */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {Array.from({ length: 30 }, (_, i) => i + 1)
              .filter(
                (d) =>
                  d >= Math.max(1, state.currentDay - 3) &&
                  d <= Math.min(30, state.currentDay + 3)
              )
              .map((d) => {
                const isSelected = state.currentDay === d;
                const isMilestone = [7, 14, 21, 28, 30].includes(d);
                const score = calculateDayScore(state.days[d]);

                return (
                  <button
                    key={d}
                    onClick={() => saveState((p) => ({ ...p, currentDay: d }))}
                    className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition flex flex-col items-center min-w-[50px] ${
                      isSelected
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-950/50 scale-105'
                        : score >= 80
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">D{d}</span>
                    <span className="text-[11px] font-black">{score}%</span>
                    {isMilestone && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => saveState((p) => ({ ...p, currentDay: Math.min(30, p.currentDay + 1) }))}
            disabled={state.currentDay >= 30}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ADAPTIVE FEEDBACK NOTICES */}
      {adaptiveAlerts.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pt-4 space-y-2.5">
          {adaptiveAlerts.map((a) => (
            <div
              key={a.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                a.type === 'rose'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  a.type === 'rose' ? 'text-rose-400' : 'text-amber-400'
                }`}
              />
              <div className="text-xs">
                <div className="font-bold text-white mb-0.5">{a.title}</div>
                <p className="opacity-90 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT ROUTER VIA ACTIVE TAB */}
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {activeTab === 'today' && (
          <TodayTab
            currentDay={state.currentDay}
            currentWeek={currentWeek}
            dayData={currentDayData}
            metrics={metrics}
            consumedCalories={consumedCalories}
            consumedProtein={consumedProtein}
            todayScore={todayScore}
            weeklyStrength={state.weeklyStrength[currentWeek] || [false, false, false, false]}
            updateCurrentDay={updateCurrentDay}
            handleMealField={handleMealField}
            toggleMealTag={toggleMealTag}
            toggleStrengthDay={(idx) => toggleStrengthDay(currentWeek, idx)}
            openPresetModal={(mealKey) => setPresetModalTarget(mealKey)}
            openMilestone={() => setActiveMilestoneModal(state.currentDay)}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            days={state.days}
            currentDay={state.currentDay}
            milestones={state.milestones}
            onSelectDay={(d) => {
              saveState((p) => ({ ...p, currentDay: d }));
              setActiveTab('today');
            }}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestonesTab
            milestones={state.milestones}
            profile={state.profile}
            metrics={metrics}
            onOpenMilestone={(mDay) => setActiveMilestoneModal(mDay)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={state.profile}
            metrics={metrics}
            latestWeight={latestWeight}
            user={user}
            syncStatus={syncStatus}
            onEditTargets={() => setShowProfileModal(true)}
            onOpenAccount={() => setShowAccountModal(true)}
            onResetAll={() => setConfirmResetModal(true)}
          />
        )}
      </main>

      {/* BOTTOM MOBILE NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/90 py-2 px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'today' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Today</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'timeline' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">30-Day Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'milestones' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Milestones</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'profile' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Profile & Sync</span>
          </button>
        </div>
      </nav>

      {/* QUICK PRESETS MODAL */}
      {presetModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-base">
                  Approved High-Satiety Meals ({presetModalTarget.toUpperCase()})
                </h3>
              </div>
              <button
                onClick={() => setPresetModalTarget(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              One-tap meal population with verified lean protein & zero-oil standards:
            </p>
            <div className="space-y-2">
              {MEAL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(presetModalTarget, p)}
                  className="w-full text-left p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.tags.map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-amber-400">{p.calories} kcal</div>
                    <div className="text-xs font-bold text-emerald-400">{p.protein}g Protein</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MILESTONE WEIGH-IN & ADAPTIVE MODAL */}
      {activeMilestoneModal && (
        <MilestoneModal
          day={activeMilestoneModal}
          milestoneData={state.milestones[activeMilestoneModal]}
          profile={state.profile}
          metrics={metrics}
          onClose={() => setActiveMilestoneModal(null)}
          onSave={(field, val) => {
            updateMilestone(activeMilestoneModal, field, val);
            showToast(`Day ${activeMilestoneModal} weigh-in saved`);
          }}
        />
      )}

      {/* ACCOUNT & CLOUD SYNC MODAL */}
      {showAccountModal && (
        <AccountModal
          user={user}
          syncStatus={syncStatus}
          syncTimestamp={syncTimestamp}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onClose={() => setShowAccountModal(false)}
        />
      )}

      {/* PROTOCOL RESET MODAL */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-white text-base">Reset 30-Day Protocol?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will reset all logged meals, steps, and weigh-ins back to Day 1 across all connected devices.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmResetModal(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const fresh = createInitialState();
                  fresh.onboarded = true;
                  fresh.profile = state.profile;
                  saveState(fresh);
                  setConfirmResetModal(false);
                  showToast("30-Day Protocol reset to Day 1");
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-black"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-VIEW: TAB 1 (TODAY DASHBOARD) ---
function TodayTab({
  currentDay,
  currentWeek,
  dayData,
  metrics,
  consumedCalories,
  consumedProtein,
  todayScore,
  weeklyStrength,
  updateCurrentDay,
  handleMealField,
  toggleMealTag,
  toggleStrengthDay,
  openPresetModal,
  openMilestone
}) {
  const isMilestoneDay = [7, 14, 21, 28, 30].includes(currentDay);

  return (
    <div className="space-y-4">
      {/* DAILY DISCIPLINE HERO CARD */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                DAY {currentDay}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Week {currentWeek}
              </span>
              {isMilestoneDay && (
                <button
                  onClick={openMilestone}
                  className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-zinc-950 flex items-center gap-1 animate-pulse"
                >
                  <Scale className="w-3 h-3" /> Weigh-In Due
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Strict 16:8 Fasting • 2 Lean Feedings • High NEAT Steps
            </p>
          </div>

          {/* Radial Score Indicator */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#27272a"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke={todayScore === 100 ? '#10b981' : '#f59e0b'}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray="163"
                strokeDashoffset={163 - (todayScore / 100) * 163}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">{todayScore}%</span>
          </div>
        </div>

        {/* METABOLIC BUDGET COMPARISON BAR */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800/80">
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3">
            <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-1">
              <span>Energy Limit</span>
              <span className={consumedCalories > metrics.dailyCalories ? 'text-rose-400' : 'text-emerald-400'}>
                {metrics.dailyCalories - consumedCalories} left
              </span>
            </div>
            <div className="text-lg font-black text-white">
              {consumedCalories}{' '}
              <span className="text-[11px] font-normal text-zinc-500">/ {metrics.dailyCalories} kcal</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full ${consumedCalories > metrics.dailyCalories ? 'bg-rose-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, (consumedCalories / metrics.dailyCalories) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3">
            <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-1">
              <span>Protein Target</span>
              <span className="text-emerald-400">
                {Math.round((consumedProtein / metrics.proteinTarget) * 100)}%
              </span>
            </div>
            <div className="text-lg font-black text-white">
              {consumedProtein}g{' '}
              <span className="text-[11px] font-normal text-zinc-500">/ {metrics.proteinTarget}g</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${Math.min(100, (consumedProtein / metrics.proteinTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2-MEAL FASTING MODULE (LUNCH & DINNER) */}
      <div className="space-y-3">
        {(['lunch', 'dinner']).map((mealKey) => {
          const meal = dayData.meals[mealKey];
          const isLunch = mealKey === 'lunch';
          const title = isLunch ? 'Meal 1: Lunch (Fasting Break)' : 'Meal 2: Dinner (Final Feeding)';

          return (
            <div
              key={mealKey}
              className={`p-4 rounded-3xl border transition-all ${
                meal.completed
                  ? 'bg-zinc-900/90 border-emerald-500/40'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleMealField(mealKey, 'completed', !meal.completed)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                      meal.completed
                        ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                        : 'bg-zinc-950 border-zinc-700 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <h4 className="text-sm font-black text-white">{title}</h4>
                </div>

                <button
                  onClick={() => openPresetModal(mealKey)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/25"
                >
                  <BookOpen className="w-3 h-3" /> Quick Presets
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., 200g Boiled Chicken + White Rice..."
                  value={meal.description}
                  onChange={(e) => handleMealField(mealKey, 'description', e.target.value)}
                  className="sm:col-span-6 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-emerald-500"
                />
                <div className="sm:col-span-3 flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Kcal:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={meal.calories || ''}
                    onChange={(e) =>
                      handleMealField(mealKey, 'calories', Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-transparent text-xs font-black text-amber-400 outline-none"
                  />
                </div>
                <div className="sm:col-span-3 flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Protein:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0g"
                    value={meal.protein || ''}
                    onChange={(e) =>
                      handleMealField(mealKey, 'protein', Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full bg-transparent text-xs font-black text-emerald-400 outline-none"
                  />
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-1.5">
                {MEAL_TAGS.map((t) => {
                  const active = (meal.tags || []).includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleMealTag(mealKey, t)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <CheckCircle2 className={`w-3 h-3 ${active ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* LIQUID INTAKE & STRICT ZERO LIQUID SUGAR REMINDER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-400" />
            <div>
              <h4 className="text-xs font-black uppercase text-white">Hydration & Electrolytes</h4>
              <p className="text-[10px] text-zinc-400">Target: 3,000ml (3.0L) daily to blunt ghrelin</p>
            </div>
          </div>
          <div className="text-xs font-black text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-xl">
            {(dayData.waterMl || 0)} / 3000 ml
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[250, 500, 750, 1000].map((vol) => (
            <button
              key={vol}
              onClick={() =>
                updateCurrentDay((d) => ({ ...d, waterMl: Math.min(6000, (d.waterMl || 0) + vol) }))
              }
              className="py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-sky-500/40 text-xs font-bold text-sky-300 transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> {vol}ml
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => updateCurrentDay((d) => ({ ...d, waterMl: Math.max(0, (d.waterMl || 0) - 250) }))}
            className="text-[10px] text-zinc-500 hover:text-zinc-300"
          >
            -250ml Correction
          </button>
          <button
            onClick={() => updateCurrentDay((d) => ({ ...d, waterMl: 0 }))}
            className="text-[10px] text-zinc-500 hover:text-rose-400"
          >
            Clear Water
          </button>
        </div>

        {/* Strict Zero Liquid Sugar Guard */}
        <div className="rounded-2xl bg-rose-950/30 border border-rose-500/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-rose-200">
              <span className="font-extrabold uppercase tracking-wide">Strict Zero Liquid Sugar: </span>
              Water, Black Coffee, Unsweetened Tea & 0-Cal Sodas ONLY.
            </div>
          </div>
          <button
            onClick={() =>
              updateCurrentDay((d) => ({
                ...d,
                zeroLiquidSugarConfirmed: !d.zeroLiquidSugarConfirmed
              }))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition shrink-0 ${
              dayData.zeroLiquidSugarConfirmed
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                : 'bg-zinc-950 text-zinc-400 border-zinc-700'
            }`}
          >
            {dayData.zeroLiquidSugarConfirmed ? '✓ Zero Sugar Verified' : 'Confirm 0 Liquid Sugar'}
          </button>
        </div>
      </div>

      {/* ACTIVITY & STEP TIER PROGRESS RING */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-black uppercase text-white">NEAT Daily Steps</h4>
              <p className="text-[10px] text-zinc-400">Primary Fat Oxidation Engine</p>
            </div>
          </div>
          <StepBadge steps={dayData.steps || 0} />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="25000"
            step="500"
            value={dayData.steps || 0}
            onChange={(e) =>
              updateCurrentDay((d) => ({ ...d, steps: parseInt(e.target.value) || 0 }))
            }
            className="w-full accent-emerald-500"
          />
          <div className="w-24 shrink-0 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-center">
            <span className="text-xs font-black text-white">{(dayData.steps || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className={`p-2 rounded-xl border ${dayData.steps >= 10000 ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
            Min: 10,000
          </div>
          <div className={`p-2 rounded-xl border ${dayData.steps >= 15000 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
            Optimal: 15,000
          </div>
          <div className={`p-2 rounded-xl border ${dayData.steps >= 20000 ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
            Elite: 20,000
          </div>
        </div>
      </div>

      {/* WEEKLY STRENGTH MAINTENANCE & ZONE 2 CARDIO */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-black uppercase text-white">Week {currentWeek} Strength Armor</h4>
              <p className="text-[10px] text-zinc-400">4 Heavy Resistance Sessions to Halt Catabolism</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {weeklyStrength.filter(Boolean).length} / 4 Done
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['Session 1: Upper Push/Pull', 'Session 2: Lower Compound', 'Session 3: Upper Hypertrophy', 'Session 4: Lower & Core'].map((name, i) => (
            <button
              key={name}
              onClick={() => toggleStrengthDay(i)}
              className={`p-2.5 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                weeklyStrength[i]
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${weeklyStrength[i] ? 'bg-emerald-500 text-zinc-950' : 'border border-zinc-700'}`}>
                {weeklyStrength[i] && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="truncate text-[11px]">{name}</span>
            </button>
          ))}
        </div>

        {/* Zone 2 Walking Minutes */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-zinc-300">Zone 2 Cardio / Incline Walk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="180"
              placeholder="0"
              value={dayData.zone2Minutes || ''}
              onChange={(e) =>
                updateCurrentDay((d) => ({
                  ...d,
                  zone2Minutes: Math.max(0, parseInt(e.target.value) || 0)
                }))
              }
              className="w-16 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 text-xs font-black text-white text-right outline-none"
            />
            <span className="text-xs text-zinc-500">mins</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 italic">
          * Warning: Avoid exhaustive HIIT sessions. Zone 2 (120-135 BPM) protects muscle while accelerating deficit.
        </p>
      </div>
    </div>
  );
}

// --- SUB-VIEW: TAB 2 (30-DAY GRID) ---
function TimelineTab({ days, currentDay, milestones, onSelectDay }) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
          30-Day Master Protocol Timeline
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Tap any day to inspect meal logs, steps, and compliance scores.
        </p>

        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((dNum) => {
            const dObj = days[dNum];
            let score = 0;
            if (dObj) {
              if (dObj.meals.lunch.completed) score += 20;
              if (dObj.meals.dinner.completed) score += 20;
              if ((dObj.waterMl || 0) >= 2500) score += 20;
              if (dObj.zeroLiquidSugarConfirmed) score += 20;
              if ((dObj.steps || 0) >= 10000) score += 20;
            }

            const isSelected = currentDay === dNum;
            const isMilestone = [7, 14, 21, 28, 30].includes(dNum);
            const milestoneDone = milestones[dNum]?.completed;

            let badgeColor = 'bg-zinc-950 border-zinc-800 text-zinc-500';
            if (score >= 80) badgeColor = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
            else if (score > 0) badgeColor = 'bg-amber-500/15 border-amber-500/40 text-amber-300';

            if (isSelected) {
              badgeColor = 'bg-emerald-500 border-emerald-400 text-zinc-950 font-black scale-105';
            }

            return (
              <button
                key={dNum}
                onClick={() => onSelectDay(dNum)}
                className={`relative h-14 rounded-2xl border flex flex-col items-center justify-center transition-all ${badgeColor}`}
              >
                <span className="text-[10px] opacity-75">D{dNum}</span>
                <span className="text-xs font-black">{score}%</span>
                {isMilestone && (
                  <span
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${
                      milestoneDone ? 'bg-emerald-400 text-zinc-950' : 'bg-purple-500 text-white'
                    }`}
                  >
                    ★
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- SUB-VIEW: TAB 3 (MILESTONES & ADAPTIVE) ---
function MilestonesTab({ milestones, profile, metrics, onOpenMilestone }) {
  const startW = parseFloat(profile.startWeight) || 80;

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
          Weekly Weigh-Ins & Adaptive Intelligence
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Fasted morning weigh-ins trigger automated protocol adjustments.
        </p>

        <div className="space-y-3">
          {[7, 14, 21, 28, 30].map((mDay) => {
            const m = milestones[mDay];
            const weightVal = parseFloat(m?.weight);
            const drop = !isNaN(weightVal) ? (startW - weightVal).toFixed(1) : null;

            return (
              <div
                key={mDay}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-purple-400">
                      Day {mDay} Check-In
                    </span>
                    {m?.completed && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-bold">
                        Logged
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    {weightVal ? `${weightVal} kg` : 'Pending Weigh-In'}
                    {drop !== null && (
                      <span className="text-xs font-normal text-emerald-400 ml-2">
                        (-{drop} kg vs start)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {mDay === 7
                      ? 'Week 1 Loss Diagnostic'
                      : mDay === 21
                      ? 'Week 3 CNS & Cortisol Assessment'
                      : mDay === 30
                      ? 'Exit Protocol & Reverse Diet'
                      : `Week ${mDay / 7} Checkpoint`}
                  </p>
                </div>

                <button
                  onClick={() => onOpenMilestone(mDay)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition"
                >
                  {m?.completed ? 'Update' : 'Log Weight'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- SUB-VIEW: TAB 4 (PROFILE & CLOUD SYNC) ---
function ProfileTab({
  profile,
  metrics,
  latestWeight,
  user,
  syncStatus,
  onEditTargets,
  onOpenAccount,
  onResetAll
}) {
  return (
    <div className="space-y-4">
      {/* Account Cloud Status Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">
                {user?.isAnonymous ? 'Anonymous Device Session' : user?.displayName || user?.email || 'Logged In User'}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                UID: {user?.uid || 'Not connected'}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAccount}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
          >
            Manage
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
          <span className="text-zinc-400">Cloud Sync Status:</span>
          <span className={`font-bold uppercase ${syncStatus === 'synced' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {syncStatus}
          </span>
        </div>
      </div>

      {/* Target Blueprint Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-white tracking-wider">
            Metabolic Blueprint (Mifflin-St Jeor)
          </h4>
          <button
            onClick={onEditTargets}
            className="text-xs text-emerald-400 hover:underline font-bold"
          >
            Recalculate
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">Daily Calorie Target</span>
            <div className="text-base font-black text-amber-400 mt-0.5">{metrics.dailyCalories} kcal</div>
            <span className="text-[10px] text-zinc-500">TDEE ({metrics.tdee}) - 700</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">Daily Protein Target</span>
            <div className="text-base font-black text-emerald-400 mt-0.5">{metrics.proteinTarget}g / day</div>
            <span className="text-[10px] text-zinc-500">2.0g per kg BW</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">Current Weight</span>
            <div className="text-base font-black text-white mt-0.5">{latestWeight} kg</div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">Target Goal</span>
            <div className="text-base font-black text-emerald-400 mt-0.5">{profile.targetWeight} kg</div>
          </div>
        </div>
      </div>

      {/* Reset Session Action */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={onResetAll}
          className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Protocol from Day 1
        </button>
      </div>
    </div>
  );
}

// --- SUBCOMPONENT: STEP BADGE ---
function StepBadge({ steps }) {
  if (steps >= 20000) {
    return (
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
        ★ Elite (20k+)
      </span>
    );
  }
  if (steps >= 15000) {
    return (
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        ✓ Optimal (15k+)
      </span>
    );
  }
  if (steps >= 10000) {
    return (
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
        Min Baseline (10k+)
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
      Below 10k Minimum
    </span>
  );
}

// --- SUBCOMPONENT: MILESTONE MODAL ---
function MilestoneModal({ day, milestoneData, profile, metrics, onClose, onSave }) {
  const [weight, setWeight] = useState(milestoneData?.weight || '');
  const [stress, setStress] = useState(!!milestoneData?.highStressOrInsomnia);
  const startW = parseFloat(profile.startWeight) || 80;
  const currentW = parseFloat(weight);
  const loss = !isNaN(currentW) ? (startW - currentW).toFixed(1) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="font-black text-white text-base">Day {day} Milestone Check-In</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Weight Input */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400">
            Morning Fasted Scale Weight (kg)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-lg font-black text-white outline-none focus:border-purple-500"
            />
            {loss !== null && (
              <span className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 shrink-0">
                {loss >= 0 ? `-${loss}kg` : `+${Math.abs(loss)}kg`}
              </span>
            )}
          </div>
        </div>

        {/* Adaptive Rules */}
        {day === 7 && loss !== null && (
          <div className="text-xs p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
            {loss < 1.0 ? (
              <p>
                <strong>Week 1 Drop &lt; 1.0 kg ({loss}kg):</strong> Adaptive rule triggered. Do NOT cut food calories further. Boost daily steps by +2,000 to +3,000 steps.
              </p>
            ) : (
              <p className="text-emerald-300">
                <strong>Optimal Pace (-{loss}kg):</strong> Fat loss is on track. Sustain your current 10k-15k steps and {metrics.dailyCalories} kcal intake into Week 2.
              </p>
            )}
          </div>
        )}

        {day === 21 && (
          <div className="space-y-2">
            <button
              onClick={() => setStress(!stress)}
              className={`w-full p-3 rounded-2xl border text-left text-xs transition flex items-center gap-2 ${
                stress ? 'bg-rose-950/40 border-rose-500 text-rose-200 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${stress ? 'bg-rose-500 text-zinc-950' : 'border border-zinc-700'}`}>
                {stress && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Flag Symptoms: Insomnia, Night-Waking, or Severe Lethargy</span>
            </button>
            {stress && (
              <p className="text-[11px] text-rose-300/90 p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                Cortisol guard active: Hold your current pace. Shift your main carb portion to Dinner and do NOT add volume.
              </p>
            )}
          </div>
        )}

        {day === 30 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-zinc-950 border border-emerald-500/40 text-xs space-y-2">
            <div className="font-black text-emerald-300 text-sm">Reverse Diet Exit Ramp</div>
            <p className="text-zinc-300 leading-relaxed">
              To prevent fat rebound: Increase intake by +150 kcal/day each week from clean complex carbohydrates until reaching maintenance ({metrics.tdee} kcal).
            </p>
          </div>
        )}

        <button
          onClick={() => {
            onSave('weight', weight);
            if (day === 21) onSave('highStressOrInsomnia', stress);
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition"
        >
          Save & Apply Feedback
        </button>
      </div>
    </div>
  );
}

// --- SUBCOMPONENT: ACCOUNT & CLOUD MODAL ---
function AccountModal({ user, syncStatus, syncTimestamp, onGoogleSignIn, onSignOut, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-white text-base">Account & Cloud Sync</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>Sync Status:</span>
            <span className="font-bold text-emerald-400 uppercase">{syncStatus}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>Last Cloud Write:</span>
            <span className="text-white">{syncTimestamp || 'Active'}</span>
          </div>

          <div className="pt-2 border-t border-zinc-800 space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">User ID:</span>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 break-all">
              <span className="truncate">{user?.uid || 'Not Initialized'}</span>
              <button onClick={copyUid} className="shrink-0 text-zinc-400 hover:text-white" title="Copy UID">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {!user ? (
            <button
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold shadow-md transition active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>
          ) : (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 border border-zinc-700/50 hover:border-red-800/50 font-medium transition"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          )}
      </div>
    </div>
  );
}

// --- SUBCOMPONENT: ONBOARDING / TARGET CALCULATOR MODAL ---
function OnboardingModal({ profile, metrics, isEditing, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    age: profile.age || 28,
    gender: profile.gender || 'male',
    height: profile.height || 175,
    startWeight: profile.startWeight || 82,
    targetWeight: profile.targetWeight || 78,
    activityLevel: profile.activityLevel || 'moderate'
  }));

  const livePreview = useMemo(() => {
    const w = parseFloat(form.startWeight) || 75;
    const h = parseFloat(form.height) || 175;
    const a = parseFloat(form.age) || 28;
    const base = 10 * w + 6.25 * h - 5 * a;
    const bmr = Math.round(form.gender === 'male' ? base + 5 : base - 161);
    const factor = ACTIVITY_MULTIPLIERS[form.activityLevel]?.factor || 1.4;
    const tdee = Math.round(bmr * factor);
    const dailyCalories = Math.max(1200, tdee - 700);
    const proteinTarget = Math.round(w * 2);
    return { bmr, tdee, dailyCalories, proteinTarget };
  }, [form]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950">
              <Flame className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400">
                4-Week Aggressive Recomp
              </span>
              <h2 className="text-lg font-black text-white">Target Prescription Calculator</h2>
            </div>
          </div>
          {isEditing && (
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              age: Number(form.age),
              gender: form.gender,
              height: Number(form.height),
              startWeight: Number(form.startWeight),
              targetWeight: Number(form.targetWeight),
              activityLevel: form.activityLevel
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">Gender</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {['male', 'female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, gender: g }))}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border transition ${
                      form.gender === g
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">Age</label>
              <input
                type="number"
                required
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">Height (cm)</label>
              <input
                type="number"
                required
                value={form.height}
                onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">Current (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.startWeight}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({
                    ...f,
                    startWeight: val,
                    targetWeight: +(parseFloat(val) - 4).toFixed(1) || f.targetWeight
                  }));
                }}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">Target (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.targetWeight}
                onChange={(e) => setForm((f) => ({ ...f, targetWeight: e.target.value }))}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-zinc-400">Activity Level</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, activityLevel: key }))}
                  className={`p-2 rounded-xl text-left text-[11px] border transition ${
                    form.activityLevel === key
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Summary Preview */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-zinc-500">Daily Intake (-700 kcal)</span>
              <div className="text-base font-black text-amber-400">{livePreview.dailyCalories} kcal</div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500">Protein Target (2g/kg)</span>
              <div className="text-base font-black text-emerald-400">{livePreview.proteinTarget}g / day</div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/50"
          >
            {isEditing ? 'Save Changes' : 'Initialize 30-Day Protocol'}
          </button>
        </form>
      </div>
    </div>
  );
}
