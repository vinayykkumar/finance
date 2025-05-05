import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

const MotionCard: React.FC<MotionCardProps> = ({ 
  children, 
  className = "", 
  onClick,
  delay = 0
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 
                dark:border-gray-700 hover:shadow-lg transition-all duration-300 
                backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 
                hover:bg-opacity-100 dark:hover:bg-opacity-100 
                relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {children}
    </motion.div>
  );
};

export default MotionCard;
