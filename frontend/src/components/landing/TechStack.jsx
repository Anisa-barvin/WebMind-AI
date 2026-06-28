import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2, Database, BrainCircuit, Layout } from 'lucide-react';

const stacks = [
  {
    category: "Frontend",
    icon: Layout,
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    techs: ["React", "Tailwind CSS", "Framer Motion", "ShadCN UI"]
  },
  {
    category: "Backend",
    icon: Code2,
    color: "text-green-400",
    border: "border-green-500/20",
    bg: "bg-green-500/5",
    techs: ["Node.js", "Express", "REST APIs", "Cheerio Crawler"]
  },
  {
    category: "Database",
    icon: Database,
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    techs: ["MongoDB", "Mongoose", "ChromaDB (Vector)", "Redis Cache"]
  },
  {
    category: "AI & RAG",
    icon: BrainCircuit,
    color: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
    techs: ["LangChain", "Gemini Embeddings", "Groq LLMs", "Semantic Search"]
  }
];

const TechStack = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-800/50">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Built with Modern <span className="gradient-text">Tech Stack</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Scalable, fast, and reliable open-source technologies.</p>
      </div>

      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stacks.map((stack, idx) => {
          const Icon = stack.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-6 rounded-2xl border ${stack.border} ${stack.bg} backdrop-blur-sm group`}
            >
              <div className="flex items-center gap-3 mb-6">
                <Icon className={`w-8 h-8 ${stack.color} group-hover:rotate-12 transition-transform duration-300`} />
                <h3 className="text-xl font-bold text-slate-200">{stack.category}</h3>
              </div>
              <ul className="space-y-3">
                {stack.techs.map((tech, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TechStack;
