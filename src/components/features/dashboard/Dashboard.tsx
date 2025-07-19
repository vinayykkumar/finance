import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Wallet, PiggyBank, TrendingUp, TrendingDown } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import AnimatedChart from "../../../components/ui/AnimatedChart"
import { Category as CategoryType } from "../../../types"

interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: "expense" | "income" | "transfer"
  category_id?: string
  bank_id: string
  to_bank_id?: string
  user_id?: string
  created_at: string
}

interface Bank {
  id: string
  name: string
  balance: number
  user_id?: string
  created_at: string
}

interface DashboardProps {
  transactions: Transaction[]
  categories: CategoryType[]
  banks: Bank[]
  selectedMonth: Date
  formatIndianCurrency: (amount: number) => string
}

const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  categories,
  banks,
  selectedMonth,
  formatIndianCurrency,
}) => {
  // Filter transactions for the selected month
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return (
      transactionDate.getMonth() === selectedMonth.getMonth() &&
      transactionDate.getFullYear() === selectedMonth.getFullYear()
    )
  })

  // Calculate total income and expenses for the current month
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netSavings = totalIncome - totalExpenses
  
  // Get previous month's date
  const previousMonth = subMonths(selectedMonth, 1)
  
  // Filter transactions for the previous month
  const previousMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    return (
      transactionDate.getMonth() === previousMonth.getMonth() &&
      transactionDate.getFullYear() === previousMonth.getFullYear()
    )
  })
  
  // Calculate previous month's income, expenses, and net savings
  const previousMonthIncome = previousMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
    
  const previousMonthExpenses = previousMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
    
  const previousMonthNetSavings = previousMonthIncome - previousMonthExpenses
  
  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number): { value: number, isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true }
    
    const change = ((current - previous) / previous) * 100
    return { 
      value: Math.abs(Math.round(change * 10) / 10), // Round to 1 decimal place and get absolute value
      isPositive: change >= 0
    }
  }
  
  const incomeChange = calculatePercentageChange(totalIncome, previousMonthIncome)
  const expensesChange = calculatePercentageChange(totalExpenses, previousMonthExpenses)
  const netSavingsChange = calculatePercentageChange(netSavings, previousMonthNetSavings)
  
  // Calculate balance change based on the previous 2 months of transactions
  const currentBalance = banks.reduce((sum, bank) => sum + bank.balance, 0)
  
  // Estimate previous month's balance by subtracting current month's net change
  const currentMonthNetChange = totalIncome - totalExpenses
  const estimatedPreviousBalance = currentBalance - currentMonthNetChange
  
  const balanceChange = calculatePercentageChange(currentBalance, estimatedPreviousBalance)

  // Get category spending data for the month
  const categorySpending = filteredTransactions
    .filter((t) => t.type === "expense" && t.category_id)
    .reduce((acc, transaction) => {
      const categoryId = transaction.category_id
      if (!categoryId) return acc

      if (!acc[categoryId]) {
        acc[categoryId] = 0
      }
      acc[categoryId] += transaction.amount
      return acc
    }, {} as Record<string, number>)

  // Prepare data for category spending chart
  const categoryChartData = Object.entries(categorySpending)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        name: category?.name || "Uncategorized",
        value: amount,
        color: category?.color || "#6366F1",
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 categories

  // Prepare data for monthly spending trend chart
  const monthlyTrendData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(selectedMonth, 5 - i)
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    
    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date >= monthStart && date <= monthEnd
    })
    
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      name: format(month, "MMM"),
      income,
      expense,
    }
  })

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Month Display at Top */}
      <motion.div 
        className="relative mb-8 text-center p-8 card-glass"
        variants={cardVariants}
      >
        <div>
          <h2 className="text-3xl font-black text-gradient-hero">
            {format(selectedMonth, "MMMM yyyy")}
          </h2>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-3">
            Financial Summary
          </p>
        </div>
      </motion.div>
      
      {/* Total Balance Highlight Card */}
      <motion.div 
        className="card-hero mb-8 neon-primary"
        variants={cardVariants}
        whileHover={{ 
          scale: 1.01,
          y: -4,
          boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.4)"
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white/90 mb-3">Total Balance</h2>
            <p className="text-5xl font-black text-white mb-2">
              {formatIndianCurrency(banks.reduce((sum, bank) => sum + Number(bank.balance), 0))}
            </p>
            <div className="flex items-center text-sm font-medium">
              {balanceChange.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1 text-white/80" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1 text-white/80" />
              )}
              <span className="font-bold text-white/90">
                {balanceChange.isPositive ? '+' : '-'}{balanceChange.value}%
              </span>
              <span className="ml-2 text-white/70">from last month</span>
            </div>
          </div>
          <div className="p-5 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
            <Wallet className="h-14 w-14 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white/15 backdrop-blur-sm p-4 rounded-xl flex items-center gap-3 border border-white/20">
              <div className="w-1 h-10 rounded-full bg-white/70"></div>
              <div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wide">{bank.name}</p>
                <p className="text-lg font-black text-white">{formatIndianCurrency(bank.balance)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="card-pixelbin p-8 glow-success"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.02,
            y: -4
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Total Income</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                {formatIndianCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-4 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium">
            {incomeChange.isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1 text-emerald-500" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
            )}
            <span className={`font-bold ${incomeChange.isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {incomeChange.isPositive ? '+' : '-'}{incomeChange.value}%
            </span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="card-pixelbin p-8 glow-danger"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.02,
            y: -4
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Total Expenses</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">
                {formatIndianCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-4 bg-red-100/80 dark:bg-red-900/30 rounded-2xl border border-red-200/50 dark:border-red-700/50">
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium">
            {/* For expenses, increasing is bad (red), decreasing is good (green) */}
            {expensesChange.isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1 text-red-500" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1 text-emerald-500" />
            )}
            <span className={`font-bold ${expensesChange.isPositive ? "text-red-600" : "text-emerald-600"}`}>
              {expensesChange.isPositive ? '+' : '-'}{expensesChange.value}%
            </span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>

        <motion.div 
          className={`card-pixelbin p-8 ${netSavings >= 0 ? 'glow-success' : 'glow-danger'}`}
          variants={cardVariants}
          whileHover={{ 
            scale: 1.02,
            y: -4
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Net Savings</p>
              <p className={`text-3xl font-black mt-2 ${
                netSavings >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatIndianCurrency(netSavings)}
              </p>
            </div>
            <div className={`p-4 rounded-2xl border ${
              netSavings >= 0 
                ? "bg-emerald-100/80 dark:bg-emerald-900/30 border-emerald-200/50 dark:border-emerald-700/50" 
                : "bg-red-100/80 dark:bg-red-900/30 border-red-200/50 dark:border-red-700/50"
            }`}>
              <PiggyBank className={`h-8 w-8 ${
                netSavings >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              }`} />
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium">
            {netSavingsChange.isPositive ? (
              <>
                <ArrowUp className="h-4 w-4 mr-1 text-emerald-500" />
                <span className="text-emerald-600 font-bold">+{netSavingsChange.value}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-red-600 font-bold">-{netSavingsChange.value}%</span>
              </>
            )}
            <span className="ml-2 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Monthly Income vs Expenses Chart */}
        <motion.div 
          className="card-pixelbin p-8"
          variants={cardVariants}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-sky-500 to-blue-500 h-5 w-1.5 rounded-full mr-4" />
            Income vs Expenses
          </h3>
          <div className="h-80 p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl">
            <AnimatedChart
              data={monthlyTrendData}
              type="bar"
              dataKeys={["income", "expense"]}
              colors={["#10B981", "#F43F5E"]}
              isDarkMode={document.documentElement.classList.contains('dark')}
            />
          </div>
        </motion.div>

        {/* Top Spending Categories Chart */}
        <motion.div 
          className="card-pixelbin p-8"
          variants={cardVariants}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 h-5 w-1.5 rounded-full mr-4" />
            Top Spending Categories
          </h3>
          <div className="h-80 p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl">
            <AnimatedChart
              data={categoryChartData}
              type="bar"
              dataKeys={["value"]}
              colors={categoryChartData.map(item => item.color)}
              isDarkMode={document.documentElement.classList.contains('dark')}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions Section */}
      <motion.div 
        className="card-pixelbin p-8 mb-8"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-sky-500 to-blue-500 h-5 w-1.5 rounded-full mr-4" />
            Recent Transactions
          </h3>
          <button className="btn-primary text-sm">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-white/10">
                <th className="pb-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="pb-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="pb-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="pb-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100/50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-300">
                  <td className="py-5 whitespace-nowrap">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{transaction.description}</span>
                  </td>
                  <td className="py-5 whitespace-nowrap">
                    {transaction.category_id && (
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3 shadow-sm" 
                          style={{ 
                            backgroundColor: categories.find(c => c.id === transaction.category_id)?.color || '#6366F1' 
                          }}
                        />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {categories.find(c => c.id === transaction.category_id)?.name || 'Uncategorized'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                  </td>
                  <td className="py-5 whitespace-nowrap text-right">
                    <span className={`text-sm font-bold ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : transaction.type === 'expense'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-cyan-600 dark:text-cyan-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                      {formatIndianCurrency(transaction.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
