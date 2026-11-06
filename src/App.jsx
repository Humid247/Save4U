import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wallet,
  Sun,
  Moon,
  Fuel,
  Sparkles,
  CreditCard,
  Users,
  Car,
  Smartphone,
  Wifi,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Download,
  Upload,
  Copy,
  Check,
  Settings,
  Bookmark,
  Home,
  ShoppingBag,
  HeartPulse,
  Zap,
  Briefcase,
  Sliders,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  RefreshCw,
  X,
  PiggyBank,
  Utensils,
  Shield,
} from 'lucide-react';

// Versioned storage key for clean production state
const STORAGE_KEY = 'save4u_v1';

// Supported currencies
const CURRENCIES = {
  ZAR: { code: 'ZAR', symbol: 'R', label: 'South African Rand (R)' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
};

// Icon registry for serializable state persistence
const ICON_MAP = {
  Wallet,
  Fuel,
  Sparkles,
  CreditCard,
  Users,
  Car,
  Smartphone,
  Wifi,
  Home,
  ShoppingBag,
  HeartPulse,
  Zap,
  Briefcase,
  PiggyBank,
  Utensils,
  Shield,
};

const ICON_KEYS = Object.keys(ICON_MAP);

// Color themes for adjustable expense sliders
const COLOR_THEMES = {
  emerald: {
    name: 'Emerald',
    accent: 'accent-emerald-500',
    dot: 'bg-emerald-500',
    iconBgLight: 'bg-emerald-100',
    iconBgDark: 'bg-emerald-500/20',
    iconText: 'text-emerald-500',
    badgeLight: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    badgeDark: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  },
  amber: {
    name: 'Amber',
    accent: 'accent-amber-500',
    dot: 'bg-amber-500',
    iconBgLight: 'bg-amber-100',
    iconBgDark: 'bg-amber-500/20',
    iconText: 'text-amber-500',
    badgeLight: 'bg-amber-50 text-amber-800 border border-amber-200',
    badgeDark: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  },
  purple: {
    name: 'Purple',
    accent: 'accent-purple-500',
    dot: 'bg-purple-500',
    iconBgLight: 'bg-purple-100',
    iconBgDark: 'bg-purple-500/20',
    iconText: 'text-purple-500',
    badgeLight: 'bg-purple-50 text-purple-800 border border-purple-200',
    badgeDark: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  },
  blue: {
    name: 'Blue',
    accent: 'accent-blue-500',
    dot: 'bg-blue-500',
    iconBgLight: 'bg-blue-100',
    iconBgDark: 'bg-blue-500/20',
    iconText: 'text-blue-500',
    badgeLight: 'bg-blue-50 text-blue-800 border border-blue-200',
    badgeDark: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  },
  teal: {
    name: 'Teal',
    accent: 'accent-teal-500',
    dot: 'bg-teal-500',
    iconBgLight: 'bg-teal-100',
    iconBgDark: 'bg-teal-500/20',
    iconText: 'text-teal-500',
    badgeLight: 'bg-teal-50 text-teal-800 border border-teal-200',
    badgeDark: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
  },
  rose: {
    name: 'Rose',
    accent: 'accent-rose-500',
    dot: 'bg-rose-500',
    iconBgLight: 'bg-rose-100',
    iconBgDark: 'bg-rose-500/20',
    iconText: 'text-rose-500',
    badgeLight: 'bg-rose-50 text-rose-800 border border-rose-200',
    badgeDark: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  },
};

/**
 * Formats a numeric value with the selected currency symbol
 */
const formatMoney = (value, currencyCode = 'ZAR') => {
  const symbol = CURRENCIES[currencyCode]?.symbol || 'R';
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(Number(value) || 0));
  const formattedNumber = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
};

/**
 * Calculates a sensible default slider Max and Step scaled to the user's income
 */
const getScaledSliderDefaults = (totalIncome) => {
  const base = Number(totalIncome) > 0 ? Number(totalIncome) : 10000;
  const rawMax = Math.max(500, Math.round((base * 0.3) / 100) * 100);
  const step = rawMax >= 5000 ? 100 : rawMax >= 1500 ? 50 : 25;
  return { max: rawMax, step };
};

/**
 * Generates zeroed-out standard categories scaled to the user's entered income
 */
const createStandardZeroedCategories = (totalIncome) => {
  const { max, step } = getScaledSliderDefaults(totalIncome);
  return {
    fixedExpenses: [
      { id: 'fix-housing', label: 'Housing / Rent', amount: 0, icon: 'Home', enabled: true },
      { id: 'fix-utilities', label: 'Utilities & Wifi', amount: 0, icon: 'Wifi', enabled: true },
      { id: 'fix-transport', label: 'Vehicle / Transport', amount: 0, icon: 'Car', enabled: true },
    ],
    variableExpenses: [
      {
        id: 'var-groceries',
        label: 'Groceries & Household',
        subtitle: 'Food & essentials',
        value: 0,
        max,
        step,
        icon: 'ShoppingBag',
        color: 'emerald',
        enabled: true,
      },
      {
        id: 'var-fuel',
        label: 'Fuel & Commuting',
        subtitle: 'Daily travel costs',
        value: 0,
        max,
        step,
        icon: 'Fuel',
        color: 'amber',
        enabled: true,
      },
      {
        id: 'var-savings',
        label: 'Savings / Stokvel',
        subtitle: 'Monthly investments & goals',
        value: 0,
        max,
        step,
        icon: 'PiggyBank',
        color: 'teal',
        enabled: true,
      },
      {
        id: 'var-leisure',
        label: 'Dining & Entertainment',
        subtitle: 'Leisure & social',
        value: 0,
        max,
        step,
        icon: 'Sparkles',
        color: 'purple',
        enabled: true,
      },
    ],
  };
};

/**
 * Reusable SliderRow component with inline value editing, inline max-cap editing,
 * pause toggle, edit modal trigger, and delete button.
 */
const SliderRow = ({
  item,
  currency,
  darkMode,
  onChangeValue,
  onChangeMax,
  onToggleEnabled,
  onEdit,
  onDelete,
}) => {
  const [editingValue, setEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState(String(item.value));
  const [editingMax, setEditingMax] = useState(false);
  const [tempMax, setTempMax] = useState(String(item.max));

  const IconComponent = ICON_MAP[item.icon] || Sliders;
  const colorConfig = COLOR_THEMES[item.color] || COLOR_THEMES.emerald;
  const min = 0;
  const max = Math.max(100, Number(item.max) || 1000);
  const step = Math.max(1, Number(item.step) || 50);
  const value = Number(item.value) || 0;
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleDecrement = () => {
    if (!item.enabled) return;
    onChangeValue(item.id, Math.max(min, value - step));
  };

  const handleIncrement = () => {
    if (!item.enabled) return;
    onChangeValue(item.id, Math.min(max, value + step));
  };

  const commitValueEdit = () => {
    const parsed = Math.max(0, Math.round(Number(tempValue) || 0));
    if (parsed > max) {
      onChangeMax(item.id, parsed);
    }
    onChangeValue(item.id, parsed);
    setEditingValue(false);
  };

  const commitMaxEdit = () => {
    const parsed = Math.max(100, Math.round(Number(tempMax) || 1000));
    onChangeMax(item.id, parsed);
    if (value > parsed) {
      onChangeValue(item.id, parsed);
    }
    setEditingMax(false);
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        !item.enabled ? 'opacity-55 ' : ''
      }${
        darkMode
          ? 'bg-gray-800/80 border-gray-700/80 hover:border-gray-600'
          : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
      }`}
    >
      {/* Top Row: Icon, Label, Actions & Value */}
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              darkMode ? colorConfig.iconBgDark : colorConfig.iconBgLight
            }`}
          >
            <IconComponent className={`w-5 h-5 ${colorConfig.iconText}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3
                className={`font-semibold text-sm sm:text-base leading-tight truncate ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                } ${!item.enabled ? 'line-through' : ''}`}
              >
                {item.label}
              </h3>
              {!item.enabled && (
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400 font-semibold">
                  Paused
                </span>
              )}
            </div>
            <p
              className={`text-xs mt-0.5 truncate ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {item.subtitle || 'Adjustable monthly expense'}
            </p>
          </div>
        </div>

        {/* Right Side: Step Controls, Inline Value Badge & Item Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={!item.enabled || value <= min}
            aria-label={`Decrease ${item.label}`}
            className={`p-1.5 rounded-lg border transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
              darkMode
                ? 'border-gray-700 bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {editingValue ? (
            <input
              type="number"
              min="0"
              autoFocus
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={commitValueEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitValueEdit();
                if (e.key === 'Escape') setEditingValue(false);
              }}
              className={`w-24 px-2 py-1 rounded-lg font-bold text-sm text-center border outline-none ${
                darkMode
                  ? 'bg-gray-900 border-emerald-500 text-white'
                  : 'bg-white border-emerald-600 text-gray-900'
              }`}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempValue(String(value));
                setEditingValue(true);
              }}
              title="Click to type an exact amount"
              className={`px-3 py-1 rounded-lg font-bold text-sm sm:text-base tabular-nums min-w-[5.5rem] text-center transition-transform active:scale-95 ${
                darkMode ? colorConfig.badgeDark : colorConfig.badgeLight
              }`}
            >
              {formatMoney(value, currency)}
            </button>
          )}

          <button
            type="button"
            onClick={handleIncrement}
            disabled={!item.enabled || value >= max}
            aria-label={`Increase ${item.label}`}
            className={`p-1.5 rounded-lg border transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
              darkMode
                ? 'border-gray-700 bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Range Slider Input */}
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={!item.enabled}
          value={Math.min(value, max)}
          onChange={(e) => onChangeValue(item.id, Number(e.target.value))}
          aria-label={item.label}
          className={`w-full h-2.5 rounded-lg cursor-pointer transition-all disabled:cursor-not-allowed ${
            colorConfig.accent
          } ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
        />
      </div>

      {/* Footer Row: Min / Step Info / Inline Editable Max / Quick Actions */}
      <div
        className={`flex flex-wrap justify-between items-center gap-2 text-[11px] font-medium mt-2.5 pt-2 border-t ${
          darkMode
            ? 'text-gray-400 border-gray-700/50'
            : 'text-gray-400 border-gray-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>{Math.round(percentage)}% of cap</span>
          <span>•</span>
          <span>Step: {formatMoney(step, currency)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Inline Max Limit Editor */}
          {editingMax ? (
            <div className="flex items-center gap-1">
              <span>Max:</span>
              <input
                type="number"
                min="100"
                autoFocus
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                onBlur={commitMaxEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitMaxEdit();
                  if (e.key === 'Escape') setEditingMax(false);
                }}
                className={`w-20 px-1.5 py-0.5 rounded text-xs font-bold border outline-none ${
                  darkMode
                    ? 'bg-gray-900 border-emerald-500 text-white'
                    : 'bg-white border-emerald-600 text-gray-900'
                }`}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempMax(String(max));
                setEditingMax(true);
              }}
              title="Click to change slider max limit"
              className={`hover:underline font-semibold ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Max: {formatMoney(max, currency)}
            </button>
          )}

          <span className="opacity-40">|</span>

          <button
            type="button"
            onClick={() => onToggleEnabled(item.id)}
            title={item.enabled ? 'Pause expense' : 'Resume expense'}
            className={`p-1 rounded hover:bg-gray-500/10 transition-colors ${
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit slider settings"
            className={`p-1 rounded hover:bg-gray-500/10 transition-colors ${
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            title="Delete slider"
            className="p-1 rounded hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // Load initial state from localStorage or default to un-onboarded clean slate
  const [appState, setAppState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            onboarded: Boolean(parsed.onboarded),
            currency: parsed.currency || 'ZAR',
            darkMode: Boolean(parsed.darkMode),
            incomes: Array.isArray(parsed.incomes) ? parsed.incomes : [],
            fixedExpenses: Array.isArray(parsed.fixedExpenses) ? parsed.fixedExpenses : [],
            variableExpenses: Array.isArray(parsed.variableExpenses) ? parsed.variableExpenses : [],
            scenarios: Array.isArray(parsed.scenarios) ? parsed.scenarios : [],
          };
        }
      }
    } catch (e) {
      console.error('Failed to read saved budget state:', e);
    }
    return {
      onboarded: false,
      currency: 'ZAR',
      darkMode: false,
      incomes: [],
      fixedExpenses: [],
      variableExpenses: [],
      scenarios: [],
    };
  });

  const {
    onboarded,
    currency,
    darkMode,
    incomes,
    fixedExpenses,
    variableExpenses,
    scenarios,
  } = appState;

  // Onboarding wizard local state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [setupCurrency, setSetupCurrency] = useState('ZAR');
  const [setupIncomeLabel, setSetupIncomeLabel] = useState('Primary Monthly Income');
  const [setupIncomeAmount, setSetupIncomeAmount] = useState('');

  // Modals & UI feedback states
  const [activeModal, setActiveModal] = useState(null); // 'income' | 'fixed' | 'variable' | 'settings' | 'scenario' | null
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef(null);

  // Form states for Add/Edit Modals
  const [incomeForm, setIncomeForm] = useState({ label: '', amount: '' });
  const [fixedForm, setFixedForm] = useState({ label: '', amount: '', icon: 'Home' });
  const [variableForm, setVariableForm] = useState({
    label: '',
    subtitle: '',
    value: '0',
    max: '2000',
    step: '50',
    icon: 'ShoppingBag',
    color: 'emerald',
  });
  const [scenarioName, setScenarioName] = useState('');

  // Persist to localStorage whenever appState changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to save budget state:', e);
    }
  }, [appState]);

  // Sync dark mode class on root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Helper to show non-blocking toast notifications
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Update partial appState helper
  const updateState = (updater) => {
    setAppState((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  };

  // Financial Calculations
  const totalIncome = useMemo(
    () =>
      incomes
        .filter((item) => item.enabled !== false)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [incomes]
  );

  const totalFixed = useMemo(
    () =>
      fixedExpenses
        .filter((item) => item.enabled !== false)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [fixedExpenses]
  );

  const totalVariable = useMemo(
    () =>
      variableExpenses
        .filter((item) => item.enabled !== false)
        .reduce((sum, item) => sum + (Number(item.value) || 0), 0),
    [variableExpenses]
  );

  const totalExpenses = totalFixed + totalVariable;
  const surplus = totalIncome - totalExpenses;
  const isSurplus = surplus >= 0;

  const rawExpenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const progressPercentage = totalIncome > 0 ? Math.min(rawExpenseRatio, 100) : 0;
  const fixedPercentage = totalIncome > 0 ? (totalFixed / totalIncome) * 100 : 0;
  const variablePercentage = totalIncome > 0 ? (totalVariable / totalIncome) * 100 : 0;

  // --- Onboarding Completion Handlers ---
  const completeOnboarding = (mode) => {
    const parsedIncome = Math.max(0, Math.round(Number(setupIncomeAmount) || 0));
    const initialIncomes =
      parsedIncome > 0
        ? [
            {
              id: `inc-${Date.now()}`,
              label: setupIncomeLabel.trim() || 'Primary Income',
              amount: parsedIncome,
              enabled: true,
            },
          ]
        : [];

    if (mode === 'blank') {
      updateState({
        onboarded: true,
        currency: setupCurrency,
        incomes: initialIncomes,
        fixedExpenses: [],
        variableExpenses: [],
      });
      showToast('Started with a clean blank canvas');
    } else if (mode === 'standard') {
      const scaffold = createStandardZeroedCategories(parsedIncome);
      updateState({
        onboarded: true,
        currency: setupCurrency,
        incomes: initialIncomes,
        fixedExpenses: scaffold.fixedExpenses,
        variableExpenses: scaffold.variableExpenses,
      });
      showToast('Standard categories created at 0');
    } else if (mode === 'demo') {
      const demoIncome = parsedIncome > 0 ? parsedIncome : 25000;
      const { max, step } = getScaledSliderDefaults(demoIncome);
      updateState({
        onboarded: true,
        currency: setupCurrency,
        incomes: [
          {
            id: 'inc-demo-1',
            label: setupIncomeLabel.trim() || 'Monthly Take-Home Pay',
            amount: demoIncome,
            enabled: true,
          },
        ],
        fixedExpenses: [
          {
            id: 'fix-demo-1',
            label: 'Housing / Rent',
            amount: Math.round(demoIncome * 0.28),
            icon: 'Home',
            enabled: true,
          },
          {
            id: 'fix-demo-2',
            label: 'Utilities & Fibre',
            amount: Math.round(demoIncome * 0.06),
            icon: 'Wifi',
            enabled: true,
          },
          {
            id: 'fix-demo-3',
            label: 'Insurance & Mobile',
            amount: Math.round(demoIncome * 0.05),
            icon: 'Shield',
            enabled: true,
          },
        ],
        variableExpenses: [
          {
            id: 'var-demo-1',
            label: 'Groceries & Household',
            subtitle: 'Food & monthly supplies',
            value: Math.round(demoIncome * 0.14),
            max,
            step,
            icon: 'ShoppingBag',
            color: 'emerald',
            enabled: true,
          },
          {
            id: 'var-demo-2',
            label: 'Transport & Fuel',
            subtitle: 'Daily commuting',
            value: Math.round(demoIncome * 0.08),
            max,
            step,
            icon: 'Fuel',
            color: 'amber',
            enabled: true,
          },
          {
            id: 'var-demo-3',
            label: 'Savings & Investments',
            subtitle: 'Emergency fund & Stokvel',
            value: Math.round(demoIncome * 0.12),
            max,
            step,
            icon: 'PiggyBank',
            color: 'teal',
            enabled: true,
          },
          {
            id: 'var-demo-4',
            label: 'Dining & Leisure',
            subtitle: 'Entertainment & social',
            value: Math.round(demoIncome * 0.06),
            max,
            step,
            icon: 'Sparkles',
            color: 'purple',
            enabled: true,
          },
        ],
      });
      showToast('Loaded sample demo values');
    }
  };

  // --- CRUD Handlers for Incomes ---
  const handleAddOrUpdateIncome = (e) => {
    e.preventDefault();
    const label = incomeForm.label.trim() || 'Income Stream';
    const amount = Math.max(0, Math.round(Number(incomeForm.amount) || 0));

    if (editingItem) {
      updateState((prev) => ({
        ...prev,
        incomes: prev.incomes.map((inc) =>
          inc.id === editingItem.id ? { ...inc, label, amount } : inc
        ),
      }));
      showToast('Income updated');
    } else {
      updateState((prev) => ({
        ...prev,
        incomes: [
          ...prev.incomes,
          { id: `inc-${Date.now()}`, label, amount, enabled: true },
        ],
      }));
      showToast('Income stream added');
    }
    setEditingItem(null);
    setIncomeForm({ label: '', amount: '' });
  };

  const handleToggleIncome = (id) => {
    updateState((prev) => ({
      ...prev,
      incomes: prev.incomes.map((inc) =>
        inc.id === id ? { ...inc, enabled: !inc.enabled } : inc
      ),
    }));
  };

  const handleDeleteIncome = (id) => {
    updateState((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((inc) => inc.id !== id),
    }));
    showToast('Income stream removed');
  };

  // --- CRUD Handlers for Fixed Expenses ---
  const openFixedModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFixedForm({
        label: item.label,
        amount: String(item.amount),
        icon: item.icon || 'Home',
      });
    } else {
      setEditingItem(null);
      setFixedForm({ label: '', amount: '', icon: 'Home' });
    }
    setActiveModal('fixed');
  };

  const handleSaveFixed = (e) => {
    e.preventDefault();
    const label = fixedForm.label.trim() || 'Fixed Bill';
    const amount = Math.max(0, Math.round(Number(fixedForm.amount) || 0));
    const icon = fixedForm.icon || 'Home';

    if (editingItem) {
      updateState((prev) => ({
        ...prev,
        fixedExpenses: prev.fixedExpenses.map((item) =>
          item.id === editingItem.id ? { ...item, label, amount, icon } : item
        ),
      }));
      showToast('Fixed commitment updated');
    } else {
      updateState((prev) => ({
        ...prev,
        fixedExpenses: [
          ...prev.fixedExpenses,
          { id: `fix-${Date.now()}`, label, amount, icon, enabled: true },
        ],
      }));
      showToast('Fixed commitment added');
    }
    setActiveModal(null);
    setEditingItem(null);
  };

  const handleToggleFixed = (id) => {
    updateState((prev) => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  const handleDeleteFixed = (id) => {
    updateState((prev) => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter((item) => item.id !== id),
    }));
    showToast('Fixed commitment removed');
  };

  // --- CRUD Handlers for Variable Expense Sliders ---
  const openVariableModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setVariableForm({
        label: item.label,
        subtitle: item.subtitle || '',
        value: String(item.value),
        max: String(item.max),
        step: String(item.step),
        icon: item.icon || 'ShoppingBag',
        color: item.color || 'emerald',
      });
    } else {
      const defaults = getScaledSliderDefaults(totalIncome);
      setEditingItem(null);
      setVariableForm({
        label: '',
        subtitle: '',
        value: '0',
        max: String(defaults.max),
        step: String(defaults.step),
        icon: 'ShoppingBag',
        color: 'emerald',
      });
    }
    setActiveModal('variable');
  };

  const handleSaveVariable = (e) => {
    e.preventDefault();
    const label = variableForm.label.trim() || 'Adjustable Expense';
    const subtitle = variableForm.subtitle.trim() || 'Monthly allocation';
    const value = Math.max(0, Math.round(Number(variableForm.value) || 0));
    const max = Math.max(100, value, Math.round(Number(variableForm.max) || 1000));
    const step = Math.max(1, Math.round(Number(variableForm.step) || 50));
    const icon = variableForm.icon || 'ShoppingBag';
    const color = variableForm.color || 'emerald';

    if (editingItem) {
      updateState((prev) => ({
        ...prev,
        variableExpenses: prev.variableExpenses.map((item) =>
          item.id === editingItem.id
            ? { ...item, label, subtitle, value, max, step, icon, color }
            : item
        ),
      }));
      showToast('Expense slider updated');
    } else {
      updateState((prev) => ({
        ...prev,
        variableExpenses: [
          ...prev.variableExpenses,
          {
            id: `var-${Date.now()}`,
            label,
            subtitle,
            value,
            max,
            step,
            icon,
            color,
            enabled: true,
          },
        ],
      }));
      showToast('Expense slider added');
    }
    setActiveModal(null);
    setEditingItem(null);
  };

  const handleSliderValueChange = (id, newValue) => {
    updateState((prev) => ({
      ...prev,
      variableExpenses: prev.variableExpenses.map((item) =>
        item.id === id ? { ...item, value: newValue } : item
      ),
    }));
  };

  const handleSliderMaxChange = (id, newMax) => {
    updateState((prev) => ({
      ...prev,
      variableExpenses: prev.variableExpenses.map((item) =>
        item.id === id ? { ...item, max: newMax } : item
      ),
    }));
    showToast(`Max cap updated to ${formatMoney(newMax, currency)}`);
  };

  const handleToggleVariable = (id) => {
    updateState((prev) => ({
      ...prev,
      variableExpenses: prev.variableExpenses.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    }));
  };

  const handleDeleteVariable = (id) => {
    updateState((prev) => ({
      ...prev,
      variableExpenses: prev.variableExpenses.filter((item) => item.id !== id),
    }));
    showToast('Expense slider removed');
  };

  const handleZeroAllSliders = () => {
    updateState((prev) => ({
      ...prev,
      variableExpenses: prev.variableExpenses.map((item) => ({ ...item, value: 0 })),
    }));
    showToast('All sliders set to 0');
  };

  // --- Saved Scenarios Management ---
  const handleSaveScenario = (e) => {
    e.preventDefault();
    const name = scenarioName.trim() || `Scenario ${scenarios.length + 1}`;
    const snapshot = {
      id: `scen-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      incomes: JSON.parse(JSON.stringify(incomes)),
      fixedExpenses: JSON.parse(JSON.stringify(fixedExpenses)),
      variableExpenses: JSON.parse(JSON.stringify(variableExpenses)),
    };
    updateState((prev) => ({
      ...prev,
      scenarios: [snapshot, ...prev.scenarios],
    }));
    setScenarioName('');
    setActiveModal(null);
    showToast(`Saved scenario "${name}"`);
  };

  const handleLoadScenario = (scenario) => {
    updateState((prev) => ({
      ...prev,
      incomes: JSON.parse(JSON.stringify(scenario.incomes || [])),
      fixedExpenses: JSON.parse(JSON.stringify(scenario.fixedExpenses || [])),
      variableExpenses: JSON.parse(JSON.stringify(scenario.variableExpenses || [])),
    }));
    showToast(`Loaded scenario "${scenario.name}"`);
  };

  const handleDeleteScenario = (id) => {
    updateState((prev) => ({
      ...prev,
      scenarios: prev.scenarios.filter((s) => s.id !== id),
    }));
    showToast('Scenario deleted');
  };

  // --- Export / Import / Factory Reset Tools ---
  const handleCopySummary = async () => {
    const lines = [
      `📊 Save4U SUMMARY`,
      `────────────────────────────`,
      `Monthly Income: ${formatMoney(totalIncome, currency)}`,
      `Fixed Commitments: ${formatMoney(totalFixed, currency)}`,
      `Adjustable Expenses: ${formatMoney(totalVariable, currency)}`,
      `Total Expenses: ${formatMoney(totalExpenses, currency)} (${rawExpenseRatio.toFixed(1)}%)`,
      `${isSurplus ? 'Monthly Surplus' : 'Monthly Deficit'}: ${formatMoney(surplus, currency)}`,
    ];

    if (variableExpenses.length > 0) {
      lines.push(`\nAdjustable Breakdown:`);
      variableExpenses
        .filter((v) => v.enabled !== false)
        .forEach((v) => {
          lines.push(`• ${v.label}: ${formatMoney(v.value, currency)}`);
        });
    }

    if (fixedExpenses.length > 0) {
      lines.push(`\nFixed Commitments:`);
      fixedExpenses
        .filter((f) => f.enabled !== false)
        .forEach((f) => {
          lines.push(`• ${f.label}: ${formatMoney(f.amount, currency)}`);
        });
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      showToast('Budget summary copied to clipboard');
    } catch {
      showToast('Unable to access clipboard');
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Type', 'Category', 'Amount', 'Max Limit', 'Status'],
      ...incomes.map((i) => [
        'Income',
        `"${i.label.replace(/"/g, '""')}"`,
        i.amount,
        '',
        i.enabled !== false ? 'Active' : 'Paused',
      ]),
      ...fixedExpenses.map((f) => [
        'Fixed Expense',
        `"${f.label.replace(/"/g, '""')}"`,
        f.amount,
        '',
        f.enabled !== false ? 'Active' : 'Paused',
      ]),
      ...variableExpenses.map((v) => [
        'Variable Expense',
        `"${v.label.replace(/"/g, '""')}"`,
        v.value,
        v.max,
        v.enabled !== false ? 'Active' : 'Paused',
      ]),
      ['Summary', 'Total Income', totalIncome, '', ''],
      ['Summary', 'Total Expenses', totalExpenses, '', ''],
      ['Summary', isSurplus ? 'Monthly Surplus' : 'Monthly Deficit', surplus, '', ''],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cashflow-plan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded CSV spreadsheet');
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(appState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cashflow-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded JSON backup');
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || ''));
        if (parsed && typeof parsed === 'object') {
          setAppState({
            onboarded: true,
            currency: parsed.currency || 'ZAR',
            darkMode: Boolean(parsed.darkMode),
            incomes: Array.isArray(parsed.incomes) ? parsed.incomes : [],
            fixedExpenses: Array.isArray(parsed.fixedExpenses) ? parsed.fixedExpenses : [],
            variableExpenses: Array.isArray(parsed.variableExpenses) ? parsed.variableExpenses : [],
            scenarios: Array.isArray(parsed.scenarios) ? parsed.scenarios : [],
          });
          setActiveModal(null);
          showToast('Budget backup restored successfully');
        }
      } catch {
        showToast('Invalid backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfirmReset(false);
    setActiveModal(null);
    setOnboardingStep(1);
    setSetupIncomeAmount('');
    setSetupIncomeLabel('Primary Monthly Income');
    setAppState({
      onboarded: false,
      currency: 'ZAR',
      darkMode,
      incomes: [],
      fixedExpenses: [],
      variableExpenses: [],
      scenarios: [],
    });
    showToast('All data cleared. Returned to setup.');
  };

  // ============================================================================
  // RENDER 1: FIRST-TIME USER ONBOARDING FLOW (NO HARDCODED PERSONAL VALUES)
  // ============================================================================
  if (!onboarded) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div
          className={`min-h-screen transition-colors duration-300 py-8 px-4 sm:px-6 flex flex-col items-center justify-center ${
            darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
          }`}
        >
          <div className="w-full max-w-lg mx-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2.5 rounded-2xl shadow-sm ${
                    darkMode
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight">
                  Save4U
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateState({ darkMode: !darkMode })}
                  aria-label="Toggle theme"
                  className={`p-2 rounded-xl border transition-colors ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-amber-400 hover:bg-gray-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => completeOnboarding('blank')}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                    darkMode
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                >
                  Skip to Blank App
                </button>
              </div>
            </div>

            {/* Onboarding Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border shadow-lg transition-all ${
                darkMode
                  ? 'bg-gray-800/90 border-gray-700'
                  : 'bg-white border-gray-100'
              }`}
            >
              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`h-1.5 flex-1 rounded-full ${
                    onboardingStep >= 1 ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
                <div
                  className={`h-1.5 flex-1 rounded-full ${
                    onboardingStep >= 2 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              </div>

              {onboardingStep === 1 ? (
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                      Step 1 of 2 • Quick Setup
                    </span>
                    <h1 className="text-2xl font-extrabold mt-1">
                      Set your currency & monthly income
                    </h1>
                    <p
                      className={`text-sm mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Everything stays 100% private in your browser. You can change or add more income streams at any time.
                    </p>
                  </div>

                  {/* Currency Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Select Currency
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.values(CURRENCIES).map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => setSetupCurrency(curr.code)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            setupCurrency === curr.code
                              ? darkMode
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-emerald-50 border-emerald-600 text-emerald-900'
                              : darkMode
                              ? 'bg-gray-900/50 border-gray-700 text-gray-300 hover:border-gray-600'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg font-extrabold">{curr.symbol}</div>
                          <div className="text-xs opacity-75 font-medium">{curr.code}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Income Input */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Income Source Name
                      </label>
                      <input
                        type="text"
                        value={setupIncomeLabel}
                        onChange={(e) => setSetupIncomeLabel(e.target.value)}
                        placeholder="e.g., Monthly Take-Home Salary"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 focus:border-emerald-500 text-white'
                            : 'bg-gray-50 border-gray-200 focus:border-emerald-600 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                        Monthly Net Amount ({CURRENCIES[setupCurrency].symbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={setupIncomeAmount}
                        onChange={(e) => setSetupIncomeAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setOnboardingStep(2);
                        }}
                        placeholder="Enter your monthly income (or leave 0 to set later)"
                        className={`w-full px-4 py-3 rounded-xl border text-base font-bold outline-none transition-colors ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 focus:border-emerald-500 text-white'
                            : 'bg-gray-50 border-gray-200 focus:border-emerald-600 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                      Step 2 of 2 • Workspace Layout
                    </span>
                    <h2 className="text-2xl font-extrabold mt-1">
                      How would you like to start?
                    </h2>
                    <p
                      className={`text-sm mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      No pre-filled personal expenses are forced on you. Choose the starting setup that fits your workflow.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Option 1: Blank Canvas */}
                    <button
                      type="button"
                      onClick={() => completeOnboarding('blank')}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                        darkMode
                          ? 'bg-gray-900/60 border-gray-700 hover:border-emerald-500/60'
                          : 'bg-gray-50 border-gray-200 hover:border-emerald-500'
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">
                          Start with a Blank Canvas
                        </h3>
                        <p
                          className={`text-xs mt-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Starts with 0 fixed bills and 0 sliders so you can add only the exact categories you use.
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Standard Categories at 0 */}
                    <button
                      type="button"
                      onClick={() => completeOnboarding('standard')}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                        darkMode
                          ? 'bg-gray-900/60 border-gray-700 hover:border-emerald-500/60'
                          : 'bg-gray-50 border-gray-200 hover:border-emerald-500'
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-blue-500/15 text-blue-500 shrink-0">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">
                          Standard Categories (All Set to 0)
                        </h3>
                        <p
                          className={`text-xs mt-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Creates common categories (Housing, Utilities, Groceries, Transport, Savings) initialized at {CURRENCIES[setupCurrency].symbol} 0 with slider limits scaled to your income.
                        </p>
                      </div>
                    </button>

                    {/* Option 3: Sample Demo */}
                    <button
                      type="button"
                      onClick={() => completeOnboarding('demo')}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                        darkMode
                          ? 'bg-gray-900/40 border-gray-700/70 hover:border-purple-500/60'
                          : 'bg-white border-gray-200 hover:border-purple-500'
                      }`}
                    >
                      <div className="p-3 rounded-xl bg-purple-500/15 text-purple-500 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">
                          Load Sample Demo Data
                        </h3>
                        <p
                          className={`text-xs mt-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          Populates example income, bills, and sliders so you can test drive the planner immediately.
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl ${
                        darkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER 2: MAIN PRODUCTION DASHBOARD
  // ============================================================================
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div
        className={`min-h-screen transition-colors duration-300 py-6 px-4 sm:px-6 flex flex-col items-center justify-between ${
          darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
      >
        {/* Non-blocking Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg bg-gray-900 text-white dark:bg-emerald-600 text-xs font-semibold border border-gray-700 animate- bounce">
            <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="w-full max-w-xl mx-auto space-y-5">
          {/* 1. Header */}
          <header className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-2xl shadow-sm flex items-center justify-center ${
                  darkMode
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Save4U
                </h1>
                <p
                  className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Interactive Budget & Surplus Simulator
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopySummary}
                title="Copy budget summary"
                className={`p-2.5 rounded-xl border transition-colors text-xs font-medium flex items-center gap-1.5 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  setActiveModal('settings');
                }}
                title="Settings, Export & Reset"
                className={`p-2.5 rounded-xl border transition-colors text-xs font-medium flex items-center gap-1.5 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Data</span>
              </button>

              <button
                type="button"
                onClick={() => updateState({ darkMode: !darkMode })}
                aria-label="Toggle Dark Mode"
                className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-amber-400 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* 2. Hero Card (Surplus & Income/Expense Summary) */}
          <section
            className={`rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-md ${
              darkMode
                ? isSurplus
                  ? 'bg-gray-800/90 border-emerald-500/30 shadow-emerald-950/20'
                  : 'bg-gray-800/90 border-red-500/40 shadow-red-950/20'
                : isSurplus
                ? 'bg-white border-emerald-100 shadow-emerald-100/50'
                : 'bg-white border-red-100 shadow-red-100/50'
            }`}
          >
            {/* Status Pill & Label */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {isSurplus ? 'Remaining Monthly Surplus' : 'Monthly Deficit'}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isSurplus
                    ? darkMode
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : darkMode
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {isSurplus ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Within Budget
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Over Budget
                  </>
                )}
              </span>
            </div>

            {/* Large Bold Surplus Value */}
            <div className="flex items-baseline justify-between my-2">
              <div
                className={`text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums transition-colors duration-300 ${
                  isSurplus
                    ? darkMode
                      ? 'text-emerald-400'
                      : 'text-emerald-600'
                    : darkMode
                    ? 'text-red-400'
                    : 'text-red-600'
                }`}
              >
                {formatMoney(surplus, currency)}
              </div>

              {totalIncome > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium">
                  {isSurplus ? (
                    <span
                      className={`flex items-center gap-1 ${
                        darkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      {Math.max(0, 100 - Math.round(rawExpenseRatio))}% unallocated
                    </span>
                  ) : (
                    <span
                      className={`flex items-center gap-1 ${
                        darkMode ? 'text-red-400' : 'text-red-600'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      {Math.round(rawExpenseRatio - 100)}% over
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Horizontal Progress Bar */}
            <div className="mt-4 mb-3">
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Income Utilization
                </span>
                <span
                  className={`font-semibold tabular-nums ${
                    isSurplus
                      ? darkMode
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                      : darkMode
                      ? 'text-red-400'
                      : 'text-red-600'
                  }`}
                >
                  {totalIncome > 0 ? `${rawExpenseRatio.toFixed(1)}%` : 'Set income below'}
                </span>
              </div>

              <div
                className={`w-full h-3.5 rounded-full overflow-hidden p-0.5 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSurplus ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div
                className={`flex justify-between items-center text-[11px] mt-1.5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <span>Fixed: {fixedPercentage.toFixed(0)}%</span>
                <span>Adjustable: {variablePercentage.toFixed(0)}%</span>
              </div>
            </div>

            {/* Income vs Total Expenses Summary Cards */}
            <div
              className={`grid grid-cols-2 gap-3 pt-3 mt-3 border-t ${
                darkMode ? 'border-gray-700/80' : 'border-gray-100'
              }`}
            >
              {/* Clickable Monthly Income Card */}
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIncomeForm({ label: '', amount: '' });
                  setActiveModal('income');
                }}
                className={`p-3 rounded-2xl text-left border transition-all group ${
                  darkMode
                    ? 'bg-gray-900/60 border-gray-700/70 hover:border-emerald-500/50'
                    : 'bg-gray-50 border-gray-200/60 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Monthly Income ({incomes.length})
                  </span>
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500 opacity-80 group-hover:opacity-100" />
                </div>
                <span className="text-base sm:text-lg font-bold tabular-nums mt-0.5 block">
                  {formatMoney(totalIncome, currency)}
                </span>
                {totalIncome === 0 && (
                  <span className="text-[11px] text-emerald-500 font-semibold">
                    + Click to set income
                  </span>
                )}
              </button>

              {/* Total Expenses Card */}
              <div
                className={`p-3 rounded-2xl border ${
                  darkMode
                    ? 'bg-gray-900/60 border-gray-700/70'
                    : 'bg-gray-50 border-gray-200/60'
                }`}
              >
                <span
                  className={`block text-xs font-medium ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Total Expenses
                </span>
                <span
                  className={`text-base sm:text-lg font-bold tabular-nums mt-0.5 block ${
                    !isSurplus
                      ? darkMode
                        ? 'text-red-400'
                        : 'text-red-600'
                      : ''
                  }`}
                >
                  {formatMoney(totalExpenses, currency)}
                </span>
                <span
                  className={`text-[11px] block ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {fixedExpenses.length} fixed • {variableExpenses.length} sliders
                </span>
              </div>
            </div>
          </section>

          {/* 3. Saved Scenarios Bar */}
          <section
            className={`rounded-2xl p-3.5 border transition-colors ${
              darkMode
                ? 'bg-gray-800/60 border-gray-700/70'
                : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Saved Scenarios ({scenarios.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setScenarioName('');
                  setActiveModal('scenario');
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  darkMode
                    ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Save Snapshot
              </button>
            </div>

            {scenarios.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-1">
                {scenarios.map((scen) => (
                  <div
                    key={scen.id}
                    className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl border text-xs font-medium shrink-0 ${
                      darkMode
                        ? 'bg-gray-900/70 border-gray-700 text-gray-200'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadScenario(scen)}
                      className="hover:underline font-semibold"
                    >
                      {scen.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteScenario(scen.id)}
                      title="Delete scenario"
                      className="p-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className={`text-xs mt-1.5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Save snapshots of your budget (e.g., &ldquo;Base Plan&rdquo;, &ldquo;Tight Month&rdquo;) to compare options anytime.
              </p>
            )}
          </section>

          {/* 4. Interactive Adjustable Expense Sliders */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Adjustable Expenses
                </h2>
                <p
                  className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Variable total: {formatMoney(totalVariable, currency)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {variableExpenses.length > 0 && totalVariable > 0 && (
                  <button
                    type="button"
                    onClick={handleZeroAllSliders}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Zero All
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openVariableModal(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Slider
                </button>
              </div>
            </div>

            {variableExpenses.length === 0 ? (
              <div
                className={`rounded-2xl p-6 border border-dashed text-center ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800/30'
                    : 'border-gray-300 bg-white/60'
                }`}
              >
                <Sliders className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <h3 className="font-bold text-sm">No Adjustable Sliders Yet</h3>
                <p
                  className={`text-xs mt-1 max-w-sm mx-auto ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Add flexible monthly categories like Groceries, Fuel, Dining Out, or Savings to simulate how changes impact your surplus.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openVariableModal(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Expense Slider
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const scaffold = createStandardZeroedCategories(totalIncome);
                      updateState((prev) => ({
                        ...prev,
                        variableExpenses: scaffold.variableExpenses,
                      }));
                      showToast('Added standard sliders at 0');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                      darkMode
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Load Standard Sliders (at 0)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {variableExpenses.map((item) => (
                  <SliderRow
                    key={item.id}
                    item={item}
                    currency={currency}
                    darkMode={darkMode}
                    onChangeValue={handleSliderValueChange}
                    onChangeMax={handleSliderMaxChange}
                    onToggleEnabled={handleToggleVariable}
                    onEdit={openVariableModal}
                    onDelete={handleDeleteVariable}
                  />
                ))}
              </div>
            )}
          </section>

          {/* 5. Footer: Fixed Monthly Commitments */}
          <footer
            className={`rounded-2xl p-4 sm:p-5 border transition-colors ${
              darkMode
                ? 'bg-gray-800/50 border-gray-800 text-gray-300'
                : 'bg-gray-100/80 border-gray-200/80 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock
                  className={`w-4 h-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    Fixed Monthly Commitments
                  </span>
                  <span
                    className={`text-[11px] ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Total fixed: {formatMoney(totalFixed, currency)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openFixedModal(null)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-emerald-400 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-emerald-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Fixed Bill
              </button>
            </div>

            {fixedExpenses.length === 0 ? (
              <div
                className={`rounded-xl p-4 border border-dashed text-center ${
                  darkMode ? 'border-gray-700/80' : 'border-gray-300'
                }`}
              >
                <p
                  className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  No fixed monthly commitments added yet (e.g., Rent, Bond, Car Payment, Wifi, Insurance).
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {fixedExpenses.map((item) => {
                  const ItemIcon = ICON_MAP[item.icon] || Lock;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        item.enabled === false ? 'opacity-50 ' : ''
                      }${
                        darkMode
                          ? 'bg-gray-900/60 border-gray-700/60'
                          : 'bg-white border-gray-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`text-xs font-semibold block truncate ${
                              item.enabled === false ? 'line-through' : ''
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="text-sm font-bold tabular-nums">
                            {formatMoney(item.amount, currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleFixed(item.id)}
                          title={item.enabled === false ? 'Enable bill' : 'Pause bill'}
                          className="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"
                        >
                          {item.enabled === false ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openFixedModal(item)}
                          title="Edit bill"
                          className="p-1.5 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-gray-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFixed(item.id)}
                          title="Delete bill"
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </footer>
        </div>

        {/* ==================================================================== */}
        {/* MODALS OVERLAY                                                       */}
        {/* ==================================================================== */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div
              className={`w-full max-w-md rounded-3xl p-6 border shadow-xl max-h-[90vh] overflow-y-auto ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-100'
                  : 'bg-white border-gray-100 text-gray-900'
              }`}
            >
              {/* 1. INCOME MANAGER MODAL */}
              {activeModal === 'income' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Manage Monthly Income</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1.5 rounded-xl hover:bg-gray-500/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Existing Income Streams List */}
                  <div className="space-y-2">
                    {incomes.length === 0 ? (
                      <p
                        className={`text-xs py-3 text-center rounded-xl border border-dashed ${
                          darkMode
                            ? 'border-gray-700 text-gray-400'
                            : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        No income streams added yet. Add your primary income below.
                      </p>
                    ) : (
                      incomes.map((inc) => (
                        <div
                          key={inc.id}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            darkMode
                              ? 'bg-gray-900/60 border-gray-700'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div>
                            <div
                              className={`text-sm font-semibold ${
                                inc.enabled === false ? 'line-through opacity-50' : ''
                              }`}
                            >
                              {inc.label}
                            </div>
                            <div className="text-sm font-bold text-emerald-500 tabular-nums">
                              {formatMoney(inc.amount, currency)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleIncome(inc.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-500/10"
                              title={inc.enabled === false ? 'Enable' : 'Pause'}
                            >
                              {inc.enabled === false ? (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(inc);
                                setIncomeForm({
                                  label: inc.label,
                                  amount: String(inc.amount),
                                });
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-500/10"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteIncome(inc.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add / Edit Income Form */}
                  <form onSubmit={handleAddOrUpdateIncome} className="space-y-3 pt-2 border-t dark:border-gray-700">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                      {editingItem ? 'Edit Income Stream' : '+ Add Income Stream'}
                    </h4>
                    <div>
                      <label className="block text-xs font-medium mb-1">Label</label>
                      <input
                        type="text"
                        required
                        value={incomeForm.label}
                        onChange={(e) =>
                          setIncomeForm((prev) => ({ ...prev, label: e.target.value }))
                        }
                        placeholder="e.g., Salary, Side Hustle, Rental"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Monthly Amount ({CURRENCIES[currency].symbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={incomeForm.amount}
                        onChange={(e) =>
                          setIncomeForm((prev) => ({ ...prev, amount: e.target.value }))
                        }
                        placeholder="0"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(null);
                            setIncomeForm({ label: '', amount: '' });
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-600"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {editingItem ? 'Update Income' : 'Add Income'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. FIXED COMMITMENT MODAL */}
              {activeModal === 'fixed' && (
                <form onSubmit={handleSaveFixed} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      {editingItem ? 'Edit Fixed Commitment' : 'Add Fixed Commitment'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1.5 rounded-xl hover:bg-gray-500/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Bill / Commitment Name</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={fixedForm.label}
                      onChange={(e) =>
                        setFixedForm((prev) => ({ ...prev, label: e.target.value }))
                      }
                      placeholder="e.g., Rent / Bond, Car Payment, Fibre"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Monthly Amount ({CURRENCIES[currency].symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={fixedForm.amount}
                      onChange={(e) =>
                        setFixedForm((prev) => ({ ...prev, amount: e.target.value }))
                      }
                      placeholder="0"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">Icon</label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {ICON_KEYS.map((key) => {
                        const IconComp = ICON_MAP[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFixedForm((prev) => ({ ...prev, icon: key }))}
                            className={`p-2 rounded-xl border flex items-center justify-center ${
                              fixedForm.icon === key
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                : darkMode
                                ? 'border-gray-700 bg-gray-900 text-gray-400'
                                : 'border-gray-200 bg-gray-50 text-gray-600'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-500/30"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Save Commitment
                    </button>
                  </div>
                </form>
              )}

              {/* 3. VARIABLE SLIDER MODAL */}
              {activeModal === 'variable' && (
                <form onSubmit={handleSaveVariable} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      {editingItem ? 'Edit Expense Slider' : 'Add Expense Slider'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1.5 rounded-xl hover:bg-gray-500/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Category Name</label>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={variableForm.label}
                        onChange={(e) =>
                          setVariableForm((prev) => ({ ...prev, label: e.target.value }))
                        }
                        placeholder="e.g., Groceries, Fuel, Stokvel"
                        className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Subtitle / Note</label>
                      <input
                        type="text"
                        value={variableForm.subtitle}
                        onChange={(e) =>
                          setVariableForm((prev) => ({ ...prev, subtitle: e.target.value }))
                        }
                        placeholder="e.g., Monthly food & household"
                        className={`w-full px-3.5 py-2 rounded-xl border text-sm outline-none ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Initial ({CURRENCIES[currency].symbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={variableForm.value}
                        onChange={(e) =>
                          setVariableForm((prev) => ({ ...prev, value: e.target.value }))
                        }
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-bold outline-none ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Max Limit ({CURRENCIES[currency].symbol})
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={variableForm.max}
                        onChange={(e) =>
                          setVariableForm((prev) => ({ ...prev, max: e.target.value }))
                        }
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-bold outline-none ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Step ({CURRENCIES[currency].symbol})
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={variableForm.step}
                        onChange={(e) =>
                          setVariableForm((prev) => ({ ...prev, step: e.target.value }))
                        }
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-bold outline-none ${
                          darkMode
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Color Accent Picker */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Accent Color</label>
                    <div className="flex items-center gap-2">
                      {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setVariableForm((prev) => ({ ...prev, color: key }))
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium ${
                            variableForm.color === key
                              ? 'border-emerald-500 font-bold'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.dot}`} />
                          <span className="hidden sm:inline">{theme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Icon</label>
                    <div className="grid grid-cols-8 gap-1.5">
                      {ICON_KEYS.map((key) => {
                        const IconComp = ICON_MAP[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              setVariableForm((prev) => ({ ...prev, icon: key }))
                            }
                            className={`p-2 rounded-xl border flex items-center justify-center ${
                              variableForm.icon === key
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                : darkMode
                                ? 'border-gray-700 bg-gray-900 text-gray-400'
                                : 'border-gray-200 bg-gray-50 text-gray-600'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-500/30"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Save Slider
                    </button>
                  </div>
                </form>
              )}

              {/* 4. SAVE SCENARIO MODAL */}
              {activeModal === 'scenario' && (
                <form onSubmit={handleSaveScenario} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Save Budget Scenario</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1.5 rounded-xl hover:bg-gray-500/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs opacity-75">
                    Save a snapshot of your current income, fixed commitments, and slider positions so you can restore it anytime.
                  </p>

                  <div>
                    <label className="block text-xs font-medium mb-1">Scenario Name</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      placeholder="e.g., Base Plan, Aggressive Savings, Lean Month"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-500/30"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Save Snapshot
                    </button>
                  </div>
                </form>
              )}

              {/* 5. SETTINGS, PORTABILITY & FACTORY RESET MODAL */}
              {activeModal === 'settings' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Workspace & Data Settings</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1.5 rounded-xl hover:bg-gray-500/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Currency Switcher */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Display Currency
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.values(CURRENCIES).map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            updateState({ currency: curr.code });
                            showToast(`Currency set to ${curr.code}`);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            currency === curr.code
                              ? 'border-emerald-500 bg-emerald-500/15 font-bold text-emerald-400'
                              : darkMode
                              ? 'border-gray-700 bg-gray-900/50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="text-base font-extrabold">{curr.symbol}</div>
                          <div className="text-[11px] opacity-75">{curr.code}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Export & Backup */}
                  <div className="space-y-2 pt-2 border-t dark:border-gray-700">
                    <label className="block text-xs font-bold uppercase tracking-wider">
                      Export & Backup
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-xs font-semibold ${
                          darkMode
                            ? 'bg-gray-900/60 border-gray-700 hover:bg-gray-900'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Download CSV Sheet</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportJSON}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-xs font-semibold ${
                          darkMode
                            ? 'bg-gray-900/60 border-gray-700 hover:bg-gray-900'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Download className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Backup JSON File</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-center gap-2 text-xs font-semibold ${
                        darkMode
                          ? 'bg-gray-900/40 border-gray-700 hover:bg-gray-900'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-purple-500" />
                      <span>Restore from JSON Backup</span>
                    </button>
                  </div>

                  {/* Factory Reset */}
                  <div className="pt-3 border-t dark:border-gray-700">
                    <label className="block text-xs font-bold uppercase tracking-wider text-red-400 mb-2">
                      Danger Zone
                    </label>
                    {!confirmReset ? (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="w-full p-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Factory Reset & Return to Onboarding
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl border border-red-500 bg-red-500/10 space-y-2">
                        <p className="text-xs font-semibold text-red-400">
                          Are you sure? This will wipe all saved incomes, expenses, and scenarios from this browser.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleFactoryReset}
                            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                          >
                            Yes, Wipe Everything
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="flex-1 py-2 rounded-lg border border-gray-600 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}