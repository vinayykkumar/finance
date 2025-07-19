import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/ToastContainer';
import { 
  Bank, Transaction, Category, CreditCard, Budget, 
  Goal, Investment, InvestmentAccount, Template, CategorySpending 
} from '../types';
import { getBanks, addBank as addBankService, deleteBank as deleteBankService, getCreditCards, addCreditCard as addCreditCardService, deleteCreditCard as deleteCreditCardService } from "../lib/bank-service";
import { getCategories, createCategory as createCategoryService, deleteCategory as deleteCategoryService, updateCategory as updateCategoryService, getCategoryExpenses } from "../lib/category-service";
import { deleteTransaction as deleteTransactionService, createTransaction as createTransactionService, getTransactions } from "../lib/transaction-service";

interface DataContextType {
  // Data states
  banks: Bank[];
  setBanks: React.Dispatch<React.SetStateAction<Bank[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  creditCards: CreditCard[];
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  investmentAccounts: InvestmentAccount[];
  setInvestmentAccounts: React.Dispatch<React.SetStateAction<InvestmentAccount[]>>;
  investments: Investment[];
  setInvestments: React.Dispatch<React.SetStateAction<Investment[]>>;
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  categorySpending: Record<string, CategorySpending>;
  setCategorySpending: React.Dispatch<React.SetStateAction<Record<string, CategorySpending>>>;
  
  // Loading state
  loading: boolean;
  
  // Form states
  newBank: Partial<Bank>;
  setNewBank: React.Dispatch<React.SetStateAction<Partial<Bank>>>;
  newTransaction: Partial<Transaction>;
  setNewTransaction: React.Dispatch<React.SetStateAction<Partial<Transaction>>>;
  newCategory: Partial<Category>;
  setNewCategory: React.Dispatch<React.SetStateAction<Partial<Category>>>;
  newCreditCard: Partial<CreditCard>;
  setNewCreditCard: React.Dispatch<React.SetStateAction<Partial<CreditCard>>>;
  
  // Data loading functions
  loadBanks: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadCreditCards: () => Promise<void>;
  
  // Data mutation functions
  addBank: (name: string, balance: number) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
  addCreditCard: (name: string, limit: number) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;
  createTransaction: (transaction: Transaction | Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  createCategory: (category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  
  // Utility functions
  formatIndianCurrency: (amount: number) => string;
  getProgressColor: (ratio: number) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { showSuccess, showError } = useToast();
  
  // Data states
  const [banks, setBanks] = useState<Bank[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investmentAccounts, setInvestmentAccounts] = useState<InvestmentAccount[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categorySpending, setCategorySpending] = useState<Record<string, CategorySpending>>({});
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newBank, setNewBank] = useState<Partial<Bank>>({ name: "", balance: 0 });
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    description: "",
    amount: 0,
    type: "expense",
    category_id: "",
    bank_id: "",
    date: new Date().toISOString().split('T')[0],
  });
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ 
    name: "", 
    color: "#6366F1", 
    icon: "tag", 
    monthly_limit: 0 
  });
  const [newCreditCard, setNewCreditCard] = useState<Partial<CreditCard>>({ 
    name: "", 
    limit: 0 
  });

  // Data mutation functions
  async function addBank(name: string, balance: number) {
    try {
      await addBankService(name, balance);
      showSuccess('Bank Added', `${name} has been added successfully`);
    } catch (error) {
      console.error("Error adding bank:", error);
      showError('Failed to Add Bank', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function deleteBank(id: string) {
    try {
      await deleteBankService(id);
      showSuccess('Bank Deleted', 'Bank account has been removed');
    } catch (error) {
      console.error("Error deleting bank:", error);
      showError('Failed to Delete Bank', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function addCreditCard(name: string, limit: number) {
    try {
      await addCreditCardService(name, limit);
      showSuccess('Credit Card Added', `${name} has been added successfully`);
    } catch (error) {
      console.error("Error adding credit card:", error);
      showError('Failed to Add Credit Card', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function deleteCreditCard(id: string) {
    try {
      await deleteCreditCardService(id);
      showSuccess('Credit Card Deleted', 'Credit card has been removed');
    } catch (error) {
      console.error("Error deleting credit card:", error);
      showError('Failed to Delete Credit Card', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function createTransaction(transaction: Transaction | Omit<Transaction, 'id' | 'created_at'>) {
    try {
      await createTransactionService(transaction);
      showSuccess('Transaction Added', 'Transaction has been recorded successfully');
    } catch (error) {
      console.error("Error creating transaction:", error);
      showError('Failed to Add Transaction', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function deleteTransaction(id: string) {
    try {
      await deleteTransactionService(id);
      showSuccess('Transaction Deleted', 'Transaction has been removed');
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showError('Failed to Delete Transaction', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function createCategory(category: Partial<Category>) {
    try {
      if (!category.name || !category.color || !category.icon) {
        throw new Error("Name, color, and icon are required for a category");
      }
      await createCategoryService(category);
      showSuccess('Category Created', `${category.name} category has been added`);
    } catch (error) {
      console.error("Error creating category:", error);
      showError('Failed to Create Category', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function deleteCategory(id: string) {
    try {
      await deleteCategoryService(id);
      showSuccess('Category Deleted', 'Category has been removed');
    } catch (error) {
      console.error("Error deleting category:", error);
      showError('Failed to Delete Category', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    try {
      await updateCategoryService(id, updates);
      showSuccess('Category Updated', 'Category has been updated successfully');
    } catch (error) {
      console.error("Error updating category:", error);
      showError('Failed to Update Category', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Data loading functions
  const loadBanks = useCallback(async () => {
    try {
      const data = await getBanks();
      setBanks(data);
    } catch (error) {
      console.error("Error loading banks:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }, []);

  const loadCreditCards = useCallback(async () => {
    try {
      const data = await getCreditCards();
      setCreditCards(data);
    } catch (error) {
      console.error("Error loading credit cards:", error);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadBanks(), loadCategories(), loadTransactions(), loadCreditCards()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        alert("Failed to load data. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [loadBanks, loadCategories, loadTransactions, loadCreditCards]);

  // Utility functions
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (ratio: number) => {
    if (ratio >= 1) return "bg-red-600";
    if (ratio >= 0.8) return "bg-yellow-500";
    return "bg-green-600";
  };

  return (
    <DataContext.Provider value={{
      // Data states
      banks,
      setBanks,
      transactions,
      setTransactions,
      categories,
      setCategories,
      creditCards,
      setCreditCards,
      budgets,
      setBudgets,
      goals,
      setGoals,
      investmentAccounts,
      setInvestmentAccounts,
      investments,
      setInvestments,
      templates,
      setTemplates,
      categorySpending,
      setCategorySpending,
      
      // Loading state
      loading,
      
      // Form states
      newBank,
      setNewBank,
      newTransaction,
      setNewTransaction,
      newCategory,
      setNewCategory,
      newCreditCard,
      setNewCreditCard,
      
      // Data loading functions
      loadBanks,
      loadCategories,
      loadTransactions,
      loadCreditCards,
      
      // Data mutation functions
      addBank,
      deleteBank,
      addCreditCard,
      deleteCreditCard,
      createTransaction,
      deleteTransaction,
      createCategory,
      deleteCategory,
      updateCategory,
      
      // Utility functions
      formatIndianCurrency,
      getProgressColor,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}