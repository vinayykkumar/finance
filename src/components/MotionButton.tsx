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
      return 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white';
    case 'secondary':
      return 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white';
    case 'success':
      return 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white';
    case 'warning':
      return 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white';
    case 'info':
      return 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white';
    default:
      return 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white';
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
      className={`px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm 
                hover:shadow-md transition-all duration-300 font-medium
                backdrop-filter backdrop-blur-sm relative overflow-hidden
                ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <span className="relative z-10">{children}</span>
      <motion.span 
        className="absolute inset-0 bg-white opacity-0 rounded-xl"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 1.5, opacity: 0.3 }}
        transition={{ duration: 0.4 }}
      />
    </motion.button>
  );
};

export default MotionButton;
