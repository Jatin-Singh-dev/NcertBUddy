import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendar = ({ quizDates = [] }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get first day of month (0=Sunday, 1=Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-gray-900">{monthName}</h4>
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 text-center">
        {weekDays.map((day, i) => (
          <span key={`${day}-${i}`} className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
            {day}
          </span>
        ))}
        
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(day => {
          const isToday = day === today;
          const hasQuiz = quizDates.includes(day);

          return (
            <div key={day} className="relative flex flex-col items-center justify-center h-8">
              <span className={`text-sm font-medium transition-colors ${
                isToday 
                  ? 'w-8 h-8 flex items-center justify-center bg-teal-600 text-white rounded-full shadow-md shadow-teal-100' 
                  : 'text-gray-600'
              }`}>
                {day}
              </span>
              {hasQuiz && !isToday && (
                <div className="absolute bottom-0 w-1 h-1 bg-teal-400 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
