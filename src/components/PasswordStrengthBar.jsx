import React from 'react';

const PasswordStrengthBar = ({ password }) => {
  const getStrength = (pass) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) strength++;
    if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  return (
    <div className="flex gap-2 mt-2">
      <div className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= 1 ? 'bg-red-500' : 'bg-gray-200'}`} />
      <div className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
      <div className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= 3 ? 'bg-green-500' : 'bg-gray-200'}`} />
    </div>
  );
};

export default PasswordStrengthBar;
