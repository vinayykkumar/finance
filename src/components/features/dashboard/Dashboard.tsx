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
        className="relative mb-8 text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
        variants={cardVariants}
      >
        <div>
          <h2 className="text-2xl font-bold text-gradient-primary">
            {format(selectedMonth, "MMMM yyyy")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Financial Summary
          </p>
        </div>
      </motion.div>
      
      {/* Total Balance Highlight Card */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 p-8 rounded-xl shadow-lg glow-primary mb-8 text-white"
        variants={cardVariants}
        whileHover={{ 
          scale: 1.005,
          boxShadow: "0 20px 40px -12px rgba(6, 182, 212, 0.4)"
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white/90 mb-2">Total Balance</h2>
            <p className="text-4xl font-bold text-white">
              {formatIndianCurrency(banks.reduce((sum, bank) => sum + Number(bank.balance), 0))}
            </p>
            <div className="mt-4 flex items-center text-sm">
              {balanceChange.isPositive ? (
                <ArrowUp className="h-4 w-4 mr-1 text-white/80" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1 text-white/80" />
              )}
              <span className="font-medium text-white/80">
                {balanceChange.isPositive ? '+' : '-'}{balanceChange.value}%
              </span>
              <span className="ml-1 text-white/60">from last month</span>
            </div>
          </div>
          <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
            <Wallet className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          {banks.map((bank) => (
            <div key={bank.id} className="bg-white/15 backdrop-blur-sm p-3 rounded-lg flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-white/60"></div>
              <div>
                <p className="text-xs font-medium text-white/80">{bank.name}</p>
                <p className="text-lg font-semibold text-white">{formatIndianCurrency(bank.balance)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.01,
            y: -2
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatIndianCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {incomeChange.isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1 text-emerald-500" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
            )}
            <span className={`font-medium ${incomeChange.isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {incomeChange.isPositive ? '+' : '-'}{incomeChange.value}%
            </span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.01,
            y: -2
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatIndianCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {/* For expenses, increasing is bad (red), decreasing is good (green) */}
            {expensesChange.isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1 text-red-500" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1 text-emerald-500" />
            )}
            <span className={`font-medium ${expensesChange.isPositive ? "text-red-600" : "text-emerald-600"}`}>
              {expensesChange.isPositive ? '+' : '-'}{expensesChange.value}%
            </span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.01,
            y: -2
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Net Savings</p>
              <p className={`text-2xl font-bold mt-1 ${
                netSavings >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatIndianCurrency(netSavings)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              netSavings >= 0 
                ? "bg-emerald-100 dark:bg-emerald-900/30" 
                : "bg-red-100 dark:bg-red-900/30"
            }`}>
              <PiggyBank className={`h-6 w-6 ${
                netSavings >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              }`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {netSavingsChange.isPositive ? (
              <>
                <ArrowUp className="h-4 w-4 mr-1 text-emerald-500" />
                <span className="text-emerald-600 font-medium">+{netSavingsChange.value}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-1 text-red-500" />
                <span className="text-red-600 font-medium">-{netSavingsChange.value}%</span>
              </>
            )}
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Monthly Income vs Expenses Chart */}
        <motion.div 
          className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 w-1 rounded-full mr-3" />
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
        </motion.div>

        {/* Top Spending Categories Chart */}
        <motion.div 
          className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
          variants={cardVariants}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="bg-gradient-to-r from-purple-500 to-violet-500 h-4 w-1 rounded-full mr-3" />
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
        </motion.div>
      </div>

      {/* Recent Transactions Section */}
      <motion.div 
        className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-8"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 w-1 rounded-full mr-3" />
            Recent Transactions
          </h3>
          <button className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                  <td className="py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</span>
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {categories.find(c => c.id === transaction.category_id)?.name || 'Uncategorized'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                  </td>
                  <td className="py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${
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
