import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthTimelineProps {
  selectedMonth: Date;
  onChange: (month: Date) => void;
  monthRange?: number; // Number of months to show on either side
  isDarkMode?: boolean;
  transactionData?: {
    month: Date;
    income: number;
    expense: number;
  }[];
}

const MonthTimeline: React.FC<MonthTimelineProps> = ({
  selectedMonth,
  onChange,
  monthRange = 3,
  isDarkMode = false,
  transactionData = [],
}) => {
  // Generate array of months to display in timeline
  const [months, setMonths] = useState<Date[]>([]);

  // Generate month timeline
  useEffect(() => {
    const monthsArray: Date[] = [];
    
    // Add months before current
    for (let i = monthRange; i > 0; i--) {
      monthsArray.push(subMonths(selectedMonth, i));
    }
    
    // Add current month
    monthsArray.push(selectedMonth);
    
    // Add future months
    for (let i = 1; i <= monthRange; i++) {
      monthsArray.push(addMonths(selectedMonth, i));
    }
    
    setMonths(monthsArray);
  }, [selectedMonth, monthRange]);
  
  // Get transaction data for a specific month (for mini sparklines)
  const getMonthData = (month: Date) => {
    return transactionData.find(data => 
      isSameMonth(data.month, month)
    ) || { month, income: 0, expense: 0 };
  };
  
  // Calculate trend percentages (simplified for mini-indicators)
  const getTrendHeight = (month: Date): number => {
    const data = getMonthData(month);
    const total = data.income + data.expense;
    if (total === 0) return 50; // neutral
    
    // Return value between 20-80 where higher means more income than expenses
    return Math.min(80, Math.max(20, (data.income / total) * 100));
  };
  
  // Navigate to previous/next month
  const navigatePrevious = () => onChange(subMonths(selectedMonth, 1));
  const navigateNext = () => onChange(addMonths(selectedMonth, 1));

  return (
    <motion.div 
      className={`relative overflow-hidden p-4 rounded-2xl ${
        isDarkMode 
          ? 'bg-slate-800/30 border border-slate-700/30' 
          : 'bg-white/30 border border-slate-200/30'
      } backdrop-filter backdrop-blur-md mb-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Timeline
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={navigatePrevious}
            className={`p-1.5 rounded-full ${
              isDarkMode 
                ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' 
                : 'bg-slate-200/50 hover:bg-slate-200 text-slate-600'
            } transition-colors`}
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={navigateNext}
            className={`p-1.5 rounded-full ${
              isDarkMode 
                ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' 
                : 'bg-slate-200/50 hover:bg-slate-200 text-slate-600'
            } transition-colors`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="relative">
        {/* Timeline track */}
        <div 
          className={`absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-slate-200/70'
          }`}
        ></div>
        
        {/* Month nodes */}
        <div className="flex justify-between relative py-4">
          <AnimatePresence>
            {months.map((month, index) => {
              const isSelected = isSameMonth(month, selectedMonth);
              const trendHeight = getTrendHeight(month);
              
              return (
                <motion.div
                  key={format(month, 'yyyy-MM')}
                  className="flex flex-col items-center relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* Data indicator (mini-sparkline) */}
                  <div 
                    className={`w-0.5 mb-2 rounded-full transition-all duration-300 ${
                      isDarkMode ? 'bg-slate-600' : 'bg-slate-300'
                    } ${isSelected ? 'h-12' : 'h-6'}`}
                    style={{ 
                      background: isSelected 
                        ? `linear-gradient(to top, #10b981 ${trendHeight}%, #f43f5e ${trendHeight}%)` 
                        : '' 
                    }}
                  ></div>
                  
                  {/* Month node */}
                  <motion.button
                    onClick={() => onChange(month)}
                    className={`relative rounded-full z-10 flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? isDarkMode
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                          : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : isDarkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: isSelected ? '44px' : '32px',
                      height: isSelected ? '44px' : '32px',
                    }}
                  >
                    <span className={`font-medium ${isSelected ? 'text-sm' : 'text-xs'}`}>
                      {format(month, 'MMM')}
                    </span>
                    
                    {/* Selection indicator glow */}
                    {isSelected && (
                      <motion.div 
                        className={`absolute inset-0 rounded-full ${
                          isDarkMode ? 'bg-indigo-500' : 'bg-indigo-400'
                        } opacity-20 blur-md -z-10`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.3 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    )}
                  </motion.button>
                  
                  {/* Month name */}
                  <motion.span 
                    className={`mt-2 text-xs ${
                      isSelected 
                        ? isDarkMode ? 'text-white' : 'text-slate-900 font-medium' 
                        : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    } transition-colors`}
                    animate={{ 
                      y: isSelected ? -4 : 0,
                      opacity: isSelected ? 1 : 0.7
                    }}
                  >
                    {format(month, 'yyyy')}
                  </motion.span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Current month display */}
      <div className="mt-2 text-center">
        <h2 className={`text-xl font-bold ${
          isDarkMode ? 'text-white' : 'text-slate-800'
        }`}>
          {format(selectedMonth, 'MMMM yyyy')}
        </h2>
      </div>
    </motion.div>
  );
};

export default MonthTimeline; 