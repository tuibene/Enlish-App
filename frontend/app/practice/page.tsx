'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, PenTool, Mic, ArrowRight, Zap, Target, Sparkles, Network, Bot } from 'lucide-react';

export default function PracticeHubPage() {
    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <span className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6 shadow-xl shadow-indigo-500/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <Network className="w-8 h-8" />
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight relative">
                        Smart Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Hub</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed relative">
                        Master all 4 language skills with the power of AI. From reading comprehension to real-life conversations, AI acts as your 1-on-1 private tutor.
                    </p>
                </div>

                {/* 4 Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:gap-10 xl:gap-12 gap-6 mb-16">

                    {/* READING */}
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 group flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-700 blur-2xl"></div>
                        
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transform group-hover:-rotate-6 transition-transform">
                                <BookOpen className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reading</h3>
                                <div className="text-blue-500 font-bold uppercase tracking-widest text-sm mt-1">Comprehension</div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-blue-500" /> 
                                <span><strong>Level-based reading</strong> modules from basic to advanced (IELTS, TOEIC, Communication).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-blue-500" /> 
                                <span><strong>AI explains vocabulary & grammar</strong> instantly when you highlight any phrase in the text.</span>
                            </li>
                        </ul>

                        <Link href="/practice/reading" className="w-full text-center bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 text-blue-700 hover:text-white dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white py-4 rounded-2xl font-bold transition-all duration-300 group-hover:shadow-lg flex items-center justify-center gap-2">
                            Start Reading <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* LISTENING */}
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 group flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-700 blur-2xl"></div>
                        
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transform group-hover:scale-110 transition-transform">
                                <Headphones className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">Listening</h3>
                                <div className="text-emerald-500 font-bold uppercase tracking-widest text-sm mt-1">Acquisition</div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-emerald-500" /> 
                                <span>Practice listening through <strong>real-life conversations, podcasts, and videos</strong> across various topics.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-emerald-500" /> 
                                <span><strong>AI auto-generates subtitles</strong> and instantly explains idioms and slang used by native speakers.</span>
                            </li>
                        </ul>

                        <Link href="/practice/listening" className="w-full text-center bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white py-4 rounded-2xl font-bold transition-all duration-300 group-hover:shadow-lg flex items-center justify-center gap-2">
                            Start Listening <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* WRITING */}
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 group flex flex-col relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/5 rounded-tr-full -z-10 group-hover:scale-125 transition-transform duration-700 blur-2xl"></div>
                        
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transform group-hover:-rotate-6 transition-transform">
                                <PenTool className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">Writing</h3>
                                <div className="text-orange-500 font-bold uppercase tracking-widest text-sm mt-1">Composition</div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-orange-500" /> 
                                <span><strong>Automated essay grading</strong> accurately benchmarked against international scoring scales.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-orange-500" /> 
                                <span>AI provides <strong>detailed syntax corrections</strong>, advanced vocabulary suggestions, and more natural phrasing.</span>
                            </li>
                        </ul>

                        <Link href="/practice/writing" className="w-full text-center bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-600 text-orange-700 hover:text-white dark:text-orange-400 dark:hover:bg-orange-600 dark:hover:text-white py-4 rounded-2xl font-bold transition-all duration-300 group-hover:shadow-lg flex items-center justify-center gap-2">
                            Start Writing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* SPEAKING */}
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 group flex flex-col relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/5 rounded-tr-full -z-10 group-hover:scale-125 transition-transform duration-700 blur-2xl"></div>
                        
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transform group-hover:scale-110 transition-transform">
                                <Mic className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">Speaking</h3>
                                <div className="text-rose-500 font-bold uppercase tracking-widest text-sm mt-1">Fluency</div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-rose-500" /> 
                                <span><strong>Conversational AI</strong> that speaks like a real native, featuring live, highly-accurate voice recognition.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-rose-500" /> 
                                <span><strong>Real-time detailed feedback</strong> on your Pronunciation and verbal Intonation.</span>
                            </li>
                        </ul>

                        <Link href="/practice/speaking" className="w-full text-center bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 text-rose-700 hover:text-white dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white py-4 rounded-2xl font-bold transition-all duration-300 group-hover:shadow-lg flex items-center justify-center gap-2">
                            Start Speaking <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* AI TUTOR */}
                    <div className="bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 group flex flex-col relative overflow-hidden md:col-span-2 lg:col-span-2">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full -z-10 group-hover:scale-110 transition-transform duration-700 blur-3xl pointer-events-none"></div>
                        
                        <div className="flex items-center gap-6 mb-8 mt-2">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transform group-hover:scale-110 transition-transform">
                                <Bot className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">AI Tutor <Sparkles className="w-6 h-6 text-yellow-400" /></h3>
                                <div className="text-purple-500 font-bold uppercase tracking-widest text-sm mt-1">Chat & Feedback</div>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-grow text-gray-700 dark:text-gray-300 max-w-3xl">
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-purple-500" /> 
                                <span><strong>Your 24/7 Personal Teacher</strong> to discuss any topic, review your grammar, or explain difficult concepts.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckIcon color="text-purple-500" /> 
                                <span><strong>Instant intelligent feedback</strong> adapted precisely to your proficiency level.</span>
                            </li>
                        </ul>

                        <Link href="/practice/ai-tutor" className="w-full md:w-auto self-start text-center bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-600 text-purple-700 hover:text-white dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white py-4 px-12 rounded-2xl font-bold transition-all duration-300 group-hover:shadow-lg flex items-center justify-center gap-2">
                            Start AI Tutor <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                </div>

            </div>
        </div>
    );
}

// Helper icon component
const CheckIcon = ({ color }: { color: string }) => (
    <div className={`mt-1 shrink-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-700 ${color}`}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    </div>
);
