import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Phone, X, ExternalLink } from 'lucide-react';

const HELPLINES = [
  {
    name: 'iCall',
    number: '9152987821',
    timing: 'Mon to Sat, 8am to 10pm',
  },
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    timing: '24/7, Free, Confidential',
  },
];

// Keywords that trigger the mental health popup
export const MENTAL_HEALTH_KEYWORDS = [
  'depression', 'depressed', 'suicide', 'suicidal',
  'kill myself', 'end my life', 'self harm', 'self-harm',
  'cutting myself', 'worthless', 'hopeless', 'no reason to live',
  'want to die', 'feeling empty', 'anxiety attack', 'panic attack',
  'mental breakdown', "can't go on", 'give up on life',
  'nobody cares', 'hate myself', 'hurt myself',
];

// Check if a message contains any mental health keyword (case-insensitive)
export function containsMentalHealthKeyword(message) {
  const lower = message.toLowerCase();
  return MENTAL_HEALTH_KEYWORDS.some((keyword) => lower.includes(keyword));
}

// Extra system prompt to inject when mental health keywords are detected
export const MENTAL_HEALTH_SYSTEM_PROMPT =
  'The user may be going through emotional distress. Respond with extra warmth, empathy, and care. Do not give academic or textbook answers. Acknowledge their feelings first. Gently encourage them to speak to someone they trust or a professional.';

const MentalHealthPopup = ({ isOpen, onContinue, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-white rounded-[20px] max-w-[480px] w-full p-8 md:p-10 shadow-2xl z-10"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={22} />
            </button>

            {/* Heart icon */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
                <Heart size={48} className="text-teal-primary" fill="#0D9488" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-center text-[28px] font-extrabold font-display text-headline leading-tight mb-3">
              You are not alone 💙
            </h2>

            {/* Warm message */}
            <p className="text-center text-base text-body-text leading-relaxed font-sans mb-6">
              It sounds like you might be going through something really difficult right now.
              Your feelings are valid, and your life matters more than you know.
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100 mb-6" />

            {/* Section heading */}
            <p className="text-center text-[11px] font-bold text-teal-primary uppercase tracking-widest mb-4 font-sans">
              Free helplines — someone is always there
            </p>

            {/* Helpline cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {HELPLINES.map((helpline) => (
                <div
                  key={helpline.name}
                  className="bg-teal-50 rounded-xl p-4 text-center border border-teal-100"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Phone size={14} className="text-teal-primary" />
                    <span className="text-sm font-bold text-headline font-sans">
                      {helpline.name}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-teal-primary font-sans mb-1">
                    {helpline.number}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium font-sans">
                    {helpline.timing}
                  </p>
                </div>
              ))}
            </div>

            {/* Continue button */}
            <button
              onClick={onContinue}
              className="w-full py-3.5 bg-teal-primary text-white font-bold rounded-xl hover:bg-teal-700 transition-colors font-sans text-[15px]"
            >
              I am okay — continue chatting
            </button>

            {/* Safe space link */}
            <a
              href="https://icallhelpline.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 mt-4 text-sm font-semibold text-teal-primary hover:text-teal-700 transition-colors font-sans"
            >
              Take me to a safe space
              <ExternalLink size={14} />
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MentalHealthPopup;
