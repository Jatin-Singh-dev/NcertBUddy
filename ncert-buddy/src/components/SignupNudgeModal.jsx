import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupNudgeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignup = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-headline mb-4 font-display">
          You have used your 2 free questions
        </h2>
        <p className="text-body-text mb-8 font-sans">
          Sign up free to unlock unlimited AI doubts, daily quizzes, CBSE papers, and your personal dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleSignup}
            className="w-full py-3.5 bg-teal-primary text-white font-semibold rounded-xl hover:scale-[1.03] transition-all font-sans"
          >
            Sign up free — it takes 30 seconds
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3.5 text-body-text font-semibold hover:bg-gray-50 rounded-xl transition-all font-sans"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupNudgeModal;
