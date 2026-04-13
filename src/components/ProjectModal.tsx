import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, Loader2, Calendar, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { Project } from '../types';
import { AISkeleton } from './AISkeleton';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  loading: boolean;
  aiInfo?: string;
}

export const ProjectModal = ({ project, onClose, loading, aiInfo }: ProjectModalProps) => {
  const { t, i18n } = useTranslation();
  if (!project) return null;

  const isEn = i18n.language.startsWith('en');
  const title = (isEn && project.titleEn) ? project.titleEn : project.title;
  const longDescription = (isEn && project.longDescriptionEn) ? project.longDescriptionEn : project.longDescription;
  const category = (isEn && project.categoryEn) ? project.categoryEn : project.category;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative h-[90vh] w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-lg backdrop-blur-md transition-all hover:bg-emerald-50 hover:text-emerald-600 active:scale-90"
          >
            <X size={20} />
          </button>

          <div className="flex h-full flex-col lg:flex-row">
            {/* Left: Image & Quick Stats */}
            <div className="relative h-64 lg:h-full lg:w-1/2">
              <img
                src={project.image}
                alt={title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    <Tag size={12} />
                    {category}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur-md">
                    <ShieldCheck size={12} />
                    {project.year || '2026'}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-extrabold text-white md:text-4xl">{title}</h2>
              </div>
            </div>

            {/* Right: Content & AI */}
            <div className="flex flex-1 flex-col overflow-y-auto p-8 lg:p-12">
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                  <Sparkles size={14} />
                  {t('project_modal.overview')}
                </div>
                <p className="text-lg leading-relaxed text-slate-600">{longDescription}</p>
              </div>

              <div className="mb-8">
                <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {t('project_modal.stack')}
                </div>
                <div className="flex flex-wrap gap-3">
                  {project.stack.map((s) => (
                    <span key={s} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Section */}
              <div className="mt-auto space-y-6">
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Bot size={20} />
                      <span className="text-sm font-bold uppercase tracking-widest">Emdash AI Insight</span>
                    </div>
                  </div>

                  {loading ? (
                    <AISkeleton />
                  ) : aiInfo ? (
                    <div className="prose prose-emerald prose-sm max-w-none">
                      <ReactMarkdown>{aiInfo}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm italic text-emerald-700/60">
                      {t('project_modal.ai_hint')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
