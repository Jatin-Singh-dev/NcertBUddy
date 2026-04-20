import React from 'react';

const SubjectSelector = ({ selectedSubjects, onToggle, error }) => {
  const subjects = [
    'Physics', 'Chemistry', 'Maths', 'Biology', 
    'English', 'History', 'Geography', 
    'Political Science', 'Economics'
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-headline mb-3">Select Subjects</label>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => {
          const isSelected = selectedSubjects.includes(subject);
          return (
            <button
              key={subject}
              type="button"
              onClick={() => onToggle(subject)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                isSelected
                  ? 'bg-teal-primary border-teal-primary text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-teal-primary/30'
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SubjectSelector;
