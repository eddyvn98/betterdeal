import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bot,
  Sparkles,
  Target,
  Zap,
  CheckCircle2,
  Globe,
  Github,
  Calendar,
  Layers,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { projects } from '../data/projects';
import { Project } from '../types';
import { AISkeleton } from '../components/AISkeleton';

export const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const isEn = i18n.language.startsWith('en');

  useEffect(() => {
    const foundProject = projects.find((p) => p.slug === slug);
    if (foundProject) {
      setProject(foundProject);
      window.scrollTo(0, 0);
    } else {
      navigate('/projects');
    }
  }, [slug, navigate]);

  if (!project) return null;

  const title = (isEn && project.titleEn) ? project.titleEn : project.title;
  const longDescription = (isEn && project.longDescriptionEn) ? project.longDescriptionEn : project.longDescription;
  const category = (isEn && project.categoryEn) ? project.categoryEn : project.category;

  const challenge = (isEn && project.challengeEn) ? project.challengeEn : project.challenge;
  const solution = (isEn && project.solutionEn) ? project.solutionEn : project.solution;
  const results = (isEn && project.resultsEn) ? project.resultsEn : project.results;

  return (
    <div className="min-h-screen bg-white pb-20 pt-24 selection:bg-emerald-500/20">
      {/* Navigation */}
      <div className="container mx-auto px-4 mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          {isEn ? 'BACK TO PROJECTS' : 'QUAY LẠI DỰ ÁN'}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest border border-emerald-100">
                {category}
              </span>
              <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest border border-slate-100">
                <Calendar size={12} />
                {project.year || '2026'}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-8 leading-[1.1]">
              {title}
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
              {longDescription}
            </p>

            <div className="flex flex-wrap gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
                >
                  <Globe size={18} />
                  {isEn ? 'Live Demo' : 'Xem Trực Tiếp'}
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold hover:border-emerald-600 hover:text-emerald-600 transition-all"
                >
                  <Github size={18} />
                  {isEn ? 'Source Code' : 'Mã Nguồn'}
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[16/10] rounded-[40px] overflow-hidden shadow-2xl border-8 border-slate-50/50">
              <img
                src={project.image}
                alt={title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decor */}
            <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats & Tech Stack */}
      <section className="bg-slate-50 py-20 mb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-6">
                <Layers size={14} />
                {isEn ? 'Technologies' : 'Công nghệ sử dụng'}
              </div>
              <div className="flex flex-wrap gap-3">
                {project.stack.map((s) => (
                  <span key={s} className="px-5 py-3 bg-white rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-900 mb-2">2026</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isEn ? 'Completed' : 'Hoàn thành'}</div>
              </div>
              <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-900 mb-2">{project.stars || '0'}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isEn ? 'Efficiency Score' : 'Điểm hiệu quả'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Case Study */}
      <section className="container mx-auto px-4 mb-32">
        <div className="max-w-4xl mx-auto space-y-24">
          {challenge && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 text-red-500 mb-6">
                <Target size={28} />
                <h2 className="text-3xl font-bold">{isEn ? 'The Challenge' : 'Bài toán & Thách thức'}</h2>
              </div>
              <p className="text-xl text-slate-600 leading-relaxed border-l-4 border-red-100 pl-8 py-2">
                {challenge}
              </p>
            </motion.div>
          )}

          {solution && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 text-blue-500 mb-6">
                <Zap size={28} />
                <h2 className="text-3xl font-bold">{isEn ? 'The Solution' : 'Giải pháp kỹ thuật'}</h2>
              </div>
              <p className="text-xl text-slate-600 leading-relaxed border-l-4 border-blue-100 pl-8 py-2">
                {solution}
              </p>
            </motion.div>
          )}

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 text-emerald-500 mb-6">
                <CheckCircle2 size={28} />
                <h2 className="text-3xl font-bold">{isEn ? 'The Results' : 'Kết quả thực thi'}</h2>
              </div>
              <p className="text-xl text-slate-600 leading-relaxed border-l-4 border-emerald-100 pl-8 py-2">
                {results}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Emdash AI Insight Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="max-w-5xl mx-auto p-12 rounded-[48px] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden shadow-3xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Emdash AI Agent</div>
                <div className="text-xl font-bold leading-tight">{t('project_modal.ai_hint_role')}</div>
              </div>
            </div>

            <div className="text-xl text-emerald-50/90 leading-relaxed font-medium max-w-3xl mb-4">
              <ReactMarkdown>
                {t('project_modal.ai_hint_long', { title })}
              </ReactMarkdown>
            </div>

            <p className="text-xs text-emerald-500/50 italic mb-8">
              {isEn
                ? "* This analysis is automatically generated by PixelPro's internal AI agent based on project metadata."
                : "* Phân tích này được tạo tự động bởi AI Agent của PixelPro dựa trên dữ liệu đặc tả của dự án."}
            </p>

            <div className="mt-12 flex items-center gap-4">
              <button className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-colors">
                {isEn ? 'Hire for similar project' : 'Tư vấn dự án tương tự'}
              </button>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Bot size={400} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-8">
          {isEn ? 'Ready to build your next big idea?' : 'Sẵn sàng triển khai ý tưởng của bạn?'}
        </h2>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200"
          >
            {isEn ? "Talk to PixelPro" : "Trao đổi với PixelPro"}
            <ArrowLeft className="rotate-180" size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
