import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import ClassSelector from '../components/ClassSelector';
import SubjectSelector from '../components/SubjectSelector';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.jsx';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedClass: '',
    selectedSubjects: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassSelect = (cls) => {
    setFormData(prev => ({ ...prev, selectedClass: cls }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => {
      const subjects = prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject];
      return { ...prev, selectedSubjects: subjects };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.selectedClass) newErrors.selectedClass = 'Please select a class';
    if (formData.selectedSubjects.length === 0) newErrors.selectedSubjects = 'Select at least one subject';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        selectedClass: formData.selectedClass,
        selectedSubjects: formData.selectedSubjects,
      });
      setIsSuccess(true);
    } catch (error) {
      const message = error.message || 'Signup failed. Please try again.';
      if (message.toLowerCase().includes('already registered')) {
        setErrors({ email: 'An account with this email already exists. Try logging in.' });
      } else {
        setErrors({ email: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      setErrors({ email: 'Google sign-up failed. Please try again.' });
    }
  };

  const rightContent = (
    <div className="flex flex-col items-center w-full">
      <div className="relative mb-12 w-full flex justify-center">
        <img src="/learning.svg" alt="Student learning" className="w-full max-w-[380px] h-auto object-contain" />
        
        {/* Floating Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100 w-64"
        >
          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-primary">
            <span className="font-bold text-lg">📝</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-headline">1,200+ Quiz questions</p>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ready for you</span>
          </div>
        </motion.div>
      </div>
      
      <h2 className="text-2xl font-display font-bold text-headline mb-2">Everything you need to ace your boards.</h2>
      <p className="text-gray-500 font-sans">Join 5,000+ students today</p>
    </div>
  );

  return (
    <AuthLayout rightContent={rightContent}>
      {isSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-20 h-20 bg-teal-50 text-teal-primary rounded-full flex items-center justify-center mb-8 text-4xl shadow-sm border border-teal-100">
            ✨
          </div>
          <h1 className="text-[32px] font-extrabold font-display leading-tight mb-4">Account created!</h1>
          <p className="text-body-text max-w-sm mx-auto mb-10 text-lg">
            Check your email to verify your account, then log in to access your dashboard.
          </p>
          <Link 
            to="/login" 
            className="w-full bg-dark-bg text-white h-[56px] rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg"
          >
            Go to Login
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold font-display leading-tight mb-2">Create your free account</h1>
            <p className="text-body-text">Join 5,000 students already using NCERT Buddy.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pb-12">
        <div>
          <label className="block text-sm font-bold text-headline mb-1.5">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none bg-white focus:bg-gray-50 ${
              errors.fullName ? 'border-red-500' : 'border-gray-100 focus:border-teal-primary/30'
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-headline mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none bg-white focus:bg-gray-50 ${
              errors.email ? 'border-red-500' : 'border-gray-100 focus:border-teal-primary/30'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-headline mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none bg-white focus:bg-gray-50 pr-12 ${
                errors.password ? 'border-red-500' : 'border-gray-100 focus:border-teal-primary/30'
              }`}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <PasswordStrengthBar password={formData.password} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-headline mb-1.5">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all outline-none bg-white focus:bg-gray-50 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-100 focus:border-teal-primary/30'
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <ClassSelector 
          selectedClass={formData.selectedClass} 
          onSelect={handleClassSelect} 
          error={errors.selectedClass}
        />

        <SubjectSelector 
          selectedSubjects={formData.selectedSubjects} 
          onToggle={handleSubjectToggle} 
          error={errors.selectedSubjects}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-dark-bg text-white h-[48px] rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Create free account'}
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-bold">or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full bg-white border-2 border-gray-100 text-headline h-[48px] rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-primary font-bold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </>
  )}
</AuthLayout>
  );
};

export default SignupPage;
