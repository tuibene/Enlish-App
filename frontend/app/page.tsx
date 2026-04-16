'use client';

import Link from 'next/link';
import { BookOpen, GraduationCap, Target, TrendingUp, Presentation, Languages, Trophy, Users, MonitorPlay } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 transition-colors duration-300">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32 lg:pb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-8 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
          <span className="text-sm font-semibold tracking-wide uppercase">{t.home.heroTag}</span>
        </div>

        <h1 className="mx-auto max-w-4xl font-display text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl animate-fade-in-up animation-delay-150">
          {t.home.heroTitle1}{' '}
          <span className="relative whitespace-nowrap text-blue-600 dark:text-blue-400">
            <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/50 dark:fill-blue-800/50" preserveAspectRatio="none"><path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z"></path></svg>
            <span className="relative">{t.home.heroTitle2}</span>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700 dark:text-slate-300 sm:text-xl animate-fade-in-up animation-delay-300">
          {t.home.heroDesc}
        </p>

        <div className="mt-10 flex justify-center gap-x-6 animate-fade-in-up animation-delay-500">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center rounded-full py-3 px-8 text-sm font-semibold text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600 transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1"
          >
            {t.home.goDashboard} <TrendingUp className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/exams"
            className="group inline-flex ring-1 ring-slate-200 dark:ring-slate-700 items-center justify-center rounded-full py-3 px-8 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-all hover:ring-slate-300 dark:hover:ring-slate-600 shadow-sm"
          >
            {t.home.browseExams} <BookOpen className="ml-2 w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Feature 1 */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/20 dark:border-gray-700/50 hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">{t.home.feature1Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {t.home.feature1Desc}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/20 dark:border-gray-700/50 hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">{t.home.feature2Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {t.home.feature2Desc}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/20 dark:border-gray-700/50 hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <Presentation className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">{t.home.feature3Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {t.home.feature3Desc}
            </p>
          </div>

        </div>
      </div>

      {/* Decorative Bottom Section */}
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <Languages className="w-6 h-6" />
              <span className="font-medium">{t.home.footerMastering}</span>
            </div>
            <div className="flex gap-12 text-slate-400 dark:text-slate-500">
              <div className="flex flex-col items-center">
                <Trophy className="w-8 h-8 mb-2 text-yellow-500/80" />
                <span className="text-xs font-semibold">{t.home.footerIeltsToeic}</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 mb-2 text-blue-500/80" />
                <span className="text-xs font-semibold">{t.home.footerCommunity}</span>
              </div>
              <div className="flex flex-col items-center">
                <MonitorPlay className="w-8 h-8 mb-2 text-emerald-500/80" />
                <span className="text-xs font-semibold">{t.home.footerInteractive}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
