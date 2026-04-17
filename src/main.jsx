import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  Apple,
  Bot,
  CalendarDays,
  Camera,
  ChevronLeft,
  Dumbbell,
  Droplets,
  Flame,
  Home,
  Languages,
  Menu,
  ScanLine,
  Settings,
  ShoppingBasket,
  Sparkles,
  Utensils,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import './styles.css';

const foods = [
  { id: 1, name: 'Grilled Chicken', emoji: '🍗', cal: 165, protein: 31, carbs: 0, fat: 4, category: 'Protein' },
  { id: 2, name: 'Avocado Toast', emoji: '🥑', cal: 295, protein: 8, carbs: 35, fat: 15, category: 'Grains' },
  { id: 3, name: 'Greek Salad', emoji: '🥗', cal: 180, protein: 6, carbs: 14, fat: 12, category: 'Vegetables' },
  { id: 4, name: 'Brown Rice', emoji: '🍚', cal: 215, protein: 5, carbs: 45, fat: 2, category: 'Grains' },
  { id: 5, name: 'Salmon Fillet', emoji: '🐟', cal: 208, protein: 28, carbs: 0, fat: 10, category: 'Protein' },
  { id: 6, name: 'Oatmeal', emoji: '🥣', cal: 158, protein: 6, carbs: 27, fat: 3, category: 'Grains' },
  { id: 7, name: 'Banana', emoji: '🍌', cal: 89, protein: 1, carbs: 23, fat: 0, category: 'Fruit' },
  { id: 8, name: 'Almonds', emoji: '🥜', cal: 164, protein: 6, carbs: 6, fat: 14, category: 'Snack' },
  { id: 9, name: 'Paneer Bowl', emoji: '🧀', cal: 320, protein: 24, carbs: 18, fat: 18, category: 'Vegetarian' },
  { id: 10, name: 'Tofu Stir Fry', emoji: '🥬', cal: 260, protein: 22, carbs: 20, fat: 11, category: 'Vegan' },
  { id: 11, name: 'Dal Rice', emoji: '🍛', cal: 390, protein: 18, carbs: 62, fat: 8, category: 'Indian' },
  { id: 12, name: 'Greek Yogurt', emoji: '🥛', cal: 140, protein: 20, carbs: 9, fat: 3, category: 'Snack' },
  { id: 13, name: 'Egg Omelette', emoji: '🍳', cal: 210, protein: 18, carbs: 3, fat: 14, category: 'Protein' },
  { id: 14, name: 'Fruit Bowl', emoji: '🍓', cal: 155, protein: 2, carbs: 38, fat: 1, category: 'Fruit' },
  { id: 15, name: 'Protein Smoothie', emoji: '🥤', cal: 280, protein: 32, carbs: 24, fat: 6, category: 'Protein' },
  { id: 16, name: 'Veggie Wrap', emoji: '🌯', cal: 350, protein: 16, carbs: 48, fat: 10, category: 'Vegetarian' }
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const translations = {
  en: {
    hello: 'Good morning',
    dashboard: 'Dashboard',
    scanner: 'Food Scanner',
    meals: 'Meal Planner',
    balance: 'Calorie Balance',
    training: 'Training',
    coach: 'AI Coach',
    mood: 'Mood Food',
    water: 'Water Tracker',
    grocery: 'Grocery List',
    profile: 'Profile',
    ask: 'Ask your nutrition coach...'
  },
  hi: {
    hello: 'नमस्ते',
    dashboard: 'डैशबोर्ड',
    scanner: 'फूड स्कैनर',
    meals: 'मील प्लानर',
    balance: 'कैलोरी बैलेंस',
    training: 'ट्रेनिंग',
    coach: 'AI कोच',
    mood: 'मूड फूड',
    water: 'वाटर ट्रैकर',
    grocery: 'ग्रोसरी',
    profile: 'प्रोफाइल',
    ask: 'अपने न्यूट्रिशन कोच से पूछें...'
  },
  es: {
    hello: 'Hola',
    dashboard: 'Panel',
    scanner: 'Escaner',
    meals: 'Comidas',
    balance: 'Calorias',
    training: 'Entreno',
    coach: 'Coach IA',
    mood: 'Estado',
    water: 'Agua',
    grocery: 'Compras',
    profile: 'Perfil',
    ask: 'Pregunta a tu coach nutricional...'
  }
};

const navGroups = [
  { label: 'Core', items: [{ id: 'dashboard', icon: Home }, { id: 'profile', icon: Settings }] },
  { label: 'Nutrition', items: [{ id: 'scanner', icon: ScanLine }, { id: 'meals', icon: Utensils }, { id: 'balance', icon: Activity }] },
  { label: 'Fitness', items: [{ id: 'training', icon: Dumbbell }] },
  { label: 'AI Features', items: [{ id: 'coach', icon: Bot }, { id: 'mood', icon: Sparkles }] },
  { label: 'Health', items: [{ id: 'water', icon: Droplets }, { id: 'grocery', icon: ShoppingBasket }] }
];

const cn = (...classes) => classes.filter(Boolean).join(' ');
const pct = (value, max) => {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.round((value / max) * 100));
};
const todayIndex = () => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};
const buildWeeklyData = totals => days.map((day, index) => ({
  day,
  calories: index === todayIndex() ? totals.calories : 0,
  burned: index === todayIndex() ? totals.burned : 0
}));
const buildMealPlan = ({ goal, diet, mealCount }) => {
  const filtered = foods.filter(food => {
    if (diet === 'vegetarian') return ['Vegetarian', 'Fruit', 'Snack', 'Grains', 'Indian'].includes(food.category);
    if (diet === 'vegan') return ['Vegan', 'Fruit', 'Grains', 'Vegetables'].includes(food.category);
    if (diet === 'indian') return ['Indian', 'Vegetarian', 'Protein'].includes(food.category);
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (goal === 'high-protein') return b.protein - a.protein;
    if (goal === 'fat-loss') return a.cal - b.cal;
    return Math.abs(280 - a.cal) - Math.abs(280 - b.cal);
  });
  const mealTypes = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  return days.map((day, dayIndexValue) => ({
    day,
    meals: Array.from({ length: mealCount }, (_, mealIndex) => {
      const food = sorted[(dayIndexValue + mealIndex) % sorted.length] || foods[0];
      return { ...food, type: mealTypes[mealIndex] || `Meal ${mealIndex + 1}` };
    })
  }));
};
const readSavedState = () => {
  try {
    return JSON.parse(localStorage.getItem('nutritracker-react-state')) || {};
  } catch {
    return {};
  }
};

function Card({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn('rounded-card border border-white/15 bg-panel/85 p-6 shadow-soft backdrop-blur-xl transition', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function ProgressBar({ value, max, color = 'bg-health' }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-white/8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct(value, max)}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={cn('h-full rounded-full', color)}
      />
    </div>
  );
}

function CircularProgress({ value, max }) {
  const percent = pct(value, max);
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <svg className="-rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
        <motion.circle
          cx="56"
          cy="56"
          r="46"
          fill="none"
          stroke="#22c55e"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={289}
          initial={{ strokeDashoffset: 289 }}
          animate={{ strokeDashoffset: 289 - (percent / 100) * 289 }}
          transition={{ duration: 0.8 }}
        />
      </svg>
      <span className="absolute text-xl font-extrabold">{percent}%</span>
    </div>
  );
}

function ChartWrapper({ title, children, className = '' }) {
  return (
    <Card className={cn('min-h-[320px]', className)}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="rounded-full bg-ai/15 px-3 py-1 text-xs font-bold text-blue-300">Live</span>
      </div>
      {children}
    </Card>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-card border border-dashed border-white/15 bg-white/5 p-6 text-center">
      <div>
        <p className="text-lg font-black text-white">{title}</p>
        <p className="mt-2 max-w-sm text-sm text-slate-400">{body}</p>
      </div>
    </div>
  );
}

function SidebarItem({ id, icon: Icon, active, label, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-400 transition duration-200 hover:bg-white/8 hover:text-white',
        active && 'bg-health/15 text-white shadow-glow'
      )}
    >
      {active && <span className="absolute left-0 top-3 h-7 w-1 rounded-full bg-health" />}
      <Icon size={19} className={active ? 'text-health' : 'text-slate-500 group-hover:text-health'} />
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

function Sidebar({ page, setPage, collapsed, setCollapsed, t }) {
  return (
    <aside className={cn('fixed left-0 top-0 z-40 hidden h-screen border-r border-white/10 bg-ink/90 p-4 backdrop-blur-xl transition-all lg:block', collapsed ? 'w-20' : 'w-72')}>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-health text-ink shadow-glow">
            <Apple size={23} />
          </div>
          {!collapsed && <div><p className="text-xl font-black">NutriTracker</p><p className="text-xs text-slate-500">AI fitness OS</p></div>}
        </div>
        <button className="rounded-xl p-2 text-slate-400 hover:bg-white/10" onClick={() => setCollapsed(!collapsed)}>
          <ChevronLeft className={collapsed ? 'rotate-180' : ''} size={18} />
        </button>
      </div>
      <nav className="space-y-6">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map(item => (
                <SidebarItem key={item.id} {...item} active={page === item.id} label={t[item.id]} collapsed={collapsed} onClick={() => setPage(item.id)} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function MobileDrawer({ page, setPage, t, close }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 lg:hidden">
      <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} className="h-full w-80 overflow-y-auto border-r border-white/10 bg-ink p-4">
        <button className="mb-5 ml-auto block rounded-xl p-2 text-slate-300 hover:bg-white/10" onClick={close}>
          <X />
        </button>
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-health text-ink shadow-glow">
            <Apple size={23} />
          </div>
          <div><p className="text-xl font-black">NutriTracker</p><p className="text-xs text-slate-500">AI fitness OS</p></div>
        </div>
        <nav className="space-y-6">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <SidebarItem key={item.id} {...item} active={page === item.id} label={t[item.id]} collapsed={false} onClick={() => { setPage(item.id); close(); }} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </motion.aside>
    </motion.div>
  );
}

function Topbar({ t, language, setLanguage, openMobile, profile }) {
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-ink/75 px-4 backdrop-blur-xl lg:px-8">
      <button className="rounded-2xl p-3 text-slate-300 hover:bg-white/10 lg:hidden" onClick={openMobile}>
        <Menu />
      </button>
      <div>
        <p className="text-sm text-slate-500">{date}</p>
        <h1 className="text-xl font-black lg:text-2xl">{t.hello}, {profile.name || 'User'}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
          <Languages size={17} className="text-blue-300" />
          <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-transparent text-sm font-bold outline-none">
            <option className="bg-panel" value="en">English</option>
            <option className="bg-panel" value="hi">हिन्दी</option>
            <option className="bg-panel" value="es">Español</option>
          </select>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-health to-ai font-black text-white">{(profile.name || 'U')[0].toUpperCase()}</div>
      </div>
    </header>
  );
}

function Dashboard({ totals, weeklyData }) {
  const macroData = [
    { name: 'Protein', value: totals.protein, color: '#22c55e' },
    { name: 'Carbs', value: totals.carbs, color: '#3b82f6' },
    { name: 'Fat', value: totals.fat, color: '#facc15' }
  ].filter(item => item.value > 0);
  return (
    <Page>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card delay={0.02}>
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Calories</p><h2 className="text-3xl font-black text-white">{totals.calories} / {totals.goal}</h2></div>
            <Flame className="text-health" />
          </div>
          <ProgressBar value={totals.calories} max={totals.goal} />
        </Card>
        <Card delay={0.06} className="flex items-center justify-between">
          <div><p className="text-sm text-slate-400">Protein</p><h2 className="text-3xl font-black text-white">{totals.protein}g</h2><p className="text-sm text-slate-500">Daily target 150g</p></div>
          <CircularProgress value={totals.protein} max={150} />
        </Card>
        <Card delay={0.1}>
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Hydration</p><h2 className="text-3xl font-black text-white">{totals.water} / 8</h2></div>
            <Droplets className="text-blue-300" />
          </div>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={cn('h-14 rounded-xl border', i < totals.water ? 'border-ai/40 bg-ai/40' : 'border-white/10 bg-white/5')} />)}
          </div>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_.9fr]">
        <ChartWrapper title="Weekly Calorie Intake">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs><linearGradient id="calGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="day" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16 }} />
              <Area dataKey="calories" type="monotone" stroke="#22c55e" strokeWidth={3} fill="url(#calGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <ChartWrapper title="Macro Distribution">
          {macroData.length ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={macroData} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
                    {macroData.map(item => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                {macroData.map(item => <span key={item.name}><span style={{ color: item.color }}>●</span> {item.name}</span>)}
              </div>
            </>
          ) : <EmptyState title="No macros logged yet" body="Add a food item to see your macro split." />}
        </ChartWrapper>
      </div>
      <AIInsights totals={totals} />
    </Page>
  );
}

function AIInsights({ totals }) {
  const proteinPercent = pct(totals.protein, 150);
  const caloriePercent = pct(totals.calories, totals.goal);
  const hydrationLeft = Math.max(0, 8 - totals.water);
  const insights = [
    {
      icon: WarningIcon,
      status: proteinPercent >= 80 ? 'Good' : 'Warning',
      title: proteinPercent >= 80 ? 'Protein target is close' : 'Protein intake needs attention',
      body: totals.protein ? `You are at ${proteinPercent}% of your 150g protein target.` : 'Log a protein-rich meal to start today’s macro tracking.',
      color: proteinPercent >= 80 ? 'border-health/30 bg-health/10 text-health' : 'border-warning/30 bg-warning/10 text-warning'
    },
    {
      icon: Sparkles,
      status: caloriePercent > 100 ? 'Warning' : 'Good',
      title: caloriePercent > 100 ? 'Calories above target' : 'Calories are being tracked',
      body: totals.calories ? `${totals.calories} kcal logged against your ${totals.goal} kcal goal.` : 'Add food from the scanner or mood recommendations to build your dashboard.',
      color: caloriePercent > 100 ? 'border-warning/30 bg-warning/10 text-warning' : 'border-health/30 bg-health/10 text-health'
    },
    {
      icon: Droplets,
      status: hydrationLeft ? 'Critical' : 'Good',
      title: hydrationLeft ? 'Hydration below recommended level' : 'Hydration goal complete',
      body: hydrationLeft ? `${hydrationLeft} glasses left to hit today’s hydration goal.` : 'Great hydration pace today. Keep it steady through the evening.',
      color: hydrationLeft ? 'border-danger/30 bg-danger/10 text-red-300' : 'border-health/30 bg-health/10 text-health'
    }
  ];
  return (
    <section className="mt-5">
      <div className="mb-4 flex items-center gap-2"><Bot className="text-ai" /><h2 className="text-2xl font-black">AI Insights</h2></div>
      <div className="grid gap-4 lg:grid-cols-3">
        {insights.map((item, i) => <InsightCard key={item.title} item={item} delay={i * 0.05} />)}
      </div>
    </section>
  );
}

function WarningIcon(props) {
  return <Activity {...props} />;
}

function InsightCard({ item, delay }) {
  const Icon = item.icon;
  return (
    <Card delay={delay} className={cn('border', item.color)}>
      <div className="mb-3 flex items-center justify-between">
        <Icon />
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.status}</span>
      </div>
      <h3 className="font-bold text-white">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
    </Card>
  );
}

function AICoach({ t }) {
  const [messages, setMessages] = useState([{ role: 'ai', text: 'AI analyzing your diet patterns... Ask me anything about nutrition, training, hydration, or groceries.' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const suggestions = ['Weight Loss Plan', 'High Protein Meal', 'Hydration Tips', 'Workout Plan'];
  const send = (text = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: getAIReply(text) }]);
    }, 800);
  };
  return (
    <Page>
      <Card className="mx-auto flex min-h-[680px] max-w-5xl flex-col">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div><h2 className="text-2xl font-black">AI Coach</h2><p className="text-sm text-slate-400">Personal nutrition and fitness guidance</p></div>
          <Bot className="text-ai" />
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((msg, i) => <ChatBubble key={i} message={msg} />)}
          {typing && <div className="w-fit rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-300">AI thinking<span className="typing">...</span></div>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.map(item => <button key={item} onClick={() => send(item)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-ai/40 hover:bg-ai/15">{item}</button>)}
        </div>
        <div className="mt-4 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t.ask} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-ai/50" />
          <button onClick={() => send()} className="rounded-2xl bg-ai px-6 font-bold text-white transition hover:bg-blue-500">Send</button>
        </div>
      </Card>
    </Page>
  );
}

function ChatBubble({ message }) {
  const user = message.role === 'user';
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6', user ? 'ml-auto bg-health text-ink' : 'bg-white/8 text-slate-200')}>{message.text}</motion.div>;
}

function getAIReply(text) {
  const value = text.toLowerCase();
  if (value.includes('protein')) return 'Aim for 25–40g protein in your next meal. Try salmon quinoa, chicken rice bowl, or Greek yogurt with almonds.';
  if (value.includes('hydration')) return 'Drink 2 glasses over the next hour, then one glass before your next meal. Your hydration trend improves energy and appetite control.';
  if (value.includes('workout') || value.includes('plan')) return 'Recommended: 8 min warm-up, 3 rounds of squats, rows, push-ups, lunges, then 12 min incline walk.';
  return 'For a balanced day, keep calories near goal, prioritize protein, add vegetables twice, and pair workouts with carbs around training.';
}

function MealPlanner() {
  const [goal, setGoal] = useState('high-protein');
  const [diet, setDiet] = useState('all');
  const [mealCount, setMealCount] = useState(3);
  const [plan, setPlan] = useState([]);
  const generate = () => setPlan(buildMealPlan({ goal, diet, mealCount }));
  return (
    <Page>
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div><h2 className="text-3xl font-black">AI Meal Planner</h2><p className="text-slate-400">Choose your goal, diet style, and number of meals.</p></div>
        <div className="grid gap-3 sm:grid-cols-4">
          <select value={goal} onChange={e => setGoal(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold outline-none">
            <option className="bg-panel" value="high-protein">High Protein</option>
            <option className="bg-panel" value="fat-loss">Fat Loss</option>
            <option className="bg-panel" value="balanced">Balanced</option>
          </select>
          <select value={diet} onChange={e => setDiet(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold outline-none">
            <option className="bg-panel" value="all">All foods</option>
            <option className="bg-panel" value="vegetarian">Vegetarian</option>
            <option className="bg-panel" value="vegan">Vegan</option>
            <option className="bg-panel" value="indian">Indian</option>
          </select>
          <select value={mealCount} onChange={e => setMealCount(Number(e.target.value))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold outline-none">
            <option className="bg-panel" value={2}>2 meals/day</option>
            <option className="bg-panel" value={3}>3 meals/day</option>
            <option className="bg-panel" value={4}>4 meals/day</option>
          </select>
          <button onClick={generate} className="rounded-2xl bg-health px-5 py-3 font-black text-ink">Generate</button>
        </div>
      </div>
      {plan.length ? (
        <div className="grid gap-4 xl:grid-cols-7">
          {plan.map((dayPlan, i) => <Card key={dayPlan.day} delay={i * 0.03} className="min-h-64">
            <p className="text-sm font-black text-health">{dayPlan.day}</p>
            <div className="mt-4 space-y-3">
              {dayPlan.meals.map(meal => (
                <div key={`${dayPlan.day}-${meal.id}-${meal.type}`} className="rounded-2xl bg-white/5 p-3">
                  <p className="text-xs font-bold text-slate-500">{meal.type}</p>
                  <p className="font-bold">{meal.emoji} {meal.name}</p>
                  <p className="text-xs text-slate-400">{meal.cal} kcal · {meal.protein}g protein</p>
                </div>
              ))}
            </div>
          </Card>)}
        </div>
      ) : <EmptyState title="No meal plan generated" body="Choose your preferences and generate a plan when you are ready." />}
    </Page>
  );
}

function CalorieBalance({ totals, weeklyData }) {
  const net = totals.calories - totals.burned;
  return (
    <Page>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <ChartWrapper title="Weekly Progress">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,.12)', borderRadius: 16 }} />
              <Bar dataKey="calories" fill="#22c55e" radius={[12, 12, 0, 0]} />
              <Bar dataKey="burned" fill="#3b82f6" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <Card>
          <h3 className="text-xl font-black">Balance Summary</h3>
          <div className="mt-5 space-y-5">
            {[
              [`Consumed ${totals.calories} kcal`, pct(totals.calories, totals.goal), 'bg-health'],
              [`Burned ${totals.burned} kcal`, pct(totals.burned, Math.max(totals.goal, 1)), 'bg-ai'],
              [`Net ${net} kcal`, pct(Math.abs(net), totals.goal), 'bg-warning']
            ].map(([item, value, color]) => <div key={item}><div className="mb-2 flex justify-between text-sm text-slate-400"><span>{item}</span><span>{value}%</span></div><ProgressBar value={value} max={100} color={color} /></div>)}
          </div>
        </Card>
      </div>
    </Page>
  );
}

function FoodScanner({ addFood }) {
  const [selected, setSelected] = useState(foods[0]);
  const [category, setCategory] = useState('All');
  const [preview, setPreview] = useState('');
  const categories = ['All', ...new Set(foods.map(food => food.category))];
  const visibleFoods = category === 'All' ? foods : foods.filter(food => food.category === category);
  const handleUpload = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const match = foods.find(food => file.name.toLowerCase().includes(food.name.toLowerCase().split(' ')[0]));
    if (match) setSelected(match);
  };
  return (
    <Page>
      <div className="grid gap-5 xl:grid-cols-[1fr_.85fr]">
        <Card>
          <h2 className="text-2xl font-black">AI Food Scanner</h2>
          <label className="mt-5 grid min-h-80 cursor-pointer place-items-center overflow-hidden rounded-card border-2 border-dashed border-white/15 bg-white/5 transition hover:border-health/50 hover:bg-health/5">
            {preview ? <img src={preview} alt="Selected food" className="h-full max-h-96 w-full object-cover" /> : <div className="text-center"><Camera className="mx-auto mb-4 text-slate-500" size={54} /><p className="font-bold">Upload or capture food</p><p className="text-sm text-slate-500">The result card updates from your selection.</p></div>}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map(item => <button key={item} onClick={() => setCategory(item)} className={cn('rounded-full border px-4 py-2 text-sm font-bold', category === item ? 'border-health bg-health/15 text-health' : 'border-white/10 bg-white/5 text-slate-300')}>{item}</button>)}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {visibleFoods.map(food => <button key={food.id} onClick={() => setSelected(food)} className={cn('rounded-2xl border p-3 text-left transition', selected.id === food.id ? 'border-health bg-health/15' : 'border-white/10 bg-white/5 hover:bg-white/10')}><span className="text-2xl">{food.emoji}</span><p className="mt-2 text-sm font-bold">{food.name}</p></button>)}
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-black">Scan Result</h3>
          <div className="mt-8 text-center text-6xl">{selected.emoji}</div>
          <h2 className="mt-5 text-center text-3xl font-black">{selected.name}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {['cal', 'protein', 'carbs', 'fat'].map(key => <div key={key} className="rounded-2xl bg-white/5 p-4 text-center"><p className="text-2xl font-black">{selected[key]}</p><p className="text-xs uppercase text-slate-500">{key}</p></div>)}
          </div>
          <button onClick={() => addFood(selected)} className="mt-6 w-full rounded-2xl bg-health py-4 font-black text-ink transition hover:bg-green-400">Add to Log</button>
        </Card>
      </div>
    </Page>
  );
}

function Training({ addBurn }) {
  const [goal, setGoal] = useState('Strength');
  const [level, setLevel] = useState('Beginner');
  const workouts = [
    { name: 'Strength Builder', min: 42, cal: 310, type: 'Strength', levels: ['Beginner', 'Intermediate', 'Advanced'] },
    { name: 'Zone 2 Cardio', min: 35, cal: 280, type: 'Endurance', levels: ['Beginner', 'Intermediate'] },
    { name: 'Mobility Reset', min: 24, cal: 120, type: 'Recovery', levels: ['Beginner', 'Intermediate', 'Advanced'] },
    { name: 'HIIT Finisher', min: 18, cal: 260, type: 'Fat Loss', levels: ['Intermediate', 'Advanced'] },
    { name: 'Core Stability', min: 20, cal: 150, type: 'Strength', levels: ['Beginner', 'Intermediate'] },
    { name: 'Yoga Flow', min: 30, cal: 170, type: 'Recovery', levels: ['Beginner', 'Intermediate', 'Advanced'] }
  ].filter(workout => workout.type === goal && workout.levels.includes(level));
  return <Page>
    <div className="mb-5 grid gap-3 md:grid-cols-2">
      <select value={goal} onChange={e => setGoal(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold outline-none">
        {['Strength', 'Endurance', 'Recovery', 'Fat Loss'].map(item => <option className="bg-panel" key={item}>{item}</option>)}
      </select>
      <select value={level} onChange={e => setLevel(e.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold outline-none">
        {['Beginner', 'Intermediate', 'Advanced'].map(item => <option className="bg-panel" key={item}>{item}</option>)}
      </select>
    </div>
    {workouts.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{workouts.map((w, i) => <Card key={w.name} delay={i * 0.04}><Dumbbell className="text-health" /><h3 className="mt-4 text-xl font-black">{w.name}</h3><p className="text-sm text-slate-500">{w.type}</p><div className="mt-5 flex justify-between text-sm"><span>{w.min} min</span><span>{w.cal} kcal</span></div><button onClick={() => addBurn(w.cal)} className="mt-5 w-full rounded-2xl bg-white/10 py-3 font-bold transition hover:bg-health hover:text-ink">Log workout</button></Card>)}</div> : <EmptyState title="No workout for this combination" body="Try another goal or level to see recommendations." />}
  </Page>;
}

function Grocery() {
  const [items, setItems] = useState([]);
  const [done, setDone] = useState({});
  const [value, setValue] = useState('');
  const add = () => { if (value.trim()) { setItems([...items, value.trim()]); setValue(''); } };
  return <Page><Card className="mx-auto max-w-3xl"><h2 className="text-2xl font-black">Smart Grocery List</h2><div className="mt-5 flex gap-3"><input value={value} onChange={e => setValue(e.target.value)} placeholder="Add grocery item" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 outline-none" /><button onClick={add} className="rounded-2xl bg-health px-5 font-bold text-ink">Add</button></div><div className="mt-5 space-y-3">{items.length ? items.map(item => <label key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"><span className={done[item] ? 'text-slate-500 line-through' : ''}>{item}</span><input type="checkbox" checked={!!done[item]} onChange={e => setDone({ ...done, [item]: e.target.checked })} /></label>) : <EmptyState title="No grocery items yet" body="Add your first item or generate a meal plan first." />}</div></Card></Page>;
}

function Water({ totals, setWater }) {
  return <Page><Card className="mx-auto max-w-3xl text-center"><Droplets className="mx-auto text-ai" size={56} /><h2 className="mt-4 text-3xl font-black">Hydration Tracker</h2><p className="mt-2 text-slate-400">{totals.water} of 8 glasses completed today.</p><div className="mt-8 grid grid-cols-8 gap-3">{Array.from({ length: 8 }).map((_, i) => <button key={i} onClick={() => setWater(i + 1)} className={cn('h-24 rounded-2xl border transition', i < totals.water ? 'border-ai/40 bg-ai/40' : 'border-white/10 bg-white/5 hover:bg-white/10')} />)}</div></Card></Page>;
}

function MoodFood({ addFood }) {
  const moodOptions = [
    {
      mood: 'Energetic',
      note: 'Steady carbs with lean protein for training days.',
      foods: [foods[15], foods[3], foods[14]]
    },
    {
      mood: 'Tired',
      note: 'Iron, protein, and slow carbs to rebuild energy.',
      foods: [foods[10], foods[8], foods[5]]
    },
    {
      mood: 'Focused',
      note: 'Light meals with healthy fats for clear concentration.',
      foods: [foods[1], foods[7], foods[11]]
    },
    {
      mood: 'Stressed',
      note: 'Calming, balanced choices with fiber and magnesium.',
      foods: [foods[2], foods[9], foods[13]]
    },
    {
      mood: 'Happy',
      note: 'Colorful meals that keep the day balanced.',
      foods: [foods[14], foods[12], foods[6]]
    }
  ];
  const [selectedMood, setSelectedMood] = useState(moodOptions[0].mood);
  const selected = moodOptions.find(item => item.mood === selectedMood) || moodOptions[0];
  const totals = selected.foods.reduce((sum, food) => ({
    cal: sum.cal + food.cal,
    protein: sum.protein + food.protein,
    carbs: sum.carbs + food.carbs,
    fat: sum.fat + food.fat
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
  return (
    <Page>
      <div className="mb-5">
        <h2 className="text-3xl font-black">Mood Food</h2>
        <p className="mt-2 text-slate-400">Pick how you feel, then add meals that match your body’s needs.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {moodOptions.map((item, i) => (
          <Card
            key={item.mood}
            delay={i * 0.03}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedMood(item.mood)}
            onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && setSelectedMood(item.mood)}
            className={cn('cursor-pointer outline-none', selectedMood === item.mood ? 'border-health/60 bg-health/15 shadow-glow' : 'hover:border-health/30')}
          >
            <Sparkles className={selectedMood === item.mood ? 'text-health' : 'text-warning'} />
            <h3 className="mt-4 text-xl font-black">{item.mood}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.note}</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_.45fr]">
        <Card>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-health">Selected mood</p>
              <h3 className="text-3xl font-black">{selected.mood}</h3>
            </div>
            <span className="rounded-full border border-ai/30 bg-ai/10 px-4 py-2 text-sm font-bold text-blue-200">AI matched recommendations</span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {selected.foods.map(food => (
              <div key={food.id} className="rounded-card border border-white/10 bg-white/5 p-4">
                <div className="text-4xl">{food.emoji}</div>
                <h4 className="mt-3 text-lg font-black">{food.name}</h4>
                <p className="mt-1 text-sm text-slate-400">{food.cal} kcal · {food.protein}g protein · {food.carbs}g carbs</p>
                <button onClick={() => addFood(food)} className="mt-4 w-full rounded-2xl bg-health py-3 font-black text-ink transition hover:bg-green-400">Add to today</button>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-black">This mood pack</h3>
          <div className="mt-5 space-y-4">
            {[
              ['Calories', `${totals.cal} kcal`, 'bg-health'],
              ['Protein', `${totals.protein}g`, 'bg-ai'],
              ['Carbs', `${totals.carbs}g`, 'bg-warning'],
              ['Fat', `${totals.fat}g`, 'bg-danger']
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <span className={cn('h-3 w-3 rounded-full', color)} />
                  <span className="text-sm font-bold text-slate-400">{label}</span>
                </div>
                <span className="font-black">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}

function Profile({ profile, setProfile, totals, setTotals }) {
  return <Page><Card className="mx-auto max-w-3xl"><div className="flex items-center gap-5"><div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-health to-ai text-2xl font-black">{(profile.name || 'U')[0].toUpperCase()}</div><div><h2 className="text-3xl font-black">{profile.name || 'User'}</h2><p className="text-slate-400">Verified NutriTracker profile</p></div></div><div className="mt-8 grid gap-4 md:grid-cols-3"><label className="space-y-2"><span className="text-sm text-slate-400">Name</span><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" /></label><label className="space-y-2"><span className="text-sm text-slate-400">Calorie goal</span><input type="number" value={totals.goal} onChange={e => setTotals(prev => ({ ...prev, goal: Number(e.target.value) || 0 }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" /></label><label className="space-y-2"><span className="text-sm text-slate-400">Goal type</span><select value={profile.goalType} onChange={e => setProfile({ ...profile, goalType: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"><option className="bg-panel">Fat Loss</option><option className="bg-panel">Muscle Gain</option><option className="bg-panel">Maintenance</option></select></label></div></Card></Page>;
}

function Page({ children }) {
  return <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.25 }} className="p-4 lg:p-8">{children}</motion.div>;
}

function App() {
  const savedState = useMemo(readSavedState, []);
  const [page, setPage] = useState('dashboard');
  const [language, setLanguage] = useState(savedState.language || 'en');
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [profile, setProfile] = useState(savedState.profile || { name: 'User', goalType: 'Maintenance' });
  const [totals, setTotals] = useState(savedState.totals || { calories: 0, goal: 2000, protein: 0, carbs: 0, fat: 0, water: 0, burned: 0 });
  const t = translations[language];
  useEffect(() => {
    localStorage.setItem('nutritracker-react-state', JSON.stringify({ language, profile, totals }));
  }, [language, profile, totals]);
  const addFood = food => setTotals(prev => ({ ...prev, calories: prev.calories + food.cal, protein: prev.protein + food.protein, carbs: prev.carbs + food.carbs, fat: prev.fat + food.fat }));
  const addBurn = cal => setTotals(prev => ({ ...prev, burned: prev.burned + cal }));
  const setWater = water => setTotals(prev => ({ ...prev, water }));
  const weeklyData = useMemo(() => buildWeeklyData(totals), [totals]);
  const content = useMemo(() => ({
    dashboard: <Dashboard totals={totals} weeklyData={weeklyData} />,
    scanner: <FoodScanner addFood={addFood} />,
    meals: <MealPlanner />,
    balance: <CalorieBalance totals={totals} weeklyData={weeklyData} />,
    training: <Training addBurn={addBurn} />,
    coach: <AICoach t={t} />,
    mood: <MoodFood addFood={addFood} />,
    water: <Water totals={totals} setWater={setWater} />,
    grocery: <Grocery />,
    profile: <Profile profile={profile} setProfile={setProfile} totals={totals} setTotals={setTotals} />
  }), [totals, weeklyData, t, profile]);
  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} t={t} />
      <AnimatePresence>{mobile && <MobileDrawer page={page} setPage={setPage} t={t} close={() => setMobile(false)} />}</AnimatePresence>
      <main className={cn('transition-all', collapsed ? 'lg:ml-20' : 'lg:ml-72')}>
        <Topbar t={t} language={language} setLanguage={setLanguage} openMobile={() => setMobile(true)} profile={profile} />
        <AnimatePresence mode="wait"><div key={page}>{content[page]}</div></AnimatePresence>
      </main>
      <MobileNav page={page} setPage={setPage} t={t} />
    </div>
  );
}

function MobileNav({ page, setPage, t }) {
  const items = [
    ['dashboard', Home],
    ['meals', Utensils],
    ['coach', Bot],
    ['training', Dumbbell],
    ['profile', Settings]
  ];
  return <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-white/10 bg-ink/95 p-2 backdrop-blur-xl lg:hidden">{items.map(([id, Icon]) => <button key={id} onClick={() => setPage(id)} className={cn('rounded-2xl py-2 text-xs font-bold', page === id ? 'bg-health/15 text-health' : 'text-slate-500')}><Icon className="mx-auto mb-1" size={18} />{t[id]}</button>)}</nav>;
}

createRoot(document.getElementById('root')).render(<App />);
