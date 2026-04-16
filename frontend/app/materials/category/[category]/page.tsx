"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { BookOpen, Tag, Activity, Search, ArrowLeft } from 'lucide-react';

interface Material {
    _id: string;
    title: string;
    description: string;
    type: string;
    tags: string[];
    createdAt: string;
}

export default function CategoryMaterialsList({ params }: { params: Promise<{ category: string }> }) {
    // React 19 Next.js unwrapping params
    const resolvedParams = use(params);
    const categoryName = resolvedParams.category.toUpperCase();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/materials?type=${categoryName}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setMaterials(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchMaterials();
    }, [categoryName]);

    const filteredAndSearched = materials.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const categoryDetails: Record<string, { title: string, desc: string, color: string }> = {
        'VOCABULARY': { title: 'Vocabulary Builder', desc: 'Expand your word bank and master idioms, phrasal verbs, and academic lexicons.', color: 'text-green-600 dark:text-green-400' },
        'GRAMMAR': { title: 'Grammar Guide', desc: 'Dive deep into rules, tenses, and structures to form perfect sentences.', color: 'text-blue-600 dark:text-blue-400' },
        'READING': { title: 'Reading Comprehension', desc: 'Practice with native excerpts and graded essays to improve your speed and understanding.', color: 'text-purple-600 dark:text-purple-400' },
        'GENERAL': { title: 'General Materials', desc: 'Explore all-round tips, tricks, and study methods.', color: 'text-gray-800 dark:text-gray-300' }
    };

    const details = categoryDetails[categoryName] || categoryDetails['GENERAL'];

    const typeColors: Record<string, string> = {
        'VOCABULARY': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'GRAMMAR': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        'READING': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        'GENERAL': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 text-gray-900 dark:text-gray-100 transition-colors p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="space-y-4">
                    <Link href="/materials" className="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-medium transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Material Hub
                    </Link>
                    <h1 className={`text-4xl md:text-5xl font-extrabold ${details.color}`}>
                        {details.title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                        {details.desc}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="flex bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${categoryName.toLowerCase()} materials...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                        />
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Activity className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                ) : filteredAndSearched.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No {categoryName.toLowerCase()} materials found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later or adjust your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSearched.map((material) => (
                            <Link href={`/materials/${material._id}`} key={material._id}>
                                <div className="group flex flex-col h-full bg-white dark:bg-gray-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/80 hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`text-xs font-bold px-3 py-1 rounded-full ${typeColors[material.type] || typeColors['GENERAL']}`}>
                                            {material.type}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {material.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                                        {material.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                        {material.tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-[#0B1120]/80 px-2 py-1 rounded-md">
                                                <Tag className="w-3 h-3 mr-1" /> {tag}
                                            </span>
                                        ))}
                                        {material.tags.length > 3 && (
                                            <span className="text-xs text-gray-400 self-center">+{material.tags.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
