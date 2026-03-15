import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SignupNudgeModal from './SignupNudgeModal';
import { useAuth } from '../context/AuthContext.jsx';

const SUBJECTS_BY_CLASS = {
  9:  ['Maths', 'Science', 'English', 'Social Science'],
  10: ['Maths', 'Science', 'English', 'Social Science'],
  11: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
  12: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
};

const ChatbotWidget = () => {
  const { user, isAuthenticated, getAuthHeader } = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'ai', 
      text: 'Hi! I am your NCERT doubt solver. Ask me anything from your textbook — I will find the exact answer for you.' 
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

  const subjects = SUBJECTS_BY_CLASS[selectedClass];

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

  // Scroll only INSIDE the chat container, not the whole page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

    const userMsg = { id: Date.now(), type: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    if (!isAuthenticated) {
      const newCount = count + 1;
      setCount(newCount);
      localStorage.setItem('ncertbuddy_guest_count', newCount.toString());
    }

    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(m => m.type === 'user' || m.type === 'ai')
        .slice(-6)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

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

      // Check for JSON error responses (non-SSE)
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to get response');
        }
        throw new Error('Failed to get response from AI');
      }

      // If response is JSON (non-streaming fallback), handle it
      if (contentType.includes('application/json')) {
        const data = await response.json();
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, type: 'ai', 
          text: data.content || data.message || 'No response received.' 
        }]);
        return;
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
      const aiMsgId = Date.now() + 1;

      // Add empty AI message that we'll update
      setIsTyping(false);
      setMessages(prev => [...prev, { id: aiMsgId, type: 'ai', text: '' }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last potentially incomplete line in buffer
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

      // If we got no text at all, show a fallback
      if (!aiText) {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiMsgId ? { ...m, text: 'Sorry, I could not generate a response. Please try again.' } : m
          )
        );
      }

      // Show signup nudge after 2 guest messages
      if (!isAuthenticated && count + 1 >= 2) {
        setTimeout(() => setShowModal(true), 1000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'ai', 
        text: error.message || 'Sorry, I am having trouble connecting right now. Please try again.' 
      }]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (!isAuthenticated && count >= 2) setDisabled(true);
  };

  // If authenticated, never disable
  const isDisabled = isAuthenticated ? false : disabled;
  const remainingQuestions = isAuthenticated ? '∞' : Math.max(0, 2 - count);

  return (
    <section id="chatbot" className="py-24 bg-[#F0FDF8] px-4">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 font-display text-[#1A1A2E]">Try the AI doubt solver — no signup needed</h2>
        <p className="text-lg text-body-text font-sans">Ask any NCERT question below. {isAuthenticated ? 'Unlimited questions as a member!' : '2 free questions, then sign up to continue.'}</p>
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
            className="h-[280px] md:h-[350px] overflow-y-auto p-4 md:p-6 space-y-4 bg-[#F9FAFB]"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start items-start'}`}
              >
                <div 
                  className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl font-sans text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.type === 'user' 
                      ? 'bg-teal-primary text-white rounded-tr-none' 
                      : 'bg-teal-50 text-headline rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-teal-50 p-3 md:p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-primary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-teal-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-teal-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
    </section>
  );
};

export default ChatbotWidget;
