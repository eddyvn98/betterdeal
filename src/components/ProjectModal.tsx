import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Star, CheckCircle2, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Project } from '../types';
import { AISkeleton } from './AISkeleton';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  loading: boolean;
  aiInfo?: string;
}

export const ProjectModal = ({ project, onClose, loading, aiInfo }: ProjectModalProps) => (
  <AnimatePresence>
    {project && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl md:flex-row"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/85 p-2 text-slate-500 shadow-md backdrop-blur-md transition-colors hover:text-slate-900"
          >
            <X size={20} />
          </button>

          <div className="relative h-72 w-full md:h-auto md:w-[48%]">
            <img src={project.image} alt={project.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em]">
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 backdrop-blur-md">{project.category}</span>
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 backdrop-blur-md">Showcase</span>
              </div>
              <h2 className="text-3xl font-bold">{project.title}</h2>
            </div>
          </div>

          <div className="w-full overflow-y-auto p-8 md:w-[52%]">
            <div className="mb-8 flex items-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-emerald-600" />
                <span>{project.year ?? '2026'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-emerald-600" />
                <span>{project.stars} Stars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Case study</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Tóm tắt</h3>
                <p className="leading-7 text-slate-600">{project.longDescription}</p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-900">Năng lực thể hiện</h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <span key={s} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <Loader2 size={18} className="animate-spin" />
                    AI đang phân tích stack...
                  </div>
                  <AISkeleton />
                </div>
              ) : aiInfo ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-900">
                    <Bot size={18} />
                    AI Stack Recommendation
                  </div>
                  <div className="prose prose-sm prose-emerald">
                    <ReactMarkdown>{aiInfo}</ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
