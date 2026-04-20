import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({ children, rightContent }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white md:bg-[#F3F4F6] md:flex md:items-center md:justify-center p-0 md:p-6 lg:p-12 font-sans">
      {/* Main Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[900px] bg-white md:rounded-2xl md:shadow-[0_8px_40px_rgba(0,0,0,0.10)] overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[600px]"
      >
        {/* Left Panel (Form) */}
        <div className="w-full md:w-1/2 bg-white px-6 py-8 md:p-12 flex flex-col relative">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-teal-primary transition-colors font-medium mb-8"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>

          <div className="mb-8">
            <span className="text-teal-primary font-bold text-xl font-display">NCERT Buddy</span>
          </div>

          <div className="flex-1 flex flex-col justify-center w-full">
            {children}
          </div>
        </div>

        {/* Right Panel (Illustration/Stats) */}
        <div className="hidden md:flex md:w-1/2 bg-[#F0FDF4] p-10 flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full text-center">
            {rightContent}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
