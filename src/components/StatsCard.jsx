import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ label, value, trend, icon: Icon, delay = 0 }) => {
  const isPositive = trend?.startsWith('+');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[13px] font-medium text-gray-500 font-sans">{label}</span>
        {Icon && (
          <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
            <Icon size={16} />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-gray-900 font-display">{value}</h3>
        {label === 'Study streak' && <span className="text-2xl">🔥</span>}
      </div>

      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-[12px] font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;
