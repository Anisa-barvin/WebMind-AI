import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, PlayCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden px-6">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen animate-float-delayed"></div>
      
      {/* Particles effect - simplified with static divs for now */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start text-left"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/40 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Next-Gen RAG Architecture</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            Chat With Any <br />
            <span className="gradient-text font-extrabold">Website</span> Using AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed"
          >
            Transform any website into an intelligent AI assistant powered by Retrieval Augmented Generation (RAG), semantic search, and advanced AI.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-base text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800 font-semibold text-base text-slate-200 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md">
              <PlayCircle className="h-5 w-5 text-indigo-400" />
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Right Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.4, type: 'spring' }}
          className="relative perspective-1000 hidden lg:block"
        >
          <div className="glassmorphism rounded-2xl border border-slate-700/50 shadow-2xl p-6 relative overflow-hidden transform-gpu hover:scale-[1.02] transition-transform duration-500">
            {/* Window controls */}
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            
            <div className="space-y-6">
              {/* URL Input Mock */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                <span className="text-slate-400 text-sm font-mono truncate">https://stripe.com/docs</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-semibold">Trained</span>
              </div>
              
              {/* Progress & Embeddings Mock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-4">
                  <div className="text-xs text-indigo-300 mb-1">Knowledge Chunks</div>
                  <div className="text-2xl font-bold text-white">4,289</div>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4">
                  <div className="text-xs text-purple-300 mb-1">Vector Embeddings</div>
                  <div className="text-2xl font-bold text-white">384-dim</div>
                </div>
              </div>
              
              {/* Chat Mock */}
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 h-48 flex flex-col justify-end space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white shrink-0">U</div>
                  <div className="bg-slate-800 rounded-lg rounded-tl-none p-3 text-sm text-slate-200">
                    How do I implement checkout sessions?
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white shrink-0">AI</div>
                  <div className="bg-indigo-900/40 border border-indigo-500/20 rounded-lg rounded-tr-none p-3 text-sm text-slate-200 w-full relative">
                    <span className="block mb-2">To implement Stripe Checkout sessions, you need to call `stripe.checkout.sessions.create`...</span>
                    <div className="typing-indicator flex">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gradient Overlay line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
