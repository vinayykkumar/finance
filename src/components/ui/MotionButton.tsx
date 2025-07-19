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
      return 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-1';
    case 'secondary':
      return 'bg-white/80 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 text-gray-900 dark:text-white border border-gray-200/50 dark:border-white/20 backdrop-blur-xl hover:-translate-y-1';
    case 'success':
      return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1';
    case 'danger':
      return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-1';
    case 'warning':
      return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-1';
    case 'info':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 neon-accent';
    default:
      return 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-1';
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
      className={`px-6 py-3 rounded-xl flex items-center gap-2 
                transition-all duration-300 font-semibold relative overflow-hidden
                ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default MotionButton;
