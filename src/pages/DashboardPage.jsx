import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, Filter, Download, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import QuizHistoryRow from '../components/QuizHistoryRow';
import ProgressRing from '../components/ProgressRing';
import MiniCalendar from '../components/MiniCalendar';
import WeakTopicCard from '../components/WeakTopicCard';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardPage = () => {
  const { user, profile, getAuthHeader } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard', {
          headers: {
            ...getAuthHeader(),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Something went wrong. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Student';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Format recent attempts for QuizHistoryRow
  const quizHistory = (dashboardData?.recentAttempts || []).map((attempt) => ({
    subject: attempt.subject || 'General',
    chapter: attempt.chapter_name || `Chapter ${attempt.chapter}`,
    score: `${attempt.score}/${attempt.total}`,
    date: new Date(attempt.attempted_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }));

  const weakTopics = dashboardData?.weakTopics || [];
  const avgScore = dashboardData?.avgScore || 0;
  const totalAttempts = dashboardData?.totalAttempts || 0;
  const streak = dashboardData?.streak || 0;
  const bestSubject = dashboardData?.bestSubject;
  const calendarDays = dashboardData?.calendarDays || [];

  // Papers section — static for now (since papers need to be in the DB)
  const papers = [
    { name: 'Class 10 Science — 2024 Sample Paper', year: '2024', size: '2.4 MB' },
    { name: 'Class 10 Maths — 2023 PYQ', year: '2023', size: '1.8 MB' },
    { name: 'Class 10 Science — 2023 PYQ', year: '2023', size: '2.1 MB' },
  ];

  // Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA]">
        <Sidebar activeItem="Dashboard" />
        <main className="md:ml-[240px] p-4 md:p-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-gray-500 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Sidebar activeItem="Dashboard" />

      <main className="md:ml-[240px] p-4 md:p-8 pb-24 md:pb-8">
        {/* Top Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">Welcome back, {userName.split(' ')[0]}! 👋</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Let us make today productive.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search subjects, chapters..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-teal-600 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-100">
              {userInitials}
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard label="Quizzes taken" value={String(totalAttempts)} trend={totalAttempts > 0 ? `${totalAttempts} total` : undefined} delay={0} />
          <StatsCard label="Average score" value={`${avgScore}%`} delay={0.1} />
          <StatsCard label="Study streak" value={`${streak} day${streak !== 1 ? 's' : ''}`} delay={0.2} />
          <StatsCard label="Best subject" value={bestSubject?.subject || '—'} trend={bestSubject ? `avg ${bestSubject.avgScore}%` : undefined} delay={0.3} />
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 mb-12">
          {/* Right Column (Progress Card) - Moved to top on mobile */}
          <div className="lg:col-span-5 space-y-8 order-1 lg:order-2">
            {/* Progress Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-gray-900">Overall progress</h3>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                  This week
                  <Filter size={14} />
                </button>
              </div>
              
              <div className="flex justify-center mb-8">
                <ProgressRing progress={avgScore / 100} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Completed', count: totalAttempts, color: 'bg-teal-500' },
                  { label: 'In Progress', count: weakTopics.length, color: 'bg-amber-500' },
                  { label: 'Upcoming', count: 0, color: 'bg-gray-300' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                      <span className="text-sm font-bold text-gray-900">{stat.count}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm w-full">
              <MiniCalendar quizDates={calendarDays} />
            </div>
          </div>

          {/* Left Column (Quiz History & Topics) */}
          <div className="lg:col-span-7 space-y-10 order-2 lg:order-1">
            {/* Quiz History */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-display">Recent quizzes</h2>
                <div className="flex bg-white p-1 rounded-xl border border-gray-100 w-fit">
                  {['All', 'This week', 'This month'].map((tab, i) => (
                    <button key={tab} className={`px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${i === 0 ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {quizHistory.length > 0 ? (
                  quizHistory.map((quiz, i) => (
                    <QuizHistoryRow key={i} {...quiz} delay={0.1 + i * 0.05} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-50">
                    <p className="text-gray-400 font-medium">No quiz attempts yet. Take your first quiz to see results here!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Weak Topics */}
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Topics to review</h2>
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Your average score in these chapters is below 60%</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {weakTopics.length > 0 ? (
                  weakTopics.map((topic, i) => (
                    <WeakTopicCard key={i} {...topic} />
                  ))
                ) : (
                  <div className="text-center py-8 bg-white rounded-2xl border border-gray-50">
                    <p className="text-gray-400 font-medium">🎉 Great job! No weak topics to review.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Papers Quick Access */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 font-display">Download CBSE Papers</h2>
            <button className="flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:gap-2 transition-all">
              View all
              <ExternalLink size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {papers.map((paper, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-4 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                  <Download size={20} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{paper.name}</h4>
                <div className="flex items-center gap-3 mb-5">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">{paper.year}</span>
                  <span className="text-[11px] text-gray-400 font-medium">{paper.size}</span>
                </div>
                <button className="w-full py-2.5 bg-gray-50 text-gray-900 rounded-xl text-xs font-bold hover:bg-teal-600 hover:text-white transition-all">
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
