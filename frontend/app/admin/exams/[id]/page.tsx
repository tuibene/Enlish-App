'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { ArrowLeft, CheckCircle2, FileText, BrainCircuit, Activity } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../../../../hooks/useTranslation';

interface Question {
    _id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
    points: number;
}

interface Exam {
    _id: string;
    title: string;
    type: string;
    description: string;
    questions: Question[];
}

export default function AdminViewExam() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { t } = useTranslation();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/dashboard');
            return;
        }

        const fetchExamDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setExam(data);
                } else {
                    console.error('Failed to fetch exam');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'ADMIN') {
            fetchExamDetails();
        }
    }, [id, user, authLoading, router]);

    if (authLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
            <div className="flex flex-col items-center gap-4 text-indigo-600 dark:text-indigo-400">
                <Activity className="w-12 h-12 animate-pulse" />
                <p className="font-semibold text-gray-600 dark:text-gray-300">{t.dashboard.loading || 'Loading...'}</p>
            </div>
        </div>
    );

    if (!exam) return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 p-8 flex flex-col items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center max-w-md w-full">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.admin.examNotFound}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t.admin.examDeleted}</p>
                <Link href="/admin" className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t.admin.backToPanel}
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 transition-colors duration-300 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        {t.admin.backToDash}
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg ${exam.type === 'IELTS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                    <BrainCircuit className="w-3.5 h-3.5 mr-1" />
                                    {exam.type}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                    {exam.questions.length} {t.admin.questions}
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{exam.title}</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{exam.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    {t.admin.previewing}
                </h2>

                {exam.questions.map((q, index) => (
                    <div key={q._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                                <span className="text-blue-600 dark:text-blue-400 mr-2">Q{index + 1}.</span>
                                {q.text}
                            </h3>
                            <span className="shrink-0 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-md ml-4">
                                {q.points} {q.points > 1 ? t.takeExam.pts : t.takeExam.pt}
                            </span>
                        </div>

                        <div className="space-y-3 mt-6">
                            {q.options.map((option, optIdx) => {
                                const isCorrect = q.correctAnswerIndex === optIdx;
                                return (
                                    <div
                                        key={optIdx}
                                        className={`flex items-center p-4 rounded-xl border-2 transition-colors ${isCorrect
                                            ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500'
                                            : 'bg-gray-50/50 border-transparent dark:bg-gray-800/50'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 mr-3 text-sm font-semibold ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                            {String.fromCharCode(65 + optIdx)}
                                        </div>
                                        <span className={`flex-1 ${isCorrect ? 'text-green-900 font-medium dark:text-green-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {option}
                                        </span>
                                        {isCorrect && (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-2 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
