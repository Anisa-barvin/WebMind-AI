import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Database, Search, Network, Bot } from 'lucide-react';

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="about" className="py-24 max-w-7xl mx-auto px-6 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Animated Illustration */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative h-[400px] w-full rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-slate-700/50 flex items-center justify-center overflow-hidden group"
        >
          {/* Animated rings */}
          <div className="absolute w-[300px] h-[300px] border border-indigo-500/20 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute w-[200px] h-[200px] border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute w-[100px] h-[100px] bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
          
          <Bot className="h-16 w-16 text-indigo-400 relative z-10 animate-float" />
          
          <div className="absolute top-1/4 left-1/4 bg-slate-800/80 p-3 rounded-xl border border-slate-700 backdrop-blur-sm animate-float-delayed">
            <Search className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="absolute bottom-1/4 right-1/4 bg-slate-800/80 p-3 rounded-xl border border-slate-700 backdrop-blur-sm animate-float">
            <Database className="h-6 w-6 text-purple-400" />
          </div>
          <div className="absolute top-3/4 left-1/3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 backdrop-blur-sm animate-float-delayed" style={{ animationDelay: '1s'}}>
            <Network className="h-6 w-6 text-indigo-400" />
          </div>
        </motion.div>

        {/* Right: Explanation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-indigo-400 text-sm font-semibold tracking-wide uppercase mb-3">What is WebMind AI?</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Turn static pages into <span className="gradient-text">intelligent knowledge</span>
          </h2>
          
          <div className="space-y-6 text-slate-400 text-lg">
            <p>
              WebMind AI converts any public website into an intelligent AI chatbot instantly. No coding required.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>
                <span><strong className="text-slate-200 font-medium">It crawls pages</strong> and extracts clean text content automatically.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
                <span><strong className="text-slate-200 font-medium">Creates embeddings</strong> and stores them securely in a high-speed vector database.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                </div>
                <span><strong className="text-slate-200 font-medium">Answers questions using RAG</strong> to ensure accurate, hallucination-free responses based on your actual data.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
