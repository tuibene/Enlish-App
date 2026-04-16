'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Circle, Lock, ArrowRight, Play, BookOpen, Clock, Target } from 'lucide-react';
import Link from 'next/link';

export default function CourseRoadmapPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, token, setAuthData } = useContext(AuthContext) || {};

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id as string}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                }
            } catch (error) {
                console.error('Failed to fetch course details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleEnroll = async () => {
        if (!user) {
            router.push('/login');
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
            router.push('/login');
            return;
        }

        setEnrolling(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id as string}/purchase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (setAuthData) {
                    setAuthData({ ...user, purchasedCourses: data.purchasedCourses }, token as string);
                }
                alert('Payment Successful! Course Unlocked.');
            } else {
                const errData = await res.json();
                alert(errData.message || 'Payment failed.');
            }
        } catch (error) {
            console.error('Purchase failed', error);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading || !course) {
        return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    const isEnrolled = user && user.enrolledCourse === id;
    const hasPurchased = user && user.purchasedCourses?.includes(id as string);
    const needToBuy = course.isPremium && !hasPurchased;

    const completedDays = user && isEnrolled && user.completedCourseDays ? user.completedCourseDays : [];

    // Calculate progress percentage
    const progressPerc = Math.round((completedDays.length / course.days.length) * 100) || 0;

    return (
        <div className="min-h-screen bg-roadmap bg-white/30 dark:bg-black/50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Course Header Banner */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative">
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
                            {course.isPremium && (
                                <div className="flex items-center gap-2 text-orange-500 bg-orange-100 dark:bg-orange-950/30 px-3 py-1.5 rounded-full font-bold">
                                    {course.price.toLocaleString('vi-VN')} VNĐ
                                </div>
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
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform hover:-translate-y-1 shadow-xl shadow-blue-500/30 flex items-center justify-center"
                            >
                                {enrolling ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Play className="w-6 h-6 mr-2" /> Start 30-Day Sprint</>}
                            </button>
                        ) : (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="w-full">
                                    <div className="flex justify-between font-bold text-blue-900 dark:text-blue-200 mb-2">
                                        <span>Current Progress</span>
                                        <span>{progressPerc}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-3">
                                        <div className="bg-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPerc}%` }}></div>
                                    </div>
                                    <p className="text-sm mt-2 text-blue-700 dark:text-blue-300 opacity-80">You have completed {completedDays.length} out of {course.days.length} days.</p>
                                </div>
                                <Link 
                                    href={`/courses/${id as string}/day/${completedDays.length + 1 <= course.days.length ? completedDays.length + 1 : course.days.length}`}
                                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-colors whitespace-nowrap"
                                >
                                    {completedDays.length === 0 ? 'Start Day 1' : completedDays.length === course.days.length ? 'Review Course' : 'Continue Course'}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-10 flex items-center gap-3">
                        <Target className="text-red-500 w-8 h-8" /> Curriculum Syllabus
                    </h2>
                    
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                        {course.days.map((day: any, index: number) => {
                            const isCompleted = completedDays.includes(day.dayNumber);
                            const isNext = isEnrolled && !isCompleted && completedDays.length + 1 === day.dayNumber;
                            const isLocked = isEnrolled && !isCompleted && !isNext;

                            return (
                                <div key={day._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 
                                        ${isCompleted ? 'bg-green-500 border-green-200 dark:border-green-900 text-white' : 
                                          isNext ? 'bg-blue-600 border-blue-200 dark:border-blue-900 text-white ring-4 ring-blue-500/30' : 
                                          'bg-gray-100 dark:bg-gray-700 border-white dark:border-gray-800 text-gray-400'}`}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                                         isNext ? <ArrowRight className="w-5 h-5 animate-pulse" /> : 
                                          isLocked ? <Lock className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    </div>
                                    
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/80 dark:bg-[#0B1120]/80/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition duration-300 hover:shadow-md cursor-pointer group-hover:-translate-y-1">
                                        <div className="flex flex-col justify-between">
                                            <div className="mb-3">
                                                <h3 className={`font-bold text-lg mb-1 flex items-center justify-between ${isNext ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                    <span>{day.title}</span>
                                                    {isCompleted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Done</span>}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{day.description}</p>
                                            </div>
                                            
                                            {isEnrolled && (
                                                <Link 
                                                    href={isLocked ? '#' : `/courses/${id as string}/day/${day.dayNumber}`}
                                                    className={`mt-2 font-semibold text-sm flex items-center gap-1 w-max ${isLocked ? 'text-gray-400 cursor-not-allowed hidden' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}
                                                >
                                                    {isCompleted ? 'Review Lesson' : 'Start Lesson'} <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
