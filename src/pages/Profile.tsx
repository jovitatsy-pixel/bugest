import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useExpenses } from '../contexts/ExpenseContext';
import {
  User,
  Mail,
  Moon,
  Sun,
  LogOut,
  Save,
  CheckCircle2,
  Database,
  Coins,
  ShieldCheck,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { profile, user, updateProfile, logout, isDemo, isSupabaseConnected } = useAuth();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, expenses } = useExpenses();

  const [fullName, setFullName] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDailyBudget(profile.daily_budget.toString());
      setMonthlyBudget(profile.monthly_budget.toString());
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const dVal = parseFloat(dailyBudget);
    const mVal = parseFloat(monthlyBudget);

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be empty');
      return;
    }

    if (isNaN(dVal) || dVal <= 0 || isNaN(mVal) || mVal <= 0) {
      setErrorMsg('Budgets must be valid positive numbers');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      daily_budget: dVal,
      monthly_budget: mVal,
    });
    setIsSaving(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Profile settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const currencies = [
    { symbol: '₹', label: 'INR (₹) - Indian Rupee' },
    { symbol: '$', label: 'USD ($) - US Dollar' },
    { symbol: '€', label: 'EUR (€) - Euro' },
    { symbol: '£', label: 'GBP (£) - British Pound' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profile & Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal details, budget preferences, theme, and backend settings
        </p>
      </div>

      {/* User Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {fullName || 'SpendSmart User'}
              </h3>
              {isDemo ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Guest Demo
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Supabase User
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Mail size={13} />
              <span>{user?.email || profile?.email || 'guest@spendsmart.app'}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {expenses.length} total expense records logged
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 py-2 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Edit Profile & Budget Limits Form */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={18} className="text-brand-600 dark:text-brand-400" />
          <span>Edit Name & Default Budgets</span>
        </h3>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Daily Budget ({currency})
              </label>
              <input
                type="number"
                min="1"
                required
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Monthly Budget ({currency})
              </label>
              <input
                type="number"
                min="1"
                required
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile & Budgets'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* App Preferences & Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Appearance Mode */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>Appearance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Toggle between modern dark fintech mode and clean bright light mode.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sun size={16} />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-brand-500 bg-slate-800 text-brand-300 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Moon size={16} />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Coins size={18} className="text-amber-500" />
              <span>Display Currency</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select your preferred currency symbol for expense tracking and alerts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {currencies.map((curr) => (
              <button
                key={curr.symbol}
                type="button"
                onClick={() => setCurrency(curr.symbol)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  currency === curr.symbol
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {curr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Supabase Database Connection Details */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Backend & Supabase Connection</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSupabaseConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {isSupabaseConnected ? 'Connected to Supabase' : 'Offline / Guest Mode'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSupabaseConnected
                ? 'Your account and expenses are safely synced to your Supabase PostgreSQL database with Row Level Security.'
                : 'Using browser LocalStorage. To connect your real cloud database, provide your Supabase keys in .env.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Row Level Security (RLS) Ready</span>
          </p>
          <p>
            A ready-to-run migration script is provided in{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
              supabase/schema.sql
            </code>{' '}
            with tables for <code className="font-mono">profiles</code> and{' '}
            <code className="font-mono">expenses</code>, automated triggers for user creation, and RLS policies ensuring users can only read and write their own data.
          </p>
        </div>
      </div>
    </div>
  );
};
