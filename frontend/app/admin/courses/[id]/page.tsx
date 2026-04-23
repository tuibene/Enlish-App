'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
    ArrowLeft, Plus, Trash2, Save, ChevronRight, ChevronDown, 
    Book, Type, FileText, Headphones, Mic, PenTool, Activity, 
    PlusCircle, X, CheckCircle2, AlertCircle, Layers, Upload
} from 'lucide-react';

interface Course {
    _id: string;
    title: string;
    targetType: string;
    days: any[];
}

const PHASES = ['Foundation', 'Building', 'Advanced', 'Mock Test'];
const SKILLS = [
    { id: 'vocabulary', label: 'Vocabulary', icon: <Book className="w-4 h-4" /> },
    { id: 'grammar', label: 'Grammar', icon: <Type className="w-4 h-4" /> },
    { id: 'reading', label: 'Reading', icon: <FileText className="w-4 h-4" /> },
    { id: 'listening', label: 'Listening', icon: <Headphones className="w-4 h-4" /> },
    { id: 'speaking', label: 'Speaking', icon: <Mic className="w-4 h-4" /> },
    { id: 'writing', label: 'Writing', icon: <PenTool className="w-4 h-4" /> },
];

export default function CourseDetailAdmin() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('vocabulary');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Local state for the day being edited
    const [editingDay, setEditingDay] = useState<any>(null);
    const [uploading, setUploading] = useState<string | null>(null); // 'listening' | 'writing' | null

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT'))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const fetchCourse = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCourse(data);
                if (data.days && data.days.length > 0 && selectedDayIndex === null) {
                    setSelectedDayIndex(0);
                    setEditingDay(JSON.parse(JSON.stringify(data.days[0])));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'ROOT') {
            fetchCourse();
        }
    }, [user, id]);

    const handleSelectDay = (index: number) => {
        setSelectedDayIndex(index);
        setEditingDay(JSON.parse(JSON.stringify(course?.days[index])));
        setMessage({ type: '', text: '' });
    };

    const handleAddDay = async () => {
        try {
            const token = localStorage.getItem('token');
            const nextDayNum = (course?.days?.length || 0) + 1;
            const newDayData = {
                dayNumber: nextDayNum,
                title: `Day ${nextDayNum}: New Topic`,
                description: 'Description for this day...',
                phase: 'Foundation',
                content: '',
                tasks: {
                    vocabulary: [],
                    grammar: { title: '', lesson: '', questions: [] },
                    reading: { title: '', passage: '', questions: [] },
                    listening: { title: '', audioUrl: '', transcript: '', questions: [] },
                    speaking: { prompt: '', tips: [] },
                    writing: { prompt: '', criteria: [], durationMinutes: 40, wordLimit: 250 }
                }
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id}/days`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(newDayData)
            });

            if (res.ok) {
                await fetchCourse();
                // Select the newly added day
                const updatedCourseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const updatedData = await updatedCourseRes.json();
                handleSelectDay(updatedData.days.length - 1);
                setMessage({ type: 'success', text: 'Added new day successfully!' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveDay = async () => {
        if (!editingDay || !course) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id}/days/${editingDay._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(editingDay)
            });

            if (res.ok) {
                const updatedDay = await res.json();
                // Update course local state
                const newDays = [...course.days];
                newDays[selectedDayIndex!] = updatedDay;
                setCourse({ ...course, days: newDays });
                setMessage({ type: 'success', text: 'Saved day contents successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save changes.' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'An error occurred during save.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleDeleteDay = async (dayId: string, index: number) => {
        if (!confirm('Are you sure you want to delete this day? This will remove all skills content.')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${id}/days/${dayId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchCourse();
                if (selectedDayIndex === index) {
                    setSelectedDayIndex(null);
                    setEditingDay(null);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- Helper functions for dynamic fields ---
    const addVocab = () => {
        const tasks = { ...editingDay.tasks };
        if (!tasks.vocabulary) tasks.vocabulary = [];
        tasks.vocabulary.push({ word: '', phonetic: '', definition: '', example: '', vietnameseMeaning: '' });
        setEditingDay({ ...editingDay, tasks });
    };

    const removeVocab = (index: number) => {
        const tasks = { ...editingDay.tasks };
        tasks.vocabulary.splice(index, 1);
        setEditingDay({ ...editingDay, tasks });
    };

    const addQuestion = (skill: string) => {
        const tasks = { ...editingDay.tasks };
        if (!tasks[skill]) tasks[skill] = { questions: [] };
        if (!tasks[skill].questions) tasks[skill].questions = [];
        
        tasks[skill].questions.push({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            explanation: '',
            instruction: 'Choose the correct answer'
        });
        setEditingDay({ ...editingDay, tasks });
    };

    const removeQuestion = (skill: string, index: number) => {
        const tasks = { ...editingDay.tasks };
        tasks[skill].questions.splice(index, 1);
        setEditingDay({ ...editingDay, tasks });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, skill: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(skill);
        const reader = new FileReader();
        
        reader.onload = async () => {
            const base64Content = reader.result as string;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setMessage({ type: 'error', text: 'Authentication token missing. Please re-login.' });
                    return;
                }

                const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/base64`;
                console.log('Attempting base64 upload to:', uploadUrl);

                const res = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}` 
                    },
                    body: JSON.stringify({
                        file: base64Content,
                        fileName: file.name
                    })
                });

                if (res.ok) {
                    const url = await res.json();
                    console.log('Upload success:', url);
                    const tasks = { ...editingDay.tasks };
                    
                    if (skill === 'listening') {
                        if (!tasks.listening) tasks.listening = {};
                        tasks.listening.audioUrl = url;
                    } else if (skill === 'writing') {
                        if (!tasks.writing) tasks.writing = {};
                        tasks.writing.image = url;
                    }

                    setEditingDay({ ...editingDay, tasks });
                    setMessage({ type: 'success', text: `Uploaded ${skill} file successfully!` });
                } else {
                    console.error('Upload response not OK:', res.status, res.statusText);
                    const errorData = await res.json().catch(() => ({}));
                    console.error('Upload error body:', errorData);
                    setMessage({ type: 'error', text: errorData.message || `Upload failed (Status: ${res.status})` });
                }
            } catch (error) {
                console.error('Upload error:', error);
                setMessage({ type: 'error', text: 'Error connecting to upload server.' });
            } finally {
                setUploading(null);
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        };

        reader.onerror = () => {
            console.error('FileReader error');
            setMessage({ type: 'error', text: 'Error reading file on client side.' });
            setUploading(null);
        };

        reader.readAsDataURL(file);
    };

    if (authLoading || loading || !course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0a0f1a]">
                <Activity className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="font-bold text-gray-500">Loading Course Curriculum...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0f1a] transition-colors">
            {/* Top Navigation */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/courses')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[300px]">{course.title}</h1>
                            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">{course.targetType} Curriculum</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {message.text && (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-right-4 ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-100 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}
                        <button 
                            onClick={handleSaveDay}
                            disabled={saving || selectedDayIndex === null}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                        >
                            {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Progress
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar - Days List */}
                <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <button 
                            onClick={handleAddDay}
                            className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add New Day
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {course.days?.map((day, idx) => (
                            <div 
                                key={day._id}
                                onClick={() => handleSelectDay(idx)}
                                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                                    selectedDayIndex === idx 
                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-black tracking-widest uppercase ${
                                        day.phase === 'Foundation' ? 'text-blue-500' : 
                                        day.phase === 'Building' ? 'text-orange-500' : 
                                        day.phase === 'Advanced' ? 'text-purple-500' : 'text-rose-500'
                                    }`}>
                                        Day {day.dayNumber} · {day.phase}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteDay(day._id, idx); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <h3 className={`font-bold text-sm truncate ${selectedDayIndex === idx ? 'text-indigo-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {day.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0a0f1a] p-8">
                    {selectedDayIndex !== null && editingDay ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Day Metadata Editor */}
                            <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Day #</label>
                                        <input 
                                            type="number"
                                            value={editingDay.dayNumber}
                                            onChange={e => setEditingDay({...editingDay, dayNumber: parseInt(e.target.value)})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Day Title</label>
                                        <input 
                                            type="text"
                                            value={editingDay.title}
                                            onChange={e => setEditingDay({...editingDay, title: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Curriculum Phase</label>
                                        <select 
                                            value={editingDay.phase}
                                            onChange={e => setEditingDay({...editingDay, phase: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-6">
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Brief Description</label>
                                        <textarea 
                                            rows={2}
                                            value={editingDay.description}
                                            onChange={e => setEditingDay({...editingDay, description: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Skills Tabbed Editor */}
                            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                                {/* Tabs Header */}
                                <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 bg-gray-50/50 dark:bg-gray-800/50">
                                    {SKILLS.map(skill => (
                                        <button
                                            key={skill.id}
                                            onClick={() => setActiveTab(skill.id)}
                                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${
                                                activeTab === skill.id 
                                                ? 'text-indigo-600 dark:text-indigo-400' 
                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            {skill.icon}
                                            {skill.label}
                                            {activeTab === skill.id && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="p-8">
                                    {activeTab === 'vocabulary' && (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                                <div>
                                                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Daily Vocabulary</h4>
                                                    <p className="text-xs text-indigo-600/70">Add words for students to learn via flashcards.</p>
                                                </div>
                                                <button onClick={addVocab} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">
                                                    <PlusCircle className="w-4 h-4" /> Add Word
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {editingDay.tasks?.vocabulary?.map((v: any, vIdx: number) => (
                                                    <div key={vIdx} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl relative border border-gray-200 dark:border-gray-700 grid grid-cols-12 gap-4">
                                                        <button 
                                                            onClick={() => removeVocab(vIdx)}
                                                            className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 border border-red-100 dark:border-red-900 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                        <div className="col-span-4">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Word</label>
                                                            <input 
                                                                type="text" value={v.word} 
                                                                onChange={e => {
                                                                    const tasks = {...editingDay.tasks};
                                                                    tasks.vocabulary[vIdx].word = e.target.value;
                                                                    setEditingDay({...editingDay, tasks});
                                                                }}
                                                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm font-bold border border-gray-100 dark:border-gray-800"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Phonetic</label>
                                                            <input 
                                                                type="text" value={v.phonetic} 
                                                                onChange={e => {
                                                                    const tasks = {...editingDay.tasks};
                                                                    tasks.vocabulary[vIdx].phonetic = e.target.value;
                                                                    setEditingDay({...editingDay, tasks});
                                                                }}
                                                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-gray-800"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Vietnamese Meaning</label>
                                                            <input 
                                                                type="text" value={v.vietnameseMeaning} 
                                                                onChange={e => {
                                                                    const tasks = {...editingDay.tasks};
                                                                    tasks.vocabulary[vIdx].vietnameseMeaning = e.target.value;
                                                                    setEditingDay({...editingDay, tasks});
                                                                }}
                                                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm font-bold border border-gray-100 dark:border-gray-800"
                                                            />
                                                        </div>
                                                        <div className="col-span-6">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">English Definition</label>
                                                            <textarea 
                                                                rows={2} value={v.definition} 
                                                                onChange={e => {
                                                                    const tasks = {...editingDay.tasks};
                                                                    tasks.vocabulary[vIdx].definition = e.target.value;
                                                                    setEditingDay({...editingDay, tasks});
                                                                }}
                                                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-xs border border-gray-100 dark:border-gray-800 resize-none"
                                                            />
                                                        </div>
                                                        <div className="col-span-6">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Example Sentence</label>
                                                            <textarea 
                                                                rows={2} value={v.example} 
                                                                onChange={e => {
                                                                    const tasks = {...editingDay.tasks};
                                                                    tasks.vocabulary[vIdx].example = e.target.value;
                                                                    setEditingDay({...editingDay, tasks});
                                                                }}
                                                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-xs italic border border-gray-100 dark:border-gray-800 resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!editingDay.tasks?.vocabulary || editingDay.tasks.vocabulary.length === 0) && (
                                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                                                        <p className="text-gray-400 text-sm">No vocabulary added for this day yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'grammar' && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Lesson Title</label>
                                                    <input 
                                                        type="text"
                                                        value={editingDay.tasks?.grammar?.title || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.grammar) tasks.grammar = {};
                                                            tasks.grammar.title = e.target.value;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Lesson Content (Markdown/HTML Support)</label>
                                                    <textarea 
                                                        rows={6}
                                                        value={editingDay.tasks?.grammar?.lesson || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.grammar) tasks.grammar = {};
                                                            tasks.grammar.lesson = e.target.value;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Grammar Questions */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-bold text-sm text-gray-700 dark:text-gray-300">Practice Questions</h5>
                                                    <button onClick={() => addQuestion('grammar')} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                        <Plus className="w-3 h-3" /> Add Question
                                                    </button>
                                                </div>
                                                {editingDay.tasks?.grammar?.questions?.map((q: any, qIdx: number) => (
                                                    <QuestionEditor 
                                                        key={qIdx} q={q} 
                                                        onRemove={() => removeQuestion('grammar', qIdx)}
                                                        onChange={(newQ) => {
                                                            const tasks = {...editingDay.tasks};
                                                            tasks.grammar.questions[qIdx] = newQ;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'reading' && (
                                        <div className="space-y-8">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Passage Title</label>
                                                <input 
                                                    type="text"
                                                    value={editingDay.tasks?.reading?.title || ''}
                                                    onChange={e => {
                                                        const tasks = {...editingDay.tasks};
                                                        if (!tasks.reading) tasks.reading = {};
                                                        tasks.reading.title = e.target.value;
                                                        setEditingDay({...editingDay, tasks});
                                                    }}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Reading Passage Content</label>
                                                <textarea 
                                                    rows={12}
                                                    value={editingDay.tasks?.reading?.passage || ''}
                                                    onChange={e => {
                                                        const tasks = {...editingDay.tasks};
                                                        if (!tasks.reading) tasks.reading = {};
                                                        tasks.reading.passage = e.target.value;
                                                        setEditingDay({...editingDay, tasks});
                                                    }}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-serif outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                                                />
                                            </div>
                                            {/* Reading Questions */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-bold text-sm text-gray-700 dark:text-gray-300">Reading Comprehension Questions</h5>
                                                    <button onClick={() => addQuestion('reading')} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                        <Plus className="w-3 h-3" /> Add Question
                                                    </button>
                                                </div>
                                                {editingDay.tasks?.reading?.questions?.map((q: any, qIdx: number) => (
                                                    <QuestionEditor 
                                                        key={qIdx} q={q} 
                                                        onRemove={() => removeQuestion('reading', qIdx)}
                                                        onChange={(newQ) => {
                                                            const tasks = {...editingDay.tasks};
                                                            tasks.reading.questions[qIdx] = newQ;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'listening' && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Audio Title</label>
                                                    <input 
                                                        type="text"
                                                        value={editingDay.tasks?.listening?.title || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.listening) tasks.listening = {};
                                                            tasks.listening.title = e.target.value;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Audio URL (MP3/Cloudinary)</label>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text"
                                                            value={editingDay.tasks?.listening?.audioUrl || ''}
                                                            onChange={e => {
                                                                const tasks = {...editingDay.tasks};
                                                                if (!tasks.listening) tasks.listening = {};
                                                                tasks.listening.audioUrl = e.target.value;
                                                                setEditingDay({...editingDay, tasks});
                                                            }}
                                                            placeholder="https://..."
                                                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-mono text-xs"
                                                        />
                                                        <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center gap-2">
                                                            {uploading === 'listening' ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                            {uploading === 'listening' ? 'Uploading...' : 'Upload MP3'}
                                                            <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'listening')} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Transcript</label>
                                                    <textarea 
                                                        rows={6}
                                                        value={editingDay.tasks?.listening?.transcript || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.listening) tasks.listening = {};
                                                            tasks.listening.transcript = e.target.value;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            {/* Listening Questions */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h5 className="font-bold text-sm text-gray-700 dark:text-gray-300">Listening Comprehension Questions</h5>
                                                    <button onClick={() => addQuestion('listening')} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                                        <Plus className="w-3 h-3" /> Add Question
                                                    </button>
                                                </div>
                                                {editingDay.tasks?.listening?.questions?.map((q: any, qIdx: number) => (
                                                    <QuestionEditor 
                                                        key={qIdx} q={q} 
                                                        onRemove={() => removeQuestion('listening', qIdx)}
                                                        onChange={(newQ) => {
                                                            const tasks = {...editingDay.tasks};
                                                            tasks.listening.questions[qIdx] = newQ;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'speaking' && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Speaking Prompt / Question</label>
                                                <textarea 
                                                    rows={4}
                                                    value={editingDay.tasks?.speaking?.prompt || ''}
                                                    onChange={e => {
                                                        const tasks = {...editingDay.tasks};
                                                        if (!tasks.speaking) tasks.speaking = {};
                                                        tasks.speaking.prompt = e.target.value;
                                                        setEditingDay({...editingDay, tasks});
                                                    }}
                                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] px-6 py-4 text-sm font-bold shadow-inner"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Sample Answer / Model Response</label>
                                                <textarea 
                                                    rows={6}
                                                    value={editingDay.tasks?.speaking?.sampleAnswer || ''}
                                                    onChange={e => {
                                                        const tasks = {...editingDay.tasks};
                                                        if (!tasks.speaking) tasks.speaking = {};
                                                        tasks.speaking.sampleAnswer = e.target.value;
                                                        setEditingDay({...editingDay, tasks});
                                                    }}
                                                    className="w-full bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-[20px] px-6 py-4 text-sm italic text-emerald-800 dark:text-emerald-300"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Duration (Seconds)</label>
                                                    <input 
                                                        type="number"
                                                        value={editingDay.tasks?.speaking?.durationSeconds || 60}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.speaking) tasks.speaking = {};
                                                            tasks.speaking.durationSeconds = parseInt(e.target.value);
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Tips (One per line)</label>
                                                    <textarea 
                                                        rows={3}
                                                        value={editingDay.tasks?.speaking?.tips?.join('\n') || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.speaking) tasks.speaking = {};
                                                            tasks.speaking.tips = e.target.value.split('\n').filter(t => t.trim() !== '');
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'writing' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Task Title</label>
                                                    <input 
                                                        type="text"
                                                        value={editingDay.tasks?.writing?.title || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.writing) tasks.writing = {};
                                                            tasks.writing.title = e.target.value;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Word Limit</label>
                                                    <input 
                                                        type="number"
                                                        value={editingDay.tasks?.writing?.wordLimit || 250}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.writing) tasks.writing = {};
                                                            tasks.writing.wordLimit = parseInt(e.target.value);
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Time Limit (Mins)</label>
                                                    <input 
                                                        type="number"
                                                        value={editingDay.tasks?.writing?.durationMinutes || 40}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.writing) tasks.writing = {};
                                                            tasks.writing.durationMinutes = parseInt(e.target.value);
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 font-bold"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Writing Prompt Image (Optional)</label>
                                                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                                        {editingDay.tasks?.writing?.image ? (
                                                            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                                                <img src={editingDay.tasks.writing.image} alt="Writing prompt" className="w-full h-full object-cover" />
                                                                <button 
                                                                    onClick={() => {
                                                                        const tasks = {...editingDay.tasks};
                                                                        tasks.writing.image = '';
                                                                        setEditingDay({...editingDay, tasks});
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
                                                                <PenTool className="w-6 h-6 mb-1" />
                                                                <span className="text-[10px] font-bold">No Image</span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 space-y-2">
                                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                                                Upload an illustration, chart, or map for the writing task. 
                                                                Supported formats: JPG, PNG, WEBP.
                                                            </p>
                                                            <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95">
                                                                {uploading === 'writing' ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                                {uploading === 'writing' ? 'Uploading...' : 'Upload Image'}
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'writing')} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Writing Prompt / Topic</label>
                                                    <textarea 
                                                        rows={4}
                                                        value={editingDay.tasks?.writing?.prompt || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.writing) tasks.writing = {};
                                                            tasks.writing.prompt = e.target.value;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 text-sm font-bold"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Model Answer</label>
                                                    <textarea 
                                                        rows={8}
                                                        value={editingDay.tasks?.writing?.modelAnswer || ''}
                                                        onChange={e => {
                                                            const tasks = {...editingDay.tasks};
                                                            if (!tasks.writing) tasks.writing = {};
                                                            tasks.writing.modelAnswer = e.target.value;
                                                            setEditingDay({...editingDay, tasks});
                                                        }}
                                                        className="w-full bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl px-6 py-4 text-sm font-serif leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Layers className="w-20 h-20 text-gray-200 dark:text-gray-800 mb-4" />
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Curriculum Designer</h2>
                            <p className="text-gray-500 max-w-sm mt-2">Select a day from the sidebar or create a new one to start editing skills and tasks.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Internal Component for Question Editing ---
function QuestionEditor({ q, onRemove, onChange }: { q: any, onRemove: () => void, onChange: (newQ: any) => void }) {
    return (
        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 relative group">
            <button 
                onClick={onRemove}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            <div className="space-y-4">
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Question Text</label>
                    <input 
                        type="text" value={q.question} 
                        onChange={e => onChange({...q, question: e.target.value})}
                        className="w-full bg-white dark:bg-gray-900 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {q.options?.map((opt: string, idx: number) => (
                        <div key={idx}>
                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Option {idx + 1}</label>
                            <input 
                                type="text" value={opt} 
                                onChange={e => {
                                    const newOpts = [...q.options];
                                    newOpts[idx] = e.target.value;
                                    onChange({...q, options: newOpts});
                                }}
                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-gray-800"
                            />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Correct Answer (Match exact string of option)</label>
                        <input 
                            type="text" value={q.correctAnswer} 
                            onChange={e => onChange({...q, correctAnswer: e.target.value})}
                            className="w-full bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-lg text-sm font-bold text-emerald-700 border border-emerald-100 dark:border-emerald-900"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Explanation</label>
                        <input 
                            type="text" value={q.explanation} 
                            onChange={e => onChange({...q, explanation: e.target.value})}
                            className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm border border-gray-100 dark:border-gray-800"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
