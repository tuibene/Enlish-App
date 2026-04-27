'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Plus, Edit2, Trash2, ArrowLeft, X, Activity, DollarSign, Calendar } from 'lucide-react';

interface Course {
    _id: string;
    title: string;
    description: string;
    targetType: string;
    durationDays: number;
    level: string;
    isPremium: boolean;
    price: number;
}

export default function AdminCourses() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetType: 'IELTS',
        durationDays: 30,
        level: 'Intermediate',
        isPremium: false,
        price: 0
    });

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT'))) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses`);
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'ROOT') {
            fetchCourses();
        }
    }, [user]);

    const openModal = (course?: Course) => {
        setImageFile(null);
        if (course) {
            setEditingId(course._id);
            setFormData({
                title: course.title,
                description: course.description,
                targetType: course.targetType,
                durationDays: course.durationDays,
                level: course.level,
                isPremium: course.isPremium,
                price: course.price
            });
        } else {
            setEditingId(null);
            setFormData({ title: '', description: '', targetType: 'IELTS', durationDays: 30, level: 'Intermediate', isPremium: false, price: 0 });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course entirely?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCourses(courses.filter(c => c._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId 
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses`;

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('targetType', formData.targetType);
            data.append('durationDays', formData.durationDays.toString());
            data.append('level', formData.level);
            data.append('isPremium', formData.isPremium.toString());
            data.append('price', formData.price.toString());
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            const res = await fetch(url, {
                method,
                headers: { 
                    Authorization: `Bearer ${token}` 
                },
                body: data
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchCourses();
            } else {
                alert('Failed to save course. Check console.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 pb-24 transition-colors">
            {/* Admin Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 w-full sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => router.push('/admin')} className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Admin Hub
                    </button>
                    <div className="font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <BookOpen className="w-5 h-5" /> Course Management CMS
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roadmaps & Premium Courses</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage global curriculum settings, pricing, and 30-day tracking logic.</p>
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Create Master Course
                    </button>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden group">
                            {course.isPremium && (
                                <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <DollarSign className="w-3 h-3" /> Premium
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight pr-24">{course.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                {course.description}
                            </p>
                            
                            <div className="mb-6 flex flex-wrap gap-2 text-xs">
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-medium">{course.targetType}</span>
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-medium">{course.level}</span>
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-medium">{course.durationDays} Days</span>
                            </div>

                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                    {course.isPremium ? `${course.price.toLocaleString('vi-VN')} VND` : 'Free'}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => router.push(`/admin/courses/${course._id}`)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                        title="Manage Course Days"
                                    >
                                        <Calendar className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => openModal(course)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(course._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {courses.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Courses Found</h3>
                            <p className="text-gray-500">Click the button above to create the first roadmap or premium masterclass.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4">
                            {editingId ? 'Edit Master Course' : 'Create Master Course'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Course Title</label>
                                <input 
                                    type="text" required
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    placeholder="E.g., IELTS Mastery 7.5+"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea 
                                    required rows={3}
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cover Image (Optional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setImageFile(e.target.files[0]);
                                        }
                                    }}
                                    className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                                />
                                {imageFile && <p className="text-xs text-indigo-600 mt-2">Selected: {imageFile.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Exam</label>
                                    <select 
                                        value={formData.targetType} onChange={e => setFormData({...formData, targetType: e.target.value})}
                                        className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="IELTS">IELTS</option>
                                        <option value="TOEIC">TOEIC</option>
                                        <option value="GENERAL">General English</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Proficiency Level</label>
                                    <select 
                                        value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}
                                        className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duration (Days)</label>
                                    <input 
                                        type="number" min="1" required
                                        value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value) || 0})}
                                        className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    />
                                </div>
                                <div className="space-y-4 pt-4 flex flex-col justify-end">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.isPremium} 
                                                onChange={e => setFormData({...formData, isPremium: e.target.checked})}
                                                className="sr-only" 
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isPremium ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isPremium ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1 group-hover:text-orange-500 transition-colors">
                                            <DollarSign className="w-4 h-4" /> Is Premium?
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {formData.isPremium && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 text-orange-600 dark:text-orange-400">Price (VND)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" min="0" required
                                            value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                                            className="w-full bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
                                            placeholder="500000"
                                        />
                                        <span className="absolute right-4 top-3 font-bold text-orange-500">VNĐ</span>
                                    </div>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Display format: {formData.price.toLocaleString('vi-VN')} VND</p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <button 
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-indigo-600/30"
                                >
                                    {editingId ? 'Update Master Course' : 'Publish Master Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
