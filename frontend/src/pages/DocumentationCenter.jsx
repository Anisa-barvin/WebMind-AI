import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Globe, ChevronRight } from 'lucide-react';
import { websiteAPI, documentationAPI } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const DocumentationCenter = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const res = await websiteAPI.list();
        // Only show ready websites
        setWebsites(res.data.websites?.filter(w => w.status === 'ready') || []);
      } catch (err) {
        console.error('Error fetching websites:', err);
      }
      setLoading(false);
    };
    fetchWebsites();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-indigo-500" />
          <span>Documentation Center</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Access AI-generated documentation for your trained websites. Preview and export in various formats.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton.List />
      ) : websites.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl max-w-2xl mx-auto">
          <FileText className="h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-base font-bold text-slate-300">No documentation available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mb-6">
            Train a website first to automatically generate documentation.
          </p>
          <Link to="/train" className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-colors glow-indigo">
            Train New Website
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map(site => (
            <Link 
              key={site._id} 
              to={`/documentation/${site._id}`}
              className="glassmorphism p-6 rounded-2xl border border-slate-800/40 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all group flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate">{site.name}</h3>
                  <p className="text-[10px] text-slate-400 truncate">{site.url}</p>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 mt-2 flex-1">
                {site.summary?.executiveSummary ? (
                  <span className="line-clamp-2">{site.summary.executiveSummary}</span>
                ) : (
                  <span className="italic">Documentation generated...</span>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-800/60">
                <span className="text-[10px] font-semibold text-indigo-400">View Documentation</span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentationCenter;
