import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play, Loader2, Link2, ExternalLink } from 'lucide-react';

const Demo = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [demoState, setDemoState] = useState('idle'); // idle, training, ready, typing, done
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (inView && demoState === 'idle') {
      setTimeout(() => setDemoState('training'), 1000);
    }
  }, [inView, demoState]);

  useEffect(() => {
    if (demoState === 'training') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setDemoState('ready'), 500);
            return 100;
          }
          return p + Math.floor(Math.random() * 15) + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
    
    if (demoState === 'ready') {
      setTimeout(() => setDemoState('typing'), 1000);
    }
    
    if (demoState === 'typing') {
      setTimeout(() => setDemoState('done'), 2500);
    }
  }, [demoState]);

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-900/10 blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">See It In <span className="gradient-text">Action</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">From zero to trained AI agent in seconds.</p>
        </div>

        <div ref={ref} className="glassmorphism rounded-3xl border border-slate-700/60 overflow-hidden shadow-2xl shadow-indigo-900/20 max-w-4xl mx-auto">
          {/* Mac window header */}
          <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <div className="ml-4 text-xs text-slate-500 font-mono flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
              <Link2 className="w-3 h-3" /> https://docs.yourcompany.com
            </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-900/40 relative min-h-[400px]">
            {demoState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                <Play className="w-16 h-16 text-slate-600 mb-4" />
                <p className="text-slate-500">Awaiting URL Submission...</p>
              </div>
            )}

            {demoState === 'training' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Training in Progress</h3>
                <p className="text-slate-400 text-sm mb-6">Crawling pages, chunking text, and generating embeddings...</p>
                <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "tween", ease: "linear" }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500 font-mono">{progress}% Complete</div>
              </div>
            )}

            {(demoState === 'ready' || demoState === 'typing' || demoState === 'done') && (
              <div className="flex flex-col h-full justify-end space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">U</div>
                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-none p-4 text-slate-200 shadow-sm">
                    How do I authenticate with the API?
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">AI</div>
                  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl rounded-tr-none p-4 text-slate-200 shadow-sm w-full relative">
                    {demoState === 'typing' ? (
                      <div className="typing-indicator flex py-2">
                        <span></span><span></span><span></span>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="mb-4">To authenticate with our API, you need to include your API key in the Authorization header as a Bearer token.</p>
                        <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-indigo-300 font-mono mb-4 overflow-x-auto">
                          Authorization: Bearer YOUR_API_KEY
                        </pre>
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Sources:</p>
                          <a href="#" className="inline-flex items-center gap-1 text-xs text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-500/20 hover:bg-cyan-900/40 transition-colors">
                            <ExternalLink className="w-3 h-3" /> /docs/authentication
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
