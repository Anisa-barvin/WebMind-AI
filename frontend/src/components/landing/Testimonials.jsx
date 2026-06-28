import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "WebMind AI completely changed how we onboard our users. We plugged in our documentation URL and had a fully functional AI assistant running in 5 minutes.",
    author: "Sarah Jenkins",
    role: "Product Manager at TechFlow",
    img: "https://i.pravatar.cc/150?img=1"
  },
  {
    quote: "The semantic search capabilities are unreal. It doesn't just match keywords, it actually understands what our developers are asking and finds the exact API endpoint.",
    author: "David Chen",
    role: "Lead Engineer",
    img: "https://i.pravatar.cc/150?img=11"
  },
  {
    quote: "We used to spend hours answering the same support questions. Now, our custom trained bot handles 80% of level 1 queries with source citations.",
    author: "Emily Rodriguez",
    role: "Head of Customer Support",
    img: "https://i.pravatar.cc/150?img=5"
  }
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 max-w-5xl mx-auto px-6 overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by <span className="gradient-text">Developers</span></h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">See what our users are saying about the platform.</p>
      </div>

      <div className="relative min-h-[300px]">
        <AnimatePresence mode='wait'>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-slate-700/50 text-center max-w-3xl relative">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-indigo-500/20" />
              <Quote className="absolute bottom-6 right-6 w-12 h-12 text-indigo-500/20 rotate-180" />
              
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-1" />
                ))}
              </div>
              
              <p className="text-xl md:text-2xl text-slate-200 mb-8 leading-relaxed font-medium">
                "{testimonials[current].quote}"
              </p>
              
              <div className="flex flex-col items-center">
                <img 
                  src={testimonials[current].img} 
                  alt={testimonials[current].author}
                  className="w-14 h-14 rounded-full border-2 border-indigo-500/50 mb-3"
                />
                <div className="font-bold text-white">{testimonials[current].author}</div>
                <div className="text-sm text-indigo-400">{testimonials[current].role}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === current ? 'bg-indigo-500 w-6' : 'bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
