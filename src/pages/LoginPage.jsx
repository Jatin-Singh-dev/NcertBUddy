import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await signIn({ email, password });
      navigate('/dashboard');
    } catch (error) {
      const message = error.message || 'Login failed. Please try again.';
      if (message.toLowerCase().includes('invalid login')) {
        setErrors({ password: 'Invalid email or password. Please try again.' });
      } else if (message.toLowerCase().includes('email not confirmed')) {
        setErrors({ email: 'Please verify your email before logging in.' });
      } else {
        setErrors({ email: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })
    if (error) console.error('Google login error:', error)
  };

  const rightContent = (
    <div className="flex flex-col items-center w-full">
      <div className="relative mb-12 w-full flex justify-center">
        <img src="/hero.svg" alt="Student learning" className="w-full max-w-[380px] h-auto object-contain" />
        
        {/* Floating Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-gray-100 w-64"
        >
          <div className="text-2xl">🔥</div>
          <div className="text-left">
            <p className="text-sm font-bold text-headline">7-day study streak!</p>
            <span className="text-[10px] bg-teal-50 text-teal-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Keep it up</span>
          </div>
        </motion.div>
      </div>
      
      <h2 className="text-2xl font-display font-bold text-headline mb-2">Study smarter, score higher</h2>
      <p className="text-gray-500 font-sans">with NCERT Buddy</p>
    </div>
  );

  return (
    <AuthLayout rightContent={rightContent}>
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl lg:text-[48px] font-extrabold font-display leading-tight mb-3">Welcome back!</h1>
        <p className="text-body-text">Your NCERT doubts and quizzes are waiting for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-headline mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none bg-white focus:bg-gray-50 ${
              errors.email ? 'border-red-500' : 'border-gray-100 focus:border-teal-primary/30'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-headline">Password</label>
            <Link to="/forgot-password" title="Forgot password?" className="text-xs font-bold text-teal-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none bg-white focus:bg-gray-50 pr-12 ${
                errors.password ? 'border-red-500' : 'border-gray-100 focus:border-teal-primary/30'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-dark-bg text-white h-[48px] rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
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
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-100 text-headline h-[48px] rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-gray-500 font-medium">
        Not a member?{' '}
        <Link to="/signup" className="text-teal-primary font-bold hover:underline">
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
