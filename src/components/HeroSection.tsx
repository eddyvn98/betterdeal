import React from 'react';
import { HeroContent } from './hero/HeroContent';
import { HeroVisual } from './hero/HeroVisual';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-20 pt-16 md:pb-32 md:pt-24">
      {/* Premium Background Elements */}
      <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-40 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full bg-emerald-200 blur-[60px] will-change-transform" />
        <div className="absolute right-[-5%] bottom-[-5%] h-[350px] w-[350px] rounded-full bg-sky-200 blur-[50px] will-change-transform" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-50/50 blur-[80px] will-change-transform" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Side: Content */}
          <HeroContent />

          {/* Right Side: Visual Mockup */}
          <HeroVisual />
        </div>
      </div>

      {/* Subtle bottom divider/gradient */}
      <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
    </section>
  );
};

