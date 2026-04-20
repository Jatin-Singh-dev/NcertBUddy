import React from 'react';
import { motion } from 'motion/react';

const ProgressRing = ({ progress = 0.73 }) => {
  const RADIUS = 70;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dash = progress * CIRCUMFERENCE;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="80"
          cy="80"
          r={RADIUS}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-gray-100"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="80"
          cy="80"
          r={RADIUS}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE - dash }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          className="text-teal-500"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 font-display">
          {Math.round(progress * 100)}%
        </span>
        <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
          avg score
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;
