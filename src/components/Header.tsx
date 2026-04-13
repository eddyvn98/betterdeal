import { Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('vi') ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  const isVi = i18n.language.startsWith('vi');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex cursor-pointer items-center gap-3">
          <img
            src="/images/logo.png"
            alt="PixelPro Better Deal"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-display text-2xl font-bold tracking-tighter">
            Pixel<span className="text-emerald-600">Pro</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          <Link to="/projects" className="font-semibold transition-colors hover:text-emerald-600">
            {t('header.projects')}
          </Link>
          <a
            href="/#challenge"
            className="rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-1 font-bold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            {t('header.chat_ai')}
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{isVi ? 'EN' : 'VI'}</span>
          </button>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/#challenge"
            className="hidden rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 sm:block"
          >
            {t('header.quick_quote')}
          </motion.a>
        </div>
      </div>
    </header>
  );
};
