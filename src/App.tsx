"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  X, Plus, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, 
  Tag, CreditCard, Wallet, Settings, Moon, Sun, Menu, 
  PiggyBank, ArrowUpDown, Target, BarChart3,
  Calendar, Search, Bell, User, ChevronDown
} from "lucide-react";
import { getBanks, addBank, deleteBank, getCreditCards, addCreditCard, deleteCreditCard } from "./lib/bank-service";
import { supabase } from "./lib/supabase";
import {
  getCategories,
  createCategory,
  checkCategoryLimit,
  deleteCategory,
  updateCategory,
  getCategoryExpenses,
  Category as CategoryType
} from "./lib/category-service";
import { deleteTransaction, createTransaction, getTransactions } from "./lib/transaction-service";
import MotionButton from "./components/MotionButton";
import Dashboard from "./components/Dashboard";
import BudgetSection from "./components/BudgetSection";
import GoalsSection from "./components/GoalsSection";
import MotionCard from "./components/MotionCard";
import AnimatedSidebar from "./components/AnimatedSidebar";

interface Bank {
  id: string
  name: string
  balance: number
  user_id?: string
  created_at: string
}

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

interface CreditCardData {
  id: string
  name: string
  limit: number
  balance: number
  created_at: string
}

function App() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [creditCards, setCreditCards] = useState<CreditCardData[]>([])
  const [categoryWarning, setCategoryWarning] = useState<string>("")
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true" || window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Budget planning state
  const [budgets, setBudgets] = useState<any[]>([])
  const [budgetSummary, setBudgetSummary] = useState<any[]>([])
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [newBudget, setNewBudget] = useState({ category_id: "", amount: 0 })

  // Financial goals state
  const [goals, setGoals] = useState<any[]>([])
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [newGoal, setNewGoal] = useState({
    name: "",
    target_amount: 0,
    current_amount: 0,
    target_date: "",
    category_id: "",
  })
  const [contributionAmount, setContributionAmount] = useState(0)

  // Investment tracking state
  const [investmentAccounts, setInvestmentAccounts] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [isInvestmentAccountModalOpen, setIsInvestmentAccountModalOpen] = useState(false)
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false)
  const [selectedInvestmentAccount, setSelectedInvestmentAccount] = useState<any>(null)
  const [newInvestmentAccount, setNewInvestmentAccount] = useState({ name: "", type: "stocks", balance: 0 })
  const [newInvestment, setNewInvestment] = useState({
    account_id: "",
    name: "",
    symbol: "",
    purchase_price: 0,
    current_price: 0,
    quantity: 0,
    purchase_date: format(new Date(), "yyyy-MM-dd"),
  })

  // Transaction templates state
  const [templates, setTemplates] = useState<any[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    amount: 0,
    type: "expense",
    category_id: "",
    bank_id: "",
    to_bank_id: "",
  })

  // Financial reports state
  const [monthlySpending, setMonthlySpending] = useState<any[]>([])
  const [monthlyIncome, setMonthlyIncome] = useState<any[]>([])
  const [categorySpendingData, setCategorySpendingData] = useState<any[]>([])
  const [netWorthData, setNetWorthData] = useState<any[]>([])
  const [reportType, setReportType] = useState<"spending" | "income" | "categories" | "networth">("spending")
  const [reportTimeframe, setReportTimeframe] = useState<number>(6) // months
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null)
  const [updatedCategoryName, setUpdatedCategoryName] = useState("")
  const [updatedCategoryLimit, setUpdatedCategoryLimit] = useState<number | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "accounts" | "categories" | "transactions" | "budgets" | "goals" | "investments" | "reports"
  >("dashboard")
  // Auth disabled
  const [loading, setLoading] = useState(true)
  const [newBank, setNewBank] = useState({ name: "", balance: 0 })
  const [newCategory, setNewCategory] = useState({ name: "", color: "#6366F1", icon: "tag", monthly_limit: 0 })
  const [newCreditCard, setNewCreditCard] = useState({ name: "", limit: 0 })
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [newTransaction, setNewTransaction] = useState<Transaction>({
    id: "",
    description: "",
    amount: 0,
    type: "expense",
    category_id: "",
    bank_id: "",
    to_bank_id: undefined,
    date: format(new Date(), "yyyy-MM-dd"),
    created_at: new Date().toISOString(),
  })

  const getProgressColor = (ratio: number) => {
    if (ratio >= 1) return "bg-red-600"
    if (ratio >= 0.8) return "bg-yellow-500"
    return "bg-green-600"
  }
  const [categorySpending, setCategorySpending] = useState<Record<string, { spent: number; limit: number }>>({})

  useEffect(() => {
    // Toggle dark mode class on body
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString())
    }
  }, [darkMode])

  useEffect(() => {
    // No auth: just load data immediately
    setLoading(true)
    Promise.all([loadBanks(), loadCategories(), loadTransactions(), loadCreditCards()])
      .catch((error) => {
        console.error("Error loading initial data:", error)
        // Show error to user
        alert("Failed to load data. Please check your connection and try again.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadCategorySpending()
  }, [selectedMonth])

  async function loadCategorySpending() {
    try {
      const spending: Record<string, { spent: number; limit: number }> = {}

      // Use selectedMonth for calculations
      const startOfMonth = new Date(selectedMonth)
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const endOfMonth = new Date(startOfMonth)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      endOfMonth.setDate(0)

      // Get all categories
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, monthly_limit")
        .order("name")

      if (categoriesError) {
        console.error("Error loading categories:", categoriesError)
        return
      }

      // For each category, get spending for the selected month
      for (const category of categories) {
        const spent = await getCategoryExpenses(category.id, selectedMonth)
        spending[category.id] = {
          spent,
          limit: Number(category.monthly_limit),
        }
      }
      setCategorySpending(spending)
    } catch (error) {
      console.error("Error loading category spending:", error)
    }
  }

  async function loadTransactions() {
    try {
      const transactionsData = await getTransactions()
      setTransactions(transactionsData)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    }
  }

  async function loadCategories() {
    try {
      const categories = await getCategories()
      setCategories(categories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  async function loadBanks() {
    try {
      const banksData = await getBanks()
      setBanks(banksData)
    } catch (error) {
      console.error("Failed to load banks:", error)
    }
  }

  async function loadCreditCards() {
    try {
      const creditCardsData = await getCreditCards()
      setCreditCards(creditCardsData)
    } catch (error) {
      console.error("Failed to load credit cards:", error)
    }
  }

  // Helper function to handle credit card transactions
  const processCreditCardTransaction = async (transaction: Omit<Transaction, "id" | "created_at">) => {
    // Check if source or destination is a credit card (format: cc_[id])
    const isCreditCardSource = transaction.bank_id.startsWith("cc_")
    const isCreditCardDestination = transaction.to_bank_id?.startsWith("cc_")

    // Create a modified transaction object
    const modifiedTransaction = { ...transaction }

    // Extract the actual credit card ID if needed
    if (isCreditCardSource) {
      const creditCardId = transaction.bank_id.substring(3) // Remove 'cc_' prefix
      const creditCard = creditCards.find((cc) => cc.id === creditCardId)

      if (!creditCard) {
        throw new Error("Credit card not found")
      }

      // For credit card expenses, we need to update the credit card balance directly
      if (transaction.type === "expense") {
        // Update credit card balance (increase it for expenses)
        const { error } = await supabase
          .from("credit_cards")
          .update({ balance: creditCard.balance + transaction.amount })
          .eq("id", creditCardId)

        if (error) throw error

        // Create a record in transactions table for tracking
        modifiedTransaction.bank_id = "credit_card_" + creditCardId // Special marker
      }
    }

    // Handle transfers to credit cards
    if (isCreditCardDestination && transaction.to_bank_id) {
      const creditCardId = transaction.to_bank_id.substring(3) // Remove 'cc_' prefix
      const creditCard = creditCards.find((cc) => cc.id === creditCardId)

      if (!creditCard) {
        throw new Error("Destination credit card not found")
      }

      // For transfers to credit cards, reduce the balance (paying off credit card)
      const { error } = await supabase
        .from("credit_cards")
        .update({ balance: Math.max(0, creditCard.balance - transaction.amount) })
        .eq("id", creditCardId)

      if (error) throw error

      // Modify the destination for the transaction record
      modifiedTransaction.to_bank_id = "credit_card_" + creditCardId // Special marker
    }

    // If neither source nor destination is a credit card, use the normal transaction flow
    if (!isCreditCardSource && !isCreditCardDestination) {
      return await createTransaction(transaction)
    } else {
      // For credit card transactions, we've already updated the credit card balance directly
      // Now just create a record in the transactions table
      return await createTransaction(modifiedTransaction)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Check if this transaction involves a credit card
      const isCreditCardTransaction =
        newTransaction.bank_id.startsWith("cc_") ||
        (newTransaction.to_bank_id && newTransaction.to_bank_id.startsWith("cc_"))

      if (isCreditCardTransaction) {
        await processCreditCardTransaction(newTransaction)
      } else {
        await createTransaction(newTransaction)
      }

      setIsModalOpen(false)
      setNewTransaction({
        id: "",
        description: "",
        amount: 0,
        type: "expense",
        category_id: "",
        bank_id: "",
        to_bank_id: undefined,
        date: format(new Date(), "yyyy-MM-dd"),
        created_at: new Date().toISOString(),
      })

      await Promise.all([loadBanks(), loadCategories(), loadTransactions(), loadCreditCards(), loadCategorySpending()])
    } catch (error) {
      console.error("Error adding transaction:", error)
      alert("Error adding transaction: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!newBank.name.trim()) {
        throw new Error("Bank name is required")
      }
      if (newBank.balance < 0) {
        throw new Error("Initial balance cannot be negative")
      }
      console.log("Submitting bank:", newBank)
      await addBank(newBank.name.trim(), newBank.balance)
      console.log("Bank added successfully")
      await loadBanks()
      setNewBank({ name: "", balance: 0 })
      setIsBankModalOpen(false)
    } catch (error) {
      console.error("Failed to add bank:", error)
      let message = "Failed to add bank"

      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === "object" && error !== null) {
        const err = error as any
        if (err.__isAuthError) {
          message = "Please wait while we set up the demo account..."
          // Retry the operation after a short delay
          setTimeout(async () => {
            try {
              await addBank(newBank.name.trim(), newBank.balance)
              await loadBanks()
              setNewBank({ name: "", balance: 0 })
              setIsBankModalOpen(false)
            } catch (retryError) {
              console.error("Retry failed:", retryError)
              alert("Could not create bank account. Please try again.")
            }
          }, 2000)
          return
        } else {
          message = JSON.stringify(error)
        }
      }

      alert(message)
    }
  }

  const handleAddCreditCard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!newCreditCard.name.trim()) {
        throw new Error("Credit card name is required")
      }
      if (newCreditCard.limit <= 0) {
        throw new Error("Credit card limit must be greater than zero")
      }
      await addCreditCard(newCreditCard.name.trim(), newCreditCard.limit)
      await loadCreditCards()
      setNewCreditCard({ name: "", limit: 0 })
      setIsCreditCardModalOpen(false)
    } catch (error) {
      console.error("Failed to add credit card:", error)
      alert("Failed to add credit card")
    }
  }

  const formatIndianCurrency = (amount: number) => {
    const absoluteAmount = Math.abs(amount)
    return absoluteAmount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
      style: "currency",
      currency: "INR",
    })
  }

  const totalBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)

  // Auth disabled: no sign-in handler

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your financial data...</p>
        </div>
      </div>
    )
  }
  // Always show the main UI, even if not authenticated

  // Handler for editing category
  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category)
    setUpdatedCategoryName(category.name)
    setUpdatedCategoryLimit(category.monthly_limit)
    setIsEditCategoryModalOpen(true)
  }

  // Handler for saving edited category
  const handleSaveCategory = async () => {
    if (!editingCategory) return
    try {
      await updateCategory(editingCategory.id, {
        name: updatedCategoryName,
        monthly_limit: updatedCategoryLimit || undefined,
      })
      await loadCategories()
      await loadCategorySpending()
      setIsEditCategoryModalOpen(false)
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Failed to update category")
    }
  }

  // Handler for deleting category
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return
    try {
      await deleteCategory(id)
      await loadCategories()
      await loadCategorySpending()
    } catch (error) {
      alert("Failed to delete category")
    }
  }

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Settings className="h-5 w-5" /> },
    { id: "accounts", label: "Accounts", icon: <Wallet className="h-5 w-5" /> },
    { id: "transactions", label: "Transactions", icon: <ArrowUpDown className="h-5 w-5" /> },
    { id: "categories", label: "Categories", icon: <Tag className="h-5 w-5" /> },
    { id: "budgets", label: "Budgets", icon: <PiggyBank className="h-5 w-5" /> },
    { id: "goals", label: "Goals", icon: <Target className="h-5 w-5" /> },
    { id: "investments", label: "Investments", icon: <TrendingUp className="h-5 w-5" /> },
    { id: "reports", label: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
                  <PiggyBank className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">FinTrack</span>
              </div>
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
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                    <span className="text-sm font-medium">Demo User</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <AnimatedSidebar
            items={navItems.map((item) => ({
              id: item.id,
              label: item.label,
              icon: item.icon,
              isActive: item.id === activeTab,
              onClick: (id) => {
                setActiveTab(id as any)
                setMobileMenuOpen(false)
              }
            }))}
            activeId={activeTab}
            onItemClick={(id) => {
              setActiveTab(id as any)
              setMobileMenuOpen(false)
            }}
            isOpen={mobileMenuOpen}
            darkMode={darkMode}
            className="z-30"
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
            {/* Month Selector */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                className="p-2 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-300"
                onClick={() =>
                  setSelectedMonth((prev) => {
                    const newMonth = new Date(prev)
                    newMonth.setMonth(newMonth.getMonth() - 1)
                    return newMonth
                  })
                }
              >
                <ChevronLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </button>
              <h2 className="text-xl font-semibold flex items-center gap-3 text-gray-800 dark:text-gray-100">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                {format(selectedMonth, "MMMM yyyy")}
              </h2>
              <button
                className="p-2 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-300"
                onClick={() =>
                  setSelectedMonth((prev) => {
                    const newMonth = new Date(prev)
                    newMonth.setMonth(newMonth.getMonth() + 1)
                    return newMonth
                  })
                }
              >
                <ChevronRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Add Transaction</span>
              </button>

              <button
                onClick={() => setIsBankModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Add Account</span>
              </button>

              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Add Category</span>
              </button>

              <button
                onClick={() => setIsCreditCardModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Add Credit Card</span>
              </button>
            </div>

            {/* Dashboard View */}
            {activeTab === "dashboard" && (
              <Dashboard
                transactions={transactions}
                categories={categories}
                banks={banks}
                selectedMonth={selectedMonth}
                formatIndianCurrency={formatIndianCurrency}
              />
            )}

            {activeTab === "budgets" && (
              <BudgetSection
                formatIndianCurrency={formatIndianCurrency}
                selectedMonth={selectedMonth}
                categories={categories}
              />
            )}

            {activeTab === "goals" && <GoalsSection formatIndianCurrency={formatIndianCurrency} />}

            {activeTab === "accounts" && (
              <>
                {/* Bank Accounts Section */}
                <motion.div 
                  className="mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
                        <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Bank Accounts</h2>
                    </div>
                    <MotionButton
                      onClick={() => setIsBankModalOpen(true)}
                      variant="success"
                    >
                      <Plus size={18} /> Add Bank
                    </MotionButton>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Bank Cards */}
                    <AnimatePresence>
                      {banks.map((bank, index) => (
                        <motion.div
                          key={bank.id}
                          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group relative overflow-hidden backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4,
                            delay: index * 0.1
                          }}
                          whileHover={{ 
                            scale: 1.03,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="flex items-center justify-between mb-5 relative">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl">
                                <Wallet className="h-5 w-5 text-green-500 dark:text-green-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{bank.name}</h3>
                            </div>
                            <motion.button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete ${bank.name}?`)) {
                                  try {
                                    await deleteBank(bank.id)
                                    await loadBanks()
                                  } catch (error) {
                                    console.error("Failed to delete bank:", error)
                                    let errorMessage = "Failed to delete bank"

                                    if (error instanceof Error) {
                                      errorMessage = error.message
                                    }

                                    alert(errorMessage)
                                  }
                                }
                              }}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100"
                              title="Delete bank"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </motion.button>
                          </div>
                          <motion.div 
                            className="mt-2 relative"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                          >
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
                            <motion.p
                              className={`text-2xl font-bold ${Number(bank.balance) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.3 + index * 0.1
                              }}
                            >
                              {formatIndianCurrency(Number(bank.balance))}
                            </motion.p>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </>
            )}

            {/* Credit Cards Section */}
            {activeTab === "accounts" && (
              <motion.div 
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Credit Cards</h2>
                  </div>
                  <MotionButton
                    onClick={() => setIsCreditCardModalOpen(true)}
                    variant="info"
                  >
                    <Plus size={18} /> Add Credit Card
                  </MotionButton>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  <AnimatePresence>
                    {creditCards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group relative overflow-hidden backdrop-filter backdrop-blur-md bg-opacity-80 dark:bg-opacity-80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4,
                          delay: 0.3 + index * 0.1
                        }}
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-center justify-between mb-5 relative">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                              <CreditCard className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{card.name}</h3>
                          </div>
                          <motion.button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this credit card?")) {
                                await deleteCreditCard(card.id)
                                await loadCreditCards()
                              }
                            }}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100"
                            title="Delete credit card"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        </div>
                        <motion.div 
                          className="mt-2 relative"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                        >
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Credit Limit</p>
                          <motion.p 
                            className="text-2xl font-bold text-green-600 dark:text-green-400"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.5 + index * 0.1
                            }}
                          >
                            {formatIndianCurrency(Number(card.limit))}
                          </motion.p>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">Current Balance</p>
                          <motion.p 
                            className="text-2xl font-bold text-red-600 dark:text-red-400"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.6 + index * 0.1
                            }}
                          >
                            {formatIndianCurrency(Number(card.balance))}
                          </motion.p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Categories Section */}
            {activeTab === "categories" && (
              <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg">
                      <Tag className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
                  </div>
                  <MotionButton
                    onClick={() => setIsCategoryModalOpen(true)}
                    variant="warning"
                  >
                    <Plus size={18} /> Add Category
                  </MotionButton>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  <AnimatePresence>
                    {categories.map((category, index) => (
                      <MotionCard
                        key={category.id}
                        delay={index * 0.05}
                        className="p-5 group"
                      >
                        <div
                          className="absolute top-0 left-0 w-full h-1"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={category.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                                <path d="M7 7h.01"></path>
                              </svg>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{category.name}</h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <motion.button
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100"
                              title="Edit category"
                              onClick={() => handleEditCategory(category)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              </svg>
                            </motion.button>
                            <motion.button
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100"
                              title="Delete category"
                              onClick={() => handleDeleteCategory(category.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                        {categorySpending[category.id] && (
                          <motion.div 
                            className="mt-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Monthly Spending
                              </span>
                              <span className="font-semibold text-gray-800 dark:text-white">
                                {formatIndianCurrency(categorySpending[category.id].spent)}
                              </span>
                            </div>
                            {category.monthly_limit && (
                              <>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Monthly Limit
                                  </span>
                                  <span className="font-semibold text-gray-800 dark:text-white">
                                    {formatIndianCurrency(category.monthly_limit)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining</span>
                                  <span
                                    className={
                                      categorySpending[category.id].spent > category.monthly_limit
                                        ? "text-red-600 dark:text-red-400 font-medium"
                                        : "text-green-600 dark:text-green-400 font-medium"
                                    }
                                  >
                                    {formatIndianCurrency(
                                      Math.max(0, category.monthly_limit - categorySpending[category.id].spent),
                                    )}
                                  </span>
                                </div>
                                <motion.div 
                                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2 overflow-hidden"
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                                >
                                  <motion.div
                                    className={`h-2.5 rounded-full ${getProgressColor(categorySpending[category.id].spent / category.monthly_limit)}`}
                                    style={{
                                      width: `${Math.min(
                                        (categorySpending[category.id].spent / category.monthly_limit) * 100,
                                        100,
                                      )}%`,
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ 
                                      width: `${Math.min(
                                        (categorySpending[category.id].spent / category.monthly_limit) * 100,
                                        100,
                                      )}%` 
                                    }}
                                    transition={{ delay: 0.4 + index * 0.05, duration: 0.7, ease: "easeOut" }}
                                  />
                                </motion.div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </MotionCard>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === "transactions" && (
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
                      <ArrowUpDown className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
                  </div>
                  <MotionButton
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                  >
                    <Plus className="h-4 w-4" />
                    Add Transaction
                  </MotionButton>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.length === 0 ? (
                    <motion.div 
                      className="p-8 text-center text-gray-500 dark:text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <ArrowUpDown className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-lg font-medium">No transactions yet</p>
                      <p className="mt-1">Add your first transaction to get started</p>
                      <MotionButton
                        onClick={() => setIsModalOpen(true)}
                        variant="primary"
                      >
                        <Plus className="h-4 w-4" />
                        Add Transaction
                      </MotionButton>
                    </motion.div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-5 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl ${transaction.type === "income" ? "bg-green-100 dark:bg-green-900/30" : transaction.type === "expense" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"} flex items-center justify-center`}
                            >
                              {transaction.type === "income" ? (
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : transaction.type === "expense" ? (
                                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                              ) : (
                                <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </span>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {format(new Date(transaction.date), "MMM dd, yyyy")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p
                                className={`font-semibold text-lg ${transaction.type === "income" ? "text-green-600 dark:text-green-400" : transaction.type === "expense" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}
                              >
                                {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                                {formatIndianCurrency(Math.abs(transaction.amount))}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {banks.find((b) => b.id === transaction.bank_id)?.name || "Unknown Bank"}
                                {transaction.type === "transfer" && transaction.to_bank_id && (
                                  <span>
                                    {" "}
                                    → {banks.find((b) => b.id === transaction.to_bank_id)?.name || "Unknown"}
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete this transaction?`)) {
                                  try {
                                    await deleteTransaction(transaction.id)
                                    await Promise.all([loadTransactions(), loadBanks(), loadCategorySpending()])
                                  } catch (error) {
                                    console.error("Failed to delete transaction:", error)
                                    alert("Failed to delete transaction")
                                  }
                                }
                              }}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100"
                              title="Delete transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </main>
        </div>

        {/* Backdrop for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Add Transaction Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
                    <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Add Transaction
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    value={newTransaction.amount}
                    onChange={async (e) => {
                      const amount = Number.parseFloat(e.target.value)
                      setNewTransaction((prev) => ({ ...prev, amount }))

                      // Check category limit if this is an expense
                      if (newTransaction.type === "expense" && newTransaction.category_id) {
                        const { isOverLimit, currentTotal, limit } = await checkCategoryLimit(
                          newTransaction.category_id,
                          amount,
                        )

                        if (isOverLimit) {
                          setCategoryWarning(
                            `Warning: This expense will exceed the monthly limit of ${formatIndianCurrency(limit || 0)}. ` +
                              `Current total: ${formatIndianCurrency(currentTotal)}`,
                          )
                        } else {
                          setCategoryWarning("")
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction Type
                  </label>
                  <select
                    required
                    value={newTransaction.type}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        type: e.target.value as "expense" | "income" | "transfer",
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="expense">Expense (Money Out)</option>
                    <option value="income">Income (Money In)</option>
                    <option value="transfer">Transfer Between Accounts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {newTransaction.type === "transfer" ? "From Account" : "Account"}
                  </label>
                  <select
                    required
                    value={newTransaction.bank_id}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, bank_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Select source account</option>
                    <optgroup label="Bank Accounts">
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name} ({formatIndianCurrency(bank.balance)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Credit Cards">
                      {creditCards.map((card) => (
                        <option key={card.id} value={`cc_${card.id}`}>
                          {card.name} (Balance: {formatIndianCurrency(card.balance)})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                {newTransaction.type === "transfer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To Account
                    </label>
                    <select
                      required
                      value={newTransaction.to_bank_id || ""}
                      onChange={(e) => setNewTransaction((prev) => ({ ...prev, to_bank_id: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select destination account</option>
                      <optgroup label="Bank Accounts">
                        {banks
                          .filter(
                            (bank) => bank.id !== newTransaction.bank_id && !newTransaction.bank_id.startsWith("cc_"),
                          )
                          .map((bank) => (
                            <option key={bank.id} value={bank.id}>
                              {bank.name} ({formatIndianCurrency(bank.balance)})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Credit Cards">
                        {creditCards
                          .filter((card) => `cc_${card.id}` !== newTransaction.bank_id)
                          .map((card) => (
                            <option key={card.id} value={`cc_${card.id}`}>
                              {card.name} (Balance: {formatIndianCurrency(card.balance)})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                )}
                {newTransaction.type !== "transfer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category (Optional)
                    </label>
                    <select
                      value={newTransaction.category_id || ""}
                      onChange={async (e) => {
                        const categoryId = e.target.value
                        setNewTransaction((prev) => ({ ...prev, category_id: categoryId }))

                        // Check category limit if this is an expense
                        if (newTransaction.type === "expense" && categoryId) {
                          const { isOverLimit, currentTotal, limit } = await checkCategoryLimit(
                            categoryId,
                            newTransaction.amount,
                          )

                          if (isOverLimit) {
                            setCategoryWarning(
                              `Warning: This expense will exceed the monthly limit of ${formatIndianCurrency(limit || 0)}. ` +
                                `Current total: ${formatIndianCurrency(currentTotal)}`,
                            )
                          } else {
                            setCategoryWarning("")
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select a category (optional)</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                          {category.monthly_limit ? ` (Limit: ${formatIndianCurrency(category.monthly_limit)})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {categoryWarning && <div className="text-red-600 text-sm mt-1">{categoryWarning}</div>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter description (optional)"
                  />
                </div>

                <MotionButton
                  type="submit"
                  variant="primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </MotionButton>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg">
                    <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Add New Category
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      await createCategory(newCategory)
                      setIsCategoryModalOpen(false)
                      setNewCategory({ name: "", color: "#6366F1", icon: "tag", monthly_limit: 0 })
                      await Promise.all([loadCategories(), loadCategorySpending()])
                    } catch (error) {
                      console.error("Error creating category:", error)
                    }
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                      <input
                        type="text"
                        required
                        value={newCategory.name}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                        placeholder="e.g., Groceries"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Monthly Limit (₹)
                      </label>
                      <input
                        type="number"
                        value={newCategory.monthly_limit}
                        onChange={(e) =>
                          setNewCategory((prev) => ({ ...prev, monthly_limit: Number.parseFloat(e.target.value) }))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                        placeholder="Optional: Set a monthly spending limit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                      <input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, color: e.target.value }))}
                        className="w-full h-10 px-1 py-1 border rounded-lg dark:border-gray-600"
                      />
                    </div>
                    <MotionButton
                      type="submit"
                      variant="primary"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </MotionButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {isEditCategoryModalOpen && editingCategory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-600 dark:text-amber-400"
                    >
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    </svg>
                  </div>
                  Edit Category
                </h3>
                <button
                  onClick={() => setIsEditCategoryModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={updatedCategoryName}
                    onChange={(e) => setUpdatedCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monthly Limit (optional)
                  </label>
                  <input
                    type="number"
                    value={updatedCategoryLimit || ""}
                    onChange={(e) => setUpdatedCategoryLimit(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter monthly limit"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setIsEditCategoryModalOpen(false)}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 mr-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <MotionButton
                    onClick={handleSaveCategory}
                    variant="primary"
                  >
                    Save Changes
                  </MotionButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Bank Modal */}
        {isBankModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
                    <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Add Bank Account
                </h3>
                <button
                  onClick={() => setIsBankModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddBank} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={newBank.name}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Initial Balance (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newBank.balance}
                    onChange={(e) =>
                      setNewBank((prev) => ({
                        ...prev,
                        balance: e.target.value === "" ? 0 : Number.parseFloat(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter initial balance"
                  />
                </div>
                <MotionButton
                  type="submit"
                  variant="primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Bank Account
                </MotionButton>
              </form>
            </div>
          </div>
        )}

        {/* Add Credit Card Modal */}
        {isCreditCardModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Add Credit Card
                </h3>
                <button
                  onClick={() => setIsCreditCardModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddCreditCard} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Credit Card Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCreditCard.name}
                    onChange={(e) => setNewCreditCard((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter credit card name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newCreditCard.limit}
                    onChange={(e) =>
                      setNewCreditCard((prev) => ({
                        ...prev,
                        limit: e.target.value === "" ? 0 : Number.parseFloat(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter credit limit"
                  />
                </div>
                <MotionButton
                  type="submit"
                  variant="primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Credit Card
                </MotionButton>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
