import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactCountUp from 'react-countup';
const CountUp = ReactCountUp.default || ReactCountUp;
import { 
  MessageSquareCode, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  FileText, 
  Database,
  Sparkles,
  BookOpen,
  Info,
  Layers,
  AlertCircle,
  Tag,
  Code2,
  Mail,
  Link2 as LinkIcon,
  Activity,
  Download
} from 'lucide-react';
import { documentationAPI } from '../services/api';

const WebsiteSummaryDashboard = ({ site, onRetrain, onDelete }) => {
  const navigate = useNavigate();
  
  if (site.status !== 'ready') {
    return (
      <div className="lg:col-span-1 glassmorphism p-6 rounded-2xl border border-slate-800/40 flex flex-col justify-between gap-6 shadow-xl sticky top-6 min-h-[400px]">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-200">{site.name}</h3>
            <a href={site.url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline truncate block max-w-[200px]">
              {site.url}
            </a>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onRetrain(site._id)} title="Retrain Index" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-950 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(site._id)} title="Delete Assistant" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500 flex-1">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-3 animate-bounce" />
          <p className="text-xs font-semibold text-slate-300">Assistant is training...</p>
          <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Data will populate once crawling and embedding are complete.</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const confidenceScore = site.summary?.aiConfidenceScore || 85;
  const isHighConfidence = confidenceScore >= 80;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="lg:col-span-1 glassmorphism p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between gap-6 shadow-2xl sticky top-6 bg-slate-900/40 backdrop-blur-xl max-h-[85vh] flex"
      key={site._id}
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-4">
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-extrabold text-lg text-white truncate">{site.name}</h3>
            {site.summary?.category && site.summary.category !== 'Uncategorized' && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shrink-0">
                {site.summary.category}
              </span>
            )}
          </div>
          <a href={site.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors hover:underline truncate block">
            {site.url}
          </a>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
          <button onClick={() => onRetrain(site._id)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(site._id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center group hover:border-indigo-500/50 transition-colors">
            <FileText className="h-4 w-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-black text-white font-mono">
              <CountUp end={site.totalPages || 0} duration={2} />
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">Pages</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center group hover:border-purple-500/50 transition-colors">
            <Database className="h-4 w-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-black text-white font-mono">
              <CountUp end={site.totalChunks || 0} duration={2} />
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-bold mt-0.5">Chunks</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center group hover:border-emerald-500/50 transition-colors relative overflow-hidden">
            <Activity className={`h-4 w-4 mb-1 group-hover:scale-110 transition-transform ${isHighConfidence ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-xl font-black text-white font-mono flex items-baseline gap-0.5">
              <CountUp end={confidenceScore} duration={2.5} />
              <span className="text-[10px] text-slate-400">%</span>
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-bold mt-0.5 z-10">AI Score</span>
            
            <div className="absolute bottom-0 left-0 h-1 bg-slate-900 w-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className={`h-full ${isHighConfidence ? 'bg-emerald-500' : 'bg-amber-500'}`} 
              />
            </div>
          </div>
        </motion.div>

        {/* Executive Summary */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>Executive Summary</span>
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed font-normal bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 shadow-inner">
            {site.summary?.executiveSummary || 'No summary compiled.'}
          </p>
        </motion.div>

        {/* Two Column Grid for Topics and Services */}
        <div className="grid grid-cols-1 gap-4">
          <motion.div variants={itemVariants} className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span>Main Topics</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {site.summary?.mainTopics?.length > 0 ? (
                site.summary.mainTopics.map((topic, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-[10px] border border-blue-500/20 font-medium">
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None</span>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Services</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {site.summary?.keyServices?.length > 0 ? (
                site.summary.keyServices.map((srv, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-[10px] border border-purple-500/20 font-medium">
                    {srv}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Technologies & Keywords */}
        <motion.div variants={itemVariants} className="space-y-3 pt-2 border-t border-slate-800/50">
          <div>
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <Code2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Technologies</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {site.summary?.technologies?.length > 0 ? (
                site.summary.technologies.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    {tech}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Not detected</span>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <Tag className="h-3.5 w-3.5 text-rose-400" />
              <span>Keywords</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {site.summary?.keywords?.length > 0 ? (
                site.summary.keywords.map((kw, i) => (
                  <span key={i} className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                    #{kw.replace(/\s+/g, '')}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Important Info & Contact */}
        <motion.div variants={itemVariants} className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/50 space-y-4">
          {site.summary?.contactInfo?.length > 0 && (
            <div>
               <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                 <Mail className="h-3.5 w-3.5 text-emerald-400" />
                 <span>Contact Info</span>
               </h4>
               <ul className="space-y-1">
                 {site.summary.contactInfo.map((info, i) => (
                   <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                     <span className="text-emerald-500 mt-0.5">•</span>
                     <span>{info}</span>
                   </li>
                 ))}
               </ul>
            </div>
          )}

          {site.summary?.socialLinks?.length > 0 && (
            <div>
               <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                 <LinkIcon className="h-3.5 w-3.5 text-pink-400" />
                 <span>Social Links</span>
               </h4>
               <div className="flex flex-wrap gap-2">
                 {site.summary.socialLinks.map((link, i) => (
                   <a key={i} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="text-[10px] text-pink-400 hover:text-pink-300 underline underline-offset-2">
                     {link.replace(/^https?:\/\/(www\.)?/, '')}
                   </a>
                 ))}
               </div>
            </div>
          )}

          <div>
             <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
               <Info className="h-3.5 w-3.5 text-slate-400" />
               <span>General Info</span>
             </h4>
             <ul className="space-y-1">
               {site.summary?.importantInfo?.map((inf, i) => (
                 <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                   <span className="text-slate-600 mt-0.5">-</span>
                   <span>{inf}</span>
                 </li>
               ))}
               {(!site.summary?.importantInfo || site.summary.importantInfo.length === 0) && (
                 <span className="text-xs text-slate-600">No additional info available.</span>
               )}
             </ul>
          </div>
        </motion.div>
      </div>

      {/* Action Button */}
      <motion.div variants={itemVariants} className="pt-2 border-t border-slate-800/60 mt-auto shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/chat?site=${site._id}`)}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 glow-indigo shadow-xl transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <MessageSquareCode className="h-4.5 w-4.5" />
            <span>Start Chat Session</span>
          </button>
          
          <a
            href={documentationAPI.getReportExportUrl(site._id)}
            download
            className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all border border-slate-700 transform hover:scale-[1.02] active:scale-95"
          >
            <Download className="h-4.5 w-4.5" />
            <span>Training Report</span>
          </a>
        </div>
        <div className="text-center mt-3">
          <span className="text-[9px] text-slate-500 flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3" />
            Trained on {new Date(site.createdAt).toLocaleDateString()}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WebsiteSummaryDashboard;
