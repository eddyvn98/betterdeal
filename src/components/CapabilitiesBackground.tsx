import React from 'react';
import { motion } from 'motion/react';

export const CapabilitiesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 1. Base Dot Grid (Existing, but slightly refined) */}
      <div 
        className="absolute inset-0 opacity-[0.25]" 
        style={{ 
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* 2. Large Decorative Glow Orbs */}
      <motion.div 
        className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-emerald-100/30 blur-[60px] rounded-full will-change-transform-opacity"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[0%] -right-[5%] w-[35%] h-[35%] bg-teal-100/20 blur-[50px] rounded-full will-change-transform-opacity"
        animate={{ 
          scale: [1.05, 1, 1.05],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* 3. Corner Technical Motifs (Circuit lines) */}
      <svg className="absolute top-0 right-0 w-64 h-64 text-emerald-500/10 will-change-transform" viewBox="0 0 100 100">
        <motion.path 
          d="M100,20 L80,20 L80,0 M100,40 L60,40 L60,20 M100,60 L40,60 L40,40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <circle cx="80" cy="20" r="1.5" fill="currentColor" fillOpacity="0.5" />
        <circle cx="60" cy="40" r="1.5" fill="currentColor" fillOpacity="0.5" />
        <circle cx="40" cy="60" r="1.5" fill="currentColor" fillOpacity="0.5" />
      </svg>

      <svg className="absolute bottom-0 left-0 w-64 h-64 text-teal-500/10 -rotate-180 will-change-transform" viewBox="0 0 100 100">
        <motion.path 
          d="M100,20 L80,20 L80,0 M100,40 L60,40 L60,20 M100,60 L40,60 L40,40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        />
      </svg>

      {/* 4. Fine Diagonal Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: 'repeating-linear-gradient(45deg, #10b981 0, #10b981 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }}
      />
    </div>
  );
};
