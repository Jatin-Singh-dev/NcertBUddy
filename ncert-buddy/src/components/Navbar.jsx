import React, { useState, useEffect } from 'react';
import { Book, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Chatbot', href: '#chatbot' },
    { name: 'Papers', href: '#papers' },
  ];

  const userName = profile?.full_name || user?.user_metadata?.full_name || '';
  const userInitials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-md' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Book className="text-teal-primary w-6 h-6" />
            <span className="text-xl font-bold text-teal-primary font-sans">NCERT Buddy</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-[15px] font-medium text-body-text hover:text-teal-primary transition-colors font-sans"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-[15px] font-semibold text-teal-primary px-4 py-2 hover:bg-gray-50 rounded-lg transition-all font-sans">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="w-9 h-9 bg-teal-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {userInitials}
                  </Link>
                  <button onClick={handleSignOut} className="text-[13px] font-medium text-gray-400 hover:text-red-500 transition-colors font-sans">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-[15px] font-semibold text-teal-primary px-4 py-2 hover:bg-gray-50 rounded-lg transition-all font-sans">
                  Login
                </Link>
                <Link to="/signup" className="text-[15px] font-semibold bg-teal-primary text-white px-6 py-2.5 rounded-lg hover:scale-[1.03] transition-all font-sans">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-body-text p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-body-text hover:bg-gray-50 rounded-md font-sans"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 font-semibold bg-teal-primary text-white rounded-lg font-sans"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setIsOpen(false); }}
                      className="w-full text-center py-3 font-semibold text-red-500 border border-red-200 rounded-lg font-sans"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 font-semibold text-teal-primary border border-teal-primary rounded-lg font-sans"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center py-3 font-semibold bg-teal-primary text-white rounded-lg font-sans"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
