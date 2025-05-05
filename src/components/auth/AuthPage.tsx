import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PiggyBank } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot-password';

const AuthPage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
              <PiggyBank className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">FinTrack</span>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 sm:p-10">
            <AnimatePresence mode="wait">
              {currentView === 'login' && (
                <LoginForm
                  key="login"
                  onSwitchToSignup={() => setCurrentView('signup')}
                  onForgotPassword={() => setCurrentView('forgot-password')}
                />
              )}
              {currentView === 'signup' && (
                <SignupForm
                  key="signup"
                  onSwitchToLogin={() => setCurrentView('login')}
                />
              )}
              {currentView === 'forgot-password' && (
                <ForgotPasswordForm
                  key="forgot-password"
                  onBack={() => setCurrentView('login')}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage; 