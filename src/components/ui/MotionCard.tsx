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
      className={`glass-card rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/20 
                hover:shadow-2xl transition-all duration-500 
                backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 
                hover:bg-white/90 dark:hover:bg-gray-800/90 
                relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.03,
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/5 dark:from-white/5 dark:to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-blue-500/5 dark:to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
      {children}
    </motion.div>
  );
};

export default MotionCard;
