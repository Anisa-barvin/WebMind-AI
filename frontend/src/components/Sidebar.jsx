import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Globe, 
  FolderHeart, 
  MessageSquareCode, 
  LineChart, 
  UserCog, 
  LogOut,
  Sparkles,
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Train Website', path: '/train', icon: <Globe className="h-5 w-5" /> },
    { name: 'Manage Sites', path: '/websites', icon: <FolderHeart className="h-5 w-5" /> },
    { name: 'Documentation', path: '/documentation', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'AI Chat', path: '/chat', icon: <MessageSquareCode className="h-5 w-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <LineChart className="h-5 w-5" /> },
    { name: 'My Profile', path: '/profile', icon: <UserCog className="h-5 w-5" /> }
  ];

  const isActive = (path) => {
    // Exact match or active subroute check
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-slate-900/40 border-r border-slate-800/60 flex flex-col h-full shrink-0">
      {/* Title */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/40">
        <div className="bg-indigo-600 p-2 rounded-xl text-white flex items-center justify-center glow-indigo">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight font-sans bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">WebMind AI</h1>
          <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">RAG Chatbot Platform</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-250 ${
                active 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.1)]' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Summary card */}
      <div className="p-4 border-t border-slate-800/40 bg-slate-950/20 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate text-slate-200">{user?.name}</h4>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950 hover:bg-rose-950/10 text-xs font-semibold transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
