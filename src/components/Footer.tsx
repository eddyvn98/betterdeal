import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Github, Send, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 bg-white pb-12 pt-20 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="h-8 w-auto object-contain" 
              />
              <span className="font-display text-xl font-bold tracking-tighter text-slate-900">
                Pixel<span className="text-emerald-600">Pro</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/eddyvn98" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-900"
              >
                <Github size={18} />
                <span className="text-sm font-semibold">GitHub</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">
              {t('footer.links_title')}
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li>
                <Link to="/" className="transition-colors hover:text-emerald-600">
                  {t('header.projects')} {/* Using existing keys for consistency */}
                </Link>
              </li>
              <li>
                <Link to="/projects" className="transition-colors hover:text-emerald-600">
                  Project Showcase
                </Link>
              </li>
              <li>
                <a href="/#challenge" className="transition-colors hover:text-emerald-600">
                  {t('header.chat_ai')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900">
              {t('footer.services_title')}
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                {t('capabilities.cards.automation.title')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-sky-500" />
                {t('capabilities.cards.ai.title')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-indigo-500" />
                {t('capabilities.cards.trading.title')}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-6 border-t border-slate-100 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold text-slate-400">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
