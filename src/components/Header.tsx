import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const Header = () => (
  <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
      <Link to="/" className="group flex cursor-pointer items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-green-400 text-xl font-bold text-white shadow-lg shadow-emerald-200 transition-transform group-hover:rotate-12">
          P
        </div>
        <span className="font-display text-xl font-bold tracking-tighter">
          PIXEL<span className="text-emerald-600">PRO</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
        <Link to="/projects" className="font-semibold transition-colors hover:text-emerald-600">
          Dự án
        </Link>
        <a
          href="/#challenge"
          className="rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-1 font-bold text-emerald-600 transition-colors hover:text-emerald-700"
        >
          Chat với AI
        </a>
      </nav>

      <div className="flex items-center gap-4">
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/#challenge"
          className="hidden rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 sm:block"
        >
          Báo giá nhanh
        </motion.a>
      </div>
    </div>
  </header>
);
