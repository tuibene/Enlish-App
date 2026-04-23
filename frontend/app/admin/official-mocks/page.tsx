'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Activity, PlusCircle, Trash2, Edit, Save, X, BrainCircuit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ListeningQuestion {
    text: string;
    options: string[];
}

interface ListeningPart {
    partNumber: number;
    instruction: string;
    type: 'gap-fill' | 'multiple-choice';
    questions: ListeningQuestion[];
}

interface ReadingQuestion {
    text: string;
    options: string[];
}

interface ReadingQuestionGroup {
    instruction: string;
    type: 'gap-fill' | 'multiple-choice' | 'tfng';
    questions: ReadingQuestion[];
}

interface ReadingPart {
    partNumber: number;
    title: string;
    text: string;
    questionGroups: ReadingQuestionGroup[];
}

interface WritingTask {
    taskNumber: number;
    instruction: string;
    imageUrl: string;
}

interface SpeakingPart {
    partNumber: number;
    instruction: string;
    questions: string[];
}

interface OfficialMock {
    _id?: string;
    title: string;
    description: string;
    readingParts: ReadingPart[];
    writingTasks: WritingTask[];
    speakingParts: SpeakingPart[];
    listeningParts: ListeningPart[];
    listeningAudioUrl: string;
    isActive: boolean;
}

export default function ManageOfficialMocks() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [mocks, setMocks] = useState<OfficialMock[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<OfficialMock>({
        title: '',
        description: '',
        readingParts: [{
            partNumber: 1,
            title: 'Reading Passage 1',
            text: '',
            questionGroups: [{
                instruction: 'Do the following statements agree with the information given? (TRUE/FALSE/NOT GIVEN)',
                type: 'tfng',
                questions: [{ text: 'The invention was widely accepted.', options: [] }]
            }]
        }],
        writingTasks: [
            { taskNumber: 1, instruction: 'Summarize the information by selecting and reporting the main features.', imageUrl: '' },
            { taskNumber: 2, instruction: 'To what extent do you agree or disagree?', imageUrl: '' }
        ],
        speakingParts: [
            { partNumber: 1, instruction: 'Let\'s talk about your hometown.', questions: ['Where is your hometown?'] }
        ],
        listeningParts: [{
            partNumber: 1,
            instruction: 'Write ONE WORD ONLY for each answer.',
            type: 'gap-fill',
            questions: [{ text: 'The lecture focuses on [GAP] environments.', options: [] }]
        }],
        listeningAudioUrl: '',
        readingQuestions: ['', '', ''],
        isActive: true
    });
    const [saving, setSaving] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [uploadingTaskImage, setUploadingTaskImage] = useState<number | null>(null);

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT'))) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const fetchMocks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/official-mocks/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setMocks(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch mocks', err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'ROOT') {
            fetchMocks();
        }
    }, [user]);

    const handleCreateNew = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            readingParts: [{
                partNumber: 1,
                title: 'Reading Passage 1',
                text: '',
                questionGroups: [{
                    instruction: 'Do the following statements agree with the information given? (TRUE/FALSE/NOT GIVEN)',
                    type: 'tfng',
                    questions: [{ text: 'The invention was widely accepted.', options: [] }]
                }]
            }],
            writingTasks: [
                { taskNumber: 1, instruction: 'Summarize the information by selecting and reporting the main features.', imageUrl: '' },
                { taskNumber: 2, instruction: 'To what extent do you agree or disagree?', imageUrl: '' }
            ],
            speakingParts: [
                { partNumber: 1, instruction: 'Let\'s talk about your hometown.', questions: ['Where is your hometown?'] }
            ],
            listeningParts: [{
                partNumber: 1,
                instruction: 'Write ONE WORD ONLY for each answer.',
                type: 'gap-fill',
                questions: [{ text: 'The lecture focuses on [GAP] environments.', options: [] }]
            }],
            listeningAudioUrl: '',
            readingQuestions: ['', '', ''],
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (mock: OfficialMock) => {
        setEditingId(mock._id || null);
        setFormData({
            ...mock,
            readingParts: mock.readingParts?.length > 0 ? mock.readingParts : [{
                partNumber: 1,
                title: 'Reading Passage 1',
                text: '',
                questionGroups: [{
                    instruction: 'Do the following statements agree with the information given? (TRUE/FALSE/NOT GIVEN)',
                    type: 'tfng',
                    questions: [{ text: 'The invention was widely accepted.', options: [] }]
                }]
            }],
            writingTasks: mock.writingTasks?.length > 0 ? mock.writingTasks : [
                { taskNumber: 1, instruction: 'Summarize the information by selecting and reporting the main features.', imageUrl: '' },
                { taskNumber: 2, instruction: 'To what extent do you agree or disagree?', imageUrl: '' }
            ],
            speakingParts: mock.speakingParts?.length > 0 ? mock.speakingParts : [
                { partNumber: 1, instruction: 'Let\'s talk about your hometown.', questions: ['Where is your hometown?'] }
            ],
            listeningParts: mock.listeningParts?.length > 0 ? mock.listeningParts : [{
                partNumber: 1,
                instruction: 'Write ONE WORD ONLY for each answer.',
                type: 'gap-fill',
                questions: [{ text: 'The lecture focuses on [GAP] environments.', options: [] }]
            }],
            listeningAudioUrl: mock.listeningAudioUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you certain you want to permanently delete this Official Simulation? Tests linked to this ID may break.')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/official-mocks/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setMocks(mocks.filter(m => m._id !== id));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to delete.');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingId 
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/official-mocks/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/official-mocks`;
                
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Save failed');
            
            await fetchMocks();
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save the mock exam. Make sure all required fields are filled.');
        } finally {
            setSaving(false);
        }
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingAudio(true);
        
        const reader = new FileReader();
        reader.onload = async () => {
            const base64Content = reader.result as string;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/base64`, {
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
                
                if (!res.ok) throw new Error('Upload failed');
                const cloudUrl = await res.json();
                
                setFormData({ ...formData, listeningAudioUrl: cloudUrl });
            } catch (err) {
                console.error(err);
                alert('Audio upload failed.');
            } finally {
                setUploadingAudio(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, taskIndex: number) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingTaskImage(taskIndex);
        
        const reader = new FileReader();
        reader.onload = async () => {
            const base64Content = reader.result as string;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/base64`, {
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
                
                if (!res.ok) throw new Error('Upload failed');
                const cloudUrl = await res.json();
                
                const newTasks = [...formData.writingTasks];
                newTasks[taskIndex].imageUrl = cloudUrl;
                setFormData({ ...formData, writingTasks: newTasks });
            } catch (err) {
                console.error(err);
                alert('Image upload failed.');
            } finally {
                setUploadingTaskImage(null);
            }
        };
        reader.readAsDataURL(file);
    };

    if (loading || pageLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-[#121212]">
            <Activity className="w-12 h-12 text-indigo-500 animate-pulse" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-12">
            <div className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800 pt-10 pb-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <Link href="/admin" className="text-sm font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-2 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Official Mock Exams</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">Manage full 4-skills CBT simulations.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                        >
                            <PlusCircle className="w-5 h-5" /> Create New Simulation
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
                <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                    {mocks.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-[1.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                            <BrainCircuit className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 font-bold mb-4">No Official Mocks found.</p>
                            <button onClick={handleCreateNew} className="text-indigo-600 font-bold hover:underline">Create the first one</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mocks.map(mock => (
                                <div key={mock._id} className="border border-gray-200 dark:border-gray-700 p-6 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all group flex flex-col justify-between">
                                    <div className="mb-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <BrainCircuit className="w-5 h-5" />
                                            </div>
                                            {!mock.isActive && <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded">Inactive</span>}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{mock.title}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{mock.description}</p>
                                    </div>
                                    <div className="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                                        <button onClick={() => handleEdit(mock)} className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-colors border border-gray-200 dark:border-gray-700">
                                            <Edit className="w-4 h-4"/> Edit
                                        </button>
                                        <button onClick={() => handleDelete(mock._id!)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors border border-gray-200 dark:border-gray-700">
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Huge Modal for Official Mock */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm overflow-hidden">
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-5xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        {/* Header Box (Fixed) */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                {editingId ? 'Edit Simulation' : 'Creation Lab'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Middle Content Box (Scrollable) */}
                        <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        value={formData.title} 
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="e.g. IELTS CBT Mock Vol. 4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <input 
                                        type="text" 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        placeholder="Short subtitle..."
                                    />
                                </div>
                            </div>
                            
                            {/* Listening Config */}
                            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-lg text-indigo-800 dark:text-indigo-400 flex items-center gap-2">🎧 Listening Setup (4 Parts)</h3>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold mb-2">Track Audio URL (.mp3)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" className="flex-1 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 dark:bg-gray-800 outline-none"
                                            placeholder="https://.../audio.mp3  (Or upload a file)"
                                            value={formData.listeningAudioUrl}
                                            onChange={e => setFormData({...formData, listeningAudioUrl: e.target.value})}
                                        />
                                        <label className={`shrink-0 flex items-center justify-center px-4 rounded-xl font-bold cursor-pointer transition-colors ${uploadingAudio ? 'bg-gray-300 text-gray-500' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}`}>
                                            {uploadingAudio ? <Activity className="w-5 h-5 animate-spin" /> : 'Upload MP3'}
                                            <input type="file" className="hidden" accept="audio/*" onChange={handleAudioUpload} disabled={uploadingAudio} />
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {formData.listeningParts?.map((part, pIdx) => (
                                        <div key={pIdx} className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 relative shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-indigo-700 dark:text-indigo-400">Part {part.partNumber}</h4>
                                                <button onClick={() => {
                                                    const newParts = formData.listeningParts.filter((_, i) => i !== pIdx);
                                                    setFormData({...formData, listeningParts: newParts});
                                                }} className="text-red-500 hover:text-red-700 font-bold text-sm"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-xs font-bold mb-1">Instruction</label>
                                                    <input 
                                                        type="text" className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none text-sm"
                                                        value={part.instruction}
                                                        onChange={e => {
                                                            const newParts = [...formData.listeningParts];
                                                            newParts[pIdx].instruction = e.target.value;
                                                            setFormData({...formData, listeningParts: newParts});
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold mb-1">Question Type</label>
                                                    <select 
                                                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none text-sm"
                                                        value={part.type}
                                                        onChange={e => {
                                                            const newParts = [...formData.listeningParts];
                                                            newParts[pIdx].type = e.target.value as 'gap-fill' | 'multiple-choice';
                                                            setFormData({...formData, listeningParts: newParts});
                                                        }}
                                                    >
                                                        <option value="gap-fill">Gap Fill (Note/Table)</option>
                                                        <option value="multiple-choice">Multiple Choice</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {part.type === 'gap-fill' && <p className="text-xs text-gray-500">Write the full sentence and use <strong className="bg-gray-200 dark:bg-gray-700 px-1 rounded">[GAP]</strong> where the input should be.</p>}
                                                {part.questions.map((q, qIdx) => (
                                                    <div key={qIdx} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-xs font-bold w-4">{qIdx + 1}.</span>
                                                            <input 
                                                                type="text" className="flex-1 p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-sm"
                                                                placeholder={part.type === 'gap-fill' ? 'e.g. He wants to buy a [GAP].' : 'e.g. Where does he live?'}
                                                                value={q.text}
                                                                onChange={e => {
                                                                    const newParts = [...formData.listeningParts];
                                                                    newParts[pIdx].questions[qIdx].text = e.target.value;
                                                                    setFormData({...formData, listeningParts: newParts});
                                                                }}
                                                            />
                                                            <button onClick={() => {
                                                                const newParts = [...formData.listeningParts];
                                                                newParts[pIdx].questions = newParts[pIdx].questions.filter((_, i) => i !== qIdx);
                                                                setFormData({...formData, listeningParts: newParts});
                                                            }} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                                                        </div>
                                                        {part.type === 'multiple-choice' && (
                                                            <div className="ml-6 flex flex-col gap-1">
                                                                {[0, 1, 2, 3].map(optIdx => (
                                                                    <div key={optIdx} className="flex items-center gap-2">
                                                                        <span className="text-xs">{String.fromCharCode(65 + optIdx)}.</span>
                                                                        <input 
                                                                            type="text" className="flex-1 p-1.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none text-xs"
                                                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                                            value={q.options[optIdx] || ''}
                                                                            onChange={e => {
                                                                                const newParts = [...formData.listeningParts];
                                                                                const newOptions = [...newParts[pIdx].questions[qIdx].options];
                                                                                newOptions[optIdx] = e.target.value;
                                                                                newParts[pIdx].questions[qIdx].options = newOptions;
                                                                                setFormData({...formData, listeningParts: newParts});
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const newParts = [...formData.listeningParts];
                                                    newParts[pIdx].questions.push({ text: '', options: [] });
                                                    setFormData({...formData, listeningParts: newParts});
                                                }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2">
                                                    <PlusCircle className="w-3 h-3" /> Add Question
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button onClick={() => {
                                        const nextNumber = (formData.listeningParts?.length || 0) + 1;
                                        setFormData({
                                            ...formData, 
                                            listeningParts: [...(formData.listeningParts || []), {
                                                partNumber: nextNumber,
                                                instruction: 'Write ONE WORD ONLY for each answer.',
                                                type: 'gap-fill',
                                                questions: [{ text: '', options: [] }]
                                            }]
                                        });
                                    }} className="w-full py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2">
                                        <PlusCircle className="w-5 h-5" /> Add Part
                                    </button>
                                </div>
                            </div>

                            {/* Reading Config */}
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-black text-lg text-blue-800 dark:text-blue-400 flex items-center gap-2">📖 Reading Setup</h3>
                                </div>
                                <div className="space-y-8">
                                    {formData.readingParts?.map((part, pIdx) => (
                                        <div key={pIdx} className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-xl p-6 relative shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <input 
                                                    type="text" className="font-bold text-blue-700 dark:text-blue-400 bg-transparent border-b border-blue-200 outline-none w-1/2"
                                                    value={part.title}
                                                    onChange={e => {
                                                        const newParts = [...formData.readingParts];
                                                        newParts[pIdx].title = e.target.value;
                                                        setFormData({...formData, readingParts: newParts});
                                                    }}
                                                />
                                                <button onClick={() => {
                                                    const newParts = formData.readingParts.filter((_, i) => i !== pIdx);
                                                    setFormData({...formData, readingParts: newParts});
                                                }} className="text-red-500 hover:text-red-700 font-bold text-sm"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <textarea 
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-y mb-6 text-sm"
                                                value={part.text}
                                                onChange={e => {
                                                    const newParts = [...formData.readingParts];
                                                    newParts[pIdx].text = e.target.value;
                                                    setFormData({...formData, readingParts: newParts});
                                                }}
                                                placeholder="Paste the passage reading text here..."
                                            />
                                            
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-sm">Question Groups for this Passage:</h4>
                                            <div className="space-y-4">
                                                {part.questionGroups?.map((group, gIdx) => (
                                                    <div key={gIdx} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                        <div className="flex gap-4 mb-3">
                                                            <input 
                                                                type="text" className="flex-1 p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none text-xs"
                                                                placeholder="Instruction (e.g. Do the following statements agree...)"
                                                                value={group.instruction}
                                                                onChange={e => {
                                                                    const newParts = [...formData.readingParts];
                                                                    newParts[pIdx].questionGroups[gIdx].instruction = e.target.value;
                                                                    setFormData({...formData, readingParts: newParts});
                                                                }}
                                                            />
                                                            <select 
                                                                className="w-40 p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none text-xs"
                                                                value={group.type}
                                                                onChange={e => {
                                                                    const newParts = [...formData.readingParts];
                                                                    newParts[pIdx].questionGroups[gIdx].type = e.target.value as any;
                                                                    setFormData({...formData, readingParts: newParts});
                                                                }}
                                                            >
                                                                <option value="tfng">True/False/NG</option>
                                                                <option value="multiple-choice">Multiple Choice</option>
                                                                <option value="gap-fill">Gap Fill</option>
                                                            </select>
                                                            <button onClick={() => {
                                                                const newParts = [...formData.readingParts];
                                                                newParts[pIdx].questionGroups = newParts[pIdx].questionGroups.filter((_, i) => i !== gIdx);
                                                                setFormData({...formData, readingParts: newParts});
                                                            }} className="text-red-500"><X className="w-4 h-4"/></button>
                                                        </div>
                                                        <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900">
                                                            {group.questions.map((q, qIdx) => (
                                                                <div key={qIdx} className="flex gap-2">
                                                                    <input 
                                                                        type="text" className="flex-1 p-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none"
                                                                        placeholder={group.type === 'gap-fill' ? 'Sentence with [GAP]' : 'Question text...'}
                                                                        value={q.text}
                                                                        onChange={e => {
                                                                            const newParts = [...formData.readingParts];
                                                                            newParts[pIdx].questionGroups[gIdx].questions[qIdx].text = e.target.value;
                                                                            setFormData({...formData, readingParts: newParts});
                                                                        }}
                                                                    />
                                                                    <button onClick={() => {
                                                                        const newParts = [...formData.readingParts];
                                                                        newParts[pIdx].questionGroups[gIdx].questions = newParts[pIdx].questionGroups[gIdx].questions.filter((_, i) => i !== qIdx);
                                                                        setFormData({...formData, readingParts: newParts});
                                                                    }} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                                                                </div>
                                                            ))}
                                                            <button onClick={() => {
                                                                const newParts = [...formData.readingParts];
                                                                newParts[pIdx].questionGroups[gIdx].questions.push({ text: '', options: [] });
                                                                setFormData({...formData, readingParts: newParts});
                                                            }} className="text-xs text-blue-600 font-bold flex items-center gap-1"><PlusCircle className="w-3 h-3"/> Add Q</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const newParts = [...formData.readingParts];
                                                    newParts[pIdx].questionGroups.push({ instruction: 'New Instruction', type: 'tfng', questions: [{ text: '', options: [] }] });
                                                    setFormData({...formData, readingParts: newParts});
                                                }} className="text-xs text-indigo-600 font-bold border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50"><PlusCircle className="w-3 h-3 inline"/> Add Question Group</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const nextNum = (formData.readingParts?.length || 0) + 1;
                                        setFormData({...formData, readingParts: [...(formData.readingParts || []), { partNumber: nextNum, title: `Reading Passage ${nextNum}`, text: '', questionGroups: [] }]});
                                    }} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-bold hover:bg-blue-50 flex items-center justify-center gap-2">
                                        <PlusCircle className="w-5 h-5"/> Add Passage
                                    </button>
                                </div>
                            </div>

                            {/* Writing Config */}
                            <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/50">
                                <h3 className="font-black text-lg mb-4 text-orange-800 dark:text-orange-400 flex items-center gap-2">✍️ Writing Setup</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {formData.writingTasks?.map((task, tIdx) => (
                                        <div key={tIdx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm relative">
                                            <h4 className="font-bold mb-2">Task {task.taskNumber}</h4>
                                            <textarea 
                                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-lg h-32 outline-none dark:text-white text-sm mb-4"
                                                value={task.instruction}
                                                onChange={e => {
                                                    const newTasks = [...formData.writingTasks];
                                                    newTasks[tIdx].instruction = e.target.value;
                                                    setFormData({...formData, writingTasks: newTasks});
                                                }}
                                                placeholder={`Instruction for Task ${task.taskNumber}`}
                                            />
                                            <div className="mb-2">
                                                <label className="block text-xs font-bold mb-1 text-gray-500">Attach Image URL (Optional)</label>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" className="flex-1 p-2 text-xs rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none"
                                                        value={task.imageUrl || ''}
                                                        onChange={e => {
                                                            const newTasks = [...formData.writingTasks];
                                                            newTasks[tIdx].imageUrl = e.target.value;
                                                            setFormData({...formData, writingTasks: newTasks});
                                                        }}
                                                    />
                                                    <label className={`shrink-0 flex items-center justify-center px-3 rounded text-xs font-bold cursor-pointer transition-colors ${uploadingTaskImage === tIdx ? 'bg-gray-300 text-gray-500' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}>
                                                        {uploadingTaskImage === tIdx ? <Activity className="w-4 h-4 animate-spin" /> : 'Upload'}
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, tIdx)} disabled={uploadingTaskImage === tIdx} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Speaking Config */}
                            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                                <h3 className="font-black text-lg mb-4 text-rose-800 dark:text-rose-400 flex items-center gap-2">🎙️ Speaking Setup</h3>
                                <div className="space-y-4">
                                    {formData.speakingParts?.map((part, pIdx) => (
                                        <div key={pIdx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-rose-200 dark:border-rose-800 relative">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-rose-700">Part {part.partNumber}</span>
                                                <button onClick={() => {
                                                    const newParts = formData.speakingParts.filter((_, i) => i !== pIdx);
                                                    setFormData({...formData, speakingParts: newParts});
                                                }} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                            <input 
                                                type="text" className="w-full p-2 mb-3 text-sm rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none"
                                                placeholder="Instruction (e.g. Describe a time...)"
                                                value={part.instruction}
                                                onChange={e => {
                                                    const newParts = [...formData.speakingParts];
                                                    newParts[pIdx].instruction = e.target.value;
                                                    setFormData({...formData, speakingParts: newParts});
                                                }}
                                            />
                                            <div className="space-y-2 pl-4 border-l-2 border-rose-200">
                                                {part.questions.map((q, qIdx) => (
                                                    <div key={qIdx} className="flex gap-2">
                                                        <input 
                                                            type="text" className="flex-1 p-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none"
                                                            placeholder="Question or bullet point"
                                                            value={q}
                                                            onChange={e => {
                                                                const newParts = [...formData.speakingParts];
                                                                newParts[pIdx].questions[qIdx] = e.target.value;
                                                                setFormData({...formData, speakingParts: newParts});
                                                            }}
                                                        />
                                                        <button onClick={() => {
                                                            const newParts = [...formData.speakingParts];
                                                            newParts[pIdx].questions = newParts[pIdx].questions.filter((_, i) => i !== qIdx);
                                                            setFormData({...formData, speakingParts: newParts});
                                                        }} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3"/></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const newParts = [...formData.speakingParts];
                                                    newParts[pIdx].questions.push('');
                                                    setFormData({...formData, speakingParts: newParts});
                                                }} className="text-xs text-rose-600 font-bold flex items-center gap-1"><PlusCircle className="w-3 h-3"/> Add Prompt</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const nextNum = (formData.speakingParts?.length || 0) + 1;
                                        setFormData({...formData, speakingParts: [...(formData.speakingParts || []), { partNumber: nextNum, instruction: '', questions: [''] }]});
                                    }} className="w-full py-2 border-2 border-dashed border-rose-200 rounded-lg text-rose-600 font-bold hover:bg-rose-50 flex justify-center gap-2">
                                        <PlusCircle className="w-4 h-4"/> Add Speaking Part
                                    </button>
                                </div>
                            </div>
                            
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-indigo-600 rounded" 
                                    checked={formData.isActive}
                                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                />
                                <span className="font-bold text-gray-700 dark:text-white">Is Active (Visible to students)</span>
                            </label>
                        </div>

                        {/* Footer Box (Fixed) */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-b-[2rem] flex justify-end gap-4 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button disabled={saving} onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                                {saving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
