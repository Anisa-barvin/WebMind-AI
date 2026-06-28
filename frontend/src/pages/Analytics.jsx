import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  LineChart, 
  Sparkles, 
  FileText, 
  Database, 
  MessageSquare,
  BarChart3,
  TrendingUp,
  Gauge
} from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsAPI.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#E2E8F0'];

  const metricCards = [
    { 
      title: 'Total Pages Crawled', 
      value: data?.summary?.totalPages || 0, 
      icon: <FileText className="h-5 w-5 text-indigo-400" />
    },
    { 
      title: 'Total Embeddings', 
      value: data?.summary?.totalChunks || 0, 
      icon: <Database className="h-5 w-5 text-purple-400" />
    },
    { 
      title: 'Total Chat Rooms', 
      value: data?.summary?.totalConversations || 0, 
      icon: <MessageSquare className="h-5 w-5 text-cyan-400" />
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <LineChart className="h-7 w-7 text-indigo-500" />
          <span>System Analytics</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">Review activity telemetry, database metrics, and service latencies.</p>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton.Card />
            <LoadingSkeleton.Card />
            <LoadingSkeleton.Card />
          </div>
          <div className="h-80 bg-slate-800/40 rounded-3xl animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricCards.map((card, i) => (
              <div key={i} className="glassmorphism p-5 rounded-2xl flex items-center justify-between border border-slate-800/40 hover:border-slate-700/60 transition-colors">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                  <span className="text-2xl font-black text-white mt-1.5 block font-mono">{card.value}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1: Questions Per Day & Web Shares */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Questions Per Day (AreaChart) */}
            <div className="glassmorphism p-6 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-200 mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Questions Per Day</span>
                </h3>
                <p className="text-[10px] text-slate-500 mb-6">Aggregate count of user messages submitted over the last 7 days</p>
              </div>

              <div className="h-64 w-full">
                {data?.charts?.questionsPerDay?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono">No query data collected yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.charts?.questionsPerDay || []}>
                      <defs>
                        <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#475569" fontSize={9} dy={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={9} dx={-10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', fontSize: '11px', color: '#F8FAFC' }} />
                      <Area type="monotone" dataKey="questions" name="Queries" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorQuestions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Trained Websites (BarChart) */}
            <div className="glassmorphism p-6 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-200 mb-1 flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-purple-400" />
                  <span>Trained Websites Distribution</span>
                </h3>
                <p className="text-[10px] text-slate-500 mb-6">Compare pages crawled and vector embeddings chunk segments per site</p>
              </div>

              <div className="h-64 w-full">
                {data?.charts?.websitesDistribution?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono">Index empty. Setup an assistant to view statistics.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={data?.charts?.websitesDistribution || []}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} dy={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={9} dx={-10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', fontSize: '11px', color: '#F8FAFC' }} />
                      <Bar dataKey="pages" name="Pages Crawled" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="chunks" name="Vectors Created" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
