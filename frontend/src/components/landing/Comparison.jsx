import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { X, Check } from 'lucide-react';

const Comparison = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="py-24 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose <span className="gradient-text">WebMind AI</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Upgrade from archaic keyword matching to semantic understanding.</p>
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="glassmorphism rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl"
      >
        <div className="grid grid-cols-3 bg-slate-900/80 p-6 border-b border-slate-700/50">
          <div className="col-span-1"></div>
          <div className="col-span-1 text-center font-semibold text-slate-400">Traditional Search</div>
          <div className="col-span-1 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-xl">WebMind AI</div>
        </div>

        <div className="divide-y divide-slate-800/50">
          {[
            { label: 'Keyword Search', t: true, w: false },
            { label: 'Semantic Retrieval', t: false, w: true },
            { label: 'Instant Answers', t: false, w: true },
            { label: 'Natural Language Chat', t: false, w: true },
            { label: 'Context Awareness', t: false, w: true },
            { label: 'Source Citations', t: false, w: true },
          ].map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 p-6 hover:bg-slate-800/20 transition-colors items-center">
              <div className="col-span-1 font-medium text-slate-300">{row.label}</div>
              <div className="col-span-1 flex justify-center">
                {row.t ? <Check className="text-slate-500 w-5 h-5" /> : <X className="text-slate-700 w-5 h-5" />}
              </div>
              <div className="col-span-1 flex justify-center">
                {row.w ? (
                  <div className="bg-indigo-500/10 p-2 rounded-full border border-indigo-500/20">
                    <Check className="text-indigo-400 w-5 h-5" />
                  </div>
                ) : (
                  <X className="text-slate-700 w-5 h-5" />
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Comparison;
