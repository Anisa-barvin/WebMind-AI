import React from 'react';

const logos = [
  "Google", "Microsoft", "OpenAI", "GitHub", "MongoDB", "LangChain", "React", "Node.js", "Tailwind"
];

const TrustedBy = () => {
  return (
    <section className="py-12 border-y border-slate-800/50 bg-slate-900/20 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0F172A] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0F172A] to-transparent z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 text-center mb-8">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Powered by Industry Leading Tech</p>
      </div>
      
      <div className="flex w-full overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap items-center">
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <div key={index} className="mx-8 md:mx-16 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-300">
              <span className="text-xl md:text-2xl font-bold text-slate-300 tracking-tight font-outfit">{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
