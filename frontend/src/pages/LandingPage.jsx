import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Hero from '../components/landing/Hero';
import TrustedBy from '../components/landing/TrustedBy';
import About from '../components/landing/About';
import Workflow from '../components/landing/Workflow';
import Architecture from '../components/landing/Architecture';
import UseCases from '../components/landing/UseCases';
import Features from '../components/landing/Features';
import Comparison from '../components/landing/Comparison';
import Demo from '../components/landing/Demo';
import TechStack from '../components/landing/TechStack';
import Performance from '../components/landing/Performance';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Premium Sticky Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glassmorphism-nav border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:bg-indigo-500 transition-colors">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight font-outfit">WebMind AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</a>
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#use-cases" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Use Cases</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 rounded-xl gradient-border-btn font-semibold text-sm text-white hover:text-indigo-100 transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Assemble the Page Components */}
      <main>
        <Hero />
        <About />
        <Workflow />
        <Architecture />
        <UseCases />
        <Features />
        <Comparison />
        <Demo />
        <TechStack />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
