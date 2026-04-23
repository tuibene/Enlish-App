'use client';

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, BrainCircuit, ArrowRight, Activity, Trophy } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface Exam {
    _id: string;
    title: string;
    type: string;
    description: string;
}

export default function ExamList() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [officialMocks, setOfficialMocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const router = useRouter();
    const { user, token, loading: authLoading } = useContext(AuthContext) || {};

    useEffect(() => {
        if (authLoading) return;

        const fetchExams = async () => {
            try {
                if (!token) {
                    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                    return;
                }
                const [res, offRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/official-mocks`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (!res.ok || !offRes.ok) {
                    if (res.status === 401 || offRes.status === 401) {
                        localStorage.removeItem('token');
                        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                        return;
                    }
                    throw new Error('Failed to fetch exams');
                }

                const data = await res.json();
                const offData = await offRes.json();
                setExams(Array.isArray(data) ? data : []);
                setOfficialMocks(Array.isArray(offData) ? offData : []);
            } catch (err) {
                console.error(err);
                setExams([]);
                setOfficialMocks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    if (loading || authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
            <div className="flex flex-col items-center gap-4 text-blue-600 dark:text-blue-400">
                <Activity className="w-12 h-12 animate-pulse" />
                <p className="font-semibold text-gray-600 dark:text-gray-300">{authLoading ? 'Signing in...' : t.exams.loading}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 pb-12">
            {/* Header Section */}
            <div className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 hidden sm:block">
                                <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{t.exams.mockCenter}</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">{t.exams.selectTest}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 relative z-10 space-y-8">

                {/* Premium Mock Test Card */}
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 flex items-center">
                        <Trophy className="w-5 h-5 mr-3 text-amber-500" /> Official IELTS Simulations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {officialMocks.map((mock) => (
                            <div key={mock._id} className="bg-blue-600 rounded-[2rem] p-6 lg:p-8 shadow-lg flex flex-col justify-between border border-blue-700 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/20 transition-all h-full">
                                <div className="absolute -top-10 -right-10 p-8 opacity-10 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
                                    <BrainCircuit className="w-48 h-48" />
                                </div>

                                <div className="relative z-10 w-full text-left flex-1 mb-8">
                                    <div className="inline-block bg-blue-500/30 text-blue-100 border border-blue-400/30 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                                        Computer-Delivered
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-3 leading-tight">{mock.title}</h3>
                                    <p className="text-blue-100 text-sm mb-6 leading-relaxed line-clamp-2">
                                        {mock.description || 'Experience the exact CBT software format with real 4-skills mock testing and AI grading.'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 text-[11px] font-bold text-white">
                                        <div className="flex items-center gap-1.5 bg-black/20 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm"><Clock className="w-3.5 h-3.5" /> 2h 45m</div>
                                        <div className="flex items-center gap-1.5 bg-black/20 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm"><BookOpen className="w-3.5 h-3.5" /> 4 Skills</div>
                                    </div>
                                </div>

                                <Link href={`/exams/ielts-mock/${mock._id}`} className="relative z-10 w-full text-center bg-white hover:bg-gray-50 text-blue-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2">
                                    Start Simulation <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Standard Exams */}
                <div className="pt-4">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 flex items-center">
                        <Activity className="w-5 h-5 mr-3 text-emerald-500" /> Community Tests
                    </h2>
                    {exams.length === 0 ? (
                        <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-10 border border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.exams.noExams}</h3>
                            <p className="max-w-sm mx-auto text-sm">{t.exams.checkBack}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map((exam) => (
                                <div key={exam._id} className="group flex flex-col bg-white dark:bg-[#0f172a] rounded-[1.5rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-300">

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                            <BrainCircuit className="w-6 h-6" />
                                        </div>
                                        <span className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                            {exam.type}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {exam.title}
                                        </h2>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-3 mb-6">
                                            {exam.description || 'No description provided for this mock examination.'}
                                        </p>
                                    </div>

                                    <div className="pt-5 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-semibold gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {t.exams.stdTime}
                                        </div>
                                        <Link
                                            href={`/exams/${exam._id}`}
                                            className="inline-flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group-hover:underline"
                                        >
                                            {t.exams.startExam} <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
