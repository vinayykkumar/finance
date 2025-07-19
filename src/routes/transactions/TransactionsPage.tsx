import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, Trash2, TrendingUp, TrendingDown, X, Plus,
  SortAsc, SortDesc, ArrowUpCircle, ArrowDownCircle, Filter, Search,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '../../providers/DataProvider';
import MotionButton from '../../components/ui/MotionButton';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import { Transaction } from '../../types';
import SmartTransactionForm from '../../components/features/ai/SmartTransactionForm';

type SortField = 'date' | 'amount' | 'description';
type SortOrder = 'asc' | 'desc';

interface TransactionsPageProps {
  selectedMonth: Date;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ selectedMonth }) => {
  const { 
    transactions, 
    banks, 
    categories, 
    creditCards,
    formatIndianCurrency,
    loadTransactions,
    loadBanks,
    loadCategorySpending,
    deleteTransaction,
    createTransaction
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    description: "",
    amount: 0,
    type: "expense",
    category_id: "",
    bank_id: "",
    to_bank_id: undefined,
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [categoryWarning, setCategoryWarning] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showSmartForm, setShowSmartForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');

  // Update local search when external search changes
  React.useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Filter transactions for the selected month
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === selectedMonth.getMonth() &&
        transactionDate.getFullYear() === selectedMonth.getFullYear()
      );
    });
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banks.find(b => b.id === transaction.bank_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categories.find(c => c.id === transaction.category_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [transactions, selectedMonth, searchQuery, banks, categories]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else if (sortField === 'description') {
        return sortOrder === 'asc' 
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      }
      return 0;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  // Toggle sort order
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newTransaction.id) {
        await createTransaction(newTransaction as Transaction);
      } else {
        await createTransaction(newTransaction as Omit<Transaction, 'id' | 'created_at'>);
      }

      setIsModalOpen(false);
      setNewTransaction({
        description: "",
        amount: 0,
        type: "expense",
        category_id: "",
        bank_id: "",
        to_bank_id: undefined,
        date: format(new Date(), "yyyy-MM-dd"),
      });

      await Promise.all([loadBanks(), loadTransactions(), loadCategorySpending()]);
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Error adding transaction: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <>
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
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Transactions - {format(selectedMonth, "MMMM yyyy")}
            </h3>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => toggleSort('date')}
                className={`px-3 py-2 flex items-center gap-1 text-sm ${
                  sortField === 'date' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
              >
                Date
                {sortField === 'date' && (
                  sortOrder === 'asc' 
                    ? <SortAsc className="h-4 w-4" />
                    : <SortDesc className="h-4 w-4" />
                )}
              </button>
              <button 
                onClick={() => toggleSort('amount')}
                className={`px-3 py-2 flex items-center gap-1 text-sm ${
                  sortField === 'amount' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
              >
                Amount
                {sortField === 'amount' && (
                  sortOrder === 'asc' 
                    ? <SortAsc className="h-4 w-4" />
                    : <SortDesc className="h-4 w-4" />
                )}
              </button>
              <button 
                onClick={() => toggleSort('description')}
                className={`px-3 py-2 flex items-center gap-1 text-sm ${
                  sortField === 'description' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
              >
                Description
                {sortField === 'description' && (
                  sortOrder === 'asc' 
                    ? <SortAsc className="h-4 w-4" />
                    : <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>
            <MotionButton
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              className="mr-2"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </MotionButton>
            <MotionButton
              onClick={() => setShowSmartForm(!showSmartForm)}
              variant="info"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Brain className="h-4 w-4" />
              AI Assistant
            </MotionButton>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <SearchBar
            placeholder="Search transactions, banks, or categories..."
            onSearch={setSearchQuery}
            className="w-full max-w-lg"
          />
        </div>
        
        {/* Smart Transaction Form */}
        {showSmartForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <SmartTransactionForm
              categories={categories}
              onTransactionCreated={async (transaction) => {
                // You could integrate this with your existing transaction creation logic
                console.log('Smart transaction created:', transaction);
                setShowSmartForm(false);
              }}
            />
          </motion.div>
        )}
        
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sortedTransactions.length === 0 ? (
            <EmptyState
              icon={ArrowUpDown}
              title={searchQuery ? "No transactions found" : `No transactions for ${format(selectedMonth, "MMMM yyyy")}`}
              description={searchQuery ? "Try adjusting your search terms" : "Add a transaction or change the selected month"}
              action={{
                label: "Add Transaction",
                onClick: () => setIsModalOpen(true)
              }}
              className="p-8"
            />
          ) : (
            sortedTransactions.map((transaction) => (
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
                            await deleteTransaction(transaction.id);
                            await Promise.all([loadTransactions(), loadBanks(), loadCategorySpending()]);
                          } catch (error) {
                            console.error("Failed to delete transaction:", error);
                            alert("Failed to delete transaction");
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
                  value={newTransaction.amount || 0}
                  onChange={(e) => {
                    const amount = Number.parseFloat(e.target.value);
                    setNewTransaction((prev) => ({ ...prev, amount }));
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
                  value={newTransaction.type || 'expense'}
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
                  value={newTransaction.bank_id || ''}
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
                    value={newTransaction.to_bank_id || ''}
                    onChange={(e) => setNewTransaction((prev) => ({ ...prev, to_bank_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Select destination account</option>
                    <optgroup label="Bank Accounts">
                      {banks
                        .filter(
                          (bank) => bank.id !== newTransaction.bank_id && !newTransaction.bank_id?.startsWith("cc_"),
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
                    value={newTransaction.category_id || ''}
                    onChange={(e) => {
                      const categoryId = e.target.value;
                      setNewTransaction((prev) => ({ ...prev, category_id: categoryId }));
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
                  value={newTransaction.date || format(new Date(), "yyyy-MM-dd")}
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
                  value={newTransaction.description || ''}
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
    </>
  );
};

export default TransactionsPage; 