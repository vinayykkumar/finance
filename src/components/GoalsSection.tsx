import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Plus, Trash2, Target, DollarSign } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import MotionButton from './MotionButton';
import { Goal, getGoals, createGoal, updateGoal, deleteGoal, contributeToGoal } from '../lib/goal-service';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface GoalsSectionProps {
  formatIndianCurrency: (amount: number) => string;
}

const GoalsSection: React.FC<GoalsSectionProps> = ({ formatIndianCurrency }) => {
  // State for goals with database persistence
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({ 
    name: '', 
    target_amount: 0, 
    current_amount: 0, 
    target_date: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd'), 
    category_id: '' 
  });
  const [contributionAmount, setContributionAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    loadData();
    
    // Listen for dark mode changes
    const handleDarkModeChange = (e: StorageEvent) => {
      if (e.key === 'darkMode') {
        setDarkMode(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleDarkModeChange);
    return () => window.removeEventListener('storage', handleDarkModeChange);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading goals and categories data...');
      
      // Load goals from database with fallback to local storage
      const goalsData = await getGoals();
      console.log('Goals data loaded:', goalsData);
      setGoals(goalsData);
      
      // Load categories
      const categoriesData = [
        { id: 'cat1', name: 'Food', color: '#FF5733', icon: 'utensils' },
        { id: 'cat2', name: 'Transportation', color: '#33A8FF', icon: 'car' },
        { id: 'cat3', name: 'Housing', color: '#33FF57', icon: 'home' },
        { id: 'cat4', name: 'Entertainment', color: '#A833FF', icon: 'film' },
        { id: 'cat5', name: 'Shopping', color: '#FF33A8', icon: 'shopping-bag' },
        { id: 'cat6', name: 'Travel', color: '#FFD700', icon: 'plane' }
      ];
      
      console.log('Categories data loaded:', categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Set default goals if there's an error
      const defaultGoals = [
        {
          id: 'goal1',
          name: 'Emergency Fund',
          target_amount: 300000,
          current_amount: 150000,
          target_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
          is_completed: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'goal2',
          name: 'New Car',
          target_amount: 1200000,
          current_amount: 400000,
          target_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
          category_id: 'cat5',
          is_completed: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'goal3',
          name: 'Vacation Fund',
          target_amount: 150000,
          current_amount: 150000,
          target_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
          category_id: 'cat6',
          is_completed: true,
          created_at: new Date().toISOString()
        }
      ];
      
      setGoals(defaultGoals);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newGoal.name.trim()) {
        alert('Please enter a goal name');
        return;
      }
      
      if (newGoal.target_amount <= 0) {
        alert('Target amount must be greater than zero');
        return;
      }
      
      // Create a new goal using the goal service
      const goalData = {
        name: newGoal.name.trim(),
        target_amount: newGoal.target_amount,
        current_amount: newGoal.current_amount || 0,
        target_date: newGoal.target_date || undefined,
        category_id: newGoal.category_id || undefined,
        is_completed: false
      };
      
      console.log('Adding new goal:', goalData);
      
      // Create goal in database
      const newGoalObj = await createGoal(goalData);
      
      // Update the state with the new goal
      setGoals(prevGoals => [newGoalObj, ...prevGoals]);
      
      setIsGoalModalOpen(false);
      setNewGoal({ 
        name: '', 
        target_amount: 0, 
        current_amount: 0, 
        target_date: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd'), 
        category_id: '' 
      });
      
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        // Delete goal from database
        await deleteGoal(id);
        
        // Remove the goal from state
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal');
      }
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedGoal) return;
      
      if (contributionAmount <= 0) {
        alert('Contribution amount must be greater than zero');
        return;
      }
      
      // Contribute to goal using the goal service
      const updatedGoal = await contributeToGoal(selectedGoal.id, contributionAmount);
      
      // Update the goal in state
      setGoals(prevGoals => prevGoals.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      ));
      
      setIsContributeModalOpen(false);
      setContributionAmount(0);
      setSelectedGoal(null);
      
    } catch (error) {
      console.error('Error contributing to goal:', error);
      alert('Failed to contribute to goal');
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'General';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getTimeLeft = (targetDate?: string) => {
    if (!targetDate) return 'No deadline';
    const date = new Date(targetDate);
    if (date < new Date()) return 'Deadline passed';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
            <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Financial Goals</h2>
        </div>
        <MotionButton
          onClick={() => setIsGoalModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
        >
          <Plus size={18} />
          Add Goal
        </MotionButton>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Goals cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <AnimatePresence>
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 
                    hover:shadow-2xl transition-all duration-300 backdrop-filter backdrop-blur-lg
                    ${goal.is_completed ? 'border-green-500 dark:border-green-600' : ''}
                    ${darkMode ? 'bg-opacity-80' : 'bg-opacity-90'}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {goal.name}
                    </h3>
                    <div className="flex gap-2">
                      {!goal.is_completed && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedGoal(goal);
                            setIsContributeModalOpen(true);
                          }}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-300"
                          title="Contribute"
                        >
                          <DollarSign className="h-4 w-4" />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                        title="Delete goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Category: {getCategoryName(goal.category_id)}
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Progress: {formatIndianCurrency(goal.current_amount)} of {formatIndianCurrency(goal.target_amount)}
                      </span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {getProgressPercentage(goal.current_amount, goal.target_amount).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`${
                          goal.is_completed ? 'bg-green-600' : 'bg-indigo-600'
                        } h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${getProgressPercentage(goal.current_amount, goal.target_amount)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {goal.target_date ? `Target: ${format(new Date(goal.target_date), 'MMM d, yyyy')}` : 'No deadline'}
                    </span>
                    <span className={`text-sm font-medium ${
                      goal.is_completed 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {goal.is_completed ? 'Completed!' : getTimeLeft(goal.target_date)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No goals message */}
          {goals.length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Goals Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start planning your future by setting financial goals
              </p>
              <MotionButton
                onClick={() => setIsGoalModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Your First Goal
              </MotionButton>
            </div>
          )}
        </>
      )}

      {/* Add Goal Modal */}
      {isGoalModalOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Add New Goal
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsGoalModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>
            </div>
            <form onSubmit={handleAddGoal} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={newGoal.name}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  placeholder="e.g., New Car, Emergency Fund"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter target amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Amount (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newGoal.current_amount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, current_amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter current amount (if any)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category (Optional)
                </label>
                <select
                  value={newGoal.category_id}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Goal
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && selectedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Contribute to Goal
              </h3>
              <button
                onClick={() => {
                  setIsContributeModalOpen(false);
                  setSelectedGoal(null);
                  setContributionAmount(0);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {selectedGoal.name}
                </h4>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current: {formatIndianCurrency(selectedGoal.current_amount)}
                  </span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Target: {formatIndianCurrency(selectedGoal.target_amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(selectedGoal.current_amount, selectedGoal.target_amount)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining: {formatIndianCurrency(selectedGoal.target_amount - selectedGoal.current_amount)}
                </p>
              </div>
              <form onSubmit={handleContribute} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contribution Amount
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedGoal.target_amount - selectedGoal.current_amount}
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter amount to contribute"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Contribute
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSection;
