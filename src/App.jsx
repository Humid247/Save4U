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
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
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

const STORAGE_KEY = 'save4u_v1';

// Supported currencies
const CURRENCIES = {
  ZAR: { code: 'ZAR', symbol: 'R', label: 'South African Rand (R)' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
};

// Clean Icon Registry
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
  Sliders,
};

const ICON_KEYS = Object.keys(ICON_MAP);

/**
 * Currency formatter
 */
const formatMoney = (value, currencyCode = 'ZAR') => {
  const symbol = CURRENCIES[currencyCode]?.symbol || 'R';
  const isNegative = value < 0;
  const absValue = Math.abs(Math.round(Number(value) || 0));
  const formattedNumber = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
};

/**
 * Calculates sensible slider defaults scaled to income
 */
const getScaledSliderDefaults = (totalIncome) => {
  const base = Number(totalIncome) > 0 ? Number(totalIncome) : 10000;
  const rawMax = Math.max(500, Math.round((base * 0.3) / 100) * 100);
  const step = rawMax >= 5000 ? 100 : rawMax >= 1500 ? 50 : 25;
  return { max: rawMax, step };
};

/**
 * Standard categories scaffold
 */
const createStandardZeroedCategories = (totalIncome) => {
  const { max, step } = getScaledSliderDefaults(totalIncome);
  return {
    fixedExpenses: [
      { id: 'fix-housing', label: 'Housing / Rent', amount: 0, icon: 'Home', enabled: true },
      { id: 'fix-utilities', label: 'Utilities & Wi-Fi', amount: 0, icon: 'Wifi', enabled: true },
      { id: 'fix-transport', label: 'Vehicle & Transport', amount: 0, icon: 'Car', enabled: true },
    ],
    variableExpenses: [
      {
        id: 'var-groceries',
        label: 'Groceries & Household',
        subtitle: 'Food and daily supplies',
        value: 0,
        max,
        step,
        icon: 'ShoppingBag',
        enabled: true,
      },
      {
        id: 'var-fuel',
        label: 'Fuel & Commute',
        subtitle: 'Travel and transport',
        value: 0,
        max,
        step,
        icon: 'Fuel',
        enabled: true,
      },
      {
        id: 'var-savings',
        label: 'Savings & Investments',
        subtitle: 'Emergency fund and goals',
        value: 0,
        max,
        step,
        icon: 'PiggyBank',
        enabled: true,
      },
      {
        id: 'var-leisure',
        label: 'Dining & Leisure',
        subtitle: 'Discretionary spending',
        value: 0,
        max,
        step,
        icon: 'Sparkles',
        enabled: true,
      },
    ],
  };
};

/**
 * Minimalist, uncluttered SliderRow
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
  const min = 0;
  const max = Math.max(100, Number(item.max) || 1000);
  const step = Math.max(1, Number(item.step) || 50);
  const value = Number(item.value) || 0;

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
      className={`p-4 rounded-2xl border transition-all ${
        !item.enabled ? 'opacity-40' : ''
      } ${
        darkMode
          ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
          : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
      }`}
    >
      {/* Header: Icon, Label, Inline Value */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              darkMode ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold text-sm leading-tight truncate ${
                  darkMode ? 'text-slate-100' : 'text-slate-900'
                } ${!item.enabled ? 'line-through' : ''}`}
              >
                {item.label}
              </span>
              {!item.enabled && (
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 font-medium">
                  Paused
                </span>
              )}
            </div>
            {item.subtitle && (
              <p
                className={`text-xs mt-0.5 truncate ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {item.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Value badge */}
        <div>
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
              className={`w-24 px-2 py-1 rounded-lg font-mono font-bold text-sm text-center border outline-none ${
                darkMode
                  ? 'bg-slate-900 border-emerald-500 text-white'
                  : 'bg-white border-emerald-600 text-slate-900'
              }`}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempValue(String(value));
                setEditingValue(true);
              }}
              title="Click to enter exact amount"
              className={`px-3 py-1 rounded-lg font-mono font-semibold text-sm tracking-tight transition-colors ${
                darkMode
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-100'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-900'
              }`}
            >
              {formatMoney(value, currency)}
            </button>
          )}
        </div>
      </div>

      {/* Range Slider */}
      <div className="py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={!item.enabled}
          value={Math.min(value, max)}
          onChange={(e) => onChangeValue(item.id, Number(e.target.value))}
          aria-label={item.label}
          className="w-full h-1.5 rounded-lg cursor-pointer accent-emerald-600 dark:accent-emerald-500"
        />
      </div>

      {/* Footer: Min, Max (editable), discreet action icons */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-2 font-mono">
        <span>{formatMoney(0, currency)}</span>

        <div className="flex items-center gap-3">
          {editingMax ? (
            <div className="flex items-center gap-1 font-sans">
              <span className="text-[11px]">Cap:</span>
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
                className={`w-16 px-1 py-0.5 rounded text-xs font-mono font-semibold border outline-none ${
                  darkMode
                    ? 'bg-slate-900 border-emerald-500 text-white'
                    : 'bg-white border-emerald-600 text-slate-900'
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
              title="Click to edit maximum cap"
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Max: {formatMoney(max, currency)}
            </button>
          )}

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700/60 pl-2 font-sans">
            <button
              type="button"
              onClick={() => onToggleEnabled(item.id)}
              title={item.enabled ? 'Pause expense' : 'Resume expense'}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onEdit(item)}
              title="Edit slider settings"
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              title="Delete slider"
              className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
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

  // Wizard state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [setupCurrency, setSetupCurrency] = useState('ZAR');
  const [setupIncomeLabel, setSetupIncomeLabel] = useState('Primary Monthly Income');
  const [setupIncomeAmount, setSetupIncomeAmount] = useState('');

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'income' | 'fixed' | 'variable' | 'settings' | 'scenarios' | null
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef(null);

  // Forms
  const [incomeForm, setIncomeForm] = useState({ label: '', amount: '' });
  const [fixedForm, setFixedForm] = useState({ label: '', amount: '', icon: 'Home' });
  const [variableForm, setVariableForm] = useState({
    label: '',
    subtitle: '',
    value: '0',
    max: '2000',
    step: '50',
    icon: 'ShoppingBag',
  });
  const [scenarioName, setScenarioName] = useState('');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to save budget state:', e);
    }
  }, [appState]);

  // Dark mode HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const updateState = (updater) => {
    setAppState((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  };

  // Financial calculations
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

  // Onboarding completion
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
      showToast('Blank workspace ready');
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
            label: setupIncomeLabel.trim() || 'Monthly Net Salary',
            amount: demoIncome,
            enabled: true,
          },
        ],
        fixedExpenses: [
          {
            id: 'fix-demo-1',
            label: 'Rent / Mortgage',
            amount: Math.round(demoIncome * 0.28),
            icon: 'Home',
            enabled: true,
          },
          {
            id: 'fix-demo-2',
            label: 'Utilities & Wi-Fi',
            amount: Math.round(demoIncome * 0.06),
            icon: 'Wifi',
            enabled: true,
          },
          {
            id: 'fix-demo-3',
            label: 'Car & Insurance',
            amount: Math.round(demoIncome * 0.12),
            icon: 'Car',
            enabled: true,
          },
        ],
        variableExpenses: [
          {
            id: 'var-demo-1',
            label: 'Groceries & Household',
            subtitle: 'Food and daily essentials',
            value: Math.round(demoIncome * 0.15),
            max,
            step,
            icon: 'ShoppingBag',
            enabled: true,
          },
          {
            id: 'var-demo-2',
            label: 'Fuel & Commute',
            subtitle: 'Weekly petrol / transit',
            value: Math.round(demoIncome * 0.08),
            max,
            step,
            icon: 'Fuel',
            enabled: true,
          },
          {
            id: 'var-demo-3',
            label: 'Savings & Emergency',
            subtitle: 'Stokvel / High-yield savings',
            value: Math.round(demoIncome * 0.12),
            max,
            step,
            icon: 'PiggyBank',
            enabled: true,
          },
          {
            id: 'var-demo-4',
            label: 'Dining & Leisure',
            subtitle: 'Restaurants and social',
            value: Math.round(demoIncome * 0.06),
            max,
            step,
            icon: 'Sparkles',
            enabled: true,
          },
        ],
      });
      showToast('Loaded sample budget');
    }
  };

  // Income handlers
  const handleAddOrUpdateIncome = (e) => {
    e.preventDefault();
    const label = incomeForm.label.trim() || 'Income Source';
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
      showToast('Income added');
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
    showToast('Income removed');
  };

  // Fixed bills handlers
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
      showToast('Fixed bill updated');
    } else {
      updateState((prev) => ({
        ...prev,
        fixedExpenses: [
          ...prev.fixedExpenses,
          { id: `fix-${Date.now()}`, label, amount, icon, enabled: true },
        ],
      }));
      showToast('Fixed bill added');
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
    showToast('Fixed bill removed');
  };

  // Variable slider handlers
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
      });
    }
    setActiveModal('variable');
  };

  const handleSaveVariable = (e) => {
    e.preventDefault();
    const label = variableForm.label.trim() || 'Adjustable Expense';
    const subtitle = variableForm.subtitle.trim();
    const value = Math.max(0, Math.round(Number(variableForm.value) || 0));
    const max = Math.max(100, value, Math.round(Number(variableForm.max) || 1000));
    const step = Math.max(1, Math.round(Number(variableForm.step) || 50));
    const icon = variableForm.icon || 'ShoppingBag';

    if (editingItem) {
      updateState((prev) => ({
        ...prev,
        variableExpenses: prev.variableExpenses.map((item) =>
          item.id === editingItem.id
            ? { ...item, label, subtitle, value, max, step, icon }
            : item
        ),
      }));
      showToast('Slider updated');
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
            enabled: true,
          },
        ],
      }));
      showToast('Slider added');
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
    showToast('Slider removed');
  };

  const handleZeroAllSliders = () => {
    updateState((prev) => ({
      ...prev,
      variableExpenses: prev.variableExpenses.map((item) => ({ ...item, value: 0 })),
    }));
    showToast('All sliders set to 0');
  };

  // Scenarios
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
    showToast(`Saved snapshot "${name}"`);
  };

  const handleLoadScenario = (scenario) => {
    updateState((prev) => ({
      ...prev,
      incomes: JSON.parse(JSON.stringify(scenario.incomes || [])),
      fixedExpenses: JSON.parse(JSON.stringify(scenario.fixedExpenses || [])),
      variableExpenses: JSON.parse(JSON.stringify(scenario.variableExpenses || [])),
    }));
    showToast(`Loaded "${scenario.name}"`);
  };

  const handleDeleteScenario = (id) => {
    updateState((prev) => ({
      ...prev,
      scenarios: prev.scenarios.filter((s) => s.id !== id),
    }));
    showToast('Scenario removed');
  };

  // Copy summary
  const handleCopySummary = async () => {
    const lines = [
      `SAVE4U BUDGET SUMMARY`,
      `────────────────────────────`,
      `Monthly Income: ${formatMoney(totalIncome, currency)}`,
      `Fixed Commitments: ${formatMoney(totalFixed, currency)}`,
      `Adjustable Expenses: ${formatMoney(totalVariable, currency)}`,
      `Total Expenses: ${formatMoney(totalExpenses, currency)} (${rawExpenseRatio.toFixed(1)}%)`,
      `${isSurplus ? 'Monthly Surplus' : 'Monthly Deficit'}: ${formatMoney(surplus, currency)}`,
    ];

    if (variableExpenses.length > 0) {
      lines.push(`\nAdjustable Expenses:`);
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
      showToast('Summary copied to clipboard');
    } catch {
      showToast('Clipboard access unavailable');
    }
  };

  // Export CSV / JSON
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
    link.setAttribute('download', `save4u-budget-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded CSV');
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(appState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `save4u-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded backup');
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
          showToast('Backup restored');
        }
      } catch {
        showToast('Invalid backup file');
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
    showToast('Reset complete. Returned to setup.');
  };

  // ============================================================================
  // FIRST TIME ONBOARDING
  // ============================================================================
  if (!onboarded) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div
          className={`min-h-screen transition-colors duration-300 py-10 px-4 flex flex-col items-center justify-center ${
            darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
        >
          <div className="w-full max-w-md mx-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight">Save4U</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateState({ darkMode: !darkMode })}
                  aria-label="Toggle theme"
                  className={`p-2 rounded-xl border transition-colors ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => completeOnboarding('blank')}
                  className={`text-xs font-medium px-3 py-2 rounded-xl border transition-colors ${
                    darkMode
                      ? 'border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-white'
                  }`}
                >
                  Skip
                </button>
              </div>
            </div>

            {/* Card */}
            <div
              className={`rounded-3xl p-6 sm:p-7 border transition-all ${
                darkMode ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-sm'
              }`}
            >
              {/* Stepper dots */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`h-1 flex-1 rounded-full ${
                    onboardingStep >= 1 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full ${
                    onboardingStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              </div>

              {onboardingStep === 1 ? (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      Currency & Monthly Income
                    </h1>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Private and stored only on your device. You can adjust this anytime.
                    </p>
                  </div>

                  {/* Currency Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Select Currency
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.values(CURRENCIES).map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => setSetupCurrency(curr.code)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            setupCurrency === curr.code
                              ? darkMode
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                                : 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                              : darkMode
                              ? 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-base font-bold font-mono">{curr.symbol}</div>
                          <div className="text-[11px] opacity-75">{curr.code}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Income Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Income Name
                      </label>
                      <input
                        type="text"
                        value={setupIncomeLabel}
                        onChange={(e) => setSetupIncomeLabel(e.target.value)}
                        placeholder="e.g. Monthly Take-Home Salary"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
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
                        placeholder="e.g. 15000"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-base font-bold font-mono outline-none transition-colors ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                            : 'bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-xs"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Choose Starting Layout</h2>
                    <p
                      className={`text-xs mt-1 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Pick how you want to set up your categories:
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => completeOnboarding('standard')}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        darkMode
                          ? 'bg-slate-900/60 border-slate-700 hover:border-emerald-500/60'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-600'
                      }`}
                    >
                      <div className="font-semibold text-sm">Standard Categories (All at 0)</div>
                      <p
                        className={`text-xs mt-0.5 ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Scaffolds common categories (Rent, Utilities, Groceries, Fuel, Savings) ready for you to slide.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => completeOnboarding('blank')}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        darkMode
                          ? 'bg-slate-900/60 border-slate-700 hover:border-emerald-500/60'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-600'
                      }`}
                    >
                      <div className="font-semibold text-sm">Blank Canvas</div>
                      <p
                        className={`text-xs mt-0.5 ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Start completely fresh with 0 bills and 0 sliders.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => completeOnboarding('demo')}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        darkMode
                          ? 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">Sample Demo Plan</div>
                      <p
                        className={`text-xs mt-0.5 ${
                          darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Explore immediately with realistic pre-filled numbers.
                      </p>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
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
  // MAIN DASHBOARD (CLEAN, MINIMAL, UNIFIED)
  // ============================================================================
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div
        className={`min-h-screen transition-colors duration-300 py-6 px-4 sm:px-6 flex flex-col items-center justify-between ${
          darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg bg-slate-900 text-white dark:bg-emerald-600 text-xs font-medium border border-slate-800 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="w-full max-w-lg mx-auto space-y-5">
          {/* 1. Header */}
          <header className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">Save4U</h1>
                <p
                  className={`text-[11px] mt-0.5 ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Monthly Cash Flow
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopySummary}
                title="Copy summary"
                className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('scenarios')}
                title="Saved Scenarios"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  scenarios.length > 0
                    ? darkMode
                      ? 'bg-slate-800 border-emerald-500/40 text-emerald-400'
                      : 'bg-white border-emerald-600/40 text-emerald-700'
                    : darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Plans{scenarios.length > 0 ? ` (${scenarios.length})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  setActiveModal('settings');
                }}
                title="Settings & Data"
                className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => updateState({ darkMode: !darkMode })}
                aria-label="Toggle Dark Mode"
                className={`p-2 rounded-xl border transition-colors ${
                  darkMode
                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Quick Scenario Chips (Shown only if scenarios exist) */}
          {scenarios.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 shrink-0">
                Plan:
              </span>
              {scenarios.map((scen) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => handleLoadScenario(scen)}
                  className={`px-3 py-1 rounded-lg border text-xs font-medium shrink-0 transition-colors ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 shadow-xs'
                  }`}
                >
                  {scen.name}
                </button>
              ))}
            </div>
          )}

          {/* 2. Hero Card: Calm, Clear Surplus & Utilization */}
          <section
            className={`rounded-3xl p-5 sm:p-6 border transition-all ${
              darkMode
                ? isSurplus
                  ? 'bg-slate-800/70 border-slate-700/80'
                  : 'bg-slate-800/70 border-rose-900/60'
                : isSurplus
                ? 'bg-white border-slate-200/90 shadow-sm'
                : 'bg-white border-rose-200 shadow-sm'
            }`}
          >
            {/* Top Row: Label & Status Pill */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {isSurplus ? 'Monthly Surplus' : 'Monthly Deficit'}
              </span>

              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  isSurplus
                    ? darkMode
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : darkMode
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                }`}
              >
                {isSurplus ? 'Within Budget' : 'Over Budget'}
              </span>
            </div>

            {/* Big Surplus Value */}
            <div className="my-1">
              <div
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums ${
                  isSurplus
                    ? darkMode
                      ? 'text-emerald-400'
                      : 'text-emerald-600'
                    : darkMode
                    ? 'text-rose-400'
                    : 'text-rose-600'
                }`}
              >
                {formatMoney(surplus, currency)}
              </div>
              <p
                className={`text-xs mt-1 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {isSurplus
                  ? 'Available for savings, debt payoff, or unallocated reserve.'
                  : 'Planned expenses exceed current monthly income.'}
              </p>
            </div>

            {/* Single Elegant Progress Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span>
                  Expenses:{' '}
                  <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                    {formatMoney(totalExpenses, currency)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIncomeForm({ label: '', amount: '' });
                    setActiveModal('income');
                  }}
                  className="hover:underline text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  Income: {formatMoney(totalIncome, currency)} ✎
                </button>
              </div>

              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  darkMode ? 'bg-slate-700' : 'bg-slate-100'
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSurplus ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                <span>Fixed: {formatMoney(totalFixed, currency)}</span>
                <span>Adjustable: {formatMoney(totalVariable, currency)}</span>
                <span>{rawExpenseRatio.toFixed(0)}% used</span>
              </div>
            </div>
          </section>

          {/* 3. Adjustable Expenses Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Adjustable Expenses
                </h2>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  Total: {formatMoney(totalVariable, currency)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {variableExpenses.length > 0 && totalVariable > 0 && (
                  <button
                    type="button"
                    onClick={handleZeroAllSliders}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                      darkMode
                        ? 'border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Zero All
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openVariableModal(null)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Slider
                </button>
              </div>
            </div>

            {variableExpenses.length === 0 ? (
              <div
                className={`rounded-2xl p-6 border border-dashed text-center ${
                  darkMode ? 'border-slate-700 bg-slate-800/20' : 'border-slate-200 bg-white/50'
                }`}
              >
                <Sliders className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p
                  className={`text-xs max-w-xs mx-auto ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  No adjustable expenses added yet. Add categories like Groceries, Fuel, or Savings to slide and budget.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openVariableModal(null)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
                  >
                    + Add Slider
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const scaffold = createStandardZeroedCategories(totalIncome);
                      updateState((prev) => ({
                        ...prev,
                        variableExpenses: scaffold.variableExpenses,
                      }));
                      showToast('Standard sliders added');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      darkMode
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Add Standard
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
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

          {/* 4. Fixed Monthly Commitments */}
          <footer
            className={`rounded-3xl p-5 border transition-colors ${
              darkMode
                ? 'bg-slate-800/40 border-slate-700/60'
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Fixed Commitments
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono">
                  {formatMoney(totalFixed, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => openFixedModal(null)}
                  className={`p-1 rounded-lg border text-xs font-medium ${
                    darkMode
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Add fixed bill"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {fixedExpenses.length === 0 ? (
              <p
                className={`text-xs py-3 text-center ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                No fixed bills added (e.g. Rent, Bond, Car, Wi-Fi).
              </p>
            ) : (
              <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-700/40">
                {fixedExpenses.map((item) => {
                  const ItemIcon = ICON_MAP[item.icon] || Lock;
                  return (
                    <div
                      key={item.id}
                      className={`py-2.5 flex items-center justify-between gap-3 text-xs ${
                        item.enabled === false ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <span
                          className={`font-medium truncate ${
                            item.enabled === false ? 'line-through' : ''
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-semibold">
                          {formatMoney(item.amount, currency)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleToggleFixed(item.id)}
                            title={item.enabled === false ? 'Enable' : 'Pause'}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                            title="Edit"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFixed(item.id)}
                            title="Delete"
                            className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </footer>
        </div>

        {/* ==================================================================== */}
        {/* MODALS                                                               */}
        {/* ==================================================================== */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div
              className={`w-full max-w-sm rounded-3xl p-5 border shadow-xl max-h-[90vh] overflow-y-auto ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* 1. INCOME MODAL */}
              {activeModal === 'income' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold">Monthly Income</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1 rounded-lg hover:bg-slate-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {incomes.length > 0 && (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {incomes.map((inc) => (
                        <div
                          key={inc.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                            inc.enabled === false ? 'opacity-40' : ''
                          } ${
                            darkMode
                              ? 'bg-slate-900/50 border-slate-700'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-semibold block truncate">{inc.label}</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {formatMoney(inc.amount, currency)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(inc);
                                setIncomeForm({ label: inc.label, amount: String(inc.amount) });
                              }}
                              className="p-1 rounded hover:bg-slate-500/10 text-slate-400"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteIncome(inc.id)}
                              className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAddOrUpdateIncome} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        {editingItem ? 'Edit Income Name' : 'Add Income Stream'}
                      </label>
                      <input
                        type="text"
                        required
                        value={incomeForm.label}
                        onChange={(e) =>
                          setIncomeForm((prev) => ({ ...prev, label: e.target.value }))
                        }
                        placeholder="e.g. Salary, Freelance, Side Hustle"
                        className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Amount ({CURRENCIES[currency].symbol})
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
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold outline-none ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      {editingItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(null);
                            setIncomeForm({ label: '', amount: '' });
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs border border-slate-300 dark:border-slate-600"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        {editingItem ? 'Save Changes' : '+ Add Stream'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. FIXED EXPENSE MODAL */}
              {activeModal === 'fixed' && (
                <form onSubmit={handleSaveFixed} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold">
                      {editingItem ? 'Edit Fixed Bill' : 'New Fixed Commitment'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1 rounded-lg hover:bg-slate-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Bill Name</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={fixedForm.label}
                      onChange={(e) =>
                        setFixedForm((prev) => ({ ...prev, label: e.target.value }))
                      }
                      placeholder="e.g. Rent, Car, Wi-Fi, Insurance"
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
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
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold outline-none ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">Icon</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['Home', 'Car', 'Wifi', 'Smartphone', 'Shield', 'CreditCard'].map((key) => {
                        const IconComp = ICON_MAP[key] || Lock;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFixedForm((prev) => ({ ...prev, icon: key }))}
                            className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                              fixedForm.icon === key
                                ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : darkMode
                                ? 'border-slate-700 bg-slate-900 text-slate-400'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
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
                      className="px-3 py-1.5 rounded-xl text-xs border border-slate-300 dark:border-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Save Bill
                    </button>
                  </div>
                </form>
              )}

              {/* 3. VARIABLE SLIDER MODAL */}
              {activeModal === 'variable' && (
                <form onSubmit={handleSaveVariable} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold">
                      {editingItem ? 'Edit Slider' : 'New Adjustable Slider'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1 rounded-lg hover:bg-slate-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

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
                      placeholder="e.g. Groceries, Fuel, Entertainment"
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Subtitle (optional)</label>
                    <input
                      type="text"
                      value={variableForm.subtitle}
                      onChange={(e) =>
                        setVariableForm((prev) => ({ ...prev, subtitle: e.target.value }))
                      }
                      placeholder="e.g. Supermarket food, household"
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Current Value ({CURRENCIES[currency].symbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={variableForm.value}
                        onChange={(e) =>
                          setVariableForm((prev) => ({ ...prev, value: e.target.value }))
                        }
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold outline-none ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Max Cap ({CURRENCIES[currency].symbol})
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={variableForm.max}
                        onChange={(e) =>
                          setVariableForm((prev) => ({ ...prev, max: e.target.value }))
                        }
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold outline-none ${
                          darkMode
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">Icon</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['ShoppingBag', 'Fuel', 'PiggyBank', 'Sparkles', 'Utensils', 'HeartPulse'].map((key) => {
                        const IconComp = ICON_MAP[key] || Sliders;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setVariableForm((prev) => ({ ...prev, icon: key }))}
                            className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                              variableForm.icon === key
                                ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : darkMode
                                ? 'border-slate-700 bg-slate-900 text-slate-400'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
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
                      className="px-3 py-1.5 rounded-xl text-xs border border-slate-300 dark:border-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Save Slider
                    </button>
                  </div>
                </form>
              )}

              {/* 4. SCENARIOS MODAL */}
              {activeModal === 'scenarios' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold">Saved Budget Plans</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1 rounded-lg hover:bg-slate-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    Save snapshots of your budget (e.g. &ldquo;Base Plan&rdquo;, &ldquo;Lean Month&rdquo;) to compare anytime.
                  </p>

                  <form onSubmit={handleSaveScenario} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      placeholder="Name this snapshot..."
                      className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none ${
                        darkMode
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                    >
                      Save
                    </button>
                  </form>

                  {scenarios.length > 0 ? (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 pt-1">
                      {scenarios.map((scen) => (
                        <div
                          key={scen.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                            darkMode
                              ? 'bg-slate-900/50 border-slate-700'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="font-semibold truncate">{scen.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                handleLoadScenario(scen);
                                setActiveModal(null);
                              }}
                              className="px-2 py-1 rounded bg-emerald-600 text-white text-[11px] font-medium"
                            >
                              Load
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteScenario(scen.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center py-4 text-slate-400">
                      No saved plans yet.
                    </p>
                  )}
                </div>
              )}

              {/* 5. SETTINGS & DATA MODAL */}
              {activeModal === 'settings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold">Settings & Data</h3>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="p-1 rounded-lg hover:bg-slate-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Currency switcher */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Currency
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.values(CURRENCIES).map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            updateState({ currency: curr.code });
                            showToast(`Currency changed to ${curr.code}`);
                          }}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            currency === curr.code
                              ? 'border-emerald-600 bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400'
                              : darkMode
                              ? 'border-slate-700 bg-slate-900/50'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="text-sm font-bold font-mono">{curr.symbol}</div>
                          <div className="text-[10px] opacity-75">{curr.code}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Backup / Export */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Backup & Export
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-medium ${
                          darkMode
                            ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-900'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportJSON}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-medium ${
                          darkMode
                            ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-900'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                        <span>Backup JSON</span>
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
                      className={`w-full p-2.5 rounded-xl border text-center flex items-center justify-center gap-2 text-xs font-medium ${
                        darkMode
                          ? 'bg-slate-900/30 border-slate-700 hover:bg-slate-900'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-400" />
                      <span>Restore from JSON</span>
                    </button>
                  </div>

                  {/* Reset */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-rose-500 mb-2">
                      Reset
                    </label>
                    {!confirmReset ? (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="w-full p-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Data & Return to Setup
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl border border-rose-500 bg-rose-500/10 space-y-2">
                        <p className="text-xs font-medium text-rose-500">
                          Clear all local budget data and return to setup?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleFactoryReset}
                            className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                          >
                            Yes, Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="flex-1 py-1.5 rounded-lg border border-slate-500 text-xs font-medium"
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
