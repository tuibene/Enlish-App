'use client';

import { useState, useEffect } from 'react';
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
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('token');
                        router.push('/login');
                        return;
                    }
                    throw new Error('Failed to fetch exams');
                }

                const data = await res.json();
                setExams(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setExams([]);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
            <div className="flex flex-col items-center gap-4 text-blue-600 dark:text-blue-400">
                <Activity className="w-12 h-12 animate-pulse" />
                <p className="font-semibold text-gray-600 dark:text-gray-300">{t.exams.loading}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 transition-colors duration-300">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl text-blue-600 dark:text-blue-400">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t.exams.mockCenter}</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">{t.exams.selectTest}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                
                {/* Premium Mock Test Card */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Official IELTS Simulations</h2>
                    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-500/30">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/20 transition-colors duration-700"></div>
                        
                        <div className="relative z-10 flex-1">
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                                Computer-Delivered Format
                            </span>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">IELTS Academic Mock Test Vol. 1</h3>
                            <p className="text-indigo-200 text-lg max-w-2xl mb-6">
                                Experience the exact look and feel of the official British Council / IDP testing software. Complete 4 skills under timed conditions.
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm font-medium text-indigo-100">
                                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm"><Clock className="w-4 h-4" /> 2 Hours 45 Mins</div>
                                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm"><BookOpen className="w-4 h-4" /> Full 4 Skills</div>
                                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm"><BrainCircuit className="w-4 h-4" /> AI AI-Graded</div>
                            </div>
                        </div>

                        <Link href="/exams/ielts-mock" className="relative z-10 shrink-0 w-full md:w-auto text-center bg-white text-indigo-900 px-8 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2 group-hover:shadow-indigo-500/25">
                            Start Simulation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Other Standard Exams */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Community Tests</h2>
                    {exams.length === 0 ? (
                        <div className="text-center bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-gray-700">
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.exams.noExams}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t.exams.checkBack}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map((exam) => (
                                <div key={exam._id} className="group flex flex-col bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-1">

                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-2.5 rounded-xl ${exam.type === 'IELTS' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                                            <BrainCircuit className="w-6 h-6" />
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${exam.type === 'IELTS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'}`}>
                                            {exam.type}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {exam.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6">
                                            {exam.description || 'No description provided for this mock examination.'}
                                        </p>
                                    </div>

                                    <div className="pt-6 mt-auto border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            <Clock className="w-4 h-4 mr-1.5" />
                                            {t.exams.stdTime}
                                        </div>
                                        <Link
                                            href={`/exams/${exam._id}`}
                                            className="inline-flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group-hover:underline"
                                        >
                                            {t.exams.startExam} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
