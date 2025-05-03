import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
  onClick: (id: string) => void;
}

interface AnimatedSidebarProps {
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive?: boolean;
    onClick?: (id: string) => void;
  }[];
  activeId?: string;
  onItemClick: (id: string) => void;
  isOpen: boolean;
  darkMode: boolean;
  className?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ id, label, icon, isActive, onClick }) => {
  return (
    <motion.div
      className="relative group"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={() => onClick(id)}
        className="w-full flex items-center py-3 px-4 text-left"
      >
        <motion.div 
          className={`flex items-center ${isActive ? "text-indigo-400" : "text-gray-600 dark:text-gray-300"}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {icon}
        </motion.div>
        <motion.span 
          className={`ml-3 ${isActive ? "text-indigo-400" : "text-gray-600 dark:text-gray-300"}`}
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {label}
        </motion.span>
      </button>
      {isActive && (
        <motion.div 
          className="absolute right-0 top-0 h-full w-[2px] bg-indigo-400"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
};

const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({ 
  items, 
  activeId, 
  onItemClick, 
  isOpen, 
  darkMode,
  className = ""
}) => {
  return (
    <motion.aside
      className={`${darkMode ? "bg-[#111827]" : "bg-white border-r border-gray-200"} 
                  w-64 flex-shrink-0 fixed md:relative md:top-0 h-[calc(100vh-4rem)] z-20
                  backdrop-filter backdrop-blur-lg
                  ${darkMode ? "bg-opacity-80" : "bg-opacity-80"}
                  transform ${!isOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
                  transition-transform duration-300 ease-in-out
                  ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="px-4 py-5">
          <h2 className={`${darkMode ? "text-gray-400" : "text-gray-500"} uppercase text-xs tracking-wider`}>
            MAIN MENU
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {items.map((item) => (
              <SidebarItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={item.id === activeId}
                onClick={onItemClick}
              />
            ))}
          </AnimatePresence>
        </nav>

        <motion.div 
          className={`mt-auto pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div 
            className={`${darkMode ? "bg-indigo-900/20" : "bg-indigo-50"} rounded-xl p-4 mx-4 mb-4
                        backdrop-filter backdrop-blur-md
                        ${darkMode ? "bg-opacity-30" : "bg-opacity-50"}
                        hover:shadow-lg transition-all duration-300`}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Total Balance</h3>
              <span className={`text-xs ${darkMode ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-600"} px-2 py-1 rounded-full`}>
                All Accounts
              </span>
            </div>
            <motion.p 
              className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.5
              }}
            >
              {/* Balance will be passed as a prop */}
              ₹1,25,000
            </motion.p>
            <div className={`mt-3 flex items-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <motion.div
                initial={{ rotate: -45 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {/* Icon will be passed as a prop based on trend */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <span className="text-green-500 font-medium">+2.5%</span>
              <span className="ml-1">from last month</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default AnimatedSidebar;
