import React from 'react';
import { motion } from 'motion/react';

const QuizHistoryRow = ({ subject, chapter, score, date, delay = 0 }) => {
  const [current, total] = score.split('/').map(Number);
  const percentage = (current / total) * 10;
  
  let badgeColor = 'bg-rose-50 text-rose-600';
  if (current >= 6) badgeColor = 'bg-emerald-50 text-emerald-600';
  else if (current >= 4) badgeColor = 'bg-amber-50 text-amber-600';

  const subjectColors = {
    Science: 'bg-teal-50 text-teal-600',
    Maths: 'bg-blue-50 text-blue-600',
    English: 'bg-amber-50 text-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-50 hover:border-teal-100 transition-colors group"
    >
      <div className="flex items-center gap-4 flex-1">
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${subjectColors[subject] || 'bg-gray-50 text-gray-600'}`}>
          {subject}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{chapter}</h4>
          <p className="text-[12px] text-gray-400 mt-0.5">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColor}`}>
          {score}
        </div>
        <button className="text-xs font-bold text-gray-400 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100">
          Review
        </button>
      </div>
    </motion.div>
  );
};

export default QuizHistoryRow;
