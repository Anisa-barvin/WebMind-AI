import React from 'react';
import { useInView } from 'react-intersection-observer';


const stats = [
  { value: 50, suffix: "+", label: "Pages Crawled / Min", color: "text-indigo-400" },
  { value: 10, suffix: "K+", label: "Chunks Indexed", color: "text-purple-400" },
  { value: 95, suffix: "%", label: "Retrieval Accuracy", color: "text-cyan-400" },
  { value: 2, suffix: "s", label: "Average Response Time", color: "text-emerald-400" }
];

const Performance = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <section id="performance" className="py-16 bg-slate-900/60 border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-800/50">
          {stats.map((stat, idx) => (
            <div key={idx} className={`text-center ${idx % 2 !== 0 ? 'border-l border-slate-800/50 md:border-none' : ''} md:border-l md:first:border-none px-4`}>
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color} drop-shadow-[0_0_15px_currentColor]`}>
                  {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Performance;
