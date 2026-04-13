import React from 'react';
import { motion } from 'motion/react';

export const AISkeleton = () => (
  <div className="flex flex-col gap-3 py-1">
    <div className="flex items-center gap-2 mb-1">
      <motion.div 
        animate={{ 
          opacity: [0.4, 0.8, 0.4] 
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="h-2 w-2 rounded-full bg-emerald-500 will-change-opacity"
      />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.2, 
              delay: i * 0.2,
              ease: "linear" 
            }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 will-change-opacity"
          />
        ))}
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/40">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent will-change-transform"
        />
      </div>
      <div className="relative h-2.5 w-4/5 overflow-hidden rounded-full bg-slate-200/40">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent will-change-transform"
        />
      </div>
      <div className="relative h-2.5 w-2/3 overflow-hidden rounded-full bg-slate-200/40">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent will-change-transform"
        />
      </div>
    </div>
  </div>
);
