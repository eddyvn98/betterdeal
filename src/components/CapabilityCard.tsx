import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CapabilityProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  className?: string;
  accent?: boolean;
  visual?: React.ReactNode;
  image?: string;
}

export const CapabilityCard = ({ 
  title, 
  description, 
  icon, 
  tags, 
  className = '', 
  accent = false, 
  visual,
  image
}: CapabilityProps) => (
  <div className={`group relative overflow-hidden rounded-[32px] p-8 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 will-change-transform ${
    accent 
      ? 'bg-emerald-600 text-white shadow-emerald-200/50' 
      : 'bg-white border border-slate-200/80 text-slate-900 shadow-sm hover:border-emerald-300'
  } ${className}`}>
    
    {/* Capability Image Background */}
    {image && (
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
        />
        <div className={`absolute inset-0 ${
          accent 
            ? 'bg-gradient-to-t from-emerald-900/90 via-emerald-800/40 to-transparent' 
            : 'bg-gradient-to-t from-white via-white/80 to-transparent'
        }`} />
      </div>
    )}

    {/* Subtle Pattern Texture for Cards - Removed expensive SVG filter for CPU optimization */}
    {!accent && !image && (
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
    )}

    {/* Visual Simulation Layer (Low opacity overlay) */}
    <div className="absolute inset-0 z-0 opacity-[0.4] group-hover:opacity-100 transition-opacity duration-700">
      {!accent && visual}
    </div>
    
    {/* Gradient Highlight on Hover */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 ${
      accent 
        ? 'bg-gradient-to-br from-white/10 to-transparent' 
        : 'bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_60%)]'
    }`} />
    
    <div className="relative flex flex-col h-full z-10">
      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
        accent ? 'bg-white/20 backdrop-blur-md' : 'bg-emerald-50/80 backdrop-blur-sm text-emerald-600 shadow-inner'
      } transition-all group-hover:scale-110 group-hover:rotate-3 duration-500`}>
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
      </div>
      
      <div className="mt-auto pt-20">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-2xl font-bold font-display tracking-tight ${accent ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
          {!accent && <ArrowUpRight size={20} className="text-slate-400 group-hover:text-emerald-500 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />}
        </div>
        <p className={`mt-4 text-[15px] leading-relaxed font-medium ${accent ? 'text-emerald-50/90' : 'text-slate-600'}`}>
          {description}
        </p>
        
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
              accent 
                ? 'bg-white/15 text-white backdrop-blur-md border border-white/10' 
                : 'bg-slate-100/50 backdrop-blur-md text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 border border-slate-200/50'
            }`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);
