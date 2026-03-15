import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'motion/react';
import { 
  MessageSquare, 
  CheckCircle, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  Book, 
  Check, 
  X 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatbotWidget from '../components/ChatbotWidget';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-8 rounded-2xl border border-gray-50 transition-all duration-250 ease-in-out hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
    >
      <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-primary mb-5">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
      <p className="text-body-text leading-relaxed font-sans">{description}</p>
    </motion.div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row min-h-[90vh] overflow-hidden relative pt-20 md:pt-0">
        {/* Right Column (Amber Panel) - Top on mobile, Right on desktop */}
        <div className="w-full h-[280px] md:h-auto md:flex-[0_0_42%] bg-hero-amber relative overflow-hidden flex items-end justify-center order-1 md:order-2">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative z-10 w-full flex flex-col items-center"
          >
            <img 
              src="/hero.svg" 
              alt="NCERT Buddy Illustration" 
              className="drop-shadow-2xl max-w-[260px] md:max-w-[420px]" 
              style={{ width: '90%', height: 'auto', display: 'block', margin: '0 auto', alignSelf: 'flex-end' }}
            />
          </motion.div>

          {/* Decorative Elements */}
          <div className="hidden md:block absolute top-10 right-10 opacity-20">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path d="M10 10C20 5 30 15 40 10C50 5 55 15 55 15" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="hidden md:block absolute bottom-10 left-10 opacity-20">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="30" stroke="#1A1A2E" strokeWidth="2" strokeDasharray="8 8"/>
            </svg>
          </div>
        </div>

        {/* Left Column (Cream Content Panel) - Bottom on mobile, Left on desktop */}
        <div className="w-full md:flex-[0_0_58%] bg-primary-bg flex items-center px-6 md:px-12 lg:px-24 py-12 md:py-20 relative order-2 md:order-1">
          <div className="max-w-2xl relative">
            {/* Doodle: Squiggle above headline */}
            <div className="hidden md:block absolute -top-12 left-0 opacity-[0.15]">
              <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                <path d="M5 10C15 5 25 15 35 10C45 5 55 15 55 15" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-teal-primary px-4 py-1.5 rounded-full text-white text-sm font-semibold mb-6 md:mb-8 font-sans"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              100% NCERT-based • Class 9 to 12
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-[64px] font-extrabold leading-[1.1] mb-6 md:mb-8 font-display text-headline"
            >
              Clear your <span className="squiggle-underline">doubts</span> from the best source
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl text-body-text mb-10 leading-relaxed font-sans"
            >
              Ask any question from your NCERT textbook. Get instant, accurate answers. Take chapter quizzes. Download CBSE papers. All free.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to="/signup" className="bg-teal-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-[1.03] transition-all shadow-lg shadow-teal-primary/20 font-sans text-center">
                Try free chatbot
              </Link>
              <Link to="/login" className="border-2 border-teal-primary text-teal-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all font-sans text-center">
                See how it works
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-4 text-sm text-gray-500 font-medium font-sans"
            >
              <div className="flex -space-x-2">
                {[
                  { initials: 'AR', color: '#0D9488' }, // Teal
                  { initials: 'PS', color: '#2563EB' }, // Blue
                  { initials: 'MK', color: '#D97706' }, // Amber
                  { initials: 'RV', color: '#FF7F50' }  // Coral
                ].map((user, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-[11px]"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.initials}
                  </div>
                ))}
              </div>
              <span>5,000+ students • Free forever • No signup needed to try</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:flex md:flex-row justify-center md:justify-between items-center gap-8 md:gap-0">
          {[
            { num: '5,000+', label: 'Students' },
            { num: '38', label: 'Chapters covered' },
            { num: '1,200+', label: 'Quiz questions' },
            { num: '100%', label: 'Free' }
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              <div className="text-center md:px-8">
                <div className="text-2xl md:text-3xl font-bold text-teal-primary mb-1 font-sans">{stat.num}</div>
                <div className="text-[10px] md:text-sm font-medium text-gray-400 font-sans uppercase tracking-wide">{stat.label}</div>
              </div>
              {i < 3 && <div className="hidden md:block h-12 w-px bg-gray-100" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-primary-bg px-4 relative">
        <div className="hidden md:block absolute top-10 right-10 opacity-[0.12]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" fill="#1A1A2E"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-teal-50 text-teal-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4 inline-block font-sans">Why students love it</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display">Everything you need. Nothing you don't.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard 
              icon={MessageSquare}
              title="AI Doubt Solver"
              description="Ask any question from your NCERT chapter. Get a cited answer in seconds."
              delay={0.1}
            />
            <FeatureCard 
              icon={CheckCircle}
              title="Daily Quiz"
              description="Test yourself chapter by chapter. See your score. Review every answer."
              delay={0.2}
            />
            <FeatureCard 
              icon={FileText}
              title="CBSE Papers"
              description="Download official sample papers and PYQs for Class 10 and 12."
              delay={0.3}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Progress Dashboard"
              description="Track your quiz scores, streaks, and weak chapters in one place."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white px-4 overflow-hidden relative">
        <div className="hidden md:block absolute bottom-20 right-[15%] opacity-[0.15] rotate-12">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 30L30 10M30 10H15M30 10V25" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 md:mb-20 font-display">How it works</h2>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start gap-12 md:gap-4">
            {/* Horizontal Connection Line (Desktop Only) */}
            <div 
              className="hidden md:block absolute left-[15%] right-[15%] z-0"
              style={{ 
                top: '40px', 
                height: '2px', 
                borderTop: '2px dashed #F5A623',
                transform: 'translateY(-50%)'
              }}
            />

            {/* Vertical Connection Line (Mobile Only) */}
            <div className="md:hidden absolute left-[40px] top-[40px] bottom-[40px] w-px border-l-2 border-dashed border-hero-amber z-0" />

            {[
              { step: 1, title: 'Sign up free', desc: 'Takes 30 seconds, no credit card' },
              { step: 2, title: 'Pick your subject and chapter', desc: 'Works for all CBSE Class 9-12 subjects' },
              { step: 3, title: 'Ask doubts, take quizzes, download papers', desc: 'All in one place' }
            ].map((item, i) => (
              <div key={item.step} className="relative z-[1] flex-1 flex md:flex-col items-center md:text-center gap-6 md:gap-0 px-4">
                <div className="flex-shrink-0 w-20 h-20 bg-hero-amber text-white text-3xl font-bold rounded-full flex items-center justify-center shadow-lg shadow-hero-amber/20 font-sans relative z-[1] md:mx-auto md:mb-8">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-3 font-display">{item.title}</h3>
                  <p className="text-sm md:text-base text-body-text font-sans">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot Section */}
      <ChatbotWidget />

      {/* Why Us Section */}
      <section id="why-us" className="py-24 bg-dark-bg px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16 font-display">Why NCERT Buddy, not a generic AI?</h2>
          
          <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-2 border-b border-white/10">
              <div className="p-4 md:p-6 text-center border-r border-white/10">
                <div className="flex items-center justify-center gap-2 text-gray-400 font-bold font-sans text-xs md:text-base">
                  <X size={16} className="md:w-5 md:h-5" /> Generic AI
                </div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="flex items-center justify-center gap-2 text-teal-primary font-bold font-sans text-xs md:text-base">
                  <Check size={16} className="md:w-5 md:h-5" /> NCERT Buddy
                </div>
              </div>
            </div>

            {[
              ['Makes up answers', 'Only uses real NCERT text'],
              ['No subject context', 'Knows your class and chapter'],
              ['No quizzes', 'Chapter-specific practice questions'],
              ['No CBSE papers', 'Official sample papers + PYQs'],
              ['No progress tracking', 'Personal dashboard and streaks']
            ].map(([bad, good], i) => (
              <div key={i} className="grid grid-cols-2 border-b border-white/5 last:border-0">
                <div className="p-4 md:p-6 text-center border-r border-white/5 text-gray-400 font-sans text-[11px] md:text-base">
                  {bad}
                </div>
                <div className="p-4 md:p-6 text-center text-white font-medium font-sans text-[11px] md:text-base">
                  {good}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-hero-amber px-4 text-center relative">
        <div className="hidden md:block absolute top-10 right-20 opacity-20">
          <svg width="12" height="40" viewBox="0 0 12 40" fill="none">
            <rect x="2" y="0" width="8" height="25" rx="4" fill="white"/>
            <rect x="2" y="30" width="8" height="8" rx="4" fill="white"/>
          </svg>
        </div>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">Ready to study smarter?</h2>
          <p className="text-lg md:text-xl text-headline/80 mb-10 font-sans">Join 5,000 students already using NCERT Buddy. It is free forever.</p>
          <button className="w-full sm:w-auto bg-dark-bg text-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-[1.03] transition-all shadow-xl font-sans min-h-[44px]">
            Sign up free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg pt-20 pb-10 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Book className="text-teal-primary w-6 h-6" />
                <span className="text-xl font-bold font-sans">NCERT Buddy</span>
              </div>
              <p className="text-gray-400 font-sans">Free NCERT study tool for CBSE students. Clear doubts, take quizzes, and track progress.</p>
            </div>
            <div className="flex flex-col items-center md:items-start gap-4">
              <h4 className="font-bold mb-2 font-display">Quick Links</h4>
              <div className="flex flex-wrap justify-center md:flex-col gap-x-6 gap-y-4">
                {['Home', 'Chatbot', 'Quiz', 'Papers', 'Dashboard'].map(link => (
                  <a key={link} href="#" className="text-gray-400 hover:text-teal-primary transition-colors font-sans">{link}</a>
                ))}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-bold mb-4 font-display">Our Mission</h4>
              <p className="text-gray-400 font-sans">Built with love for Indian students to make quality education accessible to everyone.</p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm font-sans text-center md:text-left order-3 md:order-1">© 2026 NCERT Buddy. All rights reserved.</p>
            <div className="flex gap-6 order-2">
              <a href="#" className="text-gray-500 hover:text-white text-sm font-sans">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm font-sans">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
