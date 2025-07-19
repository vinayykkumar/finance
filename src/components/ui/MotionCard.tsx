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
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 
                shadow-sm hover:shadow-md transition-all duration-200 
                hover:-translate-y-1 relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.01,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
