import React from 'react';
import { motion } from 'framer-motion';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CompactMonthSelectorProps {
  selectedMonth: Date;
  onChange: (month: Date) => void;
  darkMode?: boolean;
}

const CompactMonthSelector: React.FC<CompactMonthSelectorProps> = ({
  selectedMonth,
  onChange,
  darkMode = true,
}) => {
  const handlePreviousMonth = () => {
    onChange(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    onChange(addMonths(selectedMonth, 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${
        darkMode 
          ? 'bg-white/5 border border-white/10' 
          : 'bg-white border border-gray-200'
      } backdrop-blur-xl rounded-xl overflow-hidden`}
    >
      <div className="px-4 py-3 flex justify-between items-center border-b border-white/10">
        <span className={`flex items-center gap-1.5 text-xs ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Calendar size={12} />
          <span>Current Month</span>
        </span>
      </div>
      
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className={`p-1.5 rounded-full ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            } transition-colors`}
          >
            <ChevronLeft size={16} />
          </button>
          
          <motion.div 
            key={format(selectedMonth, 'yyyy-MM')}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center relative"
          >
            <h3 className={`text-base font-semibold ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {format(selectedMonth, 'MMMM yyyy')}
            </h3>
            
            {/* Subtle glow effect under the month */}
            <div className={`absolute inset-x-0 bottom-0 h-1 rounded-full 
              ${darkMode ? 'bg-sky-500/40' : 'bg-sky-500/40'} blur-sm mx-auto w-1/2`}
            />
          </motion.div>
          
          <button
            onClick={handleNextMonth}
            className={`p-1.5 rounded-full ${
              darkMode
                ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            } transition-colors`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        {/* Month selector buttons */}
        <div className="grid grid-cols-4 gap-1 mt-2">
          {[...Array(4)].map((_, index) => {
            const monthDate = subMonths(selectedMonth, 3 - index);
            const monthName = format(monthDate, 'MMM');
            const isSelected = format(monthDate, 'M') === format(selectedMonth, 'M');
            
            return (
              <button
                key={monthName}
                onClick={() => onChange(monthDate)}
                className={`py-1 px-1 text-xs rounded ${
                  isSelected
                    ? darkMode
                      ? 'bg-sky-500 text-white'
                      : 'bg-sky-500 text-white'
                    : darkMode
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } transition-colors`}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CompactMonthSelector; 