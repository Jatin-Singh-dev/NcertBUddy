import React from 'react';
import { motion } from 'motion/react';
import { Home, MessageSquare, Zap, Play, FileText, Settings, Share2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Sidebar = ({ activeItem = 'Dashboard' }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Student';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    { id: 'Dashboard', icon: Home, label: 'Dashboard', href: '/dashboard' },
    { id: 'AI Chatbot', icon: MessageSquare, label: 'AI Chatbot', href: '/#chatbot' },
    { id: 'Daily Quiz', icon: Zap, label: 'Daily Quiz', href: '/quiz' },
    { id: 'Tutorials', icon: Play, label: 'Tutorials', href: '/tutorials' },
    { id: 'Papers', icon: FileText, label: 'Papers', href: '/papers' },
    { id: 'Settings', icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-teal-600 rounded-2xl flex items-center justify-center text-lg">
              📚
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">NCERT Buddy</span>
          </div>
          <p className="text-xs text-gray-400 ml-11 font-medium">{userName}</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-3">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-100">
            <h4 className="font-bold text-sm mb-1">Tell a friend!</h4>
            <p className="text-[11px] text-teal-50 opacity-90 mb-4 leading-relaxed">
              Share NCERT Buddy and help your classmates
            </p>
            <button className="w-full bg-white text-teal-600 py-2 rounded-xl text-xs font-bold hover:bg-teal-50 transition-colors shadow-sm">
              Share now
            </button>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`p-2 rounded-xl transition-all ${
                isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-400'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
