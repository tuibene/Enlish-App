"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Clock, Tag, User, Activity } from 'lucide-react';

interface Material {
    _id: string;
    title: string;
    description: string;
    content: string;
    type: string;
    pdfUrl?: string;
    tags: string[];
    createdAt: string;
    createdBy: { _id: string, name: string };
}

export default function MaterialDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/materials/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMaterial(data.data);
                } else {
                    console.error("Failed to fetch material");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMaterial();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
            </div>
        );
    }

    if (!material) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white/80 dark:bg-[#0B1120]/80 text-gray-800 dark:text-gray-200">
                <h1 className="text-3xl font-bold mb-4">Material not found</h1>
                <button
                    onClick={() => router.push('/materials')}
                    className="flex items-center text-blue-600 hover:text-blue-700 transition"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Materials
                </button>
            </div>
        );
    }

    const typeColors: Record<string, string> = {
        'VOCABULARY': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        'GRAMMAR': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        'READING': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        'GENERAL': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 text-gray-900 dark:text-gray-100 py-10 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.push(`/materials/category/${material.type.toLowerCase()}`)}
                    className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {material.type.charAt(0) + material.type.slice(1).toLowerCase()}
                </button>

                <div className="bg-white dark:bg-gray-800/60 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700/50">
                    {/* Header */}
                    <header className="mb-10 pb-10 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${typeColors[material.type] || typeColors['GENERAL']}`}>
                                {material.type}
                            </span>
                            {material.tags.map(tag => (
                                <span key={tag} className="flex items-center text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                    <Tag className="w-3 h-3 mr-1" /> {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                            {material.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-blue-500" />
                                {material.createdBy?.name || 'Administrator'}
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                                {new Date(material.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </header>

                    {/* Markdown Content */}
                    <div className={`prose prose-lg dark:prose-invert max-w-none ${material.type === 'VOCABULARY'
                        ? 'prose-headings:font-bold prose-h3:text-blue-700 dark:prose-h3:text-blue-400 prose-h3:text-2xl prose-h3:mb-2 prose-h3:pb-2 prose-h3:border-b prose-h3:border-gray-100 dark:prose-h3:border-gray-800 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-2 prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-strong:font-medium prose-em:text-gray-500 dark:prose-em:text-gray-400 prose-em:not-italic prose-em:bg-gray-100 dark:prose-em:bg-gray-800 prose-em:px-2 prose-em:py-0.5 prose-em:rounded-md prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-800 dark:prose-blockquote:text-gray-200'
                        : 'prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-indigo-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 prose-img:rounded-2xl'
                        }`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {material.content}
                        </ReactMarkdown>
                    </div>

                    {/* PDF Viewer */}
                    {material.pdfUrl && (
                        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700/50">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Attached Document</h2>
                            <iframe
                                src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${material.pdfUrl}`}
                                className="w-full h-[80vh] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm"
                                title="PDF Document"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
