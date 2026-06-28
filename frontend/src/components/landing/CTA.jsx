import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6 relative overflow-hidden my-12">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl p-12 md:p-20 overflow-hidden border border-slate-700/50 text-center"
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-slate-900/80 -z-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/80 to-slate-900 -z-10"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none -z-10"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] -z-10 animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4" />
          <span>Start Building Today</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white max-w-3xl mx-auto leading-tight">
          Ready to Chat with <br className="hidden md:block"/>
          <span className="gradient-text">Any Website?</span>
        </h2>
        
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Join thousands of developers and companies building the next generation of AI-powered conversational search.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-lg text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Start Building
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-slate-500 text-sm mt-4 sm:mt-0 sm:ml-4">No credit card required. Free tier available.</p>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
