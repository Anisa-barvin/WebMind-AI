import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  UserCog, 
  Calendar, 
  Mail, 
  Globe, 
  MessageSquare,
  Activity,
  Cpu
} from 'lucide-react';

const Profile = () => {
  const { user, stats, refreshStats } = useContext(AuthContext);

  useEffect(() => {
    refreshStats();
  }, []);

  const statsList = [
    { label: 'Domains Crawled', value: stats?.totalWebsites || 0, icon: <Globe className="h-4.5 w-4.5 text-indigo-400" /> },
    { label: 'Assistants Ready', value: stats?.trainedWebsites || 0, icon: <Cpu className="h-4.5 w-4.5 text-purple-400" /> },
    { label: 'Queries Asked', value: stats?.totalQuestions || 0, icon: <MessageSquare className="h-4.5 w-4.5 text-cyan-400" /> }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <UserCog className="h-7 w-7 text-indigo-500" />
          <span>My Profile & Settings</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">Manage credentials and monitor account usage metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: User card */}
        <div className="md:col-span-1 glassmorphism p-6 rounded-2xl border border-slate-800/40 text-center flex flex-col items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl glow-indigo mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <h3 className="font-bold text-base text-slate-100">{user?.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{user?.email}</p>

          <div className="w-full border-t border-slate-850 mt-6 pt-4 space-y-3.5 text-left">
            <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-semibold">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            
            <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-semibold">
              <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
              <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Right: Usage Statistics */}
        <div className="md:col-span-2 glassmorphism p-6 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-200 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <span>Usage Telemetry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statsList.map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center">
                  <div className="p-2 bg-slate-950 rounded-lg mb-3 shrink-0 border border-slate-800/60">
                    {stat.icon}
                  </div>
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  <span className="text-xl font-black text-white mt-1 font-mono">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl">
              <h4 className="font-bold text-xs text-slate-300 mb-2">Account Subscription</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                You are currently on the <span className="font-bold text-slate-300">Hackathon Developer Plan</span>. Enjoy unlimited crawlers, up to 50 index pages per domain, and text embeddings via Gemini model endpoints.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-600 text-right mt-6">
            Account ID: {user?._id}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
