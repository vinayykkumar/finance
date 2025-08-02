import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface ReportsPageProps {
  selectedMonth: Date;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ selectedMonth }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg">
          <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Financial Reports</h2>
      </div>
      
      <div className="p-12 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Financial reporting will be implemented in a future update.
        </p>
      </div>
    </motion.div>
  );
};

export default ReportsPage; 