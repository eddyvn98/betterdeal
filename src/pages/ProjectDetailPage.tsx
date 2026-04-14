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
  ExternalLink,
  Terminal,
  Cpu,
  Workflow,
  Code2
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

      // Dynamic SEO Updates
      const projectTitle = `${(isEn && foundProject.titleEn) ? foundProject.titleEn : foundProject.title} | Portfolio - PixelPro`;
      const projectDesc = (isEn && foundProject.descriptionEn) ? foundProject.descriptionEn : foundProject.description;
      
      document.title = projectTitle;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', projectDesc);
      
      // Update OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', projectTitle);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', projectDesc);

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', foundProject.image);

      // Inject Project JSON-LD
      const schemaId = 'project-schema-ld';
      let script = document.getElementById(schemaId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = schemaId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const projectSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": foundProject.title,
        "description": foundProject.description,
        "applicationCategory": foundProject.category,
        "operatingSystem": "Web",
        "author": {
          "@type": "Person",
          "name": "PixelPro"
        },
        "image": `https://PixelPro.vivutrade.io.vn${foundProject.image}`,
        "url": `https://PixelPro.vivutrade.io.vn/projects/${foundProject.slug}`
      };
      
      script.text = JSON.stringify(projectSchema);

    } else {
      navigate('/projects');
    }

    // Cleanup to revert to default if needed (optional but good practice)
    return () => {
      const script = document.getElementById('project-schema-ld');
      if (script) script.remove();
    };
  }, [slug, navigate, isEn]);

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

            <div className="lg:col-span-2 grid grid-cols-1 gap-8">
              <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-900 mb-2">{project.year || '2026'}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isEn ? 'Completed' : 'Hoàn thành'}</div>
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

          {project.deepDive && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-32 pt-32 border-t border-slate-100"
            >
              <div className="flex flex-col items-center text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-slate-100 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  <Terminal size={12} />
                  Engineering Logs
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                  {isEn ? 'Technical Deep-dive' : 'Phân tích kỹ thuật chuyên sâu'}
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  {isEn 
                    ? "A detailed look under the hood at the architecture, engineering challenges, and optimization strategies." 
                    : "Cái nhìn chi tiết về kiến trúc, các thách thức kỹ thuật và chiến lược tối ưu hóa hệ thống."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Architecture */}
                <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform">
                    <Workflow size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{isEn ? 'System Architecture' : 'Kiến trúc hệ thống'}</h3>
                  <div className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium leading-relaxed">
                    <ReactMarkdown>{isEn ? project.deepDive.architectureEn || '' : project.deepDive.architecture || ''}</ReactMarkdown>
                  </div>
                </div>

                {/* Core Challenges */}
                <div className="p-10 rounded-[40px] bg-slate-900 text-white border border-slate-800 hover:border-red-500/30 transition-colors group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 mb-8 group-hover:scale-110 transition-transform">
                    <Cpu size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{isEn ? 'Engineering Challenges' : 'Thách thức kỹ thuật'}</h3>
                  <div className="prose prose-invert prose-lg max-w-none text-slate-300 font-medium leading-relaxed">
                    <ReactMarkdown>{isEn ? project.deepDive.coreChallengesEn || '' : project.deepDive.coreChallenges || ''}</ReactMarkdown>
                  </div>
                </div>

                {/* Optimization - Full Width */}
                <div className="md:col-span-2 p-10 rounded-[40px] bg-emerald-600 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-100 group-hover:scale-110 transition-transform">
                        <Zap size={28} />
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-emerald-100 border border-white/10">
                        Performance Focus
                      </div>
                    </div>
                    <h3 className="text-3xl font-black mb-6">{isEn ? 'The 0.1ms Optimization' : 'Tối ưu hóa hiệu năng cực hạn'}</h3>
                    <div className="prose prose-invert prose-xl max-w-none text-emerald-50 leading-relaxed">
                      <ReactMarkdown>{isEn ? project.deepDive.optimizationEn || '' : project.deepDive.optimization || ''}</ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Decor */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                  <Code2 size={300} className="absolute bottom-[-100px] right-[-50px] opacity-10 rotate-12 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          )}

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
