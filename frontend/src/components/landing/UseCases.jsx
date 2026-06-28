import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Headset, Scale, GraduationCap, Building2, Landmark, FolderGit2, Boxes, ServerCog, Building, Plane, HeartPulse, PieChart, ShieldCheck, ShoppingCart } from 'lucide-react';

const cases = [
  { icon: Headset, title: "Customer Support", desc: "Instantly answer customer queries using your own docs." },
  { icon: Scale, title: "Legal Documentation", desc: "Chat with massive legal contracts and compliance files." },
  { icon: GraduationCap, title: "Educational Websites", desc: "Turn course materials into an interactive study tutor." },
  { icon: HeartPulse, title: "Hospital Websites", desc: "Help patients find doctors and procedures quickly." },
  { icon: Landmark, title: "Government Portals", desc: "Navigate complex public policies and forms." },
  { icon: Building, title: "University Websites", desc: "Guide students through admissions and campus info." },
  { icon: Building2, title: "Company Knowledge Base", desc: "Internal employee assistant for HR and IT." },
  { icon: FolderGit2, title: "Internal Documentation", desc: "Search across internal wikis and standard ops." },
  { icon: Boxes, title: "Product Documentation", desc: "Let users ask how to use your SaaS product." },
  { icon: ServerCog, title: "API Documentation", desc: "Developers can chat directly with your API spec." },
  { icon: Building, title: "Real Estate", desc: "Help buyers find property info automatically." },
  { icon: Plane, title: "Travel Websites", desc: "Plan itineraries using existing blog content." },
  { icon: PieChart, title: "Finance", desc: "Summarize financial reports and market analyses." },
  { icon: ShieldCheck, title: "Insurance", desc: "Clarify policy coverage and claims procedures." },
  { icon: ShoppingCart, title: "E-commerce", desc: "Assist shoppers with product details and FAQs." }
];

const UseCases = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="use-cases" className="py-24 bg-slate-900/20 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Where Can WebMind AI Be <span className="gradient-text">Used?</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Limitless possibilities across every industry.</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cases.map((useCase, idx) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group p-5 rounded-2xl glassmorphism border-slate-800/60 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mb-4 text-slate-300 group-hover:text-indigo-400 transition-colors border border-slate-700/50">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm mb-2 group-hover:text-white transition-colors">{useCase.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed group-hover:text-slate-400 transition-colors">{useCase.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
