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
  totalBalance?: number;
  formatIndianCurrency?: (amount: number) => string;
  children?: React.ReactNode;
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
  className = "",
  totalBalance,
  formatIndianCurrency,
  children
}) => {
  return (
    <motion.aside
      className={`${darkMode ? "bg-[#111827]" : "bg-white border-r border-gray-200"} 
                  w-64 flex-shrink-0 md:relative z-20
                  h-[calc(100vh-4rem)] md:h-auto
                  backdrop-filter backdrop-blur-lg
                  ${darkMode ? "bg-opacity-80" : "bg-opacity-80"}
                  absolute md:relative left-0 top-0 md:top-auto
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

        {children && (
          <motion.div 
            className={`mt-auto pt-4 border-t ${darkMode ? "border-gray-700/50" : "border-gray-200/70"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="px-4 mb-4">
              <div className="px-2 pb-2">
                <h2 className={`${darkMode ? "text-gray-400" : "text-gray-500"} uppercase text-xs tracking-wider`}>
                  Date Range
                </h2>
              </div>
              {children}
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default AnimatedSidebar;
