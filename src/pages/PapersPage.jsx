import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Loader2, ExternalLink } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';

const PapersPage = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterClass, setFilterClass] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchPapers();
  }, [filterClass, filterType]);

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/papers?';
      if (filterClass !== 'all') url += `class=${filterClass}&`;
      if (filterType !== 'all') url += `type=${filterType}`;

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });

      if (!res.ok) throw new Error('Failed to load papers');
      const data = await res.json();
      setPapers(data.papers || []);
    } catch (err) {
      setError('Could not load papers. They may not be uploaded yet.');
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // Static sample data for when DB is empty
  const samplePapers = [
    { id: 1, class: 10, subject: 'Maths', year: 2024, type: 'sample', file_size_kb: 2400, download_url: null },
    { id: 2, class: 10, subject: 'Science', year: 2024, type: 'sample', file_size_kb: 1800, download_url: null },
    { id: 3, class: 10, subject: 'Maths', year: 2023, type: 'pyq', file_size_kb: 2100, download_url: null },
    { id: 4, class: 10, subject: 'Science', year: 2023, type: 'pyq', file_size_kb: 1650, download_url: null },
    { id: 5, class: 12, subject: 'Maths', year: 2024, type: 'sample', file_size_kb: 3200, download_url: null },
    { id: 6, class: 12, subject: 'Physics', year: 2024, type: 'sample', file_size_kb: 2800, download_url: null },
  ];

  const displayPapers = papers.length > 0 ? papers : samplePapers;

  const filteredPapers = displayPapers.filter(p => {
    if (filterClass !== 'all' && p.class !== parseInt(filterClass)) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    return true;
  });

  const formatSize = (kb) => {
    if (!kb) return '';
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA]">
      <Sidebar activeItem="Papers" />
      <main className="md:ml-[240px] p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
            <FileText className="text-blue-500" size={28} /> CBSE Papers
          </h1>
          <p className="text-sm text-gray-500 mt-1">Download sample papers and previous year questions</p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20">
              <option value="all">All Classes</option>
              <option value="10">Class 10</option>
              <option value="12">Class 12</option>
            </select>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-gray-100">
            {['all', 'sample', 'pyq'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === t ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                {t === 'all' ? 'All' : t === 'sample' ? 'Sample Papers' : 'PYQ'}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
        )}

        {!loading && error && papers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-50 mb-8">
            <p className="text-gray-400 font-medium mb-2">{error}</p>
            <p className="text-xs text-gray-300">Showing sample data below. Upload papers to Supabase Storage to see real data.</p>
          </div>
        )}

        {/* Papers Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPapers.map((paper) => (
              <div key={paper.id} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${paper.type === 'sample' ? 'bg-teal-50 text-teal-600' : 'bg-purple-50 text-purple-600'}`}>
                      {paper.type === 'sample' ? 'Sample' : 'PYQ'}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                      {paper.year}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-1">Class {paper.class} {paper.subject}</h3>
                <p className="text-xs text-gray-400 mb-5">
                  {paper.type === 'sample' ? 'CBSE Sample Paper' : 'Previous Year Question Paper'} • {formatSize(paper.file_size_kb)}
                </p>

                <a href={paper.download_url || '#'} target={paper.download_url ? '_blank' : undefined} rel="noopener noreferrer"
                  className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                  <Download size={14} /> Download PDF
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredPapers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 font-medium">No papers found for this filter.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PapersPage;
