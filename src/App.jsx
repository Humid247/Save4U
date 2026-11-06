import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Sun, 
  Moon, 
  Fuel, 
  Film, 
  CreditCard, 
  Users, 
  Car, 
  Smartphone, 
  Wifi, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';

// Static Financial Constants
const INCOME = 9500;
const FIXED_EXPENSES = 5325; // Car 4175 + Phones 750 + Wifi 400

const FIXED_BREAKDOWN = [
  { label: 'Car Payment', amount: 4175, icon: Car },
  { label: 'Phones', amount: 750, icon: Smartphone },
  { label: 'Home Wi-Fi', amount: 400, icon: Wifi },
];

// Helper to format currency in South African Rand
const formatRand = (num) => {
  return `R ${Math.round(num).toLocaleString('en-ZA')}`;
};

// Reusable SliderRow Component
function SliderRow({ label, icon: Icon, value, setValue, max, step, accent, colorName }) {
  const colorMap = {
    blue: {
      badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400',
      accent: 'accent-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      badge: 'bg-purple-100 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400',
      accent: 'accent-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      badge: 'bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400',
      accent: 'accent-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      badge: 'bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400',
      accent: 'accent-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
    },
  };

  const scheme = colorMap[colorName] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700/70 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${scheme.badge}`}>
            <Icon size={20} />
          </div>
          <div>
            <span className="font-semibold text-gray-800 dark:text-gray-100 block text-sm md:text-base">
              {label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Step: R {step} • Max: R {max.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg md:text-xl font-bold font-mono ${scheme.text}`}>
            {formatRand(value)}
          </span>
        </div>
      </div>

      <div className="pt-1">
        <input
          type="range"
          min="0"
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className={`w-full h-2 rounded-lg cursor-pointer ${scheme.accent}`}
          aria-label={`${label} slider`}
        />
        <div className="flex justify-between items-center text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-mono">
          <span>R 0</span>
          <span>{formatRand(max)}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Dark mode state with HTML class toggle
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // State hooks for adjustable expenses
  const [petrol, setPetrol] = useState(600);           // Max 2000, Step 50
  const [entertainment, setEntertainment] = useState(600); // Max 2000, Step 50
  const [creditCard, setCreditCard] = useState(500);   // Max 3000, Step 100
  const [stokvel, setStokvel] = useState(1000);        // Max 2500, Step 100

  // Sync dark class on root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculations
  const adjustableTotal = petrol + entertainment + creditCard + stokvel;
  const totalExpenses = FIXED_EXPENSES + adjustableTotal;
  const surplus = INCOME - totalExpenses;
  const isSurplusPositive = surplus >= 0;

  // Percentage of income spent
  const expenseRatio = (totalExpenses / INCOME) * 100;
  const progressBarWidth = Math.min(Math.max(expenseRatio, 0), 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-md md:max-w-xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Save4U
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monthly Net Income: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatRand(INCOME)}</span>
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(prev => !prev)}
            aria-label="Toggle Dark Mode"
            className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-amber-400 shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Hero Card: Surplus / Deficit */}
        <section 
          className={`rounded-3xl p-6 md:p-7 mb-6 shadow-xl border transition-all duration-300 ${
            isSurplusPositive
              ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-gray-800 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800/60 shadow-emerald-500/5'
              : 'bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-red-950/40 dark:via-gray-800 dark:to-rose-950/30 border-red-200 dark:border-red-800/60 shadow-red-500/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              {isSurplusPositive ? (
                <>
                  <ArrowUpRight size={16} className="text-emerald-500" />
                  Monthly Surplus
                </>
              ) : (
                <>
                  <ArrowDownRight size={16} className="text-red-500" />
                  Monthly Deficit
                </>
              )}
            </span>
            <span 
              className={`text-xs font-semibold px-2.5 py-1 rounded-full font-mono ${
                isSurplusPositive 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
              }`}
            >
              {expenseRatio.toFixed(1)}% of income
            </span>
          </div>

          <div className="my-2">
            <div 
              className={`text-4xl md:text-5xl font-extrabold tracking-tight font-mono transition-colors duration-300 ${
                isSurplusPositive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isSurplusPositive ? formatRand(surplus) : `- ${formatRand(Math.abs(surplus))}`}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isSurplusPositive 
                ? 'Unallocated capital available for savings or discretionary spending.'
                : 'Warning: Current planned expenses exceed monthly net income.'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Expenses: <strong className="text-gray-800 dark:text-gray-200">{formatRand(totalExpenses)}</strong></span>
              <span>Income: <strong className="text-gray-800 dark:text-gray-200">{formatRand(INCOME)}</strong></span>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  isSurplusPositive 
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' 
                    : 'bg-red-500 shadow-sm shadow-red-500/50'
                }`}
                style={{ width: `${progressBarWidth}%` }}
              />
            </div>
          </div>
        </section>

        {/* Adjustable Expenses Section */}
        <section className="space-y-4 mb-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Adjustable Expenses
            </h2>
            <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
              Subtotal: <strong className="text-gray-700 dark:text-gray-200">{formatRand(adjustableTotal)}</strong>
            </span>
          </div>

          <div className="space-y-3">
            <SliderRow
              label="Petrol"
              icon={Fuel}
              value={petrol}
              setValue={setPetrol}
              max={2000}
              step={50}
              colorName="blue"
            />

            <SliderRow
              label="Entertainment"
              icon={Film}
              value={entertainment}
              setValue={setEntertainment}
              max={2000}
              step={50}
              colorName="purple"
            />

            <SliderRow
              label="Credit Card"
              icon={CreditCard}
              value={creditCard}
              setValue={setCreditCard}
              max={3000}
              step={100}
              colorName="amber"
            />

            <SliderRow
              label="Stokvel"
              icon={Users}
              value={stokvel}
              setValue={setStokvel}
              max={2500}
              step={100}
              colorName="rose"
            />
          </div>
        </section>

        {/* Footer: Read-only Fixed Expenses */}
        <footer className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/70 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Fixed Expenses
              </span>
            </div>
            <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">
              {formatRand(FIXED_EXPENSES)}
            </span>
          </div>

          <div className="pt-3 space-y-2.5">
            {FIXED_BREAKDOWN.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2.5">
                    <ItemIcon size={15} className="text-gray-400 dark:text-gray-500" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                    {formatRand(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
            <span>Car (R 4,175) + Phones (R 750) + Wifi (R 400)</span>
            <span className="italic">Non-adjustable</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
