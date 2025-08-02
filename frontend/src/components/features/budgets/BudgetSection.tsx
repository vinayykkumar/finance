import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Trash2, BarChart2, TrendingUp, ChevronUp, Edit } from 'lucide-react';
import { format } from 'date-fns';
// Import types and functions from the real service
import { BudgetSummaryItem, getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary, getBudgetAnalytics, getBudgetRecommendations } from '../../../lib/budget-service';
import { getCategories, Category as CategoryType } from '../../../lib/category-service';

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
}

interface BudgetAnalytics {
  totalBudget: number;
  totalSpent: number;
  topCategories: { category_id: string; percentage: number }[];
  monthlyTrend: { month: string; budget: number; spent: number }[];
}

interface BudgetRecommendation {
  category_id: string;
  current_budget: number;
  recommended_budget: number;
  reason: string;
}

interface BudgetSectionProps {
  formatIndianCurrency: (amount: number) => string;
  selectedMonth: Date;
  categories: CategoryType[];
}

// Add CSS for the stripe animation
const BudgetSection: React.FC<BudgetSectionProps> = ({ formatIndianCurrency, selectedMonth, categories }) => {
  // Add the CSS animation style to the document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes stripe-animation {
        0% { background-position: 0 0; }
        100% { background-position: 30px 0; }
      }
      .stripe-animation {
        background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent);
        background-size: 30px 30px;
        animation: stripe-animation 1s linear infinite;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);


  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryItem[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ category_id: '', amount: 0 });
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<BudgetAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    if (selectedMonth) {
      loadData();
    }
  }, [selectedMonth]);
  
  // Load analytics and recommendations when budget summary changes
  useEffect(() => {
    if (selectedMonth) {
      if (budgetSummary.length > 0) {
        loadAnalytics();
        loadRecommendations();
      }
    }
  }, [selectedMonth]);
  
  // Check if the database is properly set up
  useEffect(() => {
    const checkDatabaseSetup = async () => {
      try {
        // Try to get categories as a simple check
        await getCategories();
      } catch (error) {
        console.error('Database connection error:', error);
        if (error instanceof Error && error.message.includes('does not exist')) {
          alert('Database tables are not set up correctly. Please make sure Supabase is running and migrations are applied.');
        } else {
          alert('Unexpected error occurred while connecting to the database. Please check the logs for more details.');
        }
      }
    };

    checkDatabaseSetup();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading budget data for month:', format(selectedMonth, 'MMMM yyyy'));
      
      // Load budgets from the database
      const budgetsData = await getBudgets(selectedMonth);
      console.log('Budgets loaded:', budgetsData);
      setBudgets(budgetsData);
      
      // Load budget summary
      const summaryData = await getBudgetSummary(selectedMonth);
      console.log('Budget summary loaded:', summaryData);
      setBudgetSummary(summaryData);
      
    } catch (error) {
      console.error('Error loading budget data:', error);
      
      // Set empty arrays if there's an error
      setBudgets([]);
      setBudgetSummary([]);
      
      // Show error notification to user
      alert('Failed to load budget data from Supabase. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      console.log('Loading budget analytics for month:', format(selectedMonth, 'MMMM yyyy'));
      const analyticsData = await getBudgetAnalytics(selectedMonth);
      console.log('Budget analytics loaded:', analyticsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading budget analytics:', error);
      // Set default analytics if there's an error
      setAnalytics({
        totalBudget: budgetSummary.reduce((sum, item) => sum + item.budget_amount, 0),
        totalSpent: budgetSummary.reduce((sum, item) => sum + item.spent_amount, 0),
        topCategories: [],
        monthlyTrend: []
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };
  
  const loadRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      console.log('Loading budget recommendations for month:', format(selectedMonth, 'MMMM yyyy'));
      const recommendationsData = await getBudgetRecommendations(selectedMonth);
      console.log('Budget recommendations loaded:', recommendationsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading budget recommendations:', error);
      // Set default empty recommendations if there's an error
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newBudget.category_id) {
        alert('Please select a category');
        return;
      }
      
      if (newBudget.amount <= 0) {
        alert('Budget amount must be greater than zero');
        return;
      }
      
      console.log('Creating new budget:', newBudget);
      const budget = await createBudget(newBudget.category_id, newBudget.amount, selectedMonth);
      console.log('Budget created successfully:', budget);
      
      // Refresh data
      await loadData();
      
      // Reset form and close modal
      setNewBudget({ category_id: '', amount: 0 });
      setIsBudgetModalOpen(false);
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Failed to create budget. Please try again.');
    }
  };
  
  const handleUpdateBudget = async (id: string, amount: number) => {
    try {
      console.log(`Updating budget ${id} with amount ${amount}`);
      await updateBudget(id, amount);
      console.log('Budget updated successfully');
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget. Please try again.');
    }
  };
  
  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        console.log(`Deleting budget ${id}`);
        await deleteBudget(id);
        console.log('Budget deleted successfully');
        
        // Refresh data
        await loadData();
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  const handleBulkBudgetCreation = async () => {
    try {
      // Get categories that don't already have budgets for this month
      const existingBudgetCategoryIds = budgets.map(b => b.category_id);
      const categoriesWithoutBudgets = categories.filter(c => !existingBudgetCategoryIds.includes(c.id));
      
      if (categoriesWithoutBudgets.length === 0) {
        alert('All categories already have budgets for this month.');
        return;
      }
      
      console.log('Creating budgets for categories:', categoriesWithoutBudgets.map(c => c.name));
      
      // Create a budget for each category
      const creationPromises = categoriesWithoutBudgets.map(category => 
        createBudget(category.id, 5000, selectedMonth) // Default amount of 5000
      );
      
      await Promise.all(creationPromises);
      console.log('Bulk budget creation successful');
      
      // Refresh data
      await loadData();
      
      alert(`Created ${categoriesWithoutBudgets.length} new budgets with default amount of ₹5,000 each.`);
    } catch (error) {
      console.error('Error creating bulk budgets:', error);
      alert('Failed to create budgets for all categories. Please try again.');
    }
  };

  const getCategoryName = (categoryId: string) => {
    // If categories aren't loaded yet, return the ID as a fallback
    if (!categories || categories.length === 0) {
      console.log('Categories not loaded yet, using ID as fallback');
      return categoryId;
    }
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      console.log(`Category not found for ID: ${categoryId}`);
    }
    return category ? category.name : `Unknown (${categoryId})`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  // Month navigation is now handled by the parent component

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
            <PiggyBank className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Budget Planning</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 transition-all duration-300 font-medium"
          >
            <BarChart2 size={18} />
            <span className="hidden sm:inline">Analytics</span>
          </button>
          {recommendations.length > 0 && (
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="px-4 py-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-800/60 flex items-center gap-2 transition-all duration-300 font-medium"
            >
              <TrendingUp size={18} />
              <span className="hidden sm:inline">Suggestions</span>
              <span className="flex items-center justify-center bg-amber-500 text-white text-xs rounded-full h-5 w-5">
                {recommendations.length}
              </span>
            </button>
          )}
          <div className="flex">
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-l-xl hover:bg-indigo-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Budget</span>
            </button>
            <button
              onClick={handleBulkBudgetCreation}
              title="Create default budgets for all categories"
              className="px-3 py-2.5 bg-indigo-700 text-white rounded-r-xl hover:bg-indigo-800 flex items-center border-l border-indigo-500 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Edit size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Month is now controlled by the parent component */}

      {/* Budget Analytics Section */}
      {showAnalytics && analytics && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Budget Analytics
            </h3>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>
          
          {analyticsLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Budget</div>
                  <div className="text-xl font-semibold text-gray-800 dark:text-white">
                    {formatIndianCurrency(analytics.totalBudget)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spent</div>
                  <div className="text-xl font-semibold text-gray-800 dark:text-white">
                    {formatIndianCurrency(analytics.totalSpent)}
                  </div>
                </div>
              </div>
              
              {/* Monthly Trend */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Monthly Trend</h4>
                <div className="relative h-40">
                  {analytics.monthlyTrend.map((item, index) => {
                    const maxValue = Math.max(
                      ...analytics.monthlyTrend.map(t => Math.max(t.budget, t.spent))
                    );
                    const budgetHeight = (item.budget / maxValue) * 100;
                    const spentHeight = (item.spent / maxValue) * 100;
                    const barWidth = 100 / (analytics.monthlyTrend.length * 3); // 3 parts: budget, spent, gap
                    
                    return (
                      <div 
                        key={item.month} 
                        className="absolute bottom-0 flex items-end gap-1"
                        style={{ 
                          left: `${index * (barWidth * 3) + barWidth/2}%`,
                          width: `${barWidth * 2}%`
                        }}
                      >
                        <div 
                          className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-t-sm"
                          style={{ height: `${budgetHeight}%` }}
                        ></div>
                        <div 
                          className={`w-full ${item.spent > item.budget ? 'bg-red-400 dark:bg-red-700' : 'bg-green-400 dark:bg-green-700'} rounded-t-sm`}
                          style={{ height: `${spentHeight}%` }}
                        ></div>
                        <div className="absolute -bottom-6 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap" style={{ left: '0%', width: '100%', textAlign: 'center' }}>
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center mt-8 gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-200 dark:bg-indigo-800"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 dark:bg-green-700"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Spent</span>
                  </div>
                </div>
              </div>
              
              {/* Top Categories */}
              {analytics.topCategories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Top Spending Categories</h4>
                  <div className="space-y-3">
                    {analytics.topCategories.map(category => (
                      <div key={category.category_id} className="">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getCategoryName(category.category_id)}
                          </span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-500 dark:bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Budget Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-amber-100 dark:border-amber-900/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              Budget Recommendations
            </h3>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>
          
          {recommendationsLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on your spending patterns, we suggest the following budget adjustments:
              </p>
              
              <div className="space-y-4">
                {recommendations.map(rec => (
                  <div key={rec.category_id} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">
                          {getCategoryName(rec.category_id)}
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {rec.reason}
                        </p>
                      </div>
                      <button 
                        onClick={async () => {
                          const budget = budgets.find(b => b.category_id === rec.category_id);
                          if (budget) {
                            await updateBudget(budget.id, rec.recommended_budget);
                            await loadData();
                            // Remove this recommendation from the list
                            setRecommendations(prev => prev.filter(r => r.category_id !== rec.category_id));
                          }
                        }}
                        className="px-3 py-1 bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 rounded-lg text-sm hover:bg-amber-300 dark:hover:bg-amber-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Current: {formatIndianCurrency(rec.current_budget)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Recommended: {formatIndianCurrency(rec.recommended_budget)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Budget progress cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {budgetSummary.map((item) => (
              <div
                key={item.category_id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {getCategoryName(item.category_id)}
                  </h3>
                  <button
                    onClick={() => {
                      const budget = budgets.find(b => b.category_id === item.category_id);
                      if (budget) {
                        handleDeleteBudget(budget.id);
                      }
                    }}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 opacity-60 hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full mr-2"></span>
                      Spent: {formatIndianCurrency(item.spent_amount)}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="inline-block w-2 h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full mr-2"></span>
                      Budget: {formatIndianCurrency(item.budget_amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden backdrop-blur-sm shadow-inner">
                    <div
                      className={`${getProgressColor(item.percentage)} h-3 rounded-full transition-all duration-500 relative`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    >
                      {item.percentage > 15 && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute inset-0 opacity-20 stripe-animation"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${item.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {item.remaining < 0 ? 'Overspent: ' : 'Remaining: '}
                      {formatIndianCurrency(Math.abs(item.remaining))}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.remaining < 0 ? '😟 Over budget' : item.percentage > 90 ? '⚠️ Almost spent' : '👍 On track'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full h-12 w-12 shadow-inner">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No budgets message */}
          {budgetSummary.length === 0 && (
            <div className="text-center py-10">
              <PiggyBank className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No budgets set</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start planning your finances by setting up category budgets
              </p>
              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
              >
                <Plus size={18} />
                Add Your First Budget
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Add Budget for {format(selectedMonth, 'MMMM yyyy')}
              </h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddBudget} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  required
                  value={newBudget.category_id}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget Amount
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter budget amount"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-2 hover:translate-y-[-2px]"
              >
                <Plus className="h-5 w-5" />
                Add Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSection;
