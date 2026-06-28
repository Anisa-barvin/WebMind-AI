import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">WebMind AI</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Transform any website into an intelligent AI assistant. Powered by RAG and advanced vector search.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-indigo-400 text-sm font-semibold transition-colors">GitHub</a>
              <a href="#" className="text-slate-500 hover:text-indigo-400 text-sm font-semibold transition-colors">Twitter</a>
              <a href="#" className="text-slate-500 hover:text-indigo-400 text-sm font-semibold transition-colors">LinkedIn</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Integrations</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Developers</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">API Reference</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Open Source</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">GitHub Repo</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} WebMind AI. Crafted for AI SaaS Hackathon.
          </p>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
