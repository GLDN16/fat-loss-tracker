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

// เชื่อมต่อ Supabase
const supabaseUrl = 'https://ddaofydnexklkxclwuqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYW9meWRuZXhrbGt4Y2x3dXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MjU2MjQsImV4cCI6MjEwOTEwMTYyNH0.3Abkj_ZhUOnaL9m-3RuuD2Xz6Mi3fpLgTyfbsYghO6M';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- เมนูอาหารแนะนำโปรตีนสูง & อิ่มนาน ---
const MEAL_PRESETS = [
  {
    id: 'p1',
    name: 'อกไก่ต้ม 200g + ข้าวสวย 150g + บรอกโคลีนึ่ง',
    calories: 440,
    protein: 52,
    tags: ['ผัดน้ำ / ปลอดน้ำมัน', 'ผักไฟเบอร์สูงคุมหิว', 'เน้นโปรตีนลีน']
  },
  {
    id: 'p2',
    name: 'ข้าวโอ๊ต 50g (ชงน้ำเปล่า) + เวย์ไอโซเลท 2 สกู๊ป',
    calories: 420,
    protein: 55,
    tags: ['ผัดน้ำ / ปลอดน้ำมัน', 'เน้นโปรตีนลีน']
  },
  {
    id: 'p3',
    name: 'ปลากะพง/ปลานิลลีน 250g + สลัดหน่อไม้ฝรั่ง & ผักโขม',
    calories: 320,
    protein: 56,
    tags: ['ผัดน้ำ / ปลอดน้ำมัน', 'ผักไฟเบอร์สูงคุมหิว', 'เน้นโปรตีนลีน']
  },
  {
    id: 'p4',
    name: 'ไข่ขาว 6 ฟอง + ไข่เต็มใบ 2 ฟองคั่ว + ซูกินี 200g',
    calories: 300,
    protein: 38,
    tags: ['ผัดน้ำ / ปลอดน้ำมัน', 'ผักไฟเบอร์สูงคุมหิว', 'เน้นโปรตีนลีน']
  },
  {
    id: 'p5',
    name: 'เนื้อบดไม่ติดมัน (96/4) 220g + ข้าวกะหล่ำดอก 300g',
    calories: 390,
    protein: 50,
    tags: ['ผัดน้ำ / ปลอดน้ำมัน', 'ผักไฟเบอร์สูงคุมหิว', 'เน้นโปรตีนลีน']
  },
  {
    id: 'p6',
    name: 'กรีกโยเกิร์ต 0% 350g + เวย์ 1 สกู๊ป + เบอร์รี่สด 100g',
    calories: 360,
    protein: 58,
    tags: ['เน้นโปรตีนลีน']
  }
];

const MEAL_TAGS = [
  'ผัดน้ำ / ปลอดน้ำมัน',
  'ผักไฟเบอร์สูงคุมหิว',
  'เน้นโปรตีนลีน'
];

const ACTIVITY_MULTIPLIERS = {
  sedentary: { label: 'นั่งทำงานเป็นหลัก (ขยับน้อย, <5,000 ก้าว)', factor: 1.2 },
  light: { label: 'ขยับปานกลาง (เวทเทรนนิ่ง 1-3 วัน/สัปดาห์)', factor: 1.375 },
  moderate: { label: 'แอคทีฟ (เวท 3-5 วัน + เดิน 10,000 ก้าว)', factor: 1.55 },
  active: { label: 'แอคทีฟสูงมาก (ซ้อมหนัก + เดิน 15,000+ ก้าว)', factor: 1.725 }
};

// --- ตัวสร้างโครงสร้างข้อมูลเริ่มต้น ---
const createEmptyDay = (dayNum) => ({
  day: dayNum,
  meals: {
    lunch: { completed: false, description: '', calories: 0, protein: 0, tags: [] },
    dinner: { completed: false, description: '', calories: 0, protein: 0, tags: [] }
  },
  waterMl: 0,
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
  const [syncStatus, setSyncStatus] = useState('offline');
  const [syncTimestamp, setSyncTimestamp] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // --- APP STATE ---
  const [state, setState] = useState(() => {
    try {
      const local = localStorage.getItem('emergency_fatloss_cache');
      if (local) return JSON.parse(local);
    } catch (e) {
      console.warn("Local storage cache read fallback:", e);
    }
    return createInitialState();
  });

  const [activeTab, setActiveTab] = useState('today');
  const [presetModalTarget, setPresetModalTarget] = useState(null);
  const [activeMilestoneModal, setActiveMilestoneModal] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const isRemoteUpdate = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- 1. ตรวจจับการเข้าสู่ระบบผ่าน SUPABASE ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setSyncStatus('synced');
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setSyncStatus('synced');
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        setUser(null);
        setSyncStatus('offline');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 2. ดึงข้อมูลจาก CLOUD เมื่อล็อกอินสำเร็จ ---
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setSyncStatus('saving');
      try {
        const { data, error } = await supabase
          .from('user_tracker')
          .select('tracker_data')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && data.tracker_data) {
          isRemoteUpdate.current = true;
          setState(data.tracker_data);
          setSyncStatus('synced');
          setSyncTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          showToast('ซิงก์ข้อมูลจากระบบคลาวด์เรียบร้อย');
        } else {
          await supabase.from('user_tracker').upsert({
            user_id: user.id,
            tracker_data: state,
            updated_at: new Date().toISOString(),
          });
          setSyncStatus('synced');
          setSyncTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } catch (err) {
        console.error('Fetch cloud data error:', err);
        setSyncStatus('error');
      }
    };

    fetchUserData();
  }, [user?.id]);

  // --- 3. บันทึกข้อมูลขึ้น SUPABASE อัตโนมัติ (DEBOUNCE 800MS) ---
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

  const saveState = (updater) => {
    setState((prevState) => {
      const nextState = typeof updater === 'function' ? updater(prevState) : updater;
      try {
        localStorage.setItem('emergency_fatloss_cache', JSON.stringify(nextState));
      } catch (e) {
        console.warn("Local storage cache write:", e);
      }
      return nextState;
    });
  };

  // --- คำนวณเป้าหมายตามสูตร Mifflin-St Jeor ---
  const metrics = useMemo(() => {
    const { age, gender, height, startWeight, targetWeight, activityLevel } = state.profile;
    const w = parseFloat(startWeight) || 75;
    const h = parseFloat(height) || 175;
    const a = parseFloat(age) || 28;

    const baseBmr = 10 * w + 6.25 * h - 5 * a;
    const bmr = Math.round(gender === 'male' ? baseBmr + 5 : baseBmr - 161);
    const factor = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.4;
    const tdee = Math.round(bmr * factor);

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

  const currentDayData = state.days[state.currentDay] || createEmptyDay(state.currentDay);
  const currentWeek = Math.min(4, Math.ceil(state.currentDay / 7));

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

  const latestWeight = useMemo(() => {
    const checkDays = [30, 28, 21, 14, 7];
    for (const d of checkDays) {
      const w = parseFloat(state.milestones[d]?.weight);
      if (!isNaN(w) && w > 0) return w;
    }
    return parseFloat(state.profile.startWeight);
  }, [state.milestones, state.profile.startWeight]);

  // ระบบแจ้งเตือนอัจฉริยะ (Adaptive Feedback)
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
          title: 'สัปดาห์ที่ 1: ปรับเพิ่มก้าวเดิน +2,500 ก้าว',
          desc: `น้ำหนักลดลง ${drop.toFixed(1)} กก. (ต่ำกว่าเป้าหมาย 1.0 กก.) ห้ามลดแคลอรีจากอาหารลงอีก เพื่อรักษาระบบเผาผลาญ ให้เพิ่มการเดินเป็น 12,500 - 15,000 ก้าวต่อวัน เพื่อเพิ่มการเผาผลาญผ่าน NEAT แทน`
        });
      }
    }

    if (state.milestones[21]?.highStressOrInsomnia) {
      alerts.push({
        id: 'w3-cortisol',
        type: 'rose',
        title: 'สัปดาห์ที่ 3: ระบบแจ้งเตือนภาวะเครียดและคอร์ติซอลสูง',
        desc: 'ตรวจพบอาการนอนไม่หลับหรืออ่อนเพลียสะสม แนะนำให้คงแคลอรีและจำนวนก้าวไว้เท่าเดิม และย้ายคาร์โบไฮเดรตเชิงซ้อนมาไว้ในมื้อเย็นเพื่อช่วยฟื้นฟูเซโรโทนินและช่วยให้นอนหลับลึกขึ้น'
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
    showToast(`เลือกเมนูอาหารสำหรับ${mealKey === 'lunch' ? 'มื้อเที่ยง' : 'มื้อเย็น'}เรียบร้อย`);
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

  // จัดการ Google Login
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google sign-in error:", err);
      showToast("เข้าสู่ระบบไม่สำเร็จ: " + (err?.message || ""));
    }
  };

  // ออกจากระบบ
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSyncStatus('offline');
      showToast("ออกจากระบบแล้ว");
      setShowAccountModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  // หน้าจอ Onboarding / คำนวณเป้าหมาย
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
          showToast("อัปเดตข้อมูลและเป้าหมายเรียบร้อย");
        }}
      />
    );
  }

  const consumedCalories =
    (Number(currentDayData.meals.lunch.calories) || 0) +
    (Number(currentDayData.meals.dinner.calories) || 0);
  const consumedProtein =
    (Number(currentDayData.meals.lunch.protein) || 0) +
    (Number(currentDayData.meals.dinner.protein) || 0);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24 md:pb-12 selection:bg-emerald-500 selection:text-zinc-950">
      {/* ป๊อปอัปแจ้งเตือน */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-zinc-950 px-4 py-2 rounded-full text-xs font-black shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* แถบด้านบน */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
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
                โปรแกรมลดไขมันเร่งด่วน • ป้องกันการสูญเสียกล้ามเนื้อ 4 สัปดาห์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAccountModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : syncStatus === 'saving'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
              title="ดูรายละเอียดบัญชีและการเชื่อมต่อ Cloud"
            >
              {syncStatus === 'saving' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {syncStatus === 'synced'
                  ? `ซิงก์แล้ว ${syncTimestamp || ''}`
                  : syncStatus === 'saving'
                  ? 'กำลังซิงก์...'
                  : 'ออฟไลน์ (ในเครื่อง)'}
              </span>
            </button>

            <button
              onClick={() => setShowAccountModal(true)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-300 transition overflow-hidden"
              title="บัญชีผู้ใช้และการซิงก์"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* แถบเลือกวันเลื่อนซ้ายขวา */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 py-2 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => saveState((p) => ({ ...p, currentDay: Math.max(1, p.currentDay - 1) }))}
            disabled={state.currentDay <= 1}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

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

      {/* แจ้งเตือนข้อเสนอแนะอัจฉริยะ */}
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

      {/* ส่วนเนื้อหาหลักตามแท็บ */}
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

      {/* แถบเมนูด้านล่างสำหรับมือถือ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/90 py-2 px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'today' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">วันนี้</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'timeline' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">ตาราง 30 วัน</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'milestones' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">เป้าหมาย & ชั่งนน.</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'profile' ? 'text-emerald-400 font-extrabold scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">โปรไฟล์ & ซิงก์</span>
          </button>
        </div>
      </nav>

      {/* โมดอลเลือกเมนูแนะนำ */}
      {presetModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-white text-base">
                  เมนูโปรตีนสูงคุมหิวยอดนิยม ({presetModalTarget === 'lunch' ? 'มื้อเที่ยง' : 'มื้อเย็น'})
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
              แตะเพื่อเลือกเมนูที่ผ่านเกณฑ์โปรตีนลีนสูงและไม่ใช้น้ำมันทันที:
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
                    <div className="text-xs font-bold text-emerald-400">{p.protein}g โปรตีน</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* โมดอลชั่งน้ำหนักตามรอบ */}
      {activeMilestoneModal && (
        <MilestoneModal
          day={activeMilestoneModal}
          milestoneData={state.milestones[activeMilestoneModal]}
          profile={state.profile}
          metrics={metrics}
          onClose={() => setActiveMilestoneModal(null)}
          onSave={(field, val) => {
            updateMilestone(activeMilestoneModal, field, val);
            showToast(`บันทึกน้ำหนักวันที่ ${activeMilestoneModal} เรียบร้อย`);
          }}
        />
      )}

      {/* โมดอลจัดการบัญชี & CLOUD */}
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

      {/* โมดอลยืนยันการรีเซ็ต */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-white text-base">ต้องการรีเซ็ตโปรแกรม 30 วันหรือไม่?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              การดำเนินการนี้จะล้างข้อมูลมื้ออาหาร จำนวนก้าว และน้ำหนักทั้งหมดกลับไปเริ่มต้นวันที่ 1 ในทุกอุปกรณ์ที่เชื่อมต่อ
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmResetModal(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const fresh = createInitialState();
                  fresh.onboarded = true;
                  fresh.profile = state.profile;
                  saveState(fresh);
                  setConfirmResetModal(false);
                  showToast("รีเซ็ตโปรแกรมกลับสู่วันที่ 1 เรียบร้อย");
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 text-xs font-black"
              >
                ยืนยันรีเซ็ตข้อมูลทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- แดชบอร์ดบันทึกประจำวัน (TODAY) ---
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
      {/* การ์ดสรุปเป้าหมายประจำวัน */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                วันที่ {currentDay}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                สัปดาห์ที่ {currentWeek}
              </span>
              {isMilestoneDay && (
                <button
                  onClick={openMilestone}
                  className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-zinc-950 flex items-center gap-1 animate-pulse"
                >
                  <Scale className="w-3 h-3" /> ถึงรอบชั่งน้ำหนัก
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              ทำ Fasting 16:8 เคร่งครัด • ทาน 2 มื้อโปรตีนลีน • เพิ่มก้าวเดิน NEAT
            </p>
          </div>

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

        {/* แถบวัดพลังงานและโปรตีน */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800/80">
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3">
            <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-1">
              <span>โควตาพลังงาน</span>
              <span className={consumedCalories > metrics.dailyCalories ? 'text-rose-400' : 'text-emerald-400'}>
                {metrics.dailyCalories - consumedCalories} เหลือ
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
              <span>เป้าหมายโปรตีน</span>
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

      {/* บันทึกมื้ออาหาร 2 มื้อ */}
      <div className="space-y-3">
        {(['lunch', 'dinner']).map((mealKey) => {
          const meal = dayData.meals[mealKey];
          const isLunch = mealKey === 'lunch';
          const title = isLunch ? 'มื้อที่ 1: เที่ยง (เปิดมื้อแรก)' : 'มื้อที่ 2: เย็น (ปิดมื้อสุดท้าย)';

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
                  <BookOpen className="w-3 h-3" /> เมนูแนะนำด่วน
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="เช่น อกไก่ต้ม 200g + ข้าวสวย 150g..."
                  value={meal.description}
                  onChange={(e) => handleMealField(mealKey, 'description', e.target.value)}
                  className="sm:col-span-6 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-emerald-500"
                />
                <div className="sm:col-span-3 flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">แคล:</span>
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
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">โปรตีน:</span>
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

      {/* ปริมาณน้ำดื่มและกฎงดน้ำตาล */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-400" />
            <div>
              <h4 className="text-xs font-black uppercase text-white">ปริมาณน้ำดื่ม & เกลือแร่</h4>
              <p className="text-[10px] text-zinc-400">เป้าหมาย: 3,000 มล. (3 ลิตร) ต่อวัน เพื่อลดฮอร์โมนความหิว</p>
            </div>
          </div>
          <div className="text-xs font-black text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-xl">
            {(dayData.waterMl || 0)} / 3000 มล.
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
              <Plus className="w-3 h-3" /> {vol}มล.
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => updateCurrentDay((d) => ({ ...d, waterMl: Math.max(0, (d.waterMl || 0) - 250) }))}
            className="text-[10px] text-zinc-500 hover:text-zinc-300"
          >
            -250 มล. (ปรับลด)
          </button>
          <button
            onClick={() => updateCurrentDay((d) => ({ ...d, waterMl: 0 }))}
            className="text-[10px] text-zinc-500 hover:text-rose-400"
          >
            ล้างค่าน้ำ
          </button>
        </div>

        <div className="rounded-2xl bg-rose-950/30 border border-rose-500/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-rose-200">
              <span className="font-extrabold uppercase tracking-wide">งดเครื่องดื่มที่มีน้ำตาลเด็ดขาด: </span>
              ดื่มได้เฉพาะ น้ำเปล่า, กาแฟดำ, ชาไม่ใส่น้ำตาล และน้ำอัดลม 0 แคลอรี เท่านั้น
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
            {dayData.zeroLiquidSugarConfirmed ? '✓ ยืนยันปลอดน้ำตาลแล้ว' : 'กดยืนยันปลอดน้ำตาล'}
          </button>
        </div>
      </div>

      {/* จำนวนก้าวเดิน NEAT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-black uppercase text-white">จำนวนก้าวเดินประจำวัน (NEAT)</h4>
              <p className="text-[10px] text-zinc-400">กลไกหลักในการดึงไขมันสะสมมาเผาผลาญ</p>
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
            ขั้นต่ำ: 10,000
          </div>
          <div className={`p-2 rounded-xl border ${dayData.steps >= 15000 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
            เหมาะสม: 15,000
          </div>
          <div className={`p-2 rounded-xl border ${dayData.steps >= 20000 ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
            ระดับสูง: 20,000
          </div>
        </div>
      </div>

      {/* ตารางเวทเทรนนิ่ง & โซน 2 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-black uppercase text-white">ตารางเวทเทรนนิ่ง สัปดาห์ที่ {currentWeek}</h4>
              <p className="text-[10px] text-zinc-400">เวทหนัก 4 วันต่อสัปดาห์ เพื่อป้องกันการสูญเสียกล้ามเนื้อ</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {weeklyStrength.filter(Boolean).length} / 4 วัน
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['วันที่ 1: อก / หลัง / แขน (Upper)', 'วันที่ 2: ขา / สะโพก (Lower)', 'วันที่ 3: ช่วงบนเน้นกระตุ้นกล้ามเนื้อ', 'วันที่ 4: ช่วงล่าง & แกนกลางลำตัว'].map((name, i) => (
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

        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-zinc-300">คาร์ดิโอโซน 2 / เดินชันบนลู่วิ่ง</span>
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
            <span className="text-xs text-zinc-500">นาที</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 italic">
          * คำแนะนำ: หลีกเลี่ยงคาร์ดิโอหนักจนหมดแรง (HIIT) โซน 2 (หัวใจ 120-135 BPM) จะช่วยเผาผลาญไขมันโดยไม่สลายกล้ามเนื้อ
        </p>
      </div>
    </div>
  );
}

// --- ตารางภาพรวม 30 วัน (GRID) ---
function TimelineTab({ days, currentDay, milestones, onSelectDay }) {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
          ภาพรวมความสม่ำเสมอตลอด 30 วัน
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          แตะที่แต่ละวันเพื่อดูบันทึกมื้ออาหาร จำนวนก้าว และคะแนนวินัย
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

// --- หน้ารอบชั่งน้ำหนัก & ปรับแผน (MILESTONES) ---
function MilestonesTab({ milestones, profile, metrics, onOpenMilestone }) {
  const startW = parseFloat(profile.startWeight) || 80;

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
          ชั่งน้ำหนักประจำสัปดาห์ & ปรับแผนอัจฉริยะ
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          ชั่งน้ำหนักตอนเช้าหลังตื่นนอน (ก่อนทานอาหาร) เพื่อประเมินและปรับโปรแกรมอัตโนมัติ
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
                      เช็กอินวันที่ {mDay}
                    </span>
                    {m?.completed && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-bold">
                        บันทึกแล้ว
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    {weightVal ? `${weightVal} กก.` : 'รอชั่งน้ำหนัก'}
                    {drop !== null && (
                      <span className="text-xs font-normal text-emerald-400 ml-2">
                        (ลดลง -{drop} กก. จากวันแรก)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {mDay === 7
                      ? 'ประเมินผลลดไขมันสัปดาห์ที่ 1'
                      : mDay === 21
                      ? 'ประเมินความล้าสะสมและฮอร์โมนสัปดาห์ที่ 3'
                      : mDay === 30
                      ? 'แผนออกจากโปรแกรม & Reverse Diet'
                      : `จุดประเมินสัปดาห์ที่ ${mDay / 7}`}
                  </p>
                </div>

                <button
                  onClick={() => onOpenMilestone(mDay)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition"
                >
                  {m?.completed ? 'แก้ไข' : 'บันทึกน้ำหนัก'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- หน้าโปรไฟล์ & การซิงก์ (PROFILE) ---
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
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'ผู้ใช้งาน';
  const userId = user?.id || 'ยังไม่เชื่อมต่อ';

  return (
    <div className="space-y-4">
      {/* การ์ดสถานะบัญชีและการซิงก์ */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white">
                {user ? displayName : 'ใช้งานแบบออฟไลน์ (ในเครื่อง)'}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                UID: {userId}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAccount}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
          >
            จัดการบัญชี
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
          <span className="text-zinc-400">สถานะการเชื่อมต่อ Cloud:</span>
          <span className={`font-bold uppercase ${syncStatus === 'synced' ? 'text-emerald-400' : syncStatus === 'saving' ? 'text-amber-400' : 'text-zinc-500'}`}>
            {syncStatus === 'synced' ? 'ซิงก์แล้ว' : syncStatus === 'saving' ? 'กำลังบันทึก...' : 'ออฟไลน์'}
          </span>
        </div>
      </div>

      {/* การ์ดเป้าหมายพลังงานและการเผาผลาญ */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-white tracking-wider">
            เป้าหมายพลังงานและการเผาผลาญ (Mifflin-St Jeor)
          </h4>
          <button
            onClick={onEditTargets}
            className="text-xs text-emerald-400 hover:underline font-bold"
          >
            คำนวณใหม่
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">แคลอรีที่ต้องทานต่อวัน</span>
            <div className="text-base font-black text-amber-400 mt-0.5">{metrics.dailyCalories} kcal</div>
            <span className="text-[10px] text-zinc-500">TDEE ({metrics.tdee}) - 700</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">เป้าหมายโปรตีนต่อวัน</span>
            <div className="text-base font-black text-emerald-400 mt-0.5">{metrics.proteinTarget}g / วัน</div>
            <span className="text-[10px] text-zinc-500">2.0g ต่อน้ำหนักตัว 1 กก.</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">น้ำหนักล่าสุด</span>
            <div className="text-base font-black text-white mt-0.5">{latestWeight} กก.</div>
            <span className="text-[10px] text-zinc-500">จากเริ่มต้น {profile.startWeight} กก.</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">น้ำหนักเป้าหมาย</span>
            <div className="text-base font-black text-emerald-400 mt-0.5">{profile.targetWeight} กก.</div>
            <span className="text-[10px] text-zinc-500">เป้าลด {profile.startWeight - profile.targetWeight > 0 ? (profile.startWeight - profile.targetWeight).toFixed(1) : 0} กก.</span>
          </div>

          {/* ส่วนสูง (เพิ่มใหม่) */}
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">ส่วนสูง</span>
            <div className="text-base font-black text-white mt-0.5">{profile.height} ซม.</div>
            <span className="text-[10px] text-zinc-500">คำนวณอัตราเผาผลาญ</span>
          </div>

          {/* อายุ และ เพศ (เพิ่มใหม่) */}
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-500 text-[10px] uppercase">อายุ</span>
            <div className="text-base font-black text-white mt-0.5">{profile.age} ปี</div>
            <span className="text-[10px] text-zinc-500">เพศ{profile.gender === 'male' ? 'ชาย' : 'หญิง'}</span>
          </div>
        </div>

      {/* ปุ่มรีเซ็ตโปรแกรม */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={onResetAll}
          className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตเริ่มโปรแกรมใหม่ตั้งแต่วันที่ 1
        </button>
      </div>
    </div>
  );
}

// --- ป้ายสถิติจำนวนก้าว ---
function StepBadge({ steps }) {
  if (steps >= 20000) {
    return (
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
        ★ ระดับสูง (20k+)
      </span>
    );
  }
  if (steps >= 15000) {
    return (
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        ✓ เหมาะสม (15k+)
      </span>
    );
  }
  if (steps >= 10000) {
    return (
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
        ขั้นต่ำ (10k+)
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
      ต่ำกว่าเกณฑ์ 10k
    </span>
  );
}

// --- โมดอลเช็กอินน้ำหนัก ---
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
            <h3 className="font-black text-white text-base">บันทึกน้ำหนักวันที่ {day}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400">
            น้ำหนักตัวตอนเช้าหลังตื่นนอน (กก.)
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
                {loss >= 0 ? `-${loss} กก.` : `+${Math.abs(loss)} กก.`}
              </span>
            )}
          </div>
        </div>

        {day === 7 && loss !== null && (
          <div className="text-xs p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
            {loss < 1.0 ? (
              <p>
                <strong>น้ำหนักสัปดาห์แรกลดลงน้อยกว่า 1.0 กก. ({loss} กก.):</strong> เริ่มการปรับตัว ห้ามลดอาหารลงเด็ดขาด ให้เพิ่มก้าวเดิน +2,000 ถึง +3,000 ก้าวต่อวันเพื่อเผาผลาญเพิ่มขึ้น
              </p>
            ) : (
              <p className="text-emerald-300">
                <strong>ลดลงในเกณฑ์ที่ยอดเยี่ยม (-{loss} กก.):</strong> โปรแกรมได้ผลดีมาก ให้คงการเดิน 10,000-15,000 ก้าว และทาน {metrics.dailyCalories} kcal ตามเดิมในสัปดาห์ที่ 2
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
              <span>แจ้งอาการ: นอนไม่หลับ ตื่นกลางดึกบ่อย หรืออ่อนเพลียผิดปกติ</span>
            </button>
            {stress && (
              <p className="text-[11px] text-rose-300/90 p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                เปิดโหมดควบคุมคอร์ติซอล: คงระดับการออกกำลังกายเท่าเดิม ย้ายสัดส่วนแป้ง/คาร์โบไฮเดรตหลักมาไว้ในมื้อเย็น และไม่เพิ่มความหนักในการออกกำลังกาย
              </p>
            )}
          </div>
        )}

        {day === 30 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-zinc-950 border border-emerald-500/40 text-xs space-y-2">
            <div className="font-black text-emerald-300 text-sm">แนวทาง Reverse Diet เมื่อจบโปรแกรม</div>
            <p className="text-zinc-300 leading-relaxed">
              เพื่อป้องกันโยโย่ (Fat Rebound): ค่อยๆ เพิ่มอาหารสัปดาห์ละ +150 kcal/วัน โดยเน้นคาร์โบไฮเดรตเชิงซ้อน จนกระทั่งกลับสู่ค่าเผาผลาญปกติ ({metrics.tdee} kcal)
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
          บันทึกข้อมูลและประเมินผล
        </button>
      </div>
    </div>
  );
}

// --- โมดอลบัญชี & CLOUD ---
function AccountModal({ user, syncStatus, syncTimestamp, onGoogleSignIn, onSignOut, onClose }) {
  const [copied, setCopied] = useState(false);
  const userId = user?.id || '';

  const copyUid = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
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
            <h3 className="font-black text-white text-base">บัญชีและการเชื่อมต่อ Cloud</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-400">
            <span>สถานะการซิงก์:</span>
            <span className={`font-bold uppercase ${syncStatus === 'synced' ? 'text-emerald-400' : syncStatus === 'saving' ? 'text-amber-400' : 'text-zinc-500'}`}>
              {syncStatus === 'synced' ? 'ซิงก์แล้ว' : syncStatus === 'saving' ? 'กำลังบันทึก...' : 'ออฟไลน์'}
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-400">
            <span>บันทึกคลาวด์ล่าสุด:</span>
            <span className="text-white">{syncTimestamp || 'กำลังทำงาน'}</span>
          </div>

          <div className="pt-2 border-t border-zinc-800 space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">รหัสผู้ใช้ (UID):</span>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 break-all">
              <span className="truncate">{userId || 'ยังไม่ได้เข้าสู่ระบบ'}</span>
              {userId && (
                <button onClick={copyUid} className="shrink-0 text-zinc-400 hover:text-white" title="คัดลอก UID">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
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
            เข้าสู่ระบบด้วย Google
          </button>
        ) : (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 border border-zinc-700/50 hover:border-red-800/50 font-medium transition"
          >
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </button>
        )}
      </div>
    </div>
  );
}

// --- หน้าคำนวณเป้าหมายและโภชนาการ (ONBOARDING) ---
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
                โปรแกรมปรับรูปร่างเร่งด่วน 4 สัปดาห์
              </span>
              <h2 className="text-lg font-black text-white">คำนวณเป้าหมายและโภชนาการส่วนบุคคล</h2>
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
              <label className="text-[10px] font-black uppercase text-zinc-400">เพศ</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {[
                  { key: 'male', label: 'ชาย' },
                  { key: 'female', label: 'หญิง' }
                ].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, gender: g.key }))}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border transition ${
                      form.gender === g.key
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">อายุ (ปี)</label>
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
              <label className="text-[10px] font-black uppercase text-zinc-400">ส่วนสูง (ซม.)</label>
              <input
                type="number"
                required
                value={form.height}
                onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400">ปัจจุบัน (กก.)</label>
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
              <label className="text-[10px] font-black uppercase text-zinc-400">เป้าหมาย (กก.)</label>
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
            <label className="text-[10px] font-black uppercase text-zinc-400">ระดับกิจกรรมทางกายภาพ</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, activityLevel: key }))}
                  className={`p-2.5 rounded-xl text-left text-[11px] border transition ${
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

          {/* สรุปเป้าหมายคำนวณสด */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-zinc-500">พลังงานที่ต้องทาน (-700 kcal)</span>
              <div className="text-base font-black text-amber-400">{livePreview.dailyCalories} kcal</div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500">โปรตีนเป้าหมาย (2g / นน.ตัว)</span>
              <div className="text-base font-black text-emerald-400">{livePreview.proteinTarget}g / วัน</div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/50"
          >
            {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เริ่มต้นโปรแกรม 30 วัน'}
          </button>
        </form>
      </div>
    </div>
  );
}
