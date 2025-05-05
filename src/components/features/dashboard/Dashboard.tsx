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
        className="relative mb-8 text-center p-4 backdrop-filter backdrop-blur-sm rounded-2xl overflow-hidden border dark:border-gray-700/50 border-gray-200/70"
        variants={cardVariants}
        whileHover={{ scale: 1.01 }}
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {format(selectedMonth, "MMMM yyyy")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Financial Summary
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-xl z-0" />
        <div className="absolute -left-8 -top-8 w-32 h-32 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-xl z-0" />
      </motion.div>
      
      {/* Total Balance Highlight Card */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600/90 to-violet-600/90 dark:from-indigo-800/90 dark:to-violet-900/90 p-8 rounded-3xl shadow-lg border border-indigo-300/20 dark:border-indigo-700/20 backdrop-filter backdrop-blur-md mb-8 text-white"
        variants={cardVariants}
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)"
        }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-xl font-semibold text-white/90 mb-2">Total Balance</h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              {formatIndianCurrency(banks.reduce((sum, bank) => sum + Number(bank.balance), 0))}
            </p>
            <div className="mt-4 flex items-center text-sm">
              {balanceChange.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1 text-green-300" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1 text-red-300" />
              )}
              <span className={`font-medium ${balanceChange.isPositive ? "text-green-300" : "text-red-300"}`}>
                {balanceChange.isPositive ? '+' : '-'}{balanceChange.value}%
              </span>
              <span className="ml-1 text-white/70">from last month</span>
            </div>
          </div>
          <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md">
            <Wallet className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 relative z-10">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-white/40"></div>
              <div>
                <p className="text-sm font-medium text-white/80">{bank.name}</p>
                <p className="text-lg font-semibold text-white">{formatIndianCurrency(bank.balance)}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl z-0" />
        <div className="absolute -left-12 -top-16 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl z-0" />
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/40 dark:to-gray-800/20 p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mt-1">
                {formatIndianCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-400/30 to-green-500/30 dark:from-emerald-400/20 dark:to-emerald-600/20 rounded-2xl shadow-inner">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs relative z-10">
            {incomeChange.isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1 text-emerald-500" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1 text-rose-500" />
            )}
            <span className={`font-medium ${incomeChange.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {incomeChange.isPositive ? '+' : '-'}{incomeChange.value}%
            </span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-xl z-0" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-xl z-0" />
        </motion.div>

        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/40 dark:to-gray-800/20 p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent mt-1">
                {formatIndianCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-rose-400/30 to-red-500/30 dark:from-rose-400/20 dark:to-rose-600/20 rounded-2xl shadow-inner">
              <TrendingDown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs relative z-10">
            {/* For expenses, increasing is bad (red), decreasing is good (green) */}
            {expensesChange.isPositive ? (
              <ArrowUp className="h-3 w-3 mr-1 text-rose-500" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1 text-emerald-500" />
            )}
            <span className={`font-medium ${expensesChange.isPositive ? "text-rose-500" : "text-emerald-500"}`}>
              {expensesChange.isPositive ? '+' : '-'}{expensesChange.value}%
            </span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-400/10 dark:bg-rose-600/10 rounded-full blur-xl z-0" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-red-400/10 dark:bg-red-600/10 rounded-full blur-xl z-0" />
        </motion.div>

        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/40 dark:to-gray-800/20 p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Savings</p>
              <p className={`text-2xl font-bold mt-1 ${
                netSavings >= 0 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent" 
                  : "bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent"
              }`}>
                {formatIndianCurrency(netSavings)}
              </p>
            </div>
            <div className={`p-3 rounded-2xl shadow-inner ${
              netSavings >= 0 
                ? "bg-gradient-to-br from-emerald-400/30 to-teal-500/30 dark:from-emerald-400/20 dark:to-teal-600/20" 
                : "bg-gradient-to-br from-rose-400/30 to-pink-500/30 dark:from-rose-400/20 dark:to-pink-600/20"
            }`}>
              <PiggyBank className={`h-6 w-6 ${
                netSavings >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-rose-600 dark:text-rose-400"
              }`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs relative z-10">
            {netSavingsChange.isPositive ? (
              <>
                <ArrowUp className="h-3 w-3 mr-1 text-emerald-500" />
                <span className="text-emerald-500 font-medium">+{netSavingsChange.value}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3 w-3 mr-1 text-rose-500" />
                <span className="text-rose-500 font-medium">-{netSavingsChange.value}%</span>
              </>
            )}
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-teal-400/10 dark:bg-teal-600/10 rounded-full blur-xl z-0" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-xl z-0" />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Monthly Income vs Expenses Chart */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/40 dark:to-gray-800/20 p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.01,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 h-5 w-1 rounded-full mr-2" />
            Income vs Expenses
          </h3>
          <div className="h-80">
            <AnimatedChart
              data={monthlyTrendData}
              type="bar"
              dataKeys={["income", "expense"]}
              colors={["#10B981", "#F43F5E"]}
              isDarkMode={document.documentElement.classList.contains('dark')}
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-2xl z-0" />
          <div className="absolute -left-12 -top-12 w-32 h-32 bg-cyan-400/10 dark:bg-cyan-600/10 rounded-full blur-2xl z-0" />
        </motion.div>

        {/* Top Spending Categories Chart */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/40 dark:to-gray-800/20 p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.01,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="bg-gradient-to-r from-purple-500 to-pink-400 h-5 w-1 rounded-full mr-2" />
            Top Spending Categories
          </h3>
          <div className="h-80">
            <AnimatedChart
              data={categoryChartData}
              type="bar"
              dataKeys={["value"]}
              colors={categoryChartData.map(item => item.color)}
              isDarkMode={document.documentElement.classList.contains('dark')}
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-2xl z-0" />
          <div className="absolute -left-12 -top-12 w-32 h-32 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-2xl z-0" />
        </motion.div>
      </div>

      {/* Recent Transactions Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-white/30 to-white/10 dark:from-gray-800/40 dark:to-gray-800/20 p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-filter backdrop-blur-md mb-8"
        variants={cardVariants}
        whileHover={{ 
          scale: 1.005,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
        }}
      >
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-indigo-500 to-blue-400 h-5 w-1 rounded-full mr-2" />
            Recent Transactions
          </h3>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-sm hover:from-indigo-600 hover:to-blue-600 transition-all duration-200">
            View All
          </button>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700/50">
                <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{transaction.description}</span>
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    {transaction.category_id && (
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: categories.find(c => c.id === transaction.category_id)?.color || '#6366F1' 
                          }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {categories.find(c => c.id === transaction.category_id)?.name || 'Uncategorized'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                  </td>
                  <td className="py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : transaction.type === 'expense'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-indigo-600 dark:text-indigo-400'
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
        
        {/* Decorative elements */}
        <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-2xl z-0" />
        <div className="absolute -left-12 -top-12 w-40 h-40 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-2xl z-0" />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
