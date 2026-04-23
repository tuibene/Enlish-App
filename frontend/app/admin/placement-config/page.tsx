'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, BookOpen, Headphones, PenTool, Mic, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PlacementConfigAdmin() {
    const { user, token } = useContext(AuthContext) || {};
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [config, setConfig] = useState({
        readingContext: '',
        readingQuestion: '',
        listeningAudioUrl: '',
        listeningQuestion: '',
        writingPrompt: '',
        writingImageUrl: '',
        speakingPrompt: ''
    });

    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT')) {
            router.push('/');
            return;
        }

        const fetchConfig = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/placement-config`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setConfig({
                        readingContext: data.readingContext || '',
                        readingQuestion: data.readingQuestion || '',
                        listeningAudioUrl: data.listeningAudioUrl || '',
                        listeningQuestion: data.listeningQuestion || '',
                        writingPrompt: data.writingPrompt || '',
                        writingImageUrl: data.writingImageUrl || '',
                        speakingPrompt: data.speakingPrompt || ''
                    });
                }
            } catch (err) {
                console.error("Error fetching config:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchConfig();
        }
    }, [user, token, router]);

    const handleSave = async () => {
        setIsSaving(true);
        setSuccessMsg('');
        setErrorMsg('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/placement-config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                setSuccessMsg('Test Configuration updated successfully! Gemini AI will now use these new prompts for grading.');
            } else {
                const err = await res.json();
                setErrorMsg(err.message || 'Failed to save configuration.');
            }
        } catch (err) {
            setErrorMsg('Network error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingAudio(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/base64`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ file: reader.result, fileName: file.name })
                });
                if (!res.ok) throw new Error('Upload failed');
                const cloudUrl = await res.json();
                setConfig({ ...config, listeningAudioUrl: cloudUrl });
            } catch (err) {
                console.error(err);
                alert('Audio upload failed.');
            } finally {
                setUploadingAudio(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploadingImage(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/base64`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ file: reader.result, fileName: file.name })
                });
                if (!res.ok) throw new Error('Upload failed');
                const cloudUrl = await res.json();
                setConfig({ ...config, writingImageUrl: cloudUrl });
            } catch (err) {
                console.error(err);
                alert('Image upload failed.');
            } finally {
                setUploadingImage(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (isLoading) {
        return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Placement Test Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Modify the 4-skills test content in real-time. Changes here instantly update the front-end UI and re-calibrate the AI Examiner's grading context.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform flex items-center"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Changes
                    </button>
                </div>

                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" /> {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" /> {errorMsg}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Reading Config */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white mb-4">
                            <BookOpen className="w-5 h-5 mr-2 text-purple-500" /> Reading & Grammar
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reading Paragraph Context</label>
                                <textarea name="readingContext" value={config.readingContext} onChange={handleChange} rows={4} className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80 p-3 text-sm focus:ring-blue-500" placeholder="A short paragraph..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comprehension Question</label>
                                <input type="text" name="readingQuestion" value={config.readingQuestion} onChange={handleChange} className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80 p-3 text-sm focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Listening Config */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white mb-4">
                            <Headphones className="w-5 h-5 mr-2 text-emerald-500" /> Listening
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-1 text-gray-500" /> Track Audio URL (.mp3)
                                </label>
                                <div className="flex gap-2">
                                    <input type="text" name="listeningAudioUrl" value={config.listeningAudioUrl} onChange={handleChange} className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80 p-3 text-sm focus:ring-blue-500" placeholder="https://.../audio.mp3" />
                                    <label className={`shrink-0 flex items-center justify-center px-4 rounded-xl font-bold cursor-pointer transition-colors ${uploadingAudio ? 'bg-gray-300 text-gray-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'}`}>
                                        {uploadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                                        <input type="file" className="hidden" accept="audio/*" onChange={handleAudioUpload} disabled={uploadingAudio} />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question</label>
                                <textarea name="listeningQuestion" value={config.listeningQuestion} onChange={handleChange} rows={3} className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80 p-3 text-sm focus:ring-blue-500"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Writing Config */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white mb-4">
                            <PenTool className="w-5 h-5 mr-2 text-blue-500" /> Writing
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Essay Prompt</label>
                                <textarea name="writingPrompt" value={config.writingPrompt} onChange={handleChange} rows={5} className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80 p-3 text-sm focus:ring-blue-500"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-1 text-gray-500" /> Reference Image URL (Optional)
                                </label>
                                <div className="flex gap-2">
                                    <input type="text" name="writingImageUrl" value={config.writingImageUrl} onChange={handleChange} className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80 p-3 text-sm focus:ring-blue-500" placeholder="https://.../chart.png" />
                                    <label className={`shrink-0 flex items-center justify-center px-4 rounded-xl font-bold cursor-pointer transition-colors ${uploadingImage ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}>
                                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                                    </label>
                                </div>
                                {config.writingImageUrl && (
                                    <div className="mt-3 relative w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                                        <img src={config.writingImageUrl} alt="Writing Reference" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Speaking Config */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white mb-4">
                            <Mic className="w-5 h-5 mr-2 text-orange-500" /> Speaking
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Speaking Topic / Instruction</label>
                                <textarea name="speakingPrompt" value={config.speakingPrompt} onChange={handleChange} rows={5} className="w-full rounded-xl border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-[#0B1120]/80 p-3 text-sm focus:ring-blue-500"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CheckCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
