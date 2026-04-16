'use client';

import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Camera, Edit2, Loader2, Trophy, Loader, Clock, Target, Target as TargetIcon, Play, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, token, setAuthData } = useContext(AuthContext) || {};
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [enrolledCourseData, setEnrolledCourseData] = useState<any>(null);

    useEffect(() => {
        if (user?.enrolledCourse && token) {
            const fetchCourse = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${user.enrolledCourse}`);
                    if (res.ok) {
                        const data = await res.json();
                        setEnrolledCourseData(data);
                    }
                } catch(e) { console.error('Error fetching course', e) }
            };
            fetchCourse();
        }
    }, [user?.enrolledCourse, token]);

    if (!user) {
        return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const tempToken = token as string;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${tempToken}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (setAuthData) {
                    setAuthData(data, data.token || tempToken);
                }
            } else {
                alert('Failed to upload avatar.');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('An error occurred during upload.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Calculate course progress
    const completedDaysCount = user.completedCourseDays?.length || 0;
    const totalDays = enrolledCourseData?.days?.length || 30;
    const progressPerc = Math.round((completedDaysCount / totalDays) * 100);

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Hero Section */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 w-full relative"></div>
                    <div className="px-8 pb-8 relative">
                        
                        {/* Avatar Upload Zone */}
                        <div className="relative -mt-16 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-xl overflow-hidden group cursor-pointer" onClick={handleAvatarClick}>
                            {uploading ? (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10 font-medium text-xs">
                                    <Loader2 className="w-6 h-6 animate-spin mb-1" /> uploading
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center z-10">
                                    <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                                </div>
                            )}
                            {user.avatar ? (
                                <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-blue-100 to-blue-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-blue-500 dark:text-gray-300 text-5xl font-extrabold pb-2">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                    {user.name} 
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider align-middle dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        AI Verified
                                    </span>
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                            </div>
                            <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 text-sm shadow-sm">
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Academic Snapshot */}
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white pt-4">Academic Snapshot</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-gray-600 dark:text-gray-400">CEFR Level</span>
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{user.cefrLevel}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                                <TargetIcon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-gray-600 dark:text-gray-400">Target Score</span>
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{user.targetScore}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-gray-600 dark:text-gray-400">Commitment</span>
                        </div>
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                            {user.studyHoursPerWeek} <span className="text-lg text-gray-500 font-medium">hrs/week</span>
                        </p>
                    </div>
                </div>

                {/* Enrolled Course Progress Widget */}
                {enrolledCourseData && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Active Roadmap</h2>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-700">
                                <Target className="w-64 h-64" />
                            </div>
                            
                            <div className="relative z-10">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-100 border border-white/10 mb-4 inline-block">
                                    {enrolledCourseData.targetType} Preparation
                                </span>
                                <h3 className="text-3xl font-extrabold mb-2">{enrolledCourseData.title}</h3>
                                
                                <div className="flex items-center gap-6 mt-6 mb-8 text-sm font-medium text-blue-100">
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {enrolledCourseData.durationDays} Days</div>
                                    <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {enrolledCourseData.level}</div>
                                </div>

                                <div className="bg-black/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="font-bold text-blue-100 text-sm tracking-wide uppercase">Roadmap Progress</span>
                                            <span className="text-2xl font-extrabold">{progressPerc}%</span>
                                        </div>
                                        <div className="w-full bg-black/30 rounded-full h-3 mb-2 overflow-hidden border border-white/5">
                                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPerc}%` }}></div>
                                        </div>
                                        <p className="text-sm font-medium text-blue-200/80">
                                            {completedDaysCount} of {totalDays} days completed
                                        </p>
                                    </div>
                                    
                                    <Link 
                                        href={`/courses/${user.enrolledCourse}`}
                                        className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                                    >
                                        <Play className="w-5 h-5" /> Continue Learning
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
