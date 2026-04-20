import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 relative">
        <button 
          onClick={() => navigate('/login')}
          className="absolute top-8 left-8 text-gray-400 hover:text-teal-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mt-8">
          <div className="mb-8">
            <span className="text-teal-primary font-bold text-xl font-display">NCERT Buddy</span>
          </div>

          {!isSubmitted ? (
            <>
              <h1 className="text-3xl font-extrabold font-display leading-tight mb-3">Reset your password</h1>
              <p className="text-body-text mb-8">Enter your email and we will send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div>
                  <label className="block text-sm font-bold text-headline mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none bg-white focus:bg-gray-50 ${
                      error ? 'border-red-500' : 'border-gray-100 focus:border-teal-primary/30'
                    }`}
                    placeholder="Enter your email"
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-dark-bg text-white h-[48px] rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            <div className="py-8">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-primary mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold font-display mb-3">Reset link sent!</h2>
              <p className="text-body-text mb-8">Check your inbox for the password reset instructions.</p>
              <Link 
                to="/login" 
                className="inline-block bg-dark-bg text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
