'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileText, BrainCircuit, Activity, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../../../hooks/useTranslation';

interface Question {
    _id: string;
    questionType: string;
    text: string;
    options?: string[];
    points: number;
}

interface Exam {
    _id: string;
    title: string;
    type: string;
    questions: Question[];
}

export default function TakeExam() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setExam(data);
                    // Standard IELTS/TOEIC simulation time based on question count or hardcoded
                    // For demo, let's set 60 minutes (3600 seconds)
                    setTimeLeft(3600);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [id]);

    const handleSubmit = useCallback(async (isAutoSubmit = false) => {
        if (!exam) return;

        // Check if all questions are answered manually
        let isComplete = true;
        for (const q of exam.questions) {
            if (q.questionType === 'WRITING') {
                if (!textAnswers[q._id] || textAnswers[q._id].trim() === '') isComplete = false;
            } else {
                if (answers[q._id] === undefined) isComplete = false;
            }
        }

        if (!isAutoSubmit && !isComplete) {
            if (!confirm('You have unanswered questions. Are you sure you want to finish early?')) {
                return;
            }
        }

        setSubmitting(true);
        try {
            const formattedAnswers = exam.questions.map(q => {
                const isWriting = q.questionType === 'WRITING';
                return {
                    questionId: q._id,
                    selectedOptionIndex: isWriting ? null : answers[q._id],
                    textAnswer: isWriting ? textAnswers[q._id] : undefined
                };
            });

            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ answers: formattedAnswers })
            });

            if (res.ok) {
                const resultData = await res.json();
                setResult(resultData);
            } else {
                alert('Failed to submit exam');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during submission.');
        } finally {
            setSubmitting(false);
            setTimeLeft(null); // Stop timer
        }
    }, [exam, answers, textAnswers, id]);

    // Timer Effect
    useEffect(() => {
        if (timeLeft === null || result) return;

        if (timeLeft <= 0) {
            // Auto submit when time is up
            handleSubmit(true);
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, result, handleSubmit]);

    const handleOptionChange = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleTextChange = (questionId: string, text: string) => {
        setTextAnswers(prev => ({
            ...prev,
            [questionId]: text
        }));
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
            <div className="flex flex-col items-center gap-4 text-blue-600 dark:text-blue-400">
                <Activity className="w-12 h-12 animate-pulse" />
                <p className="font-semibold text-gray-600 dark:text-gray-300">{t.takeExam.initializing}</p>
            </div>
        </div>
    );

    if (!exam) return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 p-8 flex flex-col items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center max-w-md w-full">
                <AlertTriangle className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.takeExam.loadFailed}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t.takeExam.loadFailedDesc}</p>
                <Link href="/exams" className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t.takeExam.backToExams}
                </Link>
            </div>
        </div>
    );

    if (result) {
        const percentage = Math.round((result.score / result.totalPossibleScore) * 100);
        return (
            <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 p-8 flex flex-col items-center justify-start py-12 transition-colors duration-300">
                <div className="max-w-4xl w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{t.takeExam.simComplete}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{t.takeExam.resultsFor} <strong>{exam.title}</strong></p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 mb-10">
                        {/* Score Card */}
                        <div className="flex-1 bg-white/80 dark:bg-[#0B1120]/80/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                            <div className="relative w-40 h-40 mb-6">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-gray-200 dark:text-gray-700"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="currentColor" strokeWidth="3"
                                    />
                                    <path
                                        className={`${percentage >= 50 ? 'text-emerald-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                                        strokeDasharray={`${percentage}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="currentColor" strokeWidth="3"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-black text-gray-900 dark:text-white">{percentage}%</span>
                                </div>
                            </div>
                            <div className="text-xl font-medium text-gray-700 dark:text-gray-300">
                                {t.takeExam.score} <span className="text-blue-600 dark:text-blue-400 font-bold ml-2 text-2xl">{result.score}</span> <span className="text-gray-400">/ {result.totalPossibleScore}</span>
                            </div>
                        </div>

                        {/* Detailed AI Feedback Logic */}
                        <div className="flex-[2] flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                Detailed AI Feedback
                            </h3>
                            {result.answers.map((answer: any, idx: number) => {
                                if (answer.aiFeedback) {
                                    return (
                                        <div key={idx} className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-lg">Writing Task Assessment</h4>
                                                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 text-sm font-bold px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-700/50">
                                                    Score: {answer.aiFeedback.score}/10
                                                </span>
                                            </div>
                                            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                                                <div>
                                                    <strong className="block text-indigo-800 dark:text-indigo-400 mb-1">Your Submission:</strong>
                                                    <p className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 italic">
                                                        "{answer.textAnswer}"
                                                    </p>
                                                </div>
                                                <div>
                                                    <strong className="block text-indigo-800 dark:text-indigo-400 mb-1">AI Explanation:</strong>
                                                    <p className="leading-relaxed">{answer.aiFeedback.explanation}</p>
                                                </div>
                                                {answer.aiFeedback.suggestions && answer.aiFeedback.suggestions.length > 0 && (
                                                    <div>
                                                        <strong className="block text-indigo-800 dark:text-indigo-400 mb-2">Suggestions for Improvement:</strong>
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {answer.aiFeedback.suggestions.map((sug: string, i: number) => (
                                                                <li key={i}>{sug}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                            {!result.answers.some((a: any) => a.aiFeedback) && (
                                <div className="p-6 text-center text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    No detailed writing AI feedback available for this session.
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full md:w-auto md:min-w-[200px] mx-auto block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                    >
                        {t.takeExam.returnDash}
                    </button>
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length + Object.keys(textAnswers).filter(k => textAnswers[k].trim() !== '').length;
    const progressPercentage = Math.round((answeredCount / exam.questions.length) * 100);

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 pb-32 transition-colors duration-300">
            {/* Sticky Header / Timer Bar */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <span className={`shrink-0 inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${exam.type === 'IELTS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                <BrainCircuit className="w-3.5 h-3.5 mr-1" />
                                {exam.type}
                            </span>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md">{exam.title}</h1>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto gap-6 bg-white/80 dark:bg-[#0B1120]/80/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-mono font-bold text-lg animate-pulse">
                                <Clock className="w-5 h-5" />
                                {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                            </div>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{t.takeExam.progress}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{answeredCount} / {exam.questions.length}</span>
                            </div>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Questions Form */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
                {exam.questions.map((q, qIndex) => (
                    <div key={q._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 hover:border-blue-100 dark:hover:border-blue-900/30 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                                <span className="text-blue-600 dark:text-blue-400 font-bold mr-2">{qIndex + 1}.</span>
                                {q.text}
                            </h3>
                            <span className="shrink-0 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-md ml-4 border border-blue-100 dark:border-blue-800/50">
                                {q.points} {q.points > 1 ? t.takeExam.pts : t.takeExam.pt}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {q.questionType === 'WRITING' ? (
                                <div className="mt-4">
                                    <textarea
                                        className="w-full h-48 md:h-64 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Write your essay answer here..."
                                        value={textAnswers[q._id] || ''}
                                        onChange={(e) => handleTextChange(q._id, e.target.value)}
                                    />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                                        Word count: {textAnswers[q._id] ? textAnswers[q._id].trim().split(/\s+/).filter(w => w.length > 0).length : 0}
                                    </p>
                                </div>
                            ) : (
                                q.options?.map((option, oIndex) => {
                                    const isSelected = answers[q._id] === oIndex;
                                    return (
                                        <label
                                            key={oIndex}
                                            className={`group flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                                ? 'bg-blue-50/50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500 scale-[1.01] shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700/50 dark:hover:border-blue-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <div className="relative flex items-center justify-center w-6 h-6 mr-4 shrink-0">
                                                <input
                                                    type="radio"
                                                    name={`question-${q._id}`}
                                                    value={oIndex}
                                                    checked={isSelected}
                                                    onChange={() => handleOptionChange(q._id, oIndex)}
                                                    className="peer sr-only"
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 transition-colors ${isSelected ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}></div>
                                                <div className={`absolute w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 transition-transform scale-0 ${isSelected ? 'scale-100' : ''}`}></div>
                                            </div>
                                            <span className={`text-base flex-1 transition-colors ${isSelected ? 'text-gray-900 font-medium dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {option}
                                            </span>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 p-4 z-40 transform translate-y-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">
                        {t.takeExam.reviewAns}
                    </p>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className={`w-full sm:w-auto flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white transition-all ${submitting
                            ? 'bg-blue-400 dark:bg-blue-600/50 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5'
                            }`}
                    >
                        {submitting ? (
                            <>
                                <Activity className="w-5 h-5 mr-2 animate-spin" />
                                {t.takeExam.analyzing}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                {t.takeExam.finishSubmit}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
