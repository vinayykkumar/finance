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
      className={`card-pixelbin hover:-translate-y-2 relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        delay: delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
