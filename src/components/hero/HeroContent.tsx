import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const HeroContent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center">
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-emerald-600"
      >
        {t('hero.badge')}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mb-6 font-display text-4xl font-extrabold leading-[1.1] text-slate-900 md:text-6xl lg:text-7xl"
      >
        {t('hero.title_main')}
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
          {t('hero.title_span')}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-10 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl"
      >
        {t('hero.description')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex flex-wrap gap-4"
      >
        <a 
          href="#work" 
          className="group relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 md:px-8 md:py-4"
        >
          <span className="relative z-10">{t('hero.view_projects')}</span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-transform duration-300 group-hover:translate-x-0" />
        </a>
        <a 
          href="#challenge" 
          className="rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-800 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 active:scale-95 md:px-8 md:py-4"
        >
          {t('hero.chat_now')}
        </a>
      </motion.div>
    </div>
  );
};
