import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, X, Sparkles } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/train': 'Train Website',
  '/websites': 'Manage Sites',
  '/chat': 'AI Chat',
  '/analytics': 'Analytics',
  '/profile': 'My Profile'
};

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  
  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] || 'Console';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-darkbg text-slate-100">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          
          {/* Sidebar container */}
          <div className="relative flex w-64 max-w-xs flex-col bg-slate-900 border-r border-slate-800">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/40 bg-slate-950/15 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/30 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Breadcrumb title */}
            <div className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
              <span>WebMind AI</span>
              <span>/</span>
              <span className="text-slate-200 font-semibold uppercase tracking-wider text-xs">{pageTitle}</span>
            </div>
          </div>
          
          {/* Top Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/train" 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/10 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>New Assistant</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-hidden bg-slate-950/40">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl h-full overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
