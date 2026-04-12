import React from 'react';
import { motion } from 'motion/react';
import { Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Project } from '../types';
import { AISkeleton } from './AISkeleton';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onAiAnalysis: (project: Project) => void;
  loading: boolean;
  aiInfo?: string;
}

export const ProjectCard = ({ project, onSelect, onAiAnalysis, loading, aiInfo }: ProjectCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ y: -8, transition: { duration: 0.28, ease: 'easeOut' } }}
    onClick={() => onSelect(project)}
    className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-slate-200 bg-white transition-all duration-300 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-100"
  >
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <img
        src={project.image}
        alt={project.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-md">
          {project.category}
        </span>
        <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
          Case Study
        </span>
      </div>
    </div>

    <div className="p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-emerald-600">{project.title}</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onAiAnalysis(project);
          }}
          className="shrink-0 rounded-full border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-600 shadow-sm transition-all hover:bg-emerald-600 hover:text-white"
        >
          <span className="inline-flex items-center gap-1">
            <Bot size={10} />
            AI
          </span>
        </motion.button>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 rounded-2xl border border-emerald-100/60 bg-emerald-50/70 p-3"
        >
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <Loader2 size={12} className="animate-spin" />
            AI đang phân tích
          </div>
          <AISkeleton />
        </motion.div>
      ) : aiInfo ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900"
        >
          <div className="mb-1 flex items-center gap-1 font-bold">
            <Bot size={12} />
            AI Analysis
          </div>
          <div className="prose prose-xs prose-emerald">
            <ReactMarkdown>{aiInfo}</ReactMarkdown>
          </div>
        </motion.div>
      ) : (
        <p className="mb-5 text-sm leading-6 text-slate-600">{project.description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span key={s} className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
            {s}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);
