'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Target, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses`);
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-roadmap bg-white/30 dark:bg-black/50 transition-colors duration-300 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">

                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Learning Roadmaps & Masterclasses</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Stop guessing what to study. Enroll in our day-by-day structured roadmaps or unlock premium masterclasses guaranteed to hit your target score.
                    </p>
                </div>

                {/* Premium Masterclasses Section */}
                {courses.filter(c => c.isPremium).length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                            <Sparkles className="w-8 h-8 text-orange-500" />
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Premium Masterclasses</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.filter(c => c.isPremium).map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Free Roadmaps Section */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Structured Study Roadmaps</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.filter(c => !c.isPremium).map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable Course Card Component
function CourseCard({ course }: { course: any }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group flex flex-col relative">
            {course.isPremium && (
                <div className="absolute top-4 right-4 z-10">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {course.price.toLocaleString('vi-VN')} VND
                    </span>
                </div>
            )}
            <div className="h-48 overflow-hidden relative">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md bg-opacity-90">
                        <Target className="w-3 h-3" /> {course.targetType}
                    </span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{course.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                    {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-emerald-500" /> {course.durationDays} Days</span>
                    <span className="flex items-center gap-1.5 font-medium"><BookOpen className="w-4 h-4 text-purple-500" /> {course.level}</span>
                </div>

                <Link
                    href={`/courses/${course._id}`}
                    className={`w-full block text-center px-6 py-3.5 rounded-xl font-bold transition-all shadow-md mt-auto ${course.isPremium
                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30"
                            : "bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white"
                        }`}
                >
                    {course.isPremium ? 'View Details' : 'View Syllabus'} <ArrowRight className="w-4 h-4 inline-block ml-1" />
                </Link>
            </div>
        </div>
    );
}

