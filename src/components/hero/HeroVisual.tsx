import React from 'react';
import { motion } from 'motion/react';
import { HeroFeatureCards } from './HeroFeatureCards';

export const HeroVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      {/* Decorative background blur */}
      <div className="absolute -inset-4 z-0 bg-gradient-to-tr from-emerald-100/40 to-sky-100/40 blur-2xl rounded-[40px]" />
      
      <div className="relative z-10 overflow-hidden rounded-[40px] border border-white/50 bg-white/40 p-3 shadow-2xl backdrop-blur-sm lg:p-5">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-100 shadow-inner">
          <img
            src="/mockups/ai-pricing-deal.png"
            alt="AI Pricing Deal Optimization"
            className="h-auto w-full transition-transform duration-700 hover:scale-105"
          />
          
          {/* Subtle overlay to soften the image if needed */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
        </div>

        {/* Feature Cards Integration */}
        <HeroFeatureCards />
      </div>

      {/* Floating UI Elements for flair */}
      <motion.div
        whileInView={{ y: [0, -10, 0] }}
        viewport={{ once: false }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-6 top-1/4 z-20 hidden rounded-2xl border border-white/80 bg-white/60 p-4 shadow-xl backdrop-blur-md md:block will-change-transform"
      >
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 opacity-75" />
          <span className="text-xs font-bold text-slate-700">Đang tính toán báo giá...</span>
        </div>
      </motion.div>

      <motion.div
        whileInView={{ y: [0, 10, 0] }}
        viewport={{ once: false }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-8 bottom-1/3 z-20 hidden rounded-2xl border border-white/80 bg-white/60 p-4 shadow-xl backdrop-blur-md md:block will-change-transform"
      >
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-sky-500" />
          <span className="text-xs font-bold text-slate-700">Ưu đãi -10% cho dự án đầu tiên!</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
