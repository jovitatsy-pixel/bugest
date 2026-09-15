import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Budget } from './pages/Budget';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import type { ActivePage } from './types';
import { Wallet } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/20 animate-pulse mb-4">
          <Wallet size={28} />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-400">
          Loading SpendSmart...
        </p>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const renderActivePage = (props: any) => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard {...props} />;
      case 'expenses':
        return <Expenses {...props} />;
      case 'budget':
        return <Budget {...props} />;
      case 'analytics':
        return <Analytics {...props} />;
      case 'profile':
        return <Profile {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <ExpenseProvider>
      <AppLayout activePage={activePage} setActivePage={setActivePage}>
        {(actions) => renderActivePage({ ...actions, setActivePage })}
      </AppLayout>
    </ExpenseProvider>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
