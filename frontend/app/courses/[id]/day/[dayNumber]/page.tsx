'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function DayContentPage() {
    const { id, dayNumber } = useParams();
    const router = useRouter();
    const { user, token, setAuthData } = useContext(AuthContext) || {};

    const [course, setCourse] = useState<any>(null);
    const [dayData, setDayData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchCourse = async () => {
            try {
                // Fetch the entire course to get the embedded day
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id as string}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                    const dayObj = data.days.find((d: any) => d.dayNumber === parseInt(dayNumber as string, 10));
                    setDayData(dayObj);
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
                router.push(`/courses/${id as string}`); // Send them back to roadmap
            } else {
                alert("Failed to mark day as complete");
            }
        } catch (error) {
            console.error('Completion error', error);
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    if (!course || !dayData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 text-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson Not Found</h1>
                    <p className="text-gray-500">The curriculum for this day is still being authored.</p>
                    <Link href={`/courses/${id as string}`} className="mt-6 inline-block text-blue-600 hover:underline">
                        <ArrowLeft className="inline w-4 h-4 mr-1"/> Back to Syllabus
                    </Link>
                </div>
            </div>
        );
    }

    const isCompleted = user && user.completedCourseDays && user.completedCourseDays.includes(parseInt(dayNumber as string, 10));

    return (
        <div className="min-h-screen bg-roadmap bg-white/30 dark:bg-black/50 pb-24 transition-colors duration-300">
            {/* Header Navbar */}
            <div className="bg-white/40 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 w-full bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/courses/${id as string}`} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Roadmap
                    </Link>
                    <div className="font-bold tracking-widest text-gray-400 uppercase text-xs hidden sm:block">
                        {course?.title}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-6 lg:px-8 space-y-12">
                
                {/* Intro Block */}
                <div className="text-center max-w-2xl mx-auto">
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold px-3 py-1 rounded-full text-sm inline-block mb-4 shadow-sm border border-blue-200 dark:border-blue-800">
                        Day {dayData.dayNumber}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                        {dayData.title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {dayData.description}
                    </p>
                </div>

                {/* Lesson HTML Content Rendered securely */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Material</h2>
                    </div>
                    
                    {/* Render raw HTML from DB logic - using dangerouslySetInnerHTML */}
                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed" 
                         dangerouslySetInnerHTML={{ __html: dayData.content }} />
                </div>

                {/* Completion Action */}
                <div className="flex justify-center pt-8">
                    {isCompleted ? (
                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-8 py-4 rounded-2xl border border-green-200 dark:border-green-800 font-bold text-lg shadow-sm">
                            <CheckCircle className="w-6 h-6" /> You completed this section!
                        </div>
                    ) : (
                        <button 
                            onClick={handleCompleteDay}
                            disabled={completing}
                            className="bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-2xl font-extrabold text-xl shadow-xl shadow-green-500/30 transition-transform hover:scale-105 flex items-center justify-center min-w-[300px]"
                        >
                            {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle className="w-6 h-6 mr-3" /> Mark Day as Complete</>}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
