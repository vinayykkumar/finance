import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { useData } from '../../providers/DataProvider';
import MotionButton from '../../components/ui/MotionButton';
import MotionCard from '../../components/ui/MotionCard';
import { Category } from '../../types';

const CategoriesPage: React.FC = () => {
  const { 
    categories, 
    categorySpending,
    newCategory,
    setNewCategory,
    formatIndianCurrency,
    getProgressColor,
    loadCategories,
    loadCategorySpending,
    createCategory,
    deleteCategory,
    updateCategory
  } = useData();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [updatedCategoryName, setUpdatedCategoryName] = useState("");
  const [updatedCategoryLimit, setUpdatedCategoryLimit] = useState<number | undefined>(undefined);

  // Handler for editing category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setUpdatedCategoryName(category.name);
    setUpdatedCategoryLimit(category.monthly_limit);
    setIsEditCategoryModalOpen(true);
  };

  // Handler for saving edited category
  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory.id, {
        name: updatedCategoryName,
        monthly_limit: updatedCategoryLimit || undefined,
      });
      await loadCategories();
      await loadCategorySpending();
      setIsEditCategoryModalOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    }
  };

  // Handler for deleting category
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      await loadCategories();
      await loadCategorySpending();
    } catch (error) {
      alert("Failed to delete category");
    }
  };

  return (
    <>
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
                              categorySpending[category.id].spent > (category.monthly_limit || 0)
                                ? "text-red-600 dark:text-red-400 font-medium"
                                : "text-green-600 dark:text-green-400 font-medium"
                            }
                          >
                            {formatIndianCurrency(
                              Math.max(0, (category.monthly_limit || 0) - categorySpending[category.id].spent),
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
                            className={`h-2.5 rounded-full ${getProgressColor(categorySpending[category.id].spent / (category.monthly_limit || 1))}`}
                            style={{
                              width: `${Math.min(
                                (categorySpending[category.id].spent / (category.monthly_limit || 1)) * 100,
                                100,
                              )}%`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min(
                                (categorySpending[category.id].spent / (category.monthly_limit || 1)) * 100,
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
                  e.preventDefault();
                  try {
                    await createCategory(newCategory);
                    setIsCategoryModalOpen(false);
                    setNewCategory({ name: "", color: "#6366F1", icon: "tag", monthly_limit: 0 });
                    await Promise.all([loadCategories(), loadCategorySpending()]);
                  } catch (error) {
                    console.error("Error creating category:", error);
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={newCategory.name || ''}
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
                      value={newCategory.monthly_limit || ''}
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
                      value={newCategory.color || '#6366F1'}
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
    </>
  );
};

export default CategoriesPage; 