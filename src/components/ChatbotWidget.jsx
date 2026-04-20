import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SignupNudgeModal from './SignupNudgeModal';
import MentalHealthPopup, {
  containsMentalHealthKeyword,
  MENTAL_HEALTH_SYSTEM_PROMPT,
} from './MentalHealthPopup';
import { useAuth } from '../context/AuthContext.jsx';

const SUBJECTS_BY_CLASS = {
  9:  ['Maths', 'Science', 'English', 'Social Science'],
  10: ['Maths', 'Science', 'English', 'Social Science'],
  11: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
  12: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
};

const SUGGESTED_QUESTIONS = {
  Science: ['What is photosynthesis?', 'Explain the water cycle', "What are Newton's laws?"],
  Maths: ['What is a quadratic equation?', 'Explain Pythagoras theorem', 'What are rational numbers?'],
  Physics: ["What is Ohm's law?", 'Explain refraction of light', 'What is the law of conservation of energy?'],
  Chemistry: ['What is a chemical bond?', 'Explain periodic table trends', 'What is electrolysis?'],
  Biology: ['What is DNA replication?', 'Explain the human digestive system', 'What are enzymes?'],
  English: ['Explain the theme of the chapter', 'What are literary devices?', 'Summarise the poem'],
  'Social Science': ['What caused the French Revolution?', 'Explain democracy', 'What is globalisation?'],
};

const DEFAULT_SUGGESTIONS = ['Ask me anything from NCERT', 'Which chapter should I study?', 'Help me understand this topic'];

// Render message text with inline code and code block formatting
function renderFormattedText(text) {
  if (!text) return null;

  // Split by triple backtick code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    // Code block
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3);
      // Remove optional language identifier on first line
      const lines = inner.split('\n');
      const firstLine = lines[0].trim();
      const hasLang = firstLine && !firstLine.includes(' ') && lines.length > 1;
      const code = hasLang ? lines.slice(1).join('\n') : inner;

      return (
        <div key={i} className="my-2 rounded-lg overflow-hidden">
          <pre className="bg-[#1A1A2E] text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            <code>{code.trim()}</code>
          </pre>
        </div>
      );
    }

    // Process inline backticks
    const inlineParts = part.split(/(`[^`]+`)/g);
    return (
      <span key={i}>
        {inlineParts.map((inline, j) => {
          if (inline.startsWith('`') && inline.endsWith('`')) {
            return (
              <code
                key={j}
                className="bg-gray-100 text-teal-800 px-1.5 py-0.5 rounded text-[13px] font-mono"
              >
                {inline.slice(1, -1)}
              </code>
            );
          }
          return <span key={j}>{inline}</span>;
        })}
      </span>
    );
  });
}

const ChatbotWidget = () => {
  const { user, isAuthenticated, getAuthHeader } = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'ai', 
      text: 'Hi! I am your NCERT doubt solver. Ask me anything from your textbook — I will find the exact answer for you.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedClass, setSelectedClass] = useState(10);
  const [selectedSubject, setSelectedSubject] = useState('Maths');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Mental health popup state
  const [showMentalHealthPopup, setShowMentalHealthPopup] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  const subjects = SUBJECTS_BY_CLASS[selectedClass];
  const suggestions = SUGGESTED_QUESTIONS[selectedSubject] || DEFAULT_SUGGESTIONS;

  const handleClassChange = (cls) => {
    const c = parseInt(cls);
    setSelectedClass(c);
    const newSubjects = SUBJECTS_BY_CLASS[c];
    if (!newSubjects.includes(selectedSubject)) {
      setSelectedSubject(newSubjects[0]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      const savedCount = localStorage.getItem('ncertbuddy_guest_count');
      if (savedCount) {
        const parsedCount = parseInt(savedCount, 10);
        setCount(parsedCount);
        if (parsedCount >= 2) setDisabled(true);
      }
    }
  }, [isAuthenticated]);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Core send logic (called after mental health popup if needed)
  const sendMessage = async (userText, isMentalHealthTrigger = false) => {
    const userMsg = { id: Date.now(), type: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    if (!isAuthenticated) {
      const newCount = count + 1;
      setCount(newCount);
      localStorage.setItem('ncertbuddy_guest_count', newCount.toString());
    }

    setIsTyping(true);

    try {
      const conversationHistory = messages
        .filter(m => m.type === 'user' || m.type === 'ai')
        .slice(-6)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      // If mental health trigger, inject extra system context
      if (isMentalHealthTrigger) {
        conversationHistory.push({
          role: 'system',
          content: MENTAL_HEALTH_SYSTEM_PROMPT,
        });
      }

      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userText,
          class: selectedClass,
          subject: selectedSubject,
          conversationHistory,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to get response');
        }
        throw new Error('Failed to get response from AI');
      }

      if (contentType.includes('application/json')) {
        const data = await response.json();
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, type: 'ai', 
          text: data.content || data.message || 'No response received.',
          timestamp: new Date(),
        }]);
        return;
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
      const aiMsgId = Date.now() + 1;

      setIsTyping(false);
      setMessages(prev => [...prev, { id: aiMsgId, type: 'ai', text: '', timestamp: new Date() }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              if (data.content) {
                aiText += data.content;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === aiMsgId ? { ...m, text: aiText } : m
                  )
                );
              }
            } catch (parseErr) {
              // Skip malformed lines
            }
          }
        }
      }

      if (!aiText) {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiMsgId ? { ...m, text: 'Sorry, I could not generate a response. Please try again.' } : m
          )
        );
      }

      if (!isAuthenticated && count + 1 >= 2) {
        setTimeout(() => setShowModal(true), 1000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'ai', 
        text: error.message || 'Sorry, I am having trouble connecting right now. Please try again.',
        timestamp: new Date(),
      }]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const userText = input.trim();
    if (!userText || disabled) return;

    // Guest limit check
    if (!isAuthenticated && count >= 2) {
      setShowModal(true);
      return;
    }

    setInput('');

    // Mental health keyword check — show popup before sending
    if (containsMentalHealthKeyword(userText)) {
      setPendingMessage(userText);
      setShowMentalHealthPopup(true);
      return;
    }

    await sendMessage(userText, false);
  };

  const handleMentalHealthContinue = async () => {
    setShowMentalHealthPopup(false);
    if (pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      await sendMessage(msg, true);
    }
  };

  const handleMentalHealthClose = () => {
    setShowMentalHealthPopup(false);
    setPendingMessage(null);
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (!isAuthenticated && count >= 2) setDisabled(true);
  };

  const isDisabled = isAuthenticated ? false : disabled;
  const remainingQuestions = isAuthenticated ? '∞' : Math.max(0, 2 - count);

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section id="chatbot" className="py-24 bg-[#F0FDF8] px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 font-display text-[#1A1A2E]">Try the AI doubt solver — no signup needed</h2>
        <p className="text-lg text-body-text font-sans">{isAuthenticated ? 'Unlimited questions as a member!' : '2 free questions, then sign up to continue.'}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Chat Header */}
          <div className="bg-gray-50 px-4 md:px-6 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-2 md:gap-4">
              <select value={selectedClass} onChange={e => handleClassChange(e.target.value)}
                className="text-[11px] md:text-sm font-medium text-body-text bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer">
                {[9, 10, 11, 12].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                className="text-[11px] md:text-sm font-medium text-body-text bg-transparent border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer">
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1 text-[10px] md:text-xs font-semibold text-teal-primary bg-teal-50 px-2 py-1 rounded">
              <CheckCircle2 size={12} /> NCERT Verified
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="h-[320px] md:h-[400px] overflow-y-auto p-4 md:p-6 space-y-4 bg-[#F9FAFB]"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'ai' && (
                  <div className="flex items-start gap-2 max-w-[85%] md:max-w-[80%]">
                    {/* NB Avatar */}
                    <div className="w-9 h-9 bg-teal-primary rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 mt-0.5">
                      NB
                    </div>
                    <div>
                      <div className="bg-[#F0FDFA] border border-[#99F6E4] p-3 md:p-4 rounded-tl-none rounded-tr-2xl rounded-br-2xl rounded-bl-2xl font-sans text-sm md:text-[15px] leading-relaxed text-headline whitespace-pre-wrap">
                        {renderFormattedText(msg.text)}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 ml-1 font-sans">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                )}

                {msg.type === 'user' && (
                  <div className="max-w-[85%] md:max-w-[80%]">
                    <div className="bg-teal-primary text-white p-3 md:p-4 rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-2xl font-sans text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-right mr-1 font-sans">{formatTime(msg.timestamp)}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator with NB avatar */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 bg-teal-primary rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0 mt-0.5">
                    NB
                  </div>
                  <div className="bg-[#F0FDFA] border border-[#99F6E4] p-3 md:p-4 rounded-tl-none rounded-tr-2xl rounded-br-2xl rounded-bl-2xl flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-teal-primary rounded-full inline-block" style={{ animation: 'nb-bounce 0.6s infinite', animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-teal-primary rounded-full inline-block" style={{ animation: 'nb-bounce 0.6s infinite', animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 bg-teal-primary rounded-full inline-block" style={{ animation: 'nb-bounce 0.6s infinite', animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="hidden sm:flex gap-2 px-4 md:px-6 pt-3 overflow-x-auto no-scrollbar">
            {suggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(q)}
                className="whitespace-nowrap px-4 py-2 bg-white border border-teal-200 text-teal-primary rounded-full text-[13px] font-medium hover:bg-teal-50 transition-colors shrink-0 font-sans"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isDisabled}
                placeholder={isDisabled ? "Sign up to continue..." : "Type your question..."}
                className="w-full pl-4 pr-12 py-3 md:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-primary/20 focus:border-teal-primary transition-all font-sans disabled:opacity-50 min-h-[48px]"
              />
              <button 
                type="submit"
                disabled={isDisabled || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-teal-primary text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Send size={18} className="md:w-5 md:h-5" />
              </button>
            </form>
            <div className="mt-3 flex justify-between items-center px-1">
              <span className="text-[10px] md:text-xs text-gray-400 font-sans">
                {isAuthenticated ? 'Unlimited questions' : `${remainingQuestions} free questions remaining`}
              </span>
            </div>
          </div>
        </div>

        {isDisabled && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => window.location.href = '/signup'}
            className="mt-6 p-4 bg-teal-primary rounded-xl text-center text-white font-semibold cursor-pointer hover:bg-teal-700 transition-colors font-sans"
          >
            Sign up free to keep chatting →
          </motion.div>
        )}
      </div>

      <SignupNudgeModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
      />

      <MentalHealthPopup
        isOpen={showMentalHealthPopup}
        onContinue={handleMentalHealthContinue}
        onClose={handleMentalHealthClose}
      />

      {/* Typing indicator animation */}
      <style>{`
        @keyframes nb-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default ChatbotWidget;
