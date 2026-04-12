import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { Project } from '../types';

interface FeaturedProjectsProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onAiAnalysis: (project: Project) => void;
  loadingProjects: Set<number>;
  projectAiInfo: Record<number, string>;
}

export const FeaturedProjects = ({ projects, onSelect, onAiAnalysis, loadingProjects, projectAiInfo }: FeaturedProjectsProps) => (
  <section id="work" className="scroll-mt-24 border-t border-slate-200 bg-white/60 px-6 py-24">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-slate-900">Selected case studies</h2>
          <p className="mt-2 text-slate-500">
            Các dự án bên dưới được trình bày như project showcase để làm rõ cách tôi xử lý sản phẩm, giao diện và automation.
          </p>
        </div>
        <Link to="/projects" className="hidden items-center gap-2 font-bold text-emerald-600 transition-all hover:gap-3 md:flex">
          Xem toàn bộ <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects
          .filter((project) => project.featured)
          .slice(0, 5)
          .map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelect}
              onAiAnalysis={onAiAnalysis}
              loading={loadingProjects.has(project.id)}
              aiInfo={projectAiInfo[project.id]}
            />
          ))}

        <Link
          to="/projects"
          className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] bg-slate-900 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.45),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.22),_transparent_32%)]" />
          <div className="relative">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition-transform group-hover:translate-x-1">
              <ArrowRight size={24} />
            </div>
            <h3 className="mb-2 text-2xl font-bold">More work</h3>
            <p className="max-w-xs text-sm leading-6 text-slate-300">
              Xem thêm các case study được sắp xếp theo nhóm năng lực để portfolio nhìn gọn và thuyết phục hơn.
            </p>
          </div>
        </Link>
      </div>
    </div>
  </section>
);
