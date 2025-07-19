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
  Moon 
} from 'lucide-react';
import { format } from 'date-fns';

import { useTheme } from '../../providers/ThemeProvider';
import { useLayout } from '../../providers/LayoutProvider';
import AnimatedSidebar from './AnimatedSidebar';
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

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'accounts', label: 'Accounts', icon: <Wallet size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <ArrowUpDown size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Tag size={20} /> },
    { id: 'budgets', label: 'Budgets', icon: <PiggyBank size={20} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
    { id: 'investments', label: 'Investments', icon: <TrendingUp size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabType);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage selectedMonth={selectedMonth} />;
      case 'accounts':
        return <AccountsPage />;
      case 'transactions':
        return <TransactionsPage selectedMonth={selectedMonth} />;
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
    <div className={`min-h-screen animated-bg relative ${
      darkMode ? 'dark' : ''
    }`}>
      {/* Floating orbs background */}
      <div className="floating-orbs">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
      </div>
      
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-30 border-b border-gray-200/50 dark:border-white/10 
                   bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/15 
                         text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                         border border-gray-200/50 dark:border-white/20 backdrop-blur-xl transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-3 rounded-xl shadow-lg neon-primary">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gradient-hero">
                  FinTrack
                </h1>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Personal Finance Manager
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div 
              className="hidden sm:block px-4 py-2 rounded-xl text-sm font-semibold 
                         bg-white/80 dark:bg-white/10 border border-gray-200/50 dark:border-white/20 
                         text-gray-700 dark:text-gray-200 backdrop-blur-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {format(selectedMonth, 'MMMM yyyy')}
            </motion.div>
            
            <motion.button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl transition-all duration-300 border 
                         bg-white/80 dark:bg-white/10 border-gray-200/50 dark:border-white/20 
                         text-gray-600 dark:text-yellow-400 hover:bg-white/90 dark:hover:bg-white/15 
                         backdrop-blur-xl hover:scale-105 hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          className={`fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AnimatedSidebar
            items={sidebarItems}
            activeId={activeTab}
            onItemClick={handleTabChange}
            isOpen={mobileMenuOpen}
            darkMode={darkMode}
            className="h-[calc(100vh-5rem)] border-r border-gray-200/50 dark:border-white/10 
                       bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl"
          >
            <CompactMonthSelector
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
              darkMode={darkMode}
            />
          </AnimatedSidebar>
        </motion.div>

        {/* Main Content */}
        <motion.main 
          className="flex-1 p-6 overflow-auto main-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default MainLayout;