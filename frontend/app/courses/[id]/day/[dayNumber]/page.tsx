'use client';

import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Loader2, ArrowLeft, CheckCircle, BookOpen, Headphones, Mic,
    Languages, ChevronRight, RotateCcw, Play, Pause, Volume2,
    Clock, Star, Brain, Eye, EyeOff, Trophy, Sparkles, ChevronLeft,
    FileText, PenTool, CheckSquare, Edit3, HelpCircle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════
//  DAILY MISSION PAGE
// ═══════════════════════════════════════════════════
export default function DayContentPage() {
    const { id, dayNumber } = useParams();
    const router = useRouter();
    const { user, token, setAuthData, loading: authLoading } = useContext(AuthContext) || {};

    const [course, setCourse] = useState<any>(null);
    const [dayData, setDayData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'vocabulary');

    // Task completion tracking (local state)
    const [completedTasks, setCompletedTasks] = useState<string[]>([]);

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams, activeTab]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        // Check cache first on client side
        const cachedCourse = sessionStorage.getItem(`course_${id as string}`);
        const cachedDay = sessionStorage.getItem(`day_${id as string}_${dayNumber as string}`);

        if (cachedCourse && cachedDay) {
            try {
                setCourse(JSON.parse(cachedCourse));
                setDayData(JSON.parse(cachedDay));
                setLoading(false);
            } catch (e) {
                console.error("Cache parsing error", e);
            }
        }

        const fetchCourse = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id as string}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                    sessionStorage.setItem(`course_${id as string}`, JSON.stringify(data));
                    const dayObj = data.days.find((d: any) => d.dayNumber === parseInt(dayNumber as string, 10));
                    setDayData(dayObj);
                    if (dayObj) {
                        sessionStorage.setItem(`day_${id as string}_${dayNumber as string}`, JSON.stringify(dayObj));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch day details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, dayNumber, user, router]);

    const handleCompleteDay = async () => {
        setCompleting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id as string}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ dayNumber })
            });

            if (res.ok) {
                const data = await res.json();
                if (setAuthData && user) {
                    setAuthData({ ...user, completedCourseDays: data.completedCourseDays }, token as string);
                }
                router.push(`/courses/${id as string}`);
            } else {
                alert("Failed to mark day as complete");
            }
        } catch (error) {
            console.error('Completion error', error);
        } finally {
            setCompleting(false);
        }
    };

    const markTaskComplete = (task: string) => {
        if (!completedTasks.includes(task)) {
            setCompletedTasks([...completedTasks, task]);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0B1120] dark:to-[#0d1a2d]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 animate-pulse">{authLoading ? 'Authenticating...' : "Loading today's missions..."}</p>
                </div>
            </div>
        );
    }

    if (!course || !dayData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 text-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0B1120] dark:to-[#0d1a2d]">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson Not Found</h1>
                    <p className="text-gray-500">The curriculum for this day is still being authored.</p>
                    <Link href={`/courses/${id as string}`} className="mt-6 inline-block text-blue-600 hover:underline">
                        <ArrowLeft className="inline w-4 h-4 mr-1" /> Back to Syllabus
                    </Link>
                </div>
            </div>
        );
    }

    const hasTasks = dayData.tasks && (
        dayData.tasks.vocabulary?.length > 0 ||
        dayData.tasks.grammar ||
        dayData.tasks.reading ||
        dayData.tasks.listening ||
        dayData.tasks.speaking ||
        dayData.tasks.writing
    );

    const isCompleted = user && user.completedCourseDays && user.completedCourseDays.includes(parseInt(dayNumber as string, 10));

    // If no structured tasks, fall back to old HTML rendering
    if (!hasTasks) {
        return <LegacyDayContent course={course} dayData={dayData} isCompleted={isCompleted} completing={completing} handleCompleteDay={handleCompleteDay} id={id as string} />;
    }

    const tabs = [
        { key: 'vocabulary', label: 'Vocabulary', icon: Languages, color: 'violet', count: dayData.tasks.vocabulary?.length || 0 },
        { key: 'grammar', label: 'Grammar', icon: CheckSquare, color: 'indigo', count: dayData.tasks.grammar ? 1 : 0 },
        { key: 'reading', label: 'Reading', icon: BookOpen, color: 'blue', count: dayData.tasks.reading ? 1 : 0 },
        { key: 'listening', label: 'Listening', icon: Headphones, color: 'emerald', count: dayData.tasks.listening ? 1 : 0 },
        { key: 'speaking', label: 'Speaking', icon: Mic, color: 'rose', count: dayData.tasks.speaking ? 1 : 0 },
        { key: 'writing', label: 'Writing', icon: PenTool, color: 'orange', count: dayData.tasks.writing ? 1 : 0 },
    ].filter(t => t.count > 0);

    const totalTasks = tabs.length;
    const completedCount = completedTasks.length;
    const progressPercentage = Math.round((completedCount / totalTasks) * 100);

    const phaseColors: Record<string, string> = {
        'Foundation': 'from-blue-500 to-cyan-500',
        'Building': 'from-amber-500 to-orange-500',
        'Advanced': 'from-purple-500 to-pink-500',
        'Mock Test': 'from-red-500 to-rose-600',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0B1120] dark:via-[#0d1525] dark:to-[#0d1a2d] transition-colors duration-300">

            {/* ─── TOP NAV ─── */}
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-30 w-full">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/courses/${id as string}`} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium gap-2">
                        <ArrowLeft className="w-5 h-5" /> Back to Roadmap
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block font-bold tracking-widest text-gray-400 uppercase text-xs">
                            {course?.title}
                        </div>
                        {/* Mini progress ring */}
                        <div className="relative w-10 h-10">
                            <svg className="w-10 h-10 -rotate-90">
                                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200 dark:text-gray-700" />
                                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none"
                                    className="text-blue-500"
                                    strokeDasharray={`${progressPercentage} ${100 - progressPercentage}`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">{completedCount}/{totalTasks}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 pb-32 space-y-8">

                {/* ─── MISSION HEADER ─── */}
                <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700/50 shadow-xl">
                    {/* Phase gradient stripe */}
                    <div className={`h-2 bg-gradient-to-r ${phaseColors[dayData.phase] || 'from-blue-500 to-cyan-500'}`} />

                    <div className="p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${phaseColors[dayData.phase] || 'from-blue-500 to-cyan-500'} shadow-lg`}>
                                        {dayData.phase || 'Foundation'} Phase
                                    </span>
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                                        Day {dayData.dayNumber} / {course.durationDays}
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                                    {dayData.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{dayData.description}</p>
                            </div>

                            {/* Progress circle */}
                            <div className="shrink-0 flex flex-col items-center">
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 -rotate-90">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-100 dark:text-gray-700" />
                                        <circle cx="48" cy="48" r="40" stroke="url(#progressGrad)" strokeWidth="6" fill="none"
                                            strokeDasharray={`${progressPercentage * 2.51} ${251 - progressPercentage * 2.51}`}
                                            strokeLinecap="round"
                                            style={{ transition: 'stroke-dasharray 0.8s ease' }}
                                        />
                                        <defs>
                                            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3B82F6" />
                                                <stop offset="100%" stopColor="#8B5CF6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">{progressPercentage}%</span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2 font-medium">{completedCount} of {totalTasks} tasks</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── TASK TABS ─── */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        const isDone = completedTasks.includes(tab.key);
                        const colorMap: Record<string, string> = {
                            violet: isActive ? 'bg-violet-500 text-white shadow-violet-500/30' : 'bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30',
                            indigo: isActive ? 'bg-indigo-500 text-white shadow-indigo-500/30' : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30',
                            blue: isActive ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30',
                            emerald: isActive ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
                            rose: isActive ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30',
                            orange: isActive ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30',
                        };

                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border transition-all duration-300 shadow-sm whitespace-nowrap ${colorMap[tab.color]} ${isActive ? 'shadow-lg scale-[1.02] border-transparent' : 'border-gray-100 dark:border-gray-700'}`}
                            >
                                {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ─── TASK CONTENT AREA ─── */}
                <div className="min-h-[400px]">
                    {activeTab === 'vocabulary' && dayData.tasks.vocabulary?.length > 0 && (
                        <VocabularySection cards={dayData.tasks.vocabulary} onComplete={() => markTaskComplete('vocabulary')} isCompleted={completedTasks.includes('vocabulary')} />
                    )}
                    {activeTab === 'grammar' && dayData.tasks.grammar && (
                        <GrammarSection task={dayData.tasks.grammar} onComplete={() => markTaskComplete('grammar')} isCompleted={completedTasks.includes('grammar')} />
                    )}
                    {activeTab === 'reading' && dayData.tasks.reading && (
                        <ReadingSection task={dayData.tasks.reading} onComplete={() => markTaskComplete('reading')} isCompleted={completedTasks.includes('reading')} />
                    )}
                    {activeTab === 'listening' && dayData.tasks.listening && (
                        <ListeningSection task={dayData.tasks.listening} onComplete={() => markTaskComplete('listening')} isCompleted={completedTasks.includes('listening')} />
                    )}
                    {activeTab === 'speaking' && dayData.tasks.speaking && (
                        <SpeakingSection task={dayData.tasks.speaking} onComplete={() => markTaskComplete('speaking')} isCompleted={completedTasks.includes('speaking')} courseId={id as string} />
                    )}
                    {activeTab === 'writing' && dayData.tasks.writing && (
                        <WritingSection task={dayData.tasks.writing} onComplete={() => markTaskComplete('writing')} isCompleted={completedTasks.includes('writing')} courseId={id as string} />
                    )}
                </div>

                {/* ─── COMPLETION BAR ─── */}
                <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mini task dots */}
                            <div className="flex gap-2">
                                {tabs.map(t => (
                                    <div key={t.key} className={`w-3 h-3 rounded-full transition-colors ${completedTasks.includes(t.key) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
                                {completedCount === totalTasks ? '🎉 All missions complete!' : `${completedCount}/${totalTasks} missions done`}
                            </span>
                        </div>

                        {isCompleted ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-5 py-2.5 rounded-xl">
                                <CheckCircle className="w-5 h-5" /> Day Completed
                            </div>
                        ) : (
                            <button
                                onClick={handleCompleteDay}
                                disabled={completing}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${completedCount >= totalTasks
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-green-500/30 hover:scale-105'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-blue-500/30 hover:scale-105'
                                    }`}
                            >
                                {completing ? <span><Loader2 className="w-5 h-5 animate-spin" /></span> : <span><Trophy className="w-5 h-5" /></span>}
                                <span>{completedCount >= totalTasks ? 'Complete Day 🎯' : 'Mark Day as Complete'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
//  VOCABULARY FLASHCARD SECTION
// ═══════════════════════════════════════════════════
function VocabularySection({ cards, onComplete, isCompleted }: { cards: any[]; onComplete: () => void; isCompleted: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

    const card = cards[currentIndex];

    const handleKnown = () => {
        const n = new Set(knownCards);
        n.add(currentIndex);
        setKnownCards(n);
        if (n.size === cards.length && !isCompleted) onComplete();
        goNext();
    };

    const goNext = () => {
        setFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 200);
    };

    const goPrev = () => {
        setFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 200);
    };

    return (
        <div className="space-y-8">
            {/* Progress bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Languages className="w-6 h-6 text-violet-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Flashcards</h2>
                    {isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">✓ Done</span>}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{knownCards.size}/{cards.length} learned</span>
            </div>

            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(knownCards.size / cards.length) * 100}%` }} />
            </div>

            {/* Flashcard */}
            <div className="flex justify-center">
                <div className="w-full max-w-lg perspective-1000">
                    <div
                        className={`relative w-full cursor-pointer transition-transform duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}
                        onClick={() => setFlipped(!flipped)}
                        style={{ minHeight: '320px', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.6s' }}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center">
                                <span className="text-sm text-violet-500 font-bold uppercase tracking-wider mb-4">Tap to flip</span>
                                <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">{card.word}</h3>
                                {card.phonetic && (
                                    <p className="text-lg text-violet-500 dark:text-violet-400 font-mono mb-2">{card.phonetic}</p>
                                )}
                                {card.partOfSpeech && (
                                    <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold px-3 py-1 rounded-full">
                                        {card.partOfSpeech}
                                    </span>
                                )}
                                <div className="mt-6 text-gray-400 text-sm">Card {currentIndex + 1} of {cards.length}</div>
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center text-white">
                                <span className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">Definition</span>
                                <p className="text-xl md:text-2xl font-bold mb-4 leading-relaxed">{card.definition}</p>
                                {card.example && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4 w-full">
                                        <p className="text-sm opacity-80 mb-1 font-semibold">Example:</p>
                                        <p className="italic text-base">&ldquo;{card.example}&rdquo;</p>
                                    </div>
                                )}
                                {card.vietnameseMeaning && (
                                    <div className="bg-white/10 rounded-xl px-4 py-2">
                                        <span className="text-sm opacity-80">🇻🇳</span> <span className="font-bold">{card.vietnameseMeaning}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button onClick={goPrev} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={() => { setFlipped(false); setTimeout(goNext, 200); }}
                    className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" /> Review Again
                </button>

                <button
                    onClick={handleKnown}
                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${knownCards.has(currentIndex)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:shadow-violet-500/30 hover:scale-105'
                        }`}
                >
                    {knownCards.has(currentIndex) ? <><CheckCircle className="w-4 h-4" /> Learned</> : <><Brain className="w-4 h-4" /> I Know This</>}
                </button>

                <button onClick={goNext} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
//  READING COMPREHENSION SECTION
// ═══════════════════════════════════════════════════
function ReadingSection({ task, onComplete, isCompleted }: { task: any; onComplete: () => void; isCompleted: boolean }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelectAnswer = (qIdx: number, answer: string) => {
        if (showResults) return;
        setAnswers(prev => ({ ...prev, [qIdx]: answer }));
    };

    const handleSubmit = () => {
        let correct = 0;
        task.questions.forEach((q: any, i: number) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        setScore(correct);
        setShowResults(true);
        if (!isCompleted) onComplete();
    };

    const handleReset = () => {
        setAnswers({});
        setShowResults(false);
        setScore(0);
    };

    const allAnswered = Object.keys(answers).length === task.questions.length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reading Comprehension</h2>
                    {isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">✓ Done</span>}
                </div>
            </div>

            {/* Passage */}
            <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 dark:border-gray-700/50">
                {task.title && <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">{task.title}</h3>}
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {task.passage}
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {task.questions.map((q: any, qIdx: number) => {
                    const selected = answers[qIdx];
                    const isCorrect = showResults && selected === q.correctAnswer;
                    const isWrong = showResults && selected && selected !== q.correctAnswer;

                    return (
                        <div key={qIdx} className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-2">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                                    {qIdx + 1}
                                </span>
                                <span>{q.question}</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt: string, oIdx: number) => {
                                    const isSelected = selected === opt;
                                    const correctOpt = showResults && opt === q.correctAnswer;

                                    let className = 'p-4 rounded-xl border-2 text-left font-medium transition-all cursor-pointer ';
                                    if (showResults && correctOpt) {
                                        className += 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300';
                                    } else if (showResults && isSelected && !correctOpt) {
                                        className += 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300';
                                    } else if (isSelected) {
                                        className += 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300';
                                    } else {
                                        className += 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700';
                                    }

                                    return (
                                        <button key={oIdx} onClick={() => handleSelectAnswer(qIdx, opt)} className={className}>
                                            <span className="text-xs font-bold mr-2 opacity-50">{String.fromCharCode(65 + oIdx)}.</span>
                                            {opt}
                                            {showResults && correctOpt && <CheckCircle className="w-4 h-4 inline ml-2 text-green-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                            {showResults && q.explanation && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                    <strong>💡 Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Submit / Results */}
            <div className="flex items-center justify-center gap-4">
                {showResults ? (
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-8 py-4 shadow-lg border border-gray-100 dark:border-gray-700">
                            <Star className="w-8 h-8 text-yellow-500" />
                            <div>
                                <div className="text-2xl font-black text-gray-900 dark:text-white">{score}/{task.questions.length}</div>
                                <div className="text-sm text-gray-500">Correct Answers</div>
                            </div>
                        </div>
                        <div>
                            <button onClick={handleReset} className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline flex items-center gap-1 mx-auto">
                                <RotateCcw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${allAnswered
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-blue-500/30 hover:scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Check Answers
                    </button>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
//  LISTENING SECTION
// ═══════════════════════════════════════════════════
function ListeningSection({ task, onComplete, isCompleted }: { task: any; onComplete: () => void; isCompleted: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showTranscript, setShowTranscript] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSelectAnswer = (qIdx: number, answer: string) => {
        if (showResults) return;
        setAnswers(prev => ({ ...prev, [qIdx]: answer }));
    };

    const handleSubmit = () => {
        let correct = 0;
        task.questions.forEach((q: any, i: number) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        setScore(correct);
        setShowResults(true);
        if (!isCompleted) onComplete();
    };

    const allAnswered = Object.keys(answers).length === task.questions.length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Headphones className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Listening Practice</h2>
                    {isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">✓ Done</span>}
                </div>
            </div>

            {/* Audio Player */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl text-white">
                <audio ref={audioRef} src={task.audioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsPlaying(false)} />

                {task.title && <h3 className="text-lg font-bold mb-4 opacity-90">{task.title}</h3>}

                <div className="flex items-center gap-6">
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors shadow-lg shrink-0"
                    >
                        {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </button>

                    <div className="flex-1 space-y-2">
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-sm opacity-70">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>

                {task.transcript && (
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="mt-4 text-sm font-semibold flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
                    >
                        {showTranscript ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                    </button>
                )}

                {showTranscript && task.transcript && (
                    <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-sm leading-relaxed italic">
                        {task.transcript}
                    </div>
                )}
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {task.questions.map((q: any, qIdx: number) => {
                    const selected = answers[qIdx];
                    const correctOpt = q.correctAnswer;

                    return (
                        <div key={qIdx} className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-2">
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                                    {qIdx + 1}
                                </span>
                                <span>{q.question}</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt: string, oIdx: number) => {
                                    const isSelected = selected === opt;
                                    const isCorrectChoice = showResults && opt === correctOpt;
                                    const isWrongChoice = showResults && isSelected && opt !== correctOpt;

                                    let cls = 'p-4 rounded-xl border-2 text-left font-medium transition-all cursor-pointer ';
                                    if (isCorrectChoice) cls += 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300';
                                    else if (isWrongChoice) cls += 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300';
                                    else if (isSelected) cls += 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-300';
                                    else cls += 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700';

                                    return (
                                        <button key={oIdx} onClick={() => handleSelectAnswer(qIdx, opt)} className={cls}>
                                            <span className="text-xs font-bold mr-2 opacity-50">{String.fromCharCode(65 + oIdx)}.</span>
                                            {opt}
                                            {isCorrectChoice && <CheckCircle className="w-4 h-4 inline ml-2 text-green-500" />}
                                        </button>
                                    );
                                })}
                            </div>
                            {showResults && q.explanation && (
                                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                                    <strong>💡 Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center">
                {showResults ? (
                    <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-8 py-4 shadow-lg border border-gray-100 dark:border-gray-700">
                        <Volume2 className="w-8 h-8 text-emerald-500" />
                        <div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{score}/{task.questions.length}</div>
                            <div className="text-sm text-gray-500">Correct Answers</div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${allAnswered
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-emerald-500/30 hover:scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Check Answers
                    </button>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
//  SPEAKING SECTION
// ═══════════════════════════════════════════════════
function SpeakingSection({ task, onComplete, isCompleted, courseId }: { task: any; onComplete: () => void; isCompleted: boolean; courseId: string }) {
    const [timer, setTimer] = useState(task.durationSeconds || 60);
    const [isRunning, setIsRunning] = useState(false);
    const [showSample, setShowSample] = useState(false);

    // AI Grading & STT States
    const [transcript, setTranscript] = useState('');
    const [recognizer, setRecognizer] = useState<any>(null);
    const [isGrading, setIsGrading] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const { token } = useContext(AuthContext) || {};

    const promptAudioRef = useRef<HTMLAudioElement>(null);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            rec.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };
            setRecognizer(rec);
        }
    }, []);

    useEffect(() => {
        if (isRunning && timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer((t: number) => t - 1);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timer === 0 && isRunning) {
                stopTimer();
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timer]);

    const startTimer = () => {
        setTimer(task.durationSeconds || 60);
        setTranscript('');
        if (recognizer) recognizer.start();
        setIsRunning(true);
    };

    const stopTimer = async () => {
        setIsRunning(false);
        if (recognizer) recognizer.stop();

        if (!transcript.trim()) {
            alert("No speech detected. Please try again.");
            return;
        }

        setIsGrading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${courseId}/grade-speaking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ promptText: task.prompt, studentTranscript: transcript })
            });

            if (res.ok) {
                const data = await res.json();
                setFeedback(data);
                if (!isCompleted) onComplete();
            } else {
                alert('Failed to get AI feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error grading speaking:', error);
        } finally {
            setIsGrading(false);
        }
    };

    const formatTimer = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const progressPct = ((task.durationSeconds - timer) / task.durationSeconds) * 100;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Mic className="w-6 h-6 text-rose-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Speaking Practice</h2>
                    {isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">✓ Done</span>}
                </div>
            </div>

            {/* Prompt Card */}
            <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-rose-500" />
                    <span className="text-sm font-bold text-rose-500 uppercase tracking-wider">Speaking Prompt</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
                    {task.prompt}
                </p>
                {task.audioUrl && (
                    <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <audio ref={promptAudioRef} src={task.audioUrl} />
                        <button
                            onClick={() => {
                                if (promptAudioRef.current) {
                                    promptAudioRef.current.currentTime = 0;
                                    promptAudioRef.current.play();
                                }
                            }}
                            className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors shadow-sm shrink-0"
                        >
                            <Volume2 className="w-6 h-6" />
                        </button>
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Listen to Prompt Audio</h4>
                    </div>
                )}
                {task.tips && task.tips.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-800">
                        <h4 className="font-bold text-rose-700 dark:text-rose-300 mb-2 text-sm flex items-center gap-2">
                            <Star className="w-4 h-4" /> Tips
                        </h4>
                        <ul className="space-y-1">
                            {task.tips.map((tip: string, i: number) => (
                                <li key={i} className="text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Timer */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 shadow-2xl text-white text-center">
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-80 mb-4">
                    {isRunning ? 'Recording Time' : timer === 0 ? 'Time\'s Up!' : 'Ready to speak?'}
                </h3>

                <div className="relative w-40 h-40 mx-auto mb-6">
                    <svg className="w-40 h-40 -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/20" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="none"
                            className="text-white"
                            strokeDasharray={`${progressPct * 4.4} ${440 - progressPct * 4.4}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 1s linear' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-black font-mono">{formatTimer(timer)}</span>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    {!isRunning ? (
                        <button onClick={startTimer} disabled={isGrading} className="px-8 py-3 rounded-xl bg-white text-rose-600 font-bold hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
                            {isGrading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                            {isGrading ? 'AI is Grading...' : timer === 0 ? 'Retry Recording' : 'Start Speaking'}
                        </button>
                    ) : (
                        <button onClick={stopTimer} className="px-8 py-3 rounded-xl bg-white/20 backdrop-blur-sm font-bold hover:bg-white/30 transition-colors shadow-lg flex items-center gap-2">
                            <Pause className="w-5 h-5" /> Finish & Submit to AI
                        </button>
                    )}
                </div>

                {transcript && (
                    <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-2xl p-6 text-left shadow-inner">
                        <div className="flex items-center gap-2 mb-3">
                            <Languages className="w-4 h-4 text-rose-200" />
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Live Transcript</span>
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed italic">"{transcript}"</p>
                    </div>
                )}
            </div>

            {/* Sample Answer Toggle */}
            {task.sampleAnswer && (
                <div>
                    <button
                        onClick={() => setShowSample(!showSample)}
                        className="w-full text-left bg-white dark:bg-gray-800/80 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            {showSample ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                            <span className="font-bold text-gray-900 dark:text-white">Sample Answer</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showSample ? 'rotate-90' : ''}`} />
                    </button>
                    {showSample && (
                        <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">{task.sampleAnswer}</p>
                        </div>
                    )}
                </div>
            )}

            {/* AI Evaluation */}
            <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-green-500" /> AI Speaking Feedback
                </h4>
                {feedback ? (
                    <div className="space-y-6">
                        {/* Overall Band */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/10 rounded-3xl border border-rose-200 dark:border-rose-800/40 min-w-[140px]">
                                <span className="text-5xl font-black text-rose-600 dark:text-rose-400 mb-1">{feedback.score}</span>
                                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-widest">/ 9 Band</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm flex-1">
                                {feedback.explanation}
                            </p>
                        </div>

                        {/* Band Sub-Scores */}
                        {feedback.bandScores && (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {[
                                    { key: 'taskAchievement', label: 'Task', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
                                    { key: 'fluencyCoherence', label: 'Fluency', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
                                    { key: 'lexicalResource', label: 'Lexical', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                                    { key: 'grammaticalRange', label: 'Grammar', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
                                    { key: 'pronunciation', label: 'Pronunciation', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' },
                                ].map(({ key, label, color }) => (
                                    <div key={key} className={`rounded-2xl p-3 text-center border ${color}`}>
                                        <span className="block text-2xl font-black">{feedback.bandScores[key] ?? '-'}</span>
                                        <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">{label}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pronunciation Errors */}
                        {feedback.pronunciationErrors && feedback.pronunciationErrors.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-200 dark:border-red-800/40">
                                <h5 className="font-bold text-sm text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Pronunciation Issues Detected
                                </h5>
                                <div className="space-y-2">
                                    {feedback.pronunciationErrors.map((err: any, i: number) => (
                                        <div key={i} className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-red-100 dark:border-red-900/30">
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-lg font-mono font-bold text-sm line-through">{err.word}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg font-mono font-bold text-sm">{err.intended}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 italic ml-auto">{err.issue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {feedback.suggestions && feedback.suggestions.length > 0 && (
                            <div>
                                <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Tips to Improve:</h5>
                                <ul className="space-y-2">
                                    {feedback.suggestions.map((s: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="text-rose-500 font-bold shrink-0 mt-0.5">»</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm font-medium text-center px-8">
                        Record your answer to receive automated AI pronunciation, vocabulary, and grammar evaluation.
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
//  GRAMMAR SECTION
// ═══════════════════════════════════════════════════
function GrammarSection({ task, onComplete, isCompleted }: { task: any; onComplete: () => void; isCompleted: boolean }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (qIdx: number, val: string) => {
        if (showResults) return;
        setAnswers(prev => ({ ...prev, [qIdx]: val }));
    };

    const handleSubmit = () => {
        let correct = 0;
        task.questions.forEach((q: any, i: number) => {
            if (answers[i]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) correct++;
        });
        setScore(correct);
        setShowResults(true);
        if (!isCompleted) onComplete();
    };

    const allAnswered = Object.keys(answers).length === task.questions.length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CheckSquare className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title || 'Grammar Practice'}</h2>
                    {isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">✓ Done</span>}
                </div>
            </div>

            {task.lesson && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800">
                    <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Quick Lesson
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-800/80 dark:text-indigo-300/80 italic">
                        {task.lesson}
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {task.questions.map((q: any, qIdx: number) => {
                    const selected = answers[qIdx];
                    const isCorrect = showResults && selected?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                    return (
                        <div key={qIdx} className="bg-white dark:bg-gray-800/80 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                                    {qIdx + 1}
                                </span>
                                <div>
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">{q.instruction}</p>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{q.question}</h4>
                                </div>
                            </div>

                            {q.type === 'fill-in' ? (
                                <input
                                    type="text"
                                    value={selected || ''}
                                    onChange={(e) => handleSelect(qIdx, e.target.value)}
                                    disabled={showResults}
                                    placeholder="Type your answer..."
                                    className={`w-full p-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 outline-none transition-all ${showResults
                                        ? isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                        : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500'
                                        }`}
                                />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((opt: string, oIdx: number) => {
                                        const isSelected = selected === opt;
                                        const isCorrectOpt = showResults && opt === q.correctAnswer;

                                        let cls = 'p-4 rounded-xl border-2 text-left font-medium transition-all cursor-pointer ';
                                        if (isCorrectOpt) cls += 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300';
                                        else if (showResults && isSelected && !isCorrectOpt) cls += 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300';
                                        else if (isSelected) cls += 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-800 dark:text-indigo-300';
                                        else cls += 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300';

                                        return (
                                            <button key={oIdx} onClick={() => handleSelect(qIdx, opt)} className={cls}>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {showResults && !isCorrect && q.type === 'fill-in' && (
                                <p className="mt-2 text-sm text-green-600 font-bold">Correct answer: {q.correctAnswer}</p>
                            )}

                            {showResults && q.explanation && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm border-l-4 border-indigo-500">
                                    <span className="font-bold text-indigo-600 block mb-1">Explanation:</span>
                                    {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center">
                {showResults ? (
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-8 py-4 shadow-lg border border-gray-100 dark:border-gray-700 mb-4">
                            <span className="text-2xl font-black text-gray-900 dark:text-white">{score}/{task.questions.length}</span>
                        </div>
                        <button onClick={() => { setShowResults(false); setAnswers({}); }} className="block text-indigo-600 font-bold hover:underline mx-auto">Try Again</button>
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${allAnswered ? 'bg-indigo-600 text-white hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Check Grammar
                    </button>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
//  WRITING SECTION
// ═══════════════════════════════════════════════════
function WritingSection({ task, onComplete, isCompleted, courseId }: { task: any; onComplete: () => void; isCompleted: boolean; courseId: string }) {
    const [text, setText] = useState('');
    const [showModel, setShowModel] = useState(false);

    // AI Grading States
    const [isGrading, setIsGrading] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const { token } = useContext(AuthContext) || {};

    const words = text.trim().split(/\s+/).filter(x => x).length;

    const handleFinish = async () => {
        if (!text.trim()) return;
        setIsGrading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${courseId}/grade-writing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ promptText: task.prompt, studentEssay: text })
            });
            if (res.ok) {
                const data = await res.json();
                setFeedback(data);
                if (!isCompleted) onComplete();
            } else {
                alert('Failed to get AI feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error grading writing:', error);
        } finally {
            setIsGrading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <PenTool className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Writing Practice</h2>
                    {isCompleted && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">✓ Done</span>}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">{task.taskType || 'Essay'} Task</span>
                </div>

                {task.image && (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                        <img
                            src={task.image}
                            alt="Writing Prompt"
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
                    {task.prompt}
                </h3>

                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-medium">
                        <Clock className="w-4 h-4 text-gray-400" /> {task.durationMinutes || 40} mins
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-medium">
                        <Edit3 className="w-4 h-4 text-gray-400" /> {task.wordLimit || 250} words limit
                    </div>
                </div>

                {task.tips && task.tips.length > 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
                        <h4 className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest mb-2">Trainer Tips</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {task.tips.map((t: string, i: number) => (
                                <li key={i} className="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400" /> {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-bold text-gray-400">YOUR RESPONSE</span>
                    <span className={`text-sm font-bold ${words < (task.wordLimit * 0.8) ? 'text-gray-400' : words > task.wordLimit ? 'text-red-500' : 'text-green-500'}`}>
                        {words} / {task.wordLimit} words
                    </span>
                </div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start writing your essay here..."
                    className="w-full h-80 p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-inner border-2 border-gray-100 dark:border-gray-700 focus:border-orange-500 outline-none resize-none transition-all text-gray-800 dark:text-gray-200 leading-relaxed font-serif"
                />
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleFinish}
                    disabled={isGrading || words === 0}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-extrabold shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                >
                    {isGrading ? <span><Loader2 className="w-5 h-5 animate-spin" /></span> : <span><Sparkles className="w-5 h-5" /></span>}
                    <span>{isGrading ? 'AI is Grading...' : 'Submit to AI Grader'}</span>
                </button>
            </div>

            {/* AI Evaluation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-green-500" /> AI Grading Result
                    </h4>
                    {feedback ? (
                        <div className="space-y-5">
                            {/* Overall Score */}
                            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/10 rounded-2xl px-6 py-4 border border-orange-200 dark:border-orange-800 w-full">
                                <span className="text-4xl font-black text-orange-600 dark:text-orange-400">{feedback.score}<span className="text-xl opacity-50">/ 9</span></span>
                                <span className="text-orange-700 dark:text-orange-300 font-bold uppercase tracking-wider text-sm ml-auto">Overall Band</span>
                            </div>

                            {/* Band Sub-Scores */}
                            {feedback.bandScores && (
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { key: 'taskAchievement', label: 'Task Response', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
                                        { key: 'coherenceCohesion', label: 'Coherence', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
                                        { key: 'lexicalResource', label: 'Lexical', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                                        { key: 'grammaticalRange', label: 'Grammar', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
                                    ].map(({ key, label, color }) => (
                                        <div key={key} className={`rounded-2xl p-3 text-center border ${color}`}>
                                            <span className="block text-2xl font-black">{feedback.bandScores[key] ?? '-'}</span>
                                            <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Explanation */}
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-justify">
                                {feedback.explanation}
                            </div>

                            {/* Suggestions */}
                            {feedback.suggestions && feedback.suggestions.length > 0 && (
                                <div>
                                    <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Key Improvement Areas:</h5>
                                    <ul className="space-y-2">
                                        {feedback.suggestions.map((s: string, i: number) => (
                                            <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="text-orange-500 font-bold">»</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm font-medium text-center px-8">
                            Submit your response to see detailed AI feedback based on IELTS band descriptors (0–9).
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-500" /> Model Answer
                        </h4>
                        <button
                            onClick={() => setShowModel(!showModel)}
                            className="text-orange-500 text-sm font-bold hover:underline"
                        >
                            {showModel ? 'Hide' : 'Reveal'}
                        </button>
                    </div>
                    {showModel ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed italic whitespace-pre-line">
                            {task.modelAnswer || "Model answer still being prepared."}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm font-medium text-center px-8">
                            Finish your draft first, then reveal the model answer to compare!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════
//  LEGACY DAY CONTENT (fallback for days without tasks)
// ═══════════════════════════════════════════════════
function LegacyDayContent({ course, dayData, isCompleted, completing, handleCompleteDay, id }: any) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0B1120] dark:to-[#0d1a2d] pb-24 transition-colors duration-300">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10 w-full">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/courses/${id}`} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Roadmap
                    </Link>
                    <div className="font-bold tracking-widest text-gray-400 uppercase text-xs hidden sm:block">
                        {course?.title}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center max-w-2xl mx-auto">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold px-3 py-1 rounded-full text-sm inline-block mb-4">
                        Day {dayData.dayNumber}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">{dayData.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{dayData.description}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Material</h2>
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: dayData.content }} />
                </div>

                <div className="flex justify-center pt-8">
                    {isCompleted ? (
                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-8 py-4 rounded-2xl border border-green-200 dark:border-green-800 font-bold text-lg shadow-sm">
                            <CheckCircle className="w-6 h-6" /> You completed this section!
                        </div>
                    ) : (
                        <button onClick={handleCompleteDay} disabled={completing}
                            className="bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-2xl font-extrabold text-xl shadow-xl shadow-green-500/30 transition-transform hover:scale-105 flex items-center justify-center min-w-[300px]">
                            {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle className="w-6 h-6 mr-3" /> Mark Day as Complete</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
