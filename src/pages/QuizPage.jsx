import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, ChevronRight, CheckCircle2, XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext.jsx';

// Subjects vary by class: 9-10 have "Science" and "Social Science", 11-12 have Physics/Chemistry/Biology
const SUBJECTS_BY_CLASS = {
  9:  ['Maths', 'Science', 'English', 'Social Science'],
  10: ['Maths', 'Science', 'English', 'Social Science'],
  11: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
  12: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English'],
};
const CLASSES = [9, 10, 11, 12];

const QuizPage = () => {
  const { getAuthHeader } = useAuth();
  const [selectedClass, setSelectedClass] = useState(10);
  const [selectedSubject, setSelectedSubject] = useState('Maths');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const subjects = SUBJECTS_BY_CLASS[selectedClass] || SUBJECTS_BY_CLASS[10];

  // Reset subject if it's invalid for the newly selected class
  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    const newSubjects = SUBJECTS_BY_CLASS[cls];
    if (!newSubjects.includes(selectedSubject)) {
      setSelectedSubject(newSubjects[0]);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz?class=${selectedClass}&subject=${selectedSubject}`, {
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setQuizStarted(true);
        setCurrentQ(0);
        setAnswers({});
        setResult(null);
      } else {
        setError(data.message || 'No questions available for this selection yet.');
      }
    } catch (err) {
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArray = questions.map(q => ({
        question_id: q.id,
        selected_option: answers[q.id] || null,
      }));

      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          answers: answersArray,
          class: selectedClass,
          subject: selectedSubject,
          chapter: questions[0]?.chapter,
          chapter_name: questions[0]?.chapter_name,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setCurrentQ(0);
  };

  const q = questions[currentQ];
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Sidebar activeItem="Daily Quiz" />
      <main className="md:ml-[240px] p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
            <Zap className="text-amber-500" size={28} /> Daily Quiz
          </h1>
          <p className="text-sm text-gray-500 mt-1">Test your NCERT knowledge with MCQs</p>
        </header>

        {/* Quiz Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-50 shadow-sm text-center mb-8">
              <div className="text-6xl mb-4">{result.percentage >= 70 ? '🎉' : result.percentage >= 50 ? '👍' : '💪'}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{result.score}/{result.total}</h2>
              <p className="text-lg text-gray-500 mb-1">You scored {result.percentage}%</p>
              <p className="text-sm text-gray-400">{result.percentage >= 70 ? 'Excellent work!' : result.percentage >= 50 ? 'Good effort! Keep practicing.' : 'Review the chapter and try again!'}</p>
            </div>

            {/* Review answers */}
            <div className="space-y-4 mb-8">
              {result.correct_answers?.map((ca, i) => {
                const question = questions.find(q => q.id === ca.question_id);
                if (!question) return null;
                return (
                  <div key={i} className={`bg-white rounded-xl p-5 border ${ca.is_correct ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      {ca.is_correct ? <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" /> : <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />}
                      <p className="text-sm font-medium text-gray-900">{question.question}</p>
                    </div>
                    {!ca.is_correct && (
                      <p className="text-xs text-gray-500 ml-6">
                        Your answer: <span className="font-semibold text-red-500">{ca.selected_option?.toUpperCase() || 'Skipped'}</span> | 
                        Correct: <span className="font-semibold text-green-600">{ca.correct_option?.toUpperCase()}</span>
                      </p>
                    )}
                    {ca.explanation && (
                      <p className="text-xs text-gray-400 mt-2 ml-6 italic">{ca.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={resetQuiz} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> New Quiz
              </button>
              <button onClick={fetchQuestions} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                <RefreshCw size={18} /> Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Quiz Selection */}
        {!quizStarted && !result && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-50 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Choose your quiz</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Class</label>
                <div className="grid grid-cols-4 gap-2">
                  {CLASSES.map(cls => (
                    <button key={cls} onClick={() => handleClassSelect(cls)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${selectedClass === cls ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      Class {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Subject</label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(sub => (
                    <button key={sub} onClick={() => setSelectedSubject(sub)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSubject === sub ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

              <button onClick={fetchQuestions} disabled={loading}
                className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                {loading ? 'Loading...' : 'Start Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {quizStarted && !result && q && (
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={resetQuiz} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <ArrowLeft size={16} /> Back
              </button>
              <span className="text-sm font-semibold text-gray-500">
                Question {currentQ + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                {totalAnswered}/{questions.length} answered
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
              <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-50 shadow-sm mb-6">
              <p className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">{q.question}</p>

              <div className="space-y-3">
                {['a', 'b', 'c', 'd'].map(opt => {
                  const optionText = q[`option_${opt}`];
                  if (!optionText) return null;
                  const isSelected = answers[q.id] === opt;
                  return (
                    <button key={opt} onClick={() => handleAnswer(q.id, opt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        isSelected ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}>
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {opt.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-3">
              <button disabled={currentQ === 0} onClick={() => setCurrentQ(prev => prev - 1)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold disabled:opacity-40 hover:bg-gray-200 transition-colors">
                Previous
              </button>

              {currentQ < questions.length - 1 ? (
                <button onClick={() => setCurrentQ(prev => prev + 1)}
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2">
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting || totalAnswered === 0}
                  className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center gap-2">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
