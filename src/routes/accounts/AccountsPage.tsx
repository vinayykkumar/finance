import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, Plus, Trash2, X } from 'lucide-react';
import { useData } from '../../providers/DataProvider';
import MotionButton from '../../components/ui/MotionButton';

const AccountsPage: React.FC = () => {
  const { 
    banks, 
    creditCards, 
    formatIndianCurrency, 
    loadBanks,
    loadCreditCards,
    addBank,
    deleteBank,
    addCreditCard,
    deleteCreditCard,
    newBank,
    setNewBank,
    newCreditCard,
    setNewCreditCard
  } = useData();

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newBank.name?.trim()) {
        throw new Error("Bank name is required");
      }
      if ((newBank.balance || 0) < 0) {
        throw new Error("Initial balance cannot be negative");
      }
      
      await addBank(newBank.name.trim(), newBank.balance || 0);
      await loadBanks();
      setNewBank({ name: "", balance: 0 });
      setIsBankModalOpen(false);
    } catch (error) {
      console.error("Failed to add bank:", error);
      alert("Failed to add bank: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleAddCreditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newCreditCard.name?.trim()) {
        throw new Error("Credit card name is required");
      }
      if ((newCreditCard.limit || 0) <= 0) {
        throw new Error("Credit card limit must be greater than zero");
      }
      
      await addCreditCard(newCreditCard.name.trim(), newCreditCard.limit || 0);
      await loadCreditCards();
      setNewCreditCard({ name: "", limit: 0 });
      setIsCreditCardModalOpen(false);
    } catch (error) {
      console.error("Failed to add credit card:", error);
      alert("Failed to add credit card: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
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
                          await deleteBank(bank.id);
                          await loadBanks();
                        } catch (error) {
                          console.error("Failed to delete bank:", error);
                          alert("Failed to delete bank");
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

      {/* Credit Cards Section */}
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
                        await deleteCreditCard(card.id);
                        await loadCreditCards();
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
                  value={newBank.name || ''}
                  onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
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
                  value={newBank.balance || 0}
                  onChange={(e) =>
                    setNewBank({
                      ...newBank,
                      balance: e.target.value === "" ? 0 : Number.parseFloat(e.target.value),
                    })
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
                  value={newCreditCard.name || ''}
                  onChange={(e) => setNewCreditCard({ ...newCreditCard, name: e.target.value })}
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
                  value={newCreditCard.limit || 0}
                  onChange={(e) =>
                    setNewCreditCard({
                      ...newCreditCard,
                      limit: e.target.value === "" ? 0 : Number.parseFloat(e.target.value),
                    })
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
    </>
  );
};

export default AccountsPage; 