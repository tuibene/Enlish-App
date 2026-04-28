'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { LayoutDashboard, FileText, ShieldAlert, LogOut, Sun, Moon, Globe, BookOpen, Headphones, Brain, Map } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Navbar() {
    const { user, logout, updatePreferences } = useAuth();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                                E
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                                EngPrep
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/exams" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                            <FileText className="w-4 h-4" />
                            {t.navbar.mockExams}
                        </Link>
                        <Link href="/materials" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                            <BookOpen className="w-4 h-4" />
                            {t.navbar.materials}
                        </Link>
                        <Link href="/practice" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors">
                            <Headphones className="w-4 h-4" />
                            {t.navbar.practice}
                        </Link>
                        <Link href="/placement-test" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors">
                            <Brain className="w-4 h-4" />
                            {t.navbar.assessment}
                        </Link>
                        <Link href="/courses" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 transition-colors">
                            <Map className="w-4 h-4" />
                            {t.navbar.roadmaps}
                        </Link>

                        {user ? (
                            <>
                                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                                    <LayoutDashboard className="w-4 h-4" />
                                    {t.navbar.dashboard}
                                </Link>
                                {(user.role === 'ADMIN' || user.role === 'ROOT') && (
                                    <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 transition-colors">
                                        <ShieldAlert className="w-4 h-4" />
                                        {t.navbar.adminPanel}
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mr-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                                        <button
                                            onClick={() => updatePreferences(user.theme === 'dark' ? 'light' : 'dark', user.language || 'en')}
                                            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm flex items-center justify-center transition-colors"
                                            title="Toggle Theme"
                                        >
                                            {user.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        </button>
                                        <span className="text-gray-300 dark:text-gray-600 text-xs">|</span>
                                        <button
                                            onClick={() => updatePreferences(user.theme || 'light', user.language === 'vi' ? 'en' : 'vi')}
                                            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                            title="Toggle Language"
                                        >
                                            <Globe className="w-3.5 h-3.5" />
                                            <span className={user.language !== 'vi' ? 'text-blue-600 dark:text-blue-400' : ''}>EN</span>
                                            <span className="opacity-50">/</span>
                                            <span className={user.language === 'vi' ? 'text-blue-600 dark:text-blue-400' : ''}>VN</span>
                                        </button>
                                    </div>
                                    <Link href="/profile" className="flex items-center gap-2 group">
                                        {user.avatar ? (
                                            <img src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-colors" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors hidden sm:block">
                                            {t.navbar.hi}, {user.name.split(' ')[0]}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        {t.navbar.logout}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                                    {t.navbar.logIn}
                                </Link>
                                <Link href="/login?tab=register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    {t.navbar.signUp}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/exams" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            {t.navbar.mockExams}
                        </Link>
                        <Link href="/materials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            {t.navbar.materials}
                        </Link>
                        <Link href="/practice" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            {t.navbar.practice}
                        </Link>
                        <Link href="/placement-test" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            {t.navbar.assessment}
                        </Link>
                        <Link href="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-gray-800">
                            {t.navbar.roadmaps}
                        </Link>
                        {user ? (
                            <>
                                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                                    My Profile
                                </Link>
                                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                                    {t.navbar.dashboard}
                                </Link>
                                {(user.role === 'ADMIN' || user.role === 'ROOT') && (
                                    <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-800">
                                        {t.navbar.adminPanel}
                                    </Link>
                                )}
                                <div className="px-3 pt-2 pb-2">
                                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.navbar.preferences}</span>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => updatePreferences(user.theme === 'dark' ? 'light' : 'dark', user.language || 'en')}
                                                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                            >
                                                {user.theme === 'dark' ? <Sun className="w-5 h-5 mx-auto" /> : <Moon className="w-5 h-5 mx-auto" />}
                                            </button>
                                            <button
                                                onClick={() => updatePreferences(user.theme || 'light', user.language === 'vi' ? 'en' : 'vi')}
                                                className="text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex gap-1 items-center"
                                            >
                                                <Globe className="w-4 h-4 mr-1" />
                                                <span className={user.language !== 'vi' ? 'text-blue-600 dark:text-blue-400' : ''}>EN</span>
                                                <span className="opacity-50">/</span>
                                                <span className={user.language === 'vi' ? 'text-blue-600 dark:text-blue-400' : ''}>VN</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                                    {t.navbar.logout} ({user.name})
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
                                    {t.navbar.logIn}
                                </Link>
                                <Link href="/login?tab=register" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800">
                                    {t.navbar.signUp}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
