import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const InvestmentsPage: React.FC = () => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Investments</h2>
      </div>
      
      <div className="p-12 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Investment tracking will be implemented in a future update.
        </p>
      </div>
    </motion.div>
  );
};

export default InvestmentsPage; 