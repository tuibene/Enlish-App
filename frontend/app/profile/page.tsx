'use client';

import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Camera, Edit2, Loader2, Trophy, Clock, Target as TargetIcon, Play, BookOpen, Star, Mail, LayoutDashboard, Crown, X, Save } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, token, setAuthData } = useContext(AuthContext) || {};
    const [uploading, setUploading] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [enrolledCourseData, setEnrolledCourseData] = useState<any>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        cefrLevel: '',
        targetScore: 0,
        studyHoursPerWeek: 0
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && user?.enrolledCourse && !enrolledCourseData) {
            const cached = sessionStorage.getItem(`course_${user.enrolledCourse}`);
            if (cached) {
                try { setEnrolledCourseData(JSON.parse(cached)); } catch(e) { /* ignore */ }
            }
        }
    }, [user?.enrolledCourse, enrolledCourseData]);

    useEffect(() => {
        if (user && !isEditing) {
            setEditData({
                name: user.name || '',
                cefrLevel: user.cefrLevel || '',
                targetScore: user.targetScore || 0,
                studyHoursPerWeek: user.studyHoursPerWeek || 0
            });
        }
    }, [user, isEditing]);

    useEffect(() => {
        if (user?.enrolledCourse && token && !enrolledCourseData) {
            const fetchCourse = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${user.enrolledCourse}`);
                    if (res.ok) {
                        const data = await res.json();
                        setEnrolledCourseData(data);
                        sessionStorage.setItem(`course_${user.enrolledCourse}`, JSON.stringify(data));
                    }
                } catch(e) { console.error('Error fetching course', e) }
            };
            fetchCourse();
        }
    }, [user?.enrolledCourse, token]);

    if (!user) {
        return <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0B1120] dark:to-[#0d1a2d]"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
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

    const handleCoverClick = () => {
        coverInputRef.current?.click();
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        setUploadingCover(true);
        const formData = new FormData();
        formData.append('coverImage', file);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token as string}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                if (setAuthData) {
                    setAuthData(data, data.token || token as string);
                }
            } else {
                alert('Failed to upload cover image.');
            }
        } catch (error) {
            console.error('Error uploading cover:', error);
            alert('An error occurred during upload.');
        } finally {
            setUploadingCover(false);
            if (coverInputRef.current) coverInputRef.current.value = '';
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                const data = await res.json();
                if (setAuthData) {
                    setAuthData(data, data.token || token as string);
                }
                setIsEditing(false);
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred during update.');
        } finally {
            setSaving(false);
        }
    };

    const completedDaysCount = user.completedCourseDays?.length || 0;
    const totalDays = enrolledCourseData?.days?.length || 30;
    const progressPerc = Math.round((completedDaysCount / totalDays) * 100) || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0B1120] dark:via-[#0d1525] dark:to-[#0d1a2d] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-10 relative z-10">
                
                {/* ─── ENHANCED HERO PROFILE CARD ─── */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden relative">
                    {/* Decorative abstract shapes */}
                    <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-3xl rounded-full pointer-events-none" />
                    
                    <div 
                        className="h-40 md:h-56 w-full relative overflow-hidden group cursor-pointer"
                        style={{
                            backgroundImage: user.coverImage ? `url("${user.coverImage.startsWith('http') ? user.coverImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.coverImage}`}")` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        onClick={handleCoverClick}
                    >
                        {!user.coverImage && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                        
                        {uploadingCover ? (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white z-10 font-bold">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Uploading Cover...
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10">
                                <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-10 h-10" />
                            </div>
                        )}
                        <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
                    </div>
                    
                    <div className="px-8 md:px-12 pb-10 relative">
                        {/* Avatar */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-20">
                            <div className="relative group shrink-0">
                                <div className="w-36 h-36 md:w-44 md:h-44 rounded-[2rem] border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-2xl overflow-hidden cursor-pointer transform transition-transform group-hover:scale-105" onClick={handleAvatarClick}>
                                    {uploading ? (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 font-bold text-sm">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                            Syncing...
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center z-10">
                                            <Camera className="text-white opacity-0 group-hover:opacity-100 duration-300 w-10 h-10" />
                                        </div>
                                    )}
                                    {user.avatar ? (
                                        <img src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-6xl font-black pb-2">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                </div>
                                {/* Role Badge floating on avatar */}
                                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-teal-400 to-emerald-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 uppercase tracking-widest flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    {user.role}
                                </div>
                            </div>
                            
                            <div className="flex-1 pb-2">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                    {user.name} 
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-400 font-medium">
                                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
                                    <span className="hidden sm:inline opacity-50">|</span>
                                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-widest dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> AI Learner
                                    </span>
                                </div>
                            </div>

                            <div className="pb-4 shrink-0">
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── ACADEMIC SNAPSHOT GRID ─── */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Academic Snapshot</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CEFR Card */}
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all hover:-translate-y-1 group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <LayoutDashboard className="w-7 h-7" />
                                </div>
                                <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm">CEFR Level</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">{user.cefrLevel}</p>
                                <p className="text-sm font-semibold text-green-500 mb-2">Verified</p>
                            </div>
                        </div>

                        {/* Target Card */}
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all hover:-translate-y-1 group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                                    <TargetIcon className="w-7 h-7" />
                                </div>
                                <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm">Target Score</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">{user.targetScore}</p>
                                <p className="text-sm font-semibold text-indigo-500 mb-2">IELTS Band</p>
                            </div>
                        </div>

                        {/* Commitment Card */}
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all hover:-translate-y-1 group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-sm">Commitment</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">{user.studyHoursPerWeek}</p>
                                <p className="text-lg font-bold text-gray-500 mb-1">hrs/week</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── ACTIVE ROADMAP WIDGET ─── */}
                {enrolledCourseData && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                                <Play className="w-6 h-6 text-blue-500 fill-blue-500" /> Active Roadmap
                            </h2>
                            <Link href="/courses" className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">
                                Browse all courses &rarr;
                            </Link>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 md:p-10 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative transition-all hover:shadow-xl group">
                            
                            <div className="relative z-10 flex flex-col xl:flex-row gap-10 xl:items-center">
                                <div className="flex-1">
                                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-6 border border-blue-200 dark:border-blue-800/50">
                                        {enrolledCourseData.targetType} Preparation
                                    </span>
                                    <h3 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 dark:text-white leading-tight">
                                        {enrolledCourseData.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed mb-8">
                                        {enrolledCourseData.description || "Stay consistent and complete your daily missions to achieve your precise target score."}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-600">
                                            <Clock className="w-4 h-4 text-amber-500" /> {enrolledCourseData.durationDays} Days
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-600">
                                            <Trophy className="w-4 h-4 text-indigo-500" /> {enrolledCourseData.level}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full xl:w-[380px] shrink-0 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="font-extrabold text-gray-500 dark:text-gray-400 text-xs tracking-widest uppercase">Completion</span>
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">{progressPerc}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                                        <div className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPerc}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center mb-8">
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                            {completedDaysCount} of {totalDays} days done
                                        </p>
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {totalDays - completedDaysCount} left
                                        </p>
                                    </div>
                                    
                                    <Link 
                                        href={`/courses/${user.enrolledCourse}`}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Play className="w-5 h-5 fill-white" /> Resume Course
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── EDIT PROFILE MODAL ─── */}
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Edit Profile</h2>
                                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4 text-left">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={editData.name} 
                                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">CEFR Level</label>
                                            <select 
                                                value={editData.cefrLevel}
                                                onChange={(e) => setEditData({...editData, cefrLevel: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                                            >
                                                <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option>
                                                <option value="B2">B2</option><option value="C1">C1</option><option value="C2">C2</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Score (IELTS)</label>
                                            <input 
                                                type="number" step="0.5" max="9.0" min="0"
                                                value={editData.targetScore} 
                                                onChange={(e) => setEditData({...editData, targetScore: parseFloat(e.target.value) || 0})}
                                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Study Commitment (hrs/week)</label>
                                        <input 
                                            type="number" min="0" max="168"
                                            value={editData.studyHoursPerWeek} 
                                            onChange={(e) => setEditData({...editData, studyHoursPerWeek: parseInt(e.target.value) || 0})}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-4 rounded-xl font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
