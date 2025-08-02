import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpDown, 
  Tag, 
  PiggyBank, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

import { useTheme } from '../../providers/ThemeProvider';
import { useLayout } from '../../providers/LayoutProvider';
import CompactMonthSelector from '../ui/CompactMonthSelector';

// Import page components
import DashboardPage from '../../routes/dashboard/DashboardPage';
import AccountsPage from '../../routes/accounts/AccountsPage';
import TransactionsPage from '../../routes/transactions/TransactionsPage';
import CategoriesPage from '../../routes/categories/CategoriesPage';
import BudgetsPage from '../../routes/budgets/BudgetsPage';
import GoalsPage from '../../routes/goals/GoalsPage';
import InvestmentsPage from '../../routes/investments/InvestmentsPage';
import ReportsPage from '../../routes/reports/ReportsPage';

import { TabType } from '../../types';

const MainLayout: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen } = useLayout();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const navigationItems = [
    { id: 'accounts', label: 'Accounts', icon: <Wallet size={18} /> },
    { id: 'transactions', label: 'Transactions', icon: <ArrowUpDown size={18} /> },
    { id: 'categories', label: 'Categories', icon: <Tag size={18} /> },
    { id: 'budgets', label: 'Budgets', icon: <PiggyBank size={18} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={18} /> },
    { id: 'investments', label: 'Investments', icon: <TrendingUp size={18} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabType);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage selectedMonth={selectedMonth} />;
      case 'accounts':
        return <AccountsPage />;
      case 'transactions':
        return <TransactionsPage selectedMonth={selectedMonth} searchQuery={globalSearchQuery} />;
      case 'categories':
        return <CategoriesPage />;
      case 'budgets':
        return <BudgetsPage selectedMonth={selectedMonth} />;
      case 'goals':
        return <GoalsPage />;
      case 'investments':
        return <InvestmentsPage />;
      case 'reports':
        return <ReportsPage selectedMonth={selectedMonth} />;
      default:
        return <DashboardPage selectedMonth={selectedMonth} />;
    }
  };

  return (
    <div className={`min-h-screen relative ${darkMode ? 'dark' : ''}`}>
      {/* Floating orbs background */}
      <div className="floating-orbs">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
      </div>
      
      {/* Animated background */}
      <div className="fixed inset-0 animated-bg -z-10" />
      
      {/* Top Navigation Header */}
      <motion.header 
        className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-1.5 rounded-lg">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                FinTrack
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav 
              className="hidden lg:flex items-center gap-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {navigationItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === item.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon}
                  <span className="hidden xl:inline text-xs">{item.label}</span>
                </motion.button>
              ))}
            </motion.nav>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Month Selector */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowMonthSelector(!showMonthSelector)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium 
                           text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white 
                           hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {format(selectedMonth, 'MMM yyyy')}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showMonthSelector ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Month Selector Dropdown */}
                <AnimatePresence>
                  {showMonthSelector && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 w-80 z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-xl">
                        <CompactMonthSelector
                          selectedMonth={selectedMonth}
                          onChange={(month) => {
                            setSelectedMonth(month);
                            setShowMonthSelector(false);
                          }}
                          darkMode={darkMode}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-lg transition-all duration-200
                         text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white 
                         hover:bg-gray-100 dark:hover:bg-gray-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg 
                         text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white 
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {navigationItems.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                      {item.label}
                    </motion.button>
                  ))}
                </div>
                
                {/* Mobile Month Selector */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <CompactMonthSelector
                    selectedMonth={selectedMonth}
                    onChange={setSelectedMonth}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="relative z-10 min-h-[calc(100vh-3.5rem)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Click outside to close month selector */}
      {showMonthSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMonthSelector(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;