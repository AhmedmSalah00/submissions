import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'neumorphic';
}

const Card: React.FC<CardProps> = ({ children, className = '', variant = 'neumorphic' }) => {
  const variantClass = variant === 'glass' ? 'card-glass' : 'card-neumorphic';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${variantClass} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
