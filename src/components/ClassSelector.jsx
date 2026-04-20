import React from 'react';

const ClassSelector = ({ selectedClass, onSelect, error }) => {
  const classes = ['9', '10', '11', '12'];

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-headline mb-3">Select Class</label>
      <div className="flex gap-3">
        {classes.map((cls) => (
          <button
            key={cls}
            type="button"
            onClick={() => onSelect(cls)}
            className={`flex-1 py-2 rounded-full font-bold transition-all border-2 ${
              selectedClass === cls
                ? 'bg-teal-primary border-teal-primary text-white'
                : 'bg-white border-gray-200 text-gray-500 hover:border-teal-primary/30'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ClassSelector;
