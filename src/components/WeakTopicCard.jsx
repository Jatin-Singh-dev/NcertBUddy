import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

const WeakTopicCard = ({ subject, chapter, avgScore }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-l-4 border-l-amber-400 border-y border-r border-gray-50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{subject}</span>
          <span className="w-1 h-1 bg-gray-200 rounded-full" />
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Avg {avgScore}%</span>
        </div>
        <h4 className="text-sm font-bold text-gray-900">{chapter}</h4>
      </div>
      
      <button className="flex items-center gap-2 text-xs font-bold text-teal-600 hover:gap-3 transition-all">
        Take quiz again
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default WeakTopicCard;
