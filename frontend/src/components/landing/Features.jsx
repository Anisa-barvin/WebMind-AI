import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Globe2, MessageSquare, Search, GitMerge, BrainCircuit, Zap, BarChart3, ShieldCheck, History, FileText, Link, Database } from 'lucide-react';

const features = [
  { icon: Globe2, title: "Website Crawling", desc: "Automated recursive crawling to map out full site architectures." },
  { icon: MessageSquare, title: "AI Chat", desc: "Interactive natural language conversations with your data." },
  { icon: Search, title: "Semantic Search", desc: "Find meaning and context, not just exact keyword matches." },
  { icon: GitMerge, title: "RAG Pipeline", desc: "End-to-end Retrieval Augmented Generation for accurate answers." },
  { icon: BrainCircuit, title: "Embeddings", desc: "State-of-the-art vector representations of text chunks." },
  { icon: Zap, title: "Real-time Streaming", desc: "Responses stream in real-time for immediate feedback." },
  { icon: BarChart3, title: "Analytics", desc: "Track query volume, latency, and user engagement." },
  { icon: ShieldCheck, title: "Authentication", desc: "Secure access control and isolated tenant data." },
  { icon: History, title: "Conversation History", desc: "Pick up past chats right where you left off." },
  { icon: FileText, title: "Website Summary", desc: "Auto-generated summaries of large documentation sites." },
  { icon: Link, title: "Source References", desc: "Every answer links back to the exact source page." },
  { icon: Database, title: "Vector Database", desc: "High-performance vector storage and retrieval." }
];

const Features = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Core <span className="gradient-text">Features</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to build production-grade AI agents.</p>
      </div>

      <motion.div 
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-6 rounded-2xl bg-slate-800/20 border border-slate-700/50 hover:bg-slate-800/40 transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-slate-200 mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Features;
