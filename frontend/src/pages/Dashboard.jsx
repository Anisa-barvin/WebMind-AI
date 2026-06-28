import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { websiteAPI } from '../services/api';
import { 
  Globe, 
  Bot, 
  MessageSquare, 
  Cpu, 
  Sparkles, 
  PlusCircle, 
  Clock, 
  MessageSquareCode,
  ArrowRight
} from 'lucide-react';
import { CardSkeleton } from '../components/LoadingSkeleton';

const Dashboard = () => {
  const { user, stats, refreshStats } = useContext(AuthContext);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await refreshStats();
        const res = await websiteAPI.list();
        setWebsites(res.data.websites || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const cardData = [
    { 
      title: 'Total Websites', 
      value: stats?.totalWebsites || 0, 
      icon: <Globe className="h-6 w-6 text-indigo-400" />,
      desc: 'Registered domains'
    },
    { 
      title: 'Trained Websites', 
      value: stats?.trainedWebsites || 0, 
      icon: <Cpu className="h-6 w-6 text-purple-400" />,
      desc: 'Ready for conversation'
    },
    { 
      title: 'Total Questions', 
      value: stats?.totalQuestions || 0, 
      icon: <MessageSquare className="h-6 w-6 text-cyan-400" />,
      desc: 'Asked by users'
    },
    { 
      title: 'AI Responses', 
      value: stats?.totalAnswers || 0, 
      icon: <Bot className="h-6 w-6 text-emerald-400" />,
      desc: 'Generated answers'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative glassmorphism p-8 rounded-3xl overflow-hidden shadow-xl border border-slate-800/40">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-gradient-to-l from-indigo-500/10 to-transparent -z-10"></div>
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Hackathon Workspace</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-slate-100">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Monitor and manage your RAG-trained AI website assistants. Ask questions, explore crawling status, or launch a new chatbot instance.
          </p>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : cardData.map((card, i) => (
              <div key={i} className="glassmorphism p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 group-hover:scale-110 transition-transform duration-350">{card.icon}</div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">{card.value}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{card.desc}</p>
                </div>
              </div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recently Trained Websites */}
        <div className="lg:col-span-2 glassmorphism p-6 rounded-2xl flex flex-col justify-between border border-slate-800/40">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base text-slate-200">Recently Trained Websites</h3>
              <Link to="/websites" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map(n => (
                  <div key={n} className="h-14 bg-slate-800/40 rounded-xl"></div>
                ))}
              </div>
            ) : websites.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl">
                <Globe className="h-10 w-10 text-slate-600 mb-3" />
                <p className="text-xs text-slate-500 font-semibold mb-4">No websites trained yet</p>
                <Link to="/train" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-colors">
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Train Your First URL</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {websites.slice(0, 3).map((site) => (
                  <div key={site._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/35 border border-slate-800/40 hover:border-slate-700/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4.5 w-4.5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-semibold truncate text-slate-200">{site.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{site.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        site.status === 'ready' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                          : site.status === 'failed'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}>
                        {site.status}
                      </span>
                      {site.status === 'ready' && (
                        <Link 
                          to={`/chat?site=${site._id}`}
                          className="p-1.5 rounded-lg bg-slate-850 hover:bg-indigo-600 hover:text-white border border-slate-800 text-slate-400 transition-colors"
                        >
                          <MessageSquareCode className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Activities */}
        <div className="glassmorphism p-6 rounded-2xl flex flex-col border border-slate-800/40">
          <h3 className="font-bold text-base text-slate-200 mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            <span>Quick Navigation</span>
          </h3>
          
          <div className="space-y-3.5 flex-1">
            <Link 
              to="/train"
              className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/35 border border-slate-800/40 hover:border-indigo-500/20 hover:bg-indigo-600/5 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Setup New Agent</h4>
                <p className="text-[10px] text-slate-500">Crawl and index a website URL</p>
              </div>
            </Link>

            <Link 
              to="/chat"
              className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/35 border border-slate-800/40 hover:border-purple-500/20 hover:bg-purple-600/5 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-purple-600/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">Start AI Chat</h4>
                <p className="text-[10px] text-slate-500">Chat with trained web documents</p>
              </div>
            </Link>

            <Link 
              to="/analytics"
              className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/35 border border-slate-800/40 hover:border-cyan-500/20 hover:bg-cyan-600/5 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-cyan-600/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">View Analytics</h4>
                <p className="text-[10px] text-slate-500">See charts, metrics and latency stats</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
