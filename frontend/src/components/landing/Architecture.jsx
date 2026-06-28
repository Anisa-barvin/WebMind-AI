import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { User, Server, Globe, Cpu, Brain, Database, ArrowRight, Zap, Sparkles } from 'lucide-react';

const archNodes = [
  { id: 'user', icon: User, label: 'User', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { id: 'frontend', icon: Globe, label: 'Frontend (React)', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { id: 'backend', icon: Server, label: 'Express Backend', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'crawler', icon: Cpu, label: 'Website Crawler', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'processing', icon: Zap, label: 'Content Processing', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'embedding', icon: Brain, label: 'Embedding Model', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  { id: 'vectordb', icon: Database, label: 'Vector Database', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'retriever', icon: Search, label: 'Retriever', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { id: 'llm', icon: Sparkles, label: 'LLM', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' },
  { id: 'response', icon: User, label: 'AI Response', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
];

import { Search } from 'lucide-react';

const Architecture = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Platform <span className="gradient-text">Architecture</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Built on a modern, scalable RAG tech stack.</p>
      </div>

      <div ref={ref} className="relative max-w-3xl mx-auto">
        <div className="flex flex-col items-center space-y-6">
          {archNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <React.Fragment key={node.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`flex items-center gap-4 w-full md:w-[400px] p-4 rounded-xl border ${node.border} ${node.bg} backdrop-blur-md shadow-lg group hover:scale-105 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`p-3 rounded-lg bg-slate-900/50 ${node.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-200">{node.label}</span>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </motion.div>
                
                {idx < archNodes.length - 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={inView ? { height: 24, opacity: 1 } : {}}
                    transition={{ duration: 0.3, delay: (idx * 0.1) + 0.1 }}
                    className="flex justify-center"
                  >
                    <ArrowRight className="w-5 h-5 text-slate-600 rotate-90" />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Architecture;
