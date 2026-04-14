import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { ProjectCard } from '../components/ProjectCard';
import { Project } from '../types';
import { categories } from '../data/projects';
import { cn } from '../lib/utils';

interface ProjectsPageProps {
  projects: Project[];
  filter: string;
  setFilter: (filter: string) => void;
  onAiAnalysis: (project: Project) => void;
  loadingProjects: Set<number>;
  projectAiInfo: Record<number, string>;
}

export const ProjectsPage = ({
  projects,
  filter,
  setFilter,
  onAiAnalysis,
  loadingProjects,
  projectAiInfo,
}: ProjectsPageProps) => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 font-bold text-slate-500 transition-colors hover:text-emerald-600">
            <ArrowLeft size={18} /> {t('projects.back_home')}
          </Link>
          <h1 className="font-display text-4xl font-bold text-slate-900">{t('projects.title')}</h1>
          <p className="mt-3 text-lg leading-7 text-slate-500">
            {t('projects.description')}
          </p>
        </div>

        <div className="mb-12 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'rounded-full px-5 py-2.5 text-sm font-bold transition-all md:text-base',
                filter === cat
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-slate-900',
              )}
            >
              {cat === 'All' ? t('projects.category_all') : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projects
              .filter((p) => filter === 'All' || p.category === filter)
              .map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onAiAnalysis={onAiAnalysis}
                  loading={loadingProjects.has(project.id)}
                  aiInfo={projectAiInfo[project.id]}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
