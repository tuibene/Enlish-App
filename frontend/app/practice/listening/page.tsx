'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Headphones, ArrowLeft, Play, Pause, FastForward, Rewind, Sparkles, Search, RefreshCw, AlertCircle, Quote, Library } from 'lucide-react';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';

const listeningLessons = [
    {
        id: 'track_1',
        title: 'At the Coffee Shop',
        badge: 'Basic • A2',
        audioUrl: 'https://res.cloudinary.com/dw5fiywyd/video/upload/v1776230189/english-learning/audios/coffee-chat.mp3',
        subtitles: [
            { id: 0, start: 0, end: 3, text: "Welcome to StarBrew. What can I get for you today?" },
            { id: 1, start: 3, end: 7, text: "Hi, I'd like a medium iced caramel macchiato, please." },
            { id: 2, start: 7, end: 11, text: "Can I get that with almond milk instead of regular milk?" },
            { id: 3, start: 11, end: 15, text: "Absolutely. Would you like whipped cream on top?" },
            { id: 4, start: 15, end: 18, text: "It comes included with the caramel macchiato." },
            { id: 5, start: 18, end: 20, text: "No whipped cream, thank you." },
            { id: 6, start: 20, end: 24, text: "Oh, and can I also have one of those chocolate chip muffins?" },
            { id: 7, start: 24, end: 30, text: "Sure thing. That'll be eight dollars and fifty cents." },
        ]
    },
    {
        id: 'track_2',
        title: 'Airport Gate Change',
        badge: 'Intermediate • B2',
        audioUrl: 'https://res.cloudinary.com/dw5fiywyd/video/upload/v1776230190/english-learning/audios/airport-announcement.mp3',
        subtitles: [
            { id: 0, start: 0, end: 5, text: "Attention all passengers traveling on Flight 8 1 2 to New York." },
            { id: 1, start: 5, end: 8, text: "This is a gate change announcement." },
            { id: 2, start: 8, end: 14, text: "Your departure gate has been changed from Gate B 4 to Gate C 12." },
            { id: 3, start: 14, end: 18, text: "Once again, passengers on Flight 8 1 2 to New York," },
            { id: 4, start: 18, end: 22, text: "please proceed immediately to Gate C 12." },
            { id: 5, start: 22, end: 26, text: "Boarding will commence in approximately ten minutes." },
            { id: 6, start: 26, end: 34, text: "We apologize for any inconvenience this may cause and thank you for flying with us." },
        ]
    },
    {
        id: 'track_3',
        title: 'AI & The Modern Workforce',
        badge: 'Advanced • C1',
        audioUrl: 'https://res.cloudinary.com/dw5fiywyd/video/upload/v1776209643/english-learning/audios/placement-audio.mp3',
        subtitles: [
            { id: 0, start: 0, end: 2, text: "Good morning everyone." },
            { id: 1, start: 2, end: 11, text: "In today's presentation, we will explore the profound impact of Artificial Intelligence on the modern workforce." },
            { id: 2, start: 11, end: 20, text: "While media often highlights the fear of job displacement, recent economic data paints a different picture." },
            { id: 3, start: 20, end: 28, text: "According to the World Economic Forum, by 2025, AI is expected to displace 85 million jobs globally," },
            { id: 4, start: 28, end: 32, text: "but it will simultaneously create 97 million new roles." },
            { id: 5, start: 32, end: 41, text: "This net positive growth strongly suggests that the central theme of our technological future is not unemployment," },
            { id: 6, start: 41, end: 45, text: "but rather an urgent need for workforce reskilling." },
            { id: 7, start: 45, end: 55, text: "The key evidence lies in the rising demand for data analysts and AI specialists across all major industries." },
        ]
    }
];

export default function ListeningPracticePage() {
    const { token } = useContext(AuthContext) || {};
    
    // Track State
    const [activeLessonId, setActiveLessonId] = useState(listeningLessons[0].id);
    const activeLesson = listeningLessons.find(l => l.id === activeLessonId) || listeningLessons[0];

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    
    // AI Tutor States
    const [selectedText, setSelectedText] = useState('');
    const [explanationData, setExplanationData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const transcriptRef = useRef<HTMLDivElement>(null);

    // Auto-scroll when subtitles change naturally
    const [activeIndex, setActiveIndex] = useState(-1);

    // Reset player on lesson change
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setSelectedText('');
        setExplanationData(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            // Force reload audio when source changes
            audioRef.current.load();
        }
    }, [activeLessonId]);


    useEffect(() => {
        const index = activeLesson.subtitles.findIndex(s => currentTime >= s.start && currentTime <= s.end);
        if (index !== activeIndex && index !== -1) {
            setActiveIndex(index);
        }
    }, [currentTime, activeLesson]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const jumpToTime = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const changeSpeed = () => {
        const newRate = playbackRate === 1 ? 0.75 : playbackRate === 0.75 ? 0.5 : 1;
        setPlaybackRate(newRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = newRate;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // AI Highlight logic
    const handleTextSelection = async () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const text = selection.toString().trim();
        
        // Basic limits
        if (!text || text.length > 100 || text.split(/\s+/).length > 20) {
             return;
        }

        setSelectedText(text);
        setLoading(true);
        setExplanationData(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ai-tutor/explain`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({ 
                    text: text, 
                    context: `Audio transcript: "${activeLesson.subtitles.map(s=>s.text).join(' ')}"`
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setExplanationData(data);
            } else {
                setExplanationData({
                    definition: "Failed to fetch AI explanation due to server limits. Please try again later.",
                });
            }
        } catch (error) {
            setExplanationData({
                definition: "Failed to connect to the AI Tutor server.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B1120]/80 pb-24 transition-colors">
            {/* Hidden Audio Element */}
            <audio 
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            >
                <source src={activeLesson.audioUrl} type="audio/mpeg" />
            </audio>

            {/* Navbar */}
            <div className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 w-full backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/practice" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Hub
                    </Link>
                    <div className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Headphones className="w-5 h-5" /> Listening Acquisition
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
                
                {/* Audio & Transcript Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* Lesson Selector */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 flex overflow-x-auto hide-scrollbar">
                        {listeningLessons.map((lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                className={`flex-1 min-w-[200px] py-3 px-6 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex flex-col items-center gap-1 ${
                                    activeLessonId === lesson.id 
                                    ? 'bg-emerald-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
                                }`}
                            >
                                <span className="flex items-center gap-2"><Library className="w-4 h-4"/> {lesson.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Audio Player Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
                        {/* Background subtle decoration */}
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>

                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 inline-block shadow-sm">
                            {activeLesson.badge}
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">{activeLesson.title}</h1>
                        
                        <div className="max-w-md mx-auto">
                            {/* Graphic visualizer mock */}
                            <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-emerald-400 to-teal-600 rounded-3xl shadow-lg mb-8 flex items-center justify-center relative overflow-hidden transition-transform duration-500 hover:scale-105">
                                <Headphones className="w-12 h-12 text-white opacity-90" />
                                {isPlaying && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center transition-opacity">
                                        <div className="flex gap-1 items-center justify-center">
                                            <span className="w-1.5 h-6 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-10 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            <span className="w-1.5 h-8 bg-white rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-sm font-medium text-gray-500 w-12 text-right tabular-nums">{formatTime(currentTime)}</span>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max={duration || 100} 
                                    value={currentTime} 
                                    onChange={handleSeek}
                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none accent-emerald-500 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-500 w-12 text-left tabular-nums">{formatTime(duration)}</span>
                            </div>
                            
                            <div className="flex items-center justify-center gap-6">
                                <button 
                                    onClick={changeSpeed}
                                    className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-700 transition shadow-sm"
                                    title="Adjust playback speed"
                                >
                                    {playbackRate}x
                                </button>

                                <button onClick={() => jumpToTime(Math.max(0, currentTime - 5))} className="p-2 text-gray-500 hover:text-emerald-500 transition-colors">
                                    <Rewind className="w-6 h-6" />
                                </button>
                                
                                <button 
                                    className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 hover:-translate-y-1"
                                    onClick={togglePlay}
                                >
                                    {isPlaying ? <Pause className="w-8 h-8 focus:outline-none" /> : <Play className="w-8 h-8 ml-1 focus:outline-none" />}
                                </button>
                                
                                <button onClick={() => jumpToTime(Math.min(duration, currentTime + 5))} className="p-2 text-gray-500 hover:text-emerald-500 transition-colors">
                                    <FastForward className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Subtitles */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 w-full overflow-hidden">
                        <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                            <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Quote className="w-4 h-4 text-emerald-500" /> Interactive AI Transcript
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">Highlight idioms for instant translation</p>
                        </div>
                        
                        <div 
                            className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700" 
                            ref={transcriptRef}
                            onMouseUp={handleTextSelection}
                            onTouchEnd={handleTextSelection}    
                        >
                            {activeLesson.subtitles.map((sub, index) => {
                                const isActive = activeIndex === index;
                                return (
                                    <div 
                                        key={sub.id} 
                                        onClick={() => jumpToTime(sub.start)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                                            isActive 
                                            ? 'bg-emerald-50 border border-emerald-200 shadow-sm dark:bg-emerald-900/20 dark:border-emerald-800/50 scale-[1.01]' 
                                            : 'border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <span className={`text-xs font-mono pt-1 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {formatTime(sub.start)}
                                            </span>
                                            <p className={`text-lg leading-relaxed transition-colors ${isActive ? 'text-emerald-900 dark:text-emerald-100 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {sub.text}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* AI Explanation Sidebar */}
                <div className="w-full md:w-[400px] lg:w-[420px] shrink-0">
                    <div className="sticky top-24 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-md border border-emerald-100 dark:border-gray-700 h-[calc(100vh-8rem)] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-200/50 dark:border-gray-700">
                            <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">AI Listening Tutor</h2>
                        </div>

                        {!selectedText && (
                            <div className="flex flex-col items-center justify-center text-center h-48 text-gray-500 dark:text-gray-400">
                                <Search className="w-10 h-10 mb-4 opacity-20 text-emerald-900 dark:text-emerald-100" />
                                <p className="font-medium text-sm px-4">Highlight idioms, slang, or difficult phrases in the transcript to receive definitions and cultural context.</p>
                            </div>
                        )}

                        {selectedText && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-lg border border-emerald-200 dark:border-gray-600 isolate">
                                    <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                                        <div>
                                            <h3 className="font-black text-2xl text-emerald-700 dark:text-emerald-400 break-words leading-tight">"{selectedText}"</h3>
                                            {explanationData?.phonetic && <p className="text-gray-500 font-mono text-sm mt-1">{explanationData.phonetic}</p>}
                                        </div>
                                    </div>
                                    
                                    {loading ? (
                                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium py-4">
                                            <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                                            Deeply analyzing contextual meaning in speech...
                                        </div>
                                    ) : explanationData ? (
                                        <div className="space-y-5 mt-4">
                                            {/* EN Definition */}
                                            {explanationData.definition && (
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Eng Context</h4>
                                                    <p className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-relaxed">{explanationData.definition}</p>
                                                </div>
                                            )}
                                            
                                            {/* VI Translation */}
                                            {explanationData.translation && (
                                                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30">
                                                    <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Vietnamese Meaning</h4>
                                                    <p className="text-gray-900 dark:text-white text-sm font-bold leading-relaxed">{explanationData.translation}</p>
                                                </div>
                                            )}

                                            {/* Grammar */}
                                            {explanationData.grammar && (
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Grammar Note</h4>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-l-2 border-emerald-200 dark:border-gray-600 pl-3">{explanationData.grammar}</p>
                                                </div>
                                            )}

                                            {/* Example */}
                                            {explanationData.example && (
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Conversational Example</h4>
                                                    <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{explanationData.example}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
