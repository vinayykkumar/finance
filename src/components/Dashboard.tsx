import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Wallet, PiggyBank, TrendingUp, TrendingDown } from "lucide-react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import AnimatedChart from "./AnimatedChart"
import { Category as CategoryType } from "../lib/category-service";

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

  // Calculate total income and expenses for the month
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netSavings = totalIncome - totalExpenses

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatIndianCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500 font-medium">+12.5%</span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatIndianCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
            <span className="text-red-500 font-medium">+8.2%</span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Savings</p>
              <p className={`text-2xl font-bold mt-1 ${netSavings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {formatIndianCurrency(netSavings)}
              </p>
            </div>
            <div className={`p-3 ${netSavings >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"} rounded-xl`}>
              <PiggyBank className={`h-6 w-6 ${netSavings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            {netSavings >= 0 ? (
              <>
                <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500 font-medium">+4.3%</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
                <span className="text-red-500 font-medium">-2.8%</span>
              </>
            )}
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatIndianCurrency(banks.reduce((sum, bank) => sum + Number(bank.balance), 0))}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500 font-medium">+2.5%</span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Income vs Expenses Chart */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.01,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Income vs Expenses</h3>
          <div className="h-80">
            <AnimatedChart
              data={monthlyTrendData}
              type="bar"
              dataKeys={["income", "expense"]}
              colors={["#10B981", "#EF4444"]}
              isDarkMode={document.documentElement.classList.contains('dark')}
            />
          </div>
        </motion.div>

        {/* Top Spending Categories Chart */}
        <motion.div 
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.01,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Spending Categories</h3>
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

      {/* Recent Transactions */}
      <motion.div 
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
        variants={cardVariants}
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.slice(0, 5).map((transaction) => {
                const category = categories.find((c) => c.id === transaction.category_id)
                const bank = banks.find((b) => b.id === transaction.bank_id)
                return (
                  <motion.tr 
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${transaction.type === "income" ? "bg-green-100 dark:bg-green-900/30" : transaction.type === "expense" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                          {transaction.type === "income" ? (
                            <TrendingUp className={`h-4 w-4 text-green-600 dark:text-green-400`} />
                          ) : transaction.type === "expense" ? (
                            <TrendingDown className={`h-4 w-4 text-red-600 dark:text-red-400`} />
                          ) : (
                            <ArrowDown className={`h-4 w-4 text-blue-600 dark:text-blue-400`} />
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {transaction.description || "Unnamed Transaction"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {category ? (
                        <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-medium ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : transaction.type === "expense" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                        {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                        {formatIndianCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {bank?.name || "Unknown"}
                    </td>
                  </motion.tr>
                )
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No transactions found for this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard
