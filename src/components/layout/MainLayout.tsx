import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, Tag, Wallet, Settings, Moon, Sun, Menu, 
  PiggyBank, ArrowUpDown, Target, BarChart3, Search, Bell
} from "lucide-react";
import AnimatedSidebar from './AnimatedSidebar';
import { useTheme } from '../../providers/ThemeProvider';
import { useLayout } from '../../providers/LayoutProvider';
import { useData } from '../../providers/DataProvider';
import DashboardPage from '../../routes/dashboard/DashboardPage';
import AccountsPage from '../../routes/accounts/AccountsPage';
import BudgetsPage from '../../routes/budgets/BudgetsPage';
import CategoriesPage from '../../routes/categories/CategoriesPage';
import GoalsPage from '../../routes/goals/GoalsPage';
import InvestmentsPage from '../../routes/investments/InvestmentsPage';
import ReportsPage from '../../routes/reports/ReportsPage';
import TransactionsPage from '../../routes/transactions/TransactionsPage';
import CompactMonthSelector from '../ui/CompactMonthSelector';

const MainLayout: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen } = useLayout();
  const { loading, formatIndianCurrency, banks, transactions, loadBanks } = useData();
  const [totalBalance, setTotalBalance] = useState(0);

  // Month selector state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const calculateTotalBalance = () => {
      const total = banks.reduce((sum, bank) => sum + bank.balance, 0);
      setTotalBalance(total);
    };

    calculateTotalBalance();
  }, [banks]);

  useEffect(() => {
    loadBanks();
    const refreshInterval = setInterval(() => {
      loadBanks();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [loadBanks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Settings className="h-5 w-5" /> },
    { id: "accounts", label: "Accounts", icon: <Wallet className="h-5 w-5" /> },
    { id: "transactions", label: "Transactions", icon: <ArrowUpDown className="h-5 w-5" /> },
    { id: "categories", label: "Categories", icon: <Tag className="h-5 w-5" /> },
    { id: "budgets", label: "Budgets", icon: <PiggyBank className="h-5 w-5" /> },
    { id: "goals", label: "Goals", icon: <Target className="h-5 w-5" /> },
    { id: "investments", label: "Investments", icon: <TrendingUp className="h-5 w-5" /> },
    { id: "reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
  ];

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
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-30">
          <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 mr-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
                <PiggyBank className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">FinTrack</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search..."
                  className="py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>

              <button
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <AnimatedSidebar
            items={navItems.map((item) => ({
              id: item.id,
              label: item.label,
              icon: item.icon,
              isActive: item.id === activeTab,
              onClick: (id) => {
                setActiveTab(id as any);
                setMobileMenuOpen(false);
              }
            }))}
            activeId={activeTab}
            onItemClick={(id) => {
              setActiveTab(id as any);
              setMobileMenuOpen(false);
            }}
            isOpen={mobileMenuOpen}
            darkMode={darkMode}
            className="z-30"
            totalBalance={totalBalance}
            formatIndianCurrency={formatIndianCurrency}
          >
            <div className="mb-2">
              <CompactMonthSelector
                selectedMonth={selectedMonth}
                onChange={setSelectedMonth}
                darkMode={darkMode}
              />
            </div>
          </AnimatedSidebar>

          <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
            {renderContent()}
          </main>
        </div>

        {mobileMenuOpen && (
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;