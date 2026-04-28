'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { calculatePreparationTime } from '../../utils/scoreCalculation';
import { useTranslation } from '../../hooks/useTranslation';
import { Brain, ArrowRight, BookOpen, Mic, PenTool, Target, Layers, PlayCircle, Clock, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    const [cefrLevel, setCefrLevel] = useState('B1');
    const [targetScore, setTargetScore] = useState(6.5);
    const [studyHours, setStudyHours] = useState(10);
    const [projection, setProjection] = useState({ estimatedWeeks: 0, bandImprovement: 0 });

    const [enrolledCourseData, setEnrolledCourseData] = useState<any>(null);
    const [isLoadingCourse, setIsLoadingCourse] = useState(false);
    const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

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
        }, 300);

        return () => clearTimeout(handler);
    }, [cefrLevel, targetScore, studyHours]);

    // Fetch enrolled course details — clear stale cache when user changes
    useEffect(() => {
        if (!user) {
            setEnrolledCourseData(null);
            sessionStorage.removeItem('enrolledCourseData');
            sessionStorage.removeItem('enrolledCourseUserId');
            return;
        }

        // If user changed, wipe old cache immediately
        const cachedUserId = sessionStorage.getItem('enrolledCourseUserId');
        if (cachedUserId && cachedUserId !== user._id) {
            sessionStorage.removeItem('enrolledCourseData');
            sessionStorage.removeItem('enrolledCourseUserId');
            setEnrolledCourseData(null);
        }

        // Try loading from cache only if it belongs to this user
        if (!user.enrolledCourse) {
            setEnrolledCourseData(null);
            return;
        }

        const cached = sessionStorage.getItem('enrolledCourseData');
        const cachedOwner = sessionStorage.getItem('enrolledCourseUserId');
        if (cached && cachedOwner === user._id) {
            try { setEnrolledCourseData(JSON.parse(cached)); } catch(e) { /* ignore */ }
        }

        const fetchEnrolledCourse = async () => {
            setIsLoadingCourse(true);
            try {
                const res = await fetch(`http://localhost:5000/api/courses/${user.enrolledCourse}`);
                if (res.ok) {
                    const data = await res.json();
                    setEnrolledCourseData(data);
                    sessionStorage.setItem('enrolledCourseData', JSON.stringify(data));
                    sessionStorage.setItem('enrolledCourseUserId', user._id);
                }
            } catch (error) {
                console.error('Failed to fetch enrolled course', error);
            } finally {
                setIsLoadingCourse(false);
            }
        };

        fetchEnrolledCourse();
    }, [user]);

    // Fetch recommended courses if unenrolled
    useEffect(() => {
        const fetchRecommended = async () => {
            if (user && !user.enrolledCourse) {
                try {
                    const res = await fetch('http://localhost:5000/api/courses');
                    if (res.ok) {
                        const courses = await res.json();
                        
                        // Map CEFR to Course Levels
                        const getExpectedLevel = (cefr: string) => {
                            if (['A1', 'A2'].includes(cefr)) return 'Beginner';
                            if (cefr === 'B1') return 'Intermediate';
                            if (cefr === 'B2') return 'Upper Intermediate';
                            return 'Advanced';
                        };
                        
                        const expected = getExpectedLevel(cefrLevel);
                        
                        // Filter matching courses or just fallback to top 2
                        let matched = courses.filter((c: any) => c.level === expected);
                        if (matched.length === 0) matched = courses;
                        
                        setRecommendedCourses(matched.slice(0, 2));
                    }
                } catch (error) {
                    console.error('Failed to fetch recommended courses', error);
                }
            }
        };
        fetchRecommended();
    }, [user, cefrLevel]);

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 min-h-screen flex items-center justify-center">Loading your dashboard...</div>;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B1120]">
                <h1 className="text-2xl font-bold dark:text-white">{t.dashboard.pleaseLogin}</h1>
            </div>
        );
    }

    // Prepare quick actions array
    const quickActions = [
        { title: 'AI Speaking Room', desc: 'Practice speaking with immediate AI feedback', icon: Mic, link: '/practice/speaking', color: 'from-blue-500 to-cyan-500' },
        { title: 'Essay Grading', desc: 'Get your IELTS essays graded by AI in seconds', icon: PenTool, link: '/practice/writing', color: 'from-purple-500 to-pink-500' },
        { title: 'Mock Test', desc: 'Simulate full realistic IELTS Mock Exams', icon: Target, link: '/mock-exams', color: 'from-orange-500 to-red-500' },
        { title: 'Materials library', desc: 'Browse curated reading & listening materials', icon: Layers, link: '/materials', color: 'from-emerald-400 to-teal-500' },
    ];

    const completedDaysCount = user.completedCourseDays?.length || 0;
    const totalDays = enrolledCourseData?.durationDays || 30;
    const progressPercent = enrolledCourseData ? Math.round((completedDaysCount / totalDays) * 100) : 0;

    // Provide progress feedback heuristic
    const getProgressFeedback = () => {
        if (!enrolledCourseData) return null;
        if (completedDaysCount === 0) {
            return {
                status: "Getting Started",
                message: "You haven't started yet. Try completing Day 1 today to build momentum!",
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-900/20",
                icon: PlayCircle
            };
        }
        if (completedDaysCount >= totalDays) {
            return {
                status: "Completed",
                message: "Congratulations! You've successfully finished this course.",
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                icon: Trophy
            };
        }
        
        let estWeeks = projection.estimatedWeeks || 4;
        let pPace = Math.ceil(totalDays / estWeeks);
        if (pPace <= 0 || !isFinite(pPace)) pPace = 3;
        
        return {
            status: "In Progress",
            message: `AI Insight: To hit your goal of IELTS ${targetScore} on time, aim to complete at least ${pPace} lessons per week. Consistency is key!`,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800",
            icon: Brain
        };
    };
    
    const progressFeedback = getProgressFeedback();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 pb-12">
            
            {/* ─── UNIFIED HEADER BANNER ─── */}
            <div className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800 pt-10 pb-16 px-4 md:px-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                            Welcome back, <span className="text-blue-600 dark:text-blue-400">{user.name}</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Ready to conquer your learning goals today? Consistent practice is key.
                        </p>
                    </div>
                    
                    {/* Header Widgets */}
                    <div className="flex flex-wrap items-stretch gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-center min-w-[120px]">
                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500" /> Current</div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{cefrLevel}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col justify-center min-w-[140px]">
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Target</div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white">IELTS {targetScore.toFixed(1)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── MAIN CONTENT AREA ─── */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 relative z-10 space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column (Wider) */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Placement Assessment Banner */}
                        {!user.hasTakenPlacementTest && user.role !== 'ADMIN' && user.role !== 'ROOT' && (
                            <div className="bg-blue-600 rounded-[2rem] p-6 md:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between text-white border border-blue-700/50 relative overflow-hidden group hover:shadow-xl transition-all">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                                    <Brain className="w-48 h-48" />
                                </div>
                                <div className="relative z-10 mb-6 md:mb-0 md:pr-8 flex items-start sm:items-center gap-5">
                                    <div className="p-4 bg-white/20 rounded-2xl shrink-0 backdrop-blur-sm hidden sm:block border border-white/20">
                                        <Brain className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold mb-2">Begin your journey correctly</h2>
                                        <p className="text-blue-100 leading-relaxed max-w-xl">Take a quick AI-powered assessment to evaluate your exact level and unlock a personalized study roadmap.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/placement-test')}
                                    className="relative z-10 shrink-0 whitespace-nowrap bg-white text-blue-700 hover:bg-gray-50 font-bold rounded-xl text-lg px-8 py-4 inline-flex items-center justify-center transition-all shadow-md active:scale-95 border border-white"
                                >
                                    Take Assessment <ArrowRight className="w-5 h-5 ml-2 text-blue-500" />
                                </button>
                            </div>
                        )}

                        {/* Continue Learning Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-indigo-500" /> Continue Learning
                            </h2>
                            {isLoadingCourse && !enrolledCourseData ? (
                                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 flex justify-center items-center opacity-50">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : enrolledCourseData ? (
                                <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md group flex flex-col">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                    {enrolledCourseData.targetType}
                                                </span>
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                                    {enrolledCourseData.level}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                                {enrolledCourseData.title}
                                            </h3>
                                        </div>
                                        <button 
                                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                                            onClick={() => router.push(`/courses/${user.enrolledCourse}`)}
                                        >
                                            <PlayCircle className="w-5 h-5 fill-white" /> Resume Study
                                        </button>
                                    </div>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 mt-auto">
                                        <div className="flex justify-between text-sm font-bold mb-3">
                                            <span className="text-gray-700 dark:text-gray-300">Course Progress</span>
                                            <span className="text-blue-600 dark:text-blue-400">{progressPercent}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                                            <div 
                                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Day {completedDaysCount} completed</span>
                                            <span>{totalDays - completedDaysCount} days left</span>
                                        </div>
                                    </div>
                                    
                                    {/* Evaluation / Recommendation Widget */}
                                    {progressFeedback && (
                                        <div className={`mt-4 p-4 rounded-xl flex items-start sm:items-center gap-3 ${progressFeedback.bg} transition-colors border-0`}>
                                            <div className={`p-2 bg-white dark:bg-[#0f172a] rounded-lg shadow-sm ${progressFeedback.color}`}>
                                                <progressFeedback.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 ${progressFeedback.color}`}>
                                                    {progressFeedback.status}
                                                </span>
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {progressFeedback.message}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : recommendedCourses.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-bl-lg">
                                            Recommended for you
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Based on your {cefrLevel} level</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {recommendedCourses.map((course) => (
                                                <div key={course._id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors flex flex-col justify-between">
                                                    <div>
                                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 block">{course.targetType} • {course.level}</span>
                                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">{course.title}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{course.description}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => router.push(`/courses/${course._id}`)}
                                                        className="w-full text-center bg-gray-50 hover:bg-indigo-50 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30 text-sm font-semibold py-2 rounded-lg transition-colors"
                                                    >
                                                        View Course
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => router.push('/courses')}
                                        className="w-full bg-gray-50 dark:bg-[#0f172a] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium px-4 py-3 rounded-xl transition-colors border border-gray-200 dark:border-gray-800"
                                    >
                                        Browse all courses
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-8 border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                                    <p className="mb-4">You are not currently enrolled in any course.</p>
                                    <button 
                                        onClick={() => router.push('/courses')}
                                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Browse Courses
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions Grid */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {quickActions.map((action, idx) => {
                                    const IconNode = action.icon;
                                    return (
                                        <div 
                                            key={idx}
                                            onClick={() => router.push(action.link)}
                                            className="group bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                                <IconNode className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Sidebar style) */}
                    <div className="space-y-8">
                        {/* Projection Widget */}
                        <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 top-8 sticky">
                            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-blue-500" /> Goal Projection
                            </h3>

                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Current CEFR</label>
                                    <select
                                        value={cefrLevel}
                                        onChange={(e) => setCefrLevel(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 px-4 transition-colors outline-none font-medium appearance-none"
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
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Target IELTS</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0" max="9"
                                        value={targetScore}
                                        onChange={(e) => setTargetScore(parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 px-4 outline-none font-medium"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Study Pace</label>
                                        <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{studyHours}h/wk</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1" max="40"
                                        value={studyHours}
                                        onChange={(e) => setStudyHours(parseInt(e.target.value))}
                                        className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden">
                                {projection.bandImprovement <= 0 ? (
                                    <div className="py-4">
                                        <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                                            {t.dashboard.reachedTarget || 'You have already reached your target!'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Jump</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">+{projection.bandImprovement.toFixed(1)}</p>
                                        </div>
                                        <div className="border-l border-slate-200 dark:border-slate-700">
                                            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Duration</p>
                                            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                                {projection.estimatedWeeks} <span className="text-sm font-bold text-gray-400">wks</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4 font-medium">
                                *Estimates based on CEFR guided hours equivalent
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
