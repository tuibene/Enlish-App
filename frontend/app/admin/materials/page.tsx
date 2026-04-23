"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Plus, Edit2, Trash2, ArrowLeft, X, Activity } from 'lucide-react';

interface Material {
    _id: string;
    title: string;
    description: string;
    content: string;
    type: string;
    pdfUrl?: string;
    tags: string[];
}

export default function AdminMaterials() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploadingObj, setUploadingObj] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        type: 'GENERAL',
        pdfUrl: '',
        tags: ''
    });

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT'))) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const fetchMaterials = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/materials`);
            if (res.ok) {
                const data = await res.json();
                setMaterials(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'ROOT') {
            fetchMaterials();
        }
    }, [user]);

    const openModal = (material?: Material) => {
        if (material) {
            setEditingId(material._id);
            setFormData({
                title: material.title,
                description: material.description,
                content: material.content,
                type: material.type,
                pdfUrl: material.pdfUrl || '',
                tags: material.tags.join(', ')
            });
        } else {
            setEditingId(null);
            setFormData({ title: '', description: '', content: '', type: 'GENERAL', pdfUrl: '', tags: '' });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/materials/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setMaterials(materials.filter(m => m._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('document', file);

        setUploadingObj(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: uploadData
            });

            if (res.ok) {
                const cloudUrl = await res.json();
                setFormData({ ...formData, pdfUrl: cloudUrl });
            } else {
                alert('File upload failed.');
            }
        } catch (error) {
            console.error('Upload Error:', error);
        } finally {
            setUploadingObj(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            const url = editingId
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/materials/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/materials`;

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchMaterials();
                setIsModalOpen(false);
            } else {
                alert('Failed to save material.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || pageLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
        </div>
    );

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 text-gray-900 dark:text-gray-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Panel
                        </button>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Manage Academic Materials
                        </h1>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" /> Add New Material
                    </button>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    {materials.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No materials found. Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-sm tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                                        <th className="py-4 px-4 font-semibold">Title</th>
                                        <th className="py-4 px-4 font-semibold">Type</th>
                                        <th className="py-4 px-4 font-semibold">Tags</th>
                                        <th className="py-4 px-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {materials.map(mat => (
                                        <tr key={mat._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="py-4 px-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">{mat.title}</td>
                                            <td className="py-4 px-4"><span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{mat.type}</span></td>
                                            <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{mat.tags.join(', ')}</td>
                                            <td className="py-4 px-4 text-right">
                                                <button onClick={() => openModal(mat)} className="text-blue-500 hover:text-blue-700 mr-4 transition"><Edit2 className="w-5 h-5 inline" /></button>
                                                <button onClick={() => handleDelete(mat._id)} className="text-red-500 hover:text-red-700 transition"><Trash2 className="w-5 h-5 inline" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
                            <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingId ? 'Edit Material' : 'Create New Material'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Title</label>
                                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Advanced Present Perfect Guide" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                                            <option value="VOCABULARY">Vocabulary</option>
                                            <option value="GRAMMAR">Grammar</option>
                                            <option value="READING">Reading</option>
                                            <option value="GENERAL">General</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                                    <input required type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Short intro about the material..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                                        Content (Markdown Supported)
                                    </label>
                                    <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={10} className="w-full px-4 py-3 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono text-sm" placeholder="# Heading 1&#10;Write your majestic markdown content here..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attach PDF Document (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileUpload}
                                            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 transition"
                                        />
                                        {uploadingObj && <span className="text-sm text-blue-500 whitespace-nowrap animate-pulse">Uploading...</span>}
                                    </div>
                                    {formData.pdfUrl && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                            ✓ PDF attached: {formData.pdfUrl}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags (comma separated)</label>
                                    <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="IELTS, B2, Idioms" />
                                </div>

                                <div className="pt-4 flex justify-end gap-4 border-t border-gray-100 dark:border-gray-700">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition">Cancel</button>
                                    <button type="submit" className="px-6 py-2 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">{editingId ? 'Save Changes' : 'Create Material'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
