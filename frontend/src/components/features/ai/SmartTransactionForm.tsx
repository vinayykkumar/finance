import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { suggestCategory, createSmartTransaction } from '../../../lib/ai-service';
import type { CategorySuggestion, SmartTransactionResult } from '../../../lib/ai-service';

interface SmartTransactionFormProps {
  onTransactionCreated?: (transaction: any) => void;
  categories: Array<{ id: string; name: string; color: string }>;
}

const SmartTransactionForm: React.FC<SmartTransactionFormProps> = ({ 
  onTransactionCreated, 
  categories 
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null);
  const [smartResult, setSmartResult] = useState<SmartTransactionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'suggestion' | 'result'>('input');

  const handleGetSuggestion = async () => {
    if (!description.trim() || amount <= 0) return;
    
    setLoading(true);
    try {
      const [categoryResult, smartResult] = await Promise.all([
        suggestCategory(description, amount),
        createSmartTransaction(description, amount)
      ]);
      
      setSuggestion(categoryResult);
      setSmartResult(smartResult);
      setStep('suggestion');
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestion && onTransactionCreated) {
      const transaction = {
        description,
        amount,
        category_id: suggestion.category_id,
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        bank_id: '', // Would need to be selected
      };
      onTransactionCreated(transaction);
    }
    setStep('result');
  };

  const handleReset = () => {
    setDescription('');
    setAmount(0);
    setSuggestion(null);
    setSmartResult(null);
    setStep('input');
  };

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return '#6366F1';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6366F1';
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Smart Transaction Assistant
            <Sparkles className="h-5 w-5 text-purple-500" />
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI-powered category suggestions and spending insights
          </p>
        </div>
      </div>

      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Lunch at McDonald's, Uber ride to office, Grocery shopping"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white dark:bg-gray-700 transition-all duration-300"
            />
          </div>

          <motion.button
            onClick={handleGetSuggestion}
            disabled={!description.trim() || amount <= 0 || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Get AI Suggestions
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {step === 'suggestion' && suggestion && smartResult && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Category Suggestion */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(suggestion.category_id) }}
              />
              Suggested Category
            </h4>
            
            {suggestion.category_id ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">
                    {suggestion.category_name}
                  </span>
                  <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                    {(suggestion.confidence * 100).toFixed(0)}% confident
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {suggestion.reason}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No specific category suggestion available. You can manually select one.
              </p>
            )}
          </div>

          {/* AI Insights */}
          {smartResult.insights.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                AI Insights
              </h4>
              <ul className="space-y-2">
                {smartResult.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Anomaly Warning */}
          {smartResult.anomaly_detected && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  ⚠️
                </motion.div>
                Unusual Spending Detected
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This transaction amount is significantly higher than your usual spending pattern.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleAcceptSuggestion}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="h-5 w-5" />
              Accept & Continue
            </motion.button>
            <motion.button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Over
            </motion.button>
          </div>
        </motion.div>
      )}

      {step === 'result' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Smart Transaction Complete!
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your transaction has been processed with AI-powered insights.
            </p>
          </div>
          <motion.button
            onClick={handleReset}
            className="bg-purple-600 text-white py-2 px-6 rounded-xl font-medium hover:bg-purple-700 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Another Transaction
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SmartTransactionForm;