'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import {
    Loader2, CheckCircle2, Circle, Lock, ArrowRight, Play, BookOpen,
    Clock, Target, Headphones, Mic, Languages, Sparkles, Trophy,
    Calendar, Zap, Brain, PenTool
} from 'lucide-react';
import Link from 'next/link';

export default function CourseRoadmapPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, token, setAuthData, loading: authLoading } = useContext(AuthContext) || {};

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            // Check cache on mount
            const cached = sessionStorage.getItem(`course_${id as string}`);
            if (cached) {
                try {
                    setCourse(JSON.parse(cached));
                    setLoading(false);
                } catch(e) {}
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id as string}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                    sessionStorage.setItem(`course_${id as string}`, JSON.stringify(data));
                }
            } catch (error) {
                console.error('Failed to fetch course details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, user]); // Added user dependency to refresh roadmap if enrollment status changes

    const handleEnroll = async () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        setEnrolling(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id as string}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (setAuthData) {
                    setAuthData({ ...user, enrolledCourse: data.enrolledCourse, completedCourseDays: data.completedCourseDays }, token as string);
                }
            }
        } catch (error) {
            console.error('Enrollment failed', error);
        } finally {
            setEnrolling(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        setEnrolling(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/payment/create_payment_url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId: id })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.paymentUrl) {
                    window.location.href = data.paymentUrl; // Redirect to VNPay
                } else {
                    alert('Could not get payment URL.');
                }
            } else {
                const errData = await res.json();
                alert(errData.message || 'Payment initiation failed.');
            }
        } catch (error) {
            console.error('Purchase failed', error);
            alert('Something went wrong initiating the payment.');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading || authLoading || !course) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0B1120] dark:to-[#0d1a2d]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500 animate-pulse">{authLoading ? 'Authenticating...' : 'Loading course roadmap...'}</p>
                </div>
            </div>
        );
    }

    const isEnrolled = user && user.enrolledCourse === id;
    const hasPurchased = user && user.purchasedCourses?.includes(id as string);
    const needToBuy = course.isPremium && !hasPurchased;
    const completedDays = user && isEnrolled && user.completedCourseDays ? user.completedCourseDays : [];
    const progressPerc = Math.round((completedDays.length / course.days.length) * 100) || 0;

    const phaseColors: Record<string, { bg: string; text: string; gradient: string }> = {
        'Foundation': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', gradient: 'from-blue-500 to-cyan-500' },
        'Building': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', gradient: 'from-amber-500 to-orange-500' },
        'Advanced': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', gradient: 'from-purple-500 to-pink-500' },
        'Mock Test': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', gradient: 'from-red-500 to-rose-600' },
    };

    // Group days by phase
    const phases = course.days.reduce((acc: any, day: any) => {
        const phase = day.phase || 'Foundation';
        if (!acc[phase]) acc[phase] = [];
        acc[phase].push(day);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0B1120] dark:via-[#0d1525] dark:to-[#0d1a2d] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* ─── COURSE HEADER BANNER ─── */}
                <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 relative">
                    <div className="h-48 md:h-64 relative">
                        <img src={course.image} alt="Course Hero" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg mb-4 inline-block tracking-wide">
                                {course.targetType} ROADMAP
                            </span>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">{course.title}</h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 text-gray-700 dark:text-gray-300">
                        <p className="text-lg leading-relaxed mb-8">{course.description}</p>

                        <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-semibold">
                            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-500" /> {course.durationDays} Days Duration</div>
                            <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-500" /> Level: {course.level}</div>
                            <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> {Object.keys(phases).length} Phases</div>
                            {course.isPremium && (
                                <div className="flex items-center gap-2 text-orange-500 bg-orange-100 dark:bg-orange-950/30 px-3 py-1.5 rounded-full font-bold">
                                    {course.price.toLocaleString('vi-VN')} VNĐ
                                </div>
                            )}
                        </div>

                        {/* Skills overview */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-3 py-2 rounded-xl text-sm font-bold">
                                <Languages className="w-4 h-4" /> Vocabulary
                            </div>
                            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-xl text-sm font-bold">
                                <Brain className="w-4 h-4" /> Grammar
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-xl text-sm font-bold">
                                <BookOpen className="w-4 h-4" /> Reading
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-xl text-sm font-bold">
                                <Headphones className="w-4 h-4" /> Listening
                            </div>
                            {course.isPremium && (
                                <>
                                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 px-3 py-2 rounded-xl text-sm font-bold">
                                        <Mic className="w-4 h-4" /> Speaking
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-sm font-bold">
                                        <PenTool className="w-4 h-4" /> Writing
                                    </div>
                                </>
                            )}
                        </div>

                        {needToBuy ? (
                            <button
                                onClick={handlePurchase}
                                disabled={enrolling}
                                className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 text-base rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2"
                            >
                                {enrolling ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Unlock Masterclass with VNPay <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        ) : !isEnrolled ? (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
                            >
                                {enrolling ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Play className="w-6 h-6" /> Start {course.durationDays}-Day Sprint</>}
                            </button>
                        ) : (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="w-full">
                                    <div className="flex justify-between font-bold text-blue-900 dark:text-blue-200 mb-2">
                                        <span className="flex items-center gap-2"><Trophy className="w-5 h-5" /> Current Progress</span>
                                        <span>{progressPerc}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-3">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPerc}%` }}></div>
                                    </div>
                                    <p className="text-sm mt-2 text-blue-700 dark:text-blue-300 opacity-80">You have completed {completedDays.length} out of {course.days.length} days.</p>
                                </div>
                                <Link
                                    href={`/courses/${id as string}/day/${completedDays.length + 1 <= course.days.length ? completedDays.length + 1 : course.days.length}`}
                                    className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105 whitespace-nowrap flex items-center gap-2"
                                >
                                    <Zap className="w-5 h-5" />
                                    {completedDays.length === 0 ? 'Start Day 1' : completedDays.length === course.days.length ? 'Review Course' : 'Continue Course'}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── PHASE-BASED SYLLABUS ─── */}
                {Object.entries(phases).map(([phaseName, phaseDays]: [string, any]) => {
                    const pc = phaseColors[phaseName] || phaseColors['Foundation'];
                    const phaseCompletedCount = phaseDays.filter((d: any) => completedDays.includes(d.dayNumber)).length;
                    const phaseProgressPct = Math.round((phaseCompletedCount / phaseDays.length) * 100);

                    return (
                        <div key={phaseName} className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700/50">

                            {/* Phase Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${pc.gradient}`} />
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{phaseName} Phase</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{phaseDays.length} days · {phaseCompletedCount} completed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                        <div className={`bg-gradient-to-r ${pc.gradient} h-2 rounded-full transition-all duration-500`} style={{ width: `${phaseProgressPct}%` }} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{phaseProgressPct}%</span>
                                </div>
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {phaseDays.map((day: any) => {
                                    const isCompleted = completedDays.includes(day.dayNumber);
                                    const isNext = isEnrolled && !isCompleted && completedDays.length + 1 === day.dayNumber;
                                    const isLocked = isEnrolled && !isCompleted && !isNext;
                                    const hasTasks = day.tasks && (
                                        day.tasks.vocabulary?.length > 0 || 
                                        day.tasks.grammar || 
                                        day.tasks.reading || 
                                        day.tasks.listening || 
                                        day.tasks.speaking ||
                                        day.tasks.writing
                                    );

                                    return (
                                        <Link
                                            key={day._id || day.dayNumber}
                                            href={isLocked || !isEnrolled ? '#' : `/courses/${id as string}/day/${day.dayNumber}`}
                                            className={`relative group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
                                                isCompleted
                                                    ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                                                    : isNext
                                                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20'
                                                    : isLocked
                                                    ? 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/50 opacity-60 cursor-not-allowed'
                                                    : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700'
                                            }`}
                                        >
                                            {/* Day indicator */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                                isCompleted ? 'bg-green-500 text-white' :
                                                isNext ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                                                'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                            }`}>
                                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                                 isNext ? <ArrowRight className="w-5 h-5 animate-pulse" /> :
                                                 isLocked ? <Lock className="w-4 h-4" /> :
                                                 <span className="text-sm font-bold">{day.dayNumber}</span>}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-sm mb-1 truncate ${
                                                    isNext ? 'text-blue-600 dark:text-blue-400' :
                                                    isCompleted ? 'text-green-700 dark:text-green-400' :
                                                    'text-gray-900 dark:text-white'
                                                }`}>
                                                    {day.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{day.description}</p>

                                                {/* Task skill icons */}
                                                {hasTasks && (
                                                    <div className="flex items-center gap-1.5">
                                                        {day.tasks.vocabulary?.length > 0 && (
                                                            <span className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center" title="Vocabulary">
                                                                <Languages className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        {day.tasks.grammar && (
                                                            <span className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center" title="Grammar">
                                                                <Brain className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        {day.tasks.reading && (
                                                            <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center" title="Reading">
                                                                <BookOpen className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        {day.tasks.listening && (
                                                            <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center" title="Listening">
                                                                <Headphones className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        {day.tasks.speaking && (
                                                            <span className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center" title="Speaking">
                                                                <Mic className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                        {day.tasks.writing && (
                                                            <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 flex items-center justify-center" title="Writing">
                                                                <PenTool className="w-3.5 h-3.5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status badge */}
                                            {isCompleted && (
                                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-bold shrink-0">
                                                    Done
                                                </span>
                                            )}
                                            {isNext && (
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-bold shrink-0 animate-pulse">
                                                    Next →
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
