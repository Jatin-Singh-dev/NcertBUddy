import React, { useState } from 'react';
import { Play, ExternalLink, Filter, Video } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const SUBJECT_COLORS = {
  Science: { bg: 'bg-teal-50', text: 'text-teal-600', placeholder: 'bg-gradient-to-br from-teal-400 to-teal-600' },
  Maths: { bg: 'bg-blue-50', text: 'text-blue-600', placeholder: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  Physics: { bg: 'bg-purple-50', text: 'text-purple-600', placeholder: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  Chemistry: { bg: 'bg-amber-50', text: 'text-amber-600', placeholder: 'bg-gradient-to-br from-amber-400 to-amber-600' },
  Biology: { bg: 'bg-emerald-50', text: 'text-emerald-600', placeholder: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
  English: { bg: 'bg-rose-50', text: 'text-rose-600', placeholder: 'bg-gradient-to-br from-rose-400 to-rose-500' },
  'Social Science': { bg: 'bg-green-50', text: 'text-green-600', placeholder: 'bg-gradient-to-br from-green-400 to-green-600' },
};

const VIDEOS = [
  { id: 1, class: 10, subject: 'Maths', chapter: 'Quadratic Equations', title: 'Quadratic Equations Class 10 | Full Chapter', channel: 'Vedantu', duration: '45:23', url: 'https://youtube.com/watch?v=dummy1' },
  { id: 2, class: 10, subject: 'Science', chapter: 'Light', title: 'Light Reflection and Refraction Class 10', channel: 'Physics Wallah', duration: '1:02:10', url: 'https://youtube.com/watch?v=dummy2' },
  { id: 3, class: 9, subject: 'Maths', chapter: 'Number System', title: 'Number System Class 9 Complete Chapter', channel: 'Vedantu', duration: '38:45', url: 'https://youtube.com/watch?v=dummy3' },
  { id: 4, class: 10, subject: 'Science', chapter: 'Carbon Compounds', title: 'Carbon and its Compounds Full Chapter', channel: 'Physics Wallah', duration: '55:30', url: 'https://youtube.com/watch?v=dummy4' },
  { id: 5, class: 11, subject: 'Physics', chapter: 'Laws of Motion', title: 'Newton Laws of Motion Class 11', channel: 'Physics Wallah', duration: '1:15:00', url: 'https://youtube.com/watch?v=dummy5' },
  { id: 6, class: 11, subject: 'Chemistry', chapter: 'Atomic Structure', title: 'Atomic Structure Class 11 Full Chapter', channel: 'Vedantu', duration: '52:18', url: 'https://youtube.com/watch?v=dummy6' },
  { id: 7, class: 12, subject: 'Maths', chapter: 'Integrals', title: 'Integrals Class 12 Full Chapter', channel: 'Vedantu', duration: '1:30:45', url: 'https://youtube.com/watch?v=dummy7' },
  { id: 8, class: 12, subject: 'Physics', chapter: 'Electrostatics', title: 'Electrostatics Class 12 Complete', channel: 'Physics Wallah', duration: '1:10:22', url: 'https://youtube.com/watch?v=dummy8' },
  { id: 9, class: 9, subject: 'Science', chapter: 'Matter', title: 'Matter in Our Surroundings Class 9', channel: 'Vedantu', duration: '42:15', url: 'https://youtube.com/watch?v=dummy9' },
  { id: 10, class: 10, subject: 'English', chapter: 'First Flight', title: 'First Flight Class 10 All Chapters Summary', channel: 'Magnet Brains', duration: '35:00', url: 'https://youtube.com/watch?v=dummy10' },
  { id: 11, class: 9, subject: 'Social Science', chapter: 'French Revolution', title: 'French Revolution Class 9 History', channel: 'Magnet Brains', duration: '28:30', url: 'https://youtube.com/watch?v=dummy11' },
  { id: 12, class: 11, subject: 'Maths', chapter: 'Trigonometry', title: 'Trigonometric Functions Class 11', channel: 'Vedantu', duration: '48:55', url: 'https://youtube.com/watch?v=dummy12' },
  { id: 13, class: 12, subject: 'Chemistry', chapter: 'Electrochemistry', title: 'Electrochemistry Class 12 Full Chapter', channel: 'Physics Wallah', duration: '58:40', url: 'https://youtube.com/watch?v=dummy13' },
  { id: 14, class: 10, subject: 'Social Science', chapter: 'Nationalism', title: 'Nationalism in India Class 10 History', channel: 'Magnet Brains', duration: '32:15', url: 'https://youtube.com/watch?v=dummy14' },
  { id: 15, class: 12, subject: 'Biology', chapter: 'Genetics', title: 'Principles of Inheritance Class 12', channel: 'Vedantu', duration: '1:05:30', url: 'https://youtube.com/watch?v=dummy15' },
];

const ALL_SUBJECTS = ['All', 'Maths', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science'];

const VideoCard = ({ video }) => {
  const colors = SUBJECT_COLORS[video.subject] || SUBJECT_COLORS.Science;

  return (
    <div className="bg-white rounded-xl border border-gray-50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group overflow-hidden">
      {/* Thumbnail placeholder */}
      <div className={`relative aspect-video ${colors.placeholder} flex items-center justify-center`}>
        <div className="text-center">
          <Play size={40} className="text-white/80 mx-auto mb-2" fill="white" fillOpacity={0.3} />
          <span className="text-white/90 text-sm font-bold font-sans">{video.subject}</span>
        </div>
        {/* Duration badge */}
        <span className="absolute top-3 right-3 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded font-sans">
          {video.duration}
        </span>
      </div>

      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}>
            {video.subject}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
            Class {video.class}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug line-clamp-2 font-sans">
          {video.title}
        </h3>

        {/* Channel */}
        <div className="flex items-center gap-1.5 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-500 shrink-0">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span className="text-[13px] text-gray-500 font-medium font-sans">{video.channel}</span>
        </div>

        {/* Watch button */}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 bg-teal-primary text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 font-sans group-hover:bg-teal-700"
        >
          <ExternalLink size={14} />
          Watch Now
        </a>
      </div>
    </div>
  );
};

const TutorialsPage = () => {
  const [filterClass, setFilterClass] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');

  const filteredVideos = VIDEOS.filter(v => {
    if (filterClass !== 'All' && v.class !== parseInt(filterClass)) return false;
    if (filterSubject !== 'All' && v.subject !== filterSubject) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Sidebar activeItem="Tutorials" />

      <main className="md:ml-[240px] p-4 md:p-8 pb-24 md:pb-8">
        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
            <Play className="text-red-500" size={28} /> Video Tutorials
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-sans">Handpicked videos for every NCERT chapter — Class 9 to 12</p>
        </header>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-sans"
            >
              <option value="All">All Classes</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-gray-100 overflow-x-auto no-scrollbar">
            {ALL_SUBJECTS.map(sub => (
              <button
                key={sub}
                onClick={() => setFilterSubject(sub)}
                className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  filterSubject === sub
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Video size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-medium font-sans text-lg">No videos found for this filter.</p>
            <p className="text-gray-300 text-sm mt-1 font-sans">More videos coming soon!</p>
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default TutorialsPage;
