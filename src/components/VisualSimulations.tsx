import React from 'react';
import { motion } from 'motion/react';

// --- Visual Simulation Components ---

export const AutomationVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none overflow-hidden">
    <svg width="240" height="240" viewBox="0 0 200 200" fill="none" className="text-emerald-600">
      <motion.path
        d="M20,100 L180,100 M60,60 L140,140 M60,140 L140,60"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="will-change-transform"
      />
      <motion.circle
        cx="100"
        cy="100"
        r="30"
        stroke="currentColor"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      {[20, 60, 100, 140, 180].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={100}
          r="3"
          fill="currentColor"
          whileInView={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          viewport={{ once: false }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </svg>
  </div>
);

export const TradingVisual = () => (
  <div className="absolute inset-x-0 bottom-6 h-28 opacity-[0.12] pointer-events-none overflow-hidden">
    <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="tradingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,50 Q40,10 80,60 T160,40 T240,70 T320,30 T400,60"
        stroke="url(#tradingGradient)"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="will-change-transform"
      />
      <motion.path
        d="M0,70 Q50,40 100,80 T200,60 T300,90 T400,50"
        stroke="#14b8a6"
        strokeWidth="1"
        strokeDasharray="2 4"
        fill="none"
        whileInView={{ x: [-20, 20, -20] }}
        viewport={{ once: false }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="will-change-transform"
      />
    </svg>
  </div>
);

export const AIVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none">
    <motion.div
      className="w-40 h-40 rounded-full border border-emerald-500/30 will-change-transform"
      whileInView={{ 
        scale: [1, 1.1, 1], 
        rotate: [0, 90, 180, 270, 360],
        borderWidth: ["1px", "1.5px", "1px"] 
      }}
      viewport={{ once: false }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute w-28 h-28 rounded-full border border-teal-500/30 will-change-transform-opacity"
      whileInView={{ 
        scale: [1.15, 1, 1.15], 
        rotate: [360, 270, 180, 90, 0],
        opacity: [0.3, 0.5, 0.3]
      }}
      viewport={{ once: false }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]" />
  </div>
);

export const IoTVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
    {[1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border border-emerald-600 will-change-transform-opacity"
        style={{ width: i * 40, height: i * 40 }}
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1.5, opacity: [0, 0.6, 0] }}
        viewport={{ once: false }}
        transition={{ duration: 5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
      />
    ))}
  </div>
);

export const CommonVisual = ({ icon: Icon }: { icon: any }) => (
  <div className="absolute -right-6 -top-6 opacity-[0.04] scale-[5] rotate-12 pointer-events-none transition-transform group-hover:rotate-0 duration-700">
    <Icon size={48} />
  </div>
);
