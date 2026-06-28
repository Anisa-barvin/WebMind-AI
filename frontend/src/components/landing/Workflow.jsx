import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Globe, Cpu, Scissors, FileText, Database, Layers, MessageSquare } from 'lucide-react';

const steps = [
  { icon: Globe, title: "Enter Website URL", desc: "Provide any public domain or specific page." },
  { icon: Cpu, title: "AI Crawls Website", desc: "Our bot recursively follows links to map the site." },
  { icon: Scissors, title: "Extract Clean Content", desc: "We strip out boilerplate, scripts, and nav menus." },
  { icon: FileText, title: "Split into Chunks", desc: "Content is divided into optimal semantic chunks." },
  { icon: Layers, title: "Generate Embeddings", desc: "Advanced AI models map chunks into vector space." },
  { icon: Database, title: "Store in Vector Database", desc: "Indexed in ChromaDB for ultra-fast retrieval." },
  { icon: MessageSquare, title: "Chat using AI", desc: "Query your bot and get exact, cited answers." }
];

const Workflow = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-slate-900/40 relative border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How the Platform <span className="gradient-text">Works</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">A fully automated pipeline from raw HTML to an intelligent conversational agent.</p>
        </div>

        <div ref={ref} className="relative mt-20">


          <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-4 overflow-x-auto pb-8 snap-x">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="flex flex-col items-center flex-1 min-w-[200px] snap-center group"
                >
                  <div className="w-16 h-16 rounded-2xl glassmorphism border-slate-700 flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                    {/* Glowing background */}
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs font-bold text-indigo-500 mb-1 uppercase tracking-wider">Step {idx + 1}</div>
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workflow;
