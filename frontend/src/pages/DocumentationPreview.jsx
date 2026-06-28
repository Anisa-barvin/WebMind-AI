import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, ArrowLeft, Copy, Check, FileText, 
  ChevronRight, ChevronDown, List, Layers, 
  Search, Link as LinkIcon 
} from 'lucide-react';
import { documentationAPI, websiteAPI } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const DocumentationPreview = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  
  const [doc, setDoc] = useState(null);
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overview: true, topics: true, pages: false, faq: false, insights: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, siteRes] = await Promise.all([
          documentationAPI.getDocumentation(websiteId),
          websiteAPI.getStatus(websiteId)
        ]);
        setDoc(docRes.data.documentation);
        setWebsite(siteRes.data.website);
      } catch (err) {
        console.error(err);
        setError('Failed to load documentation. It may still be generating.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [websiteId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) return <div className="p-8"><LoadingSkeleton.Card /></div>;
  
  if (error || !doc) return (
    <div className="flex flex-col items-center justify-center py-20">
      <FileText className="h-12 w-12 text-slate-600 mb-4" />
      <p className="text-slate-400">{error || 'Documentation not found.'}</p>
      <button onClick={() => navigate('/documentation')} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg">Go Back</button>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in relative max-w-7xl mx-auto h-[calc(100vh-80px)]">
      
      {/* Sidebar TOC */}
      <div className="hidden lg:flex flex-col w-64 shrink-0 glassmorphism rounded-2xl border border-slate-800/40 sticky top-0 h-full overflow-y-auto custom-scrollbar p-5">
        <button onClick={() => navigate('/documentation')} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-indigo-400 uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Center
        </button>
        
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <List className="h-4 w-4 text-indigo-400" /> Contents
        </h3>
        
        <nav className="space-y-1 text-xs font-medium text-slate-400">
          <button onClick={() => scrollTo('exec-summary')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-indigo-300 transition-colors">Executive Summary</button>
          <button onClick={() => scrollTo('overview')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-indigo-300 transition-colors">Website Overview</button>
          <button onClick={() => scrollTo('topics')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-indigo-300 transition-colors">Topics & Services</button>
          <button onClick={() => scrollTo('pages')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-indigo-300 transition-colors">Important Pages</button>
          <button onClick={() => scrollTo('faq')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-indigo-300 transition-colors">FAQ</button>
          <button onClick={() => scrollTo('insights')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/50 hover:text-indigo-300 transition-colors">AI Insights</button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/20 rounded-2xl border border-slate-800/50 overflow-hidden relative">
        
        {/* Header toolbar */}
        <div className="h-16 shrink-0 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-extrabold text-white truncate max-w-[200px] md:max-w-md">{website?.name} Docs</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative hidden md:flex items-center">
              <Search className="h-4 w-4 text-slate-500 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search doc..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 w-48"
              />
            </div>
            
            <button onClick={handleCopy} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors" title="Copy raw JSON">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors glow-indigo"
              >
                <Download className="h-4 w-4" /> Export
              </button>
              
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {['PDF', 'DOCX', 'Markdown', 'TXT'].map(format => (
                      <a 
                        key={format}
                        href={documentationAPI.getExportUrl(websiteId, format)}
                        download
                        onClick={() => setShowExportMenu(false)}
                        className="block px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        as {format}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Scrollable Document */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Title Section */}
            <div className="text-center space-y-4 pb-8 border-b border-slate-800/40">
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Documentation
              </h1>
              <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                <LinkIcon className="h-4 w-4" /> {website?.url}
              </p>
            </div>

            {/* Sections */}
            <section id="exec-summary" className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Executive Summary</h2>
              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-300 text-sm leading-relaxed">
                {doc.executiveSummary || 'Not available'}
              </div>
            </section>

            <section id="overview" className="space-y-4">
              <button onClick={() => toggleSection('overview')} className="flex items-center gap-2 text-lg font-bold text-white hover:text-indigo-300 transition-colors w-full">
                {expandedSections.overview ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                Website Overview
              </button>
              <AnimatePresence>
                {expandedSections.overview && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap pl-7">
                      {doc.websiteOverview || 'Not available'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section id="topics" className="space-y-6">
               <button onClick={() => toggleSection('topics')} className="flex items-center gap-2 text-lg font-bold text-white hover:text-indigo-300 transition-colors w-full">
                {expandedSections.topics ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                Topics & Services
              </button>
              <AnimatePresence>
                {expandedSections.topics && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-7 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Main Topics</h4>
                      <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                        {doc.mainTopics?.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Key Services</h4>
                      <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                        {doc.keyServices?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section id="pages" className="space-y-4">
              <button onClick={() => toggleSection('pages')} className="flex items-center gap-2 text-lg font-bold text-white hover:text-indigo-300 transition-colors w-full">
                {expandedSections.pages ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                Important Pages
              </button>
              <AnimatePresence>
                {expandedSections.pages && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-7 space-y-4">
                    {doc.importantPages?.map((p, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                        <h4 className="font-bold text-indigo-400 text-sm mb-1">{p.title}</h4>
                        <p className="text-[10px] text-slate-500 mb-2">{p.url}</p>
                        <p className="text-xs text-slate-300">{p.description}</p>
                      </div>
                    ))}
                    {!doc.importantPages?.length && <p className="text-sm text-slate-500">None detected.</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section id="faq" className="space-y-4">
              <button onClick={() => toggleSection('faq')} className="flex items-center gap-2 text-lg font-bold text-white hover:text-indigo-300 transition-colors w-full">
                {expandedSections.faq ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                Frequently Asked Questions
              </button>
              <AnimatePresence>
                {expandedSections.faq && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-7 space-y-4">
                    {doc.faq?.map((q, i) => (
                      <div key={i} className="space-y-1">
                        <h4 className="font-bold text-slate-200 text-sm flex gap-2">
                          <span className="text-indigo-500">Q.</span> {q.question}
                        </h4>
                        <p className="text-slate-400 text-sm pl-6 leading-relaxed">{q.answer}</p>
                      </div>
                    ))}
                    {!doc.faq?.length && <p className="text-sm text-slate-500">No FAQs generated.</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section id="insights" className="space-y-4">
              <button onClick={() => toggleSection('insights')} className="flex items-center gap-2 text-lg font-bold text-white hover:text-indigo-300 transition-colors w-full">
                {expandedSections.insights ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                AI Insights
              </button>
              <AnimatePresence>
                {expandedSections.insights && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-7">
                    <ul className="space-y-3">
                      {doc.aiInsights?.map((insight, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span className="leading-relaxed">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DocumentationPreview;
