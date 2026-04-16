'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { calculatePreparationTime } from '../../utils/scoreCalculation';
import { useTranslation } from '../../hooks/useTranslation';
import { Brain, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const [cefrLevel, setCefrLevel] = useState('B1');
    const [targetScore, setTargetScore] = useState(6.5);
    const [studyHours, setStudyHours] = useState(10);

    const [projection, setProjection] = useState({ estimatedWeeks: 0, bandImprovement: 0 });

    // Debounced input processing
    useEffect(() => {
        if (user && user.cefrLevel && cefrLevel === 'B1' && targetScore === 6.5) {
            setCefrLevel(user.cefrLevel);
            setTargetScore(user.targetScore || 6.5);
            setStudyHours(user.studyHoursPerWeek || 10);
        }
    }, [user]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const res = calculatePreparationTime(cefrLevel, targetScore, studyHours);
            setProjection(res);
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [cefrLevel, targetScore, studyHours]);

    if (loading) return <div className="p-8 text-center">{t.dashboard.loading}</div>;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <h1 className="text-2xl font-bold dark:text-white">{t.dashboard.pleaseLogin}</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="bg-white/80 dark:bg-[#0B1120]/80 shadow rounded-xl p-6 relative overflow-hidden">
                    <div className="relative z-10 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t.dashboard.welcomeBack}, {user.name}!</h1>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center sm:justify-start gap-2">
                            <span>
                                {t.dashboard.currLevelRole}: <span className="font-bold text-indigo-600 dark:text-indigo-400">{cefrLevel} {user.hasTakenPlacementTest && '(AI Graded)'}</span>
                            </span>
                            {user.hasTakenPlacementTest && (
                                <button onClick={() => router.push('/placement-test')} className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-semibold">
                                    Retake Default Test
                                </button>
                            )}
                            <span> • {t.dashboard.role}: {user.role}</span>
                        </p>
                    </div>
                </header>

                {!user.hasTakenPlacementTest && user.role !== 'ADMIN' && (
                    <div className="bg-gradient-to-r from-indigo-500 rounded-2xl to-purple-600 p-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between border border-indigo-400/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/10">
                            <Brain className="w-48 h-48" />
                        </div>
                        <div className="relative z-10 max-w-2xl mb-6 md:mb-0">
                            <h2 className="text-2xl font-bold mb-2 flex items-center"><Brain className="w-6 h-6 mr-3" /> Not sure where to start?</h2>
                            <p className="text-indigo-100 text-lg">Take our comprehensive 4-Skills AI Assessment to evaluate your exact English level (A1-C2). We'll map you a personalized learning path!</p>
                        </div>
                        <button
                            onClick={() => router.push('/placement-test')}
                            className="relative z-10 w-full md:w-auto bg-white text-indigo-600 hover:bg-gray-50 focus:ring-4 focus:ring-indigo-300 font-bold rounded-xl text-lg px-8 py-4 text-center inline-flex items-center justify-center transition-all shadow shadow-indigo-700/50"
                        >
                            Take the Test <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                )}

                <section className="bg-white/80 dark:bg-[#0B1120]/80 shadow rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{t.dashboard.projSettings}</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.dashboard.currCefr}</label>
                            <select
                                value={cefrLevel}
                                onChange={(e) => setCefrLevel(e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm p-3 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="A1">A1 (Beginner)</option>
                                <option value="A2">A2 (Elementary)</option>
                                <option value="B1">B1 (Intermediate)</option>
                                <option value="B2">B2 (Upper Intermediate)</option>
                                <option value="C1">C1 (Advanced)</option>
                                <option value="C2">C2 (Proficient)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.dashboard.tgtIelts}</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0" max="9"
                                value={targetScore}
                                onChange={(e) => setTargetScore(parseFloat(e.target.value) || 0)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm p-3 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.dashboard.studyHours}: {studyHours}h</label>
                            <input
                                type="range"
                                min="1" max="40"
                                value={studyHours}
                                onChange={(e) => setStudyHours(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4 shadow-inner">
                        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">{t.dashboard.yourProj}</h2>

                        {projection.bandImprovement <= 0 ? (
                            <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
                                {t.dashboard.reachedTarget}
                            </p>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">{t.dashboard.estBandImp}</p>
                                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400">+{projection.bandImprovement.toFixed(1)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">{t.dashboard.estPrepTime}</p>
                                    <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{projection.estimatedWeeks} <span className="text-xl font-medium">{t.dashboard.weeks}</span></p>
                                </div>
                            </>
                        )}

                        <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-4 leading-relaxed">
                            {t.dashboard.disclaimer}
                        </p>
                    </div>

                </section>
            </div>
        </div>
    );
}
