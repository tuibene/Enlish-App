"use client";
import React from 'react';
import Link from 'next/link';
import { BookOpen, Type, AlignLeft, Library, ArrowRight } from 'lucide-react';

export default function MaterialsHub() {
    const categories = [
        {
            id: 'vocabulary',
            title: 'Vocabulary Builder',
            description: 'Expand your word bank, master phrasal verbs, and learn idioms for better expression.',
            icon: <Type className="w-8 h-8 text-white" />,
            color: 'from-green-400 to-green-600',
            bgLight: 'bg-green-50',
            bgDark: 'dark:bg-green-900/10'
        },
        {
            id: 'grammar',
            title: 'Grammar Guide',
            description: 'Dive deep into grammar rules, tenses, and sentence structures to speak and write perfectly.',
            icon: <AlignLeft className="w-8 h-8 text-white" />,
            color: 'from-blue-400 to-blue-600',
            bgLight: 'bg-blue-50',
            bgDark: 'dark:bg-blue-900/10'
        },
        {
            id: 'reading',
            title: 'Reading Comprehension',
            description: 'Practice with graded articles, excerpts, and tests to improve reading speed and accuracy.',
            icon: <BookOpen className="w-8 h-8 text-white" />,
            color: 'from-purple-400 to-purple-600',
            bgLight: 'bg-purple-50',
            bgDark: 'dark:bg-purple-900/10'
        },
        {
            id: 'general',
            title: 'General Tips & Study Guides',
            description: 'Explore tips, tricks, study methods, and exam strategies to boost your overall performance.',
            icon: <Library className="w-8 h-8 text-white" />,
            color: 'from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700',
            bgLight: 'bg-gray-100',
            bgDark: 'dark:bg-gray-800/30'
        }
    ];

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 text-gray-900 dark:text-gray-100 transition-colors p-6 md:p-12 lg:p-20">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl mb-4">
                        <Library className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
                        Academic Knowledge Base
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Choose a dedicated section to start sharpening your English skills. Our curated materials are organized professionally to help you focus.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {categories.map((category) => (
                        <Link href={`/materials/category/${category.id}`} key={category.id}>
                            <div className={`group relative h-full flex flex-col p-8 md:p-10 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-white dark:bg-gray-800/50`}>

                                {/* Background Accent */}
                                <div className={`absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-gradient-to-br ${category.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-3xl`} />

                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg mb-8 transform group-hover:scale-110 transition-transform duration-300`}>
                                    {category.icon}
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    {category.title}
                                </h2>

                                <p className="text-lg text-gray-600 dark:text-gray-400 flex-grow leading-relaxed">
                                    {category.description}
                                </p>

                                <div className="mt-8 flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    Explore {category.title} <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
