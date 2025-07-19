import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MotionButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

const getVariantClasses = (variant: string): string => {
  switch (variant) {
    case 'primary':
      return 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40';
    case 'secondary':
      return 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600';
    case 'success':
      return 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40';
    case 'danger':
      return 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40';
    case 'warning':
      return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40';
    case 'info':
      return 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40';
    default:
      return 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40';
  }
};

const MotionButton: React.FC<MotionButtonProps> = ({ 
  children, 
  className = "", 
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary'
}) => {
  const variantClasses = getVariantClasses(variant);
  
  return (
    <motion.button
      type={type}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 
                transition-all duration-200 font-medium relative overflow-hidden
                ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default MotionButton;
