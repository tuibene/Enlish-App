'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { Clock, Play, Headphones, BookOpen, PenTool, Mic, ArrowRight, ArrowLeft, CheckCircle, Volume2, Activity } from 'lucide-react';
import Link from 'next/link';

// --- IndexedDB Helpers for Robust Audio Storage ---
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') return reject('IndexedDB not supported');
        const request = indexedDB.open('SpeakingStorage', 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('audios')) {
                db.createObjectStore('audios');
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveAudioToDB = async (key: string, blob: Blob) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction('audios', 'readwrite');
            tx.objectStore('audios').put(blob, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("IndexedDB Save Error", e);
    }
};

const getAudioFromDB = async (key: string): Promise<Blob | null> => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('audios', 'readonly');
            const req = tx.objectStore('audios').get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.error("IndexedDB Load Error", e);
        return null;
    }
};

const clearAudioFromDB = async (examId: string) => {
    try {
        const db = await openDB();
        const tx = db.transaction('audios', 'readwrite');
        const store = tx.objectStore('audios');
        // Clear all keys matching this exam
        const req = store.getAllKeys();
        req.onsuccess = () => {
            const keys = req.result as string[];
            keys.forEach(k => {
                if (k.startsWith(`mock_${examId}_`)) {
                    store.delete(k);
                }
            });
        };
    } catch (e) {
        console.error("IndexedDB Clear Error", e);
    }
};

// --- MAIN COMPONENT ---
export default function IELTSMockTestPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMock = async () => {
            // Check cache for exam data
            const cached = sessionStorage.getItem(`mock_data_${unwrappedParams.id}`);
            if (cached) {
                try {
                    setData(JSON.parse(cached));
                    setLoading(false);
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/official-mocks/${unwrappedParams.id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch mock exam');
                }
                const examData = await res.json();
                setData(examData);
                sessionStorage.setItem(`mock_data_${unwrappedParams.id}`, JSON.stringify(examData));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMock();
    }, [unwrappedParams.id]);

    const sections = ['Listening', 'Reading', 'Writing', 'Speaking'];
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(2400); // 40 mins initial for Listening
    const [timerActive, setTimerActive] = useState(false);
    
    // Test Start State
    const [testStarted, setTestStarted] = useState(false);

    // Section Data States
    const [speakingPart, setSpeakingPart] = useState(0);
    const [writingTask, setWritingTask] = useState(1);
    const [readingPassage, setReadingPassage] = useState(0);
    const [essay1, setEssay1] = useState('');
    const [essay2, setEssay2] = useState('');
    
    // Objective Questions States
    const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
    const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});

    // Submission and Results States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultData, setResultData] = useState<any>(null);

    // Speaking Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrlMap, setAudioUrlMap] = useState<Record<number, string>>({});
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // --- Persistence Logic ---
    // --- Session Persistence Removed by Request ---
    // The test will now always start fresh when navigating away and back.


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                
                // Save to IndexedDB (Robust storage)
                const dbKey = `mock_${unwrappedParams.id}_part_${speakingPart}`;
                await saveAudioToDB(dbKey, blob);
                
                // Update local UI URL
                const url = URL.createObjectURL(blob);
                setAudioUrlMap(prev => ({ ...prev, [speakingPart]: url }));

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check your browser permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    useEffect(() => {
        let timer: any;
        if (timerActive && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && timerActive) {
            handleNextSection();
        }
        return () => clearInterval(timer);
    }, [timerActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStartTest = () => {
        setTestStarted(true);
        setTimerActive(true);
        setTimeLeft(40 * 60); // 40 mins for Listening
    };

    const submitTest = async () => {
        setTimerActive(false);
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('listeningAnswers', JSON.stringify(listeningAnswers));
            formData.append('readingAnswers', JSON.stringify(readingAnswers));
            formData.append('writingTask1', essay1);
            formData.append('writingTask2', essay2);

            // Fetch Blobs from IndexedDB
            for (let i = 0; i < 3; i++) {
                const blob = await getAudioFromDB(`mock_${unwrappedParams.id}_part_${i}`);
                if (blob) {
                    formData.append('audioFiles', blob, `speakingPart${i}.webm`);
                }
            }

            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/mock-exams/evaluate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Submission failed');
            const data = await res.json();
            setResultData(data);
            
            // Clear all persistence on success
            sessionStorage.removeItem(`mock_session_${unwrappedParams.id}`);
            sessionStorage.removeItem(`mock_data_${unwrappedParams.id}`);
            await clearAudioFromDB(unwrappedParams.id);
        } catch (error) {
            console.error("AI Evaluation failed:", error);
            alert("Submitting failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextSection = () => {
        if (currentSectionIndex < sections.length - 1) {
            const nextIdx = currentSectionIndex + 1;
            setCurrentSectionIndex(nextIdx);
            
            // Set specific timers per section as per real IELTS
            if (nextIdx === 1) setTimeLeft(60 * 60); // Reading 60m
            if (nextIdx === 2) setTimeLeft(60 * 60); // Writing 60m
            if (nextIdx === 3) setTimeLeft(15 * 60); // Speaking 15m
        } else {
            // Finish Test
            submitTest();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-[#121212]">
                <div className="flex flex-col items-center gap-4 text-blue-600 dark:text-blue-400">
                    <Activity className="w-12 h-12 animate-pulse" />
                    <p className="font-semibold text-gray-600 dark:text-gray-300">Loading Official Mock Setup...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] dark:bg-[#121212] p-4 text-center">
                <h1 className="text-2xl font-bold dark:text-white mb-4">Exam Not Found</h1>
                <Link href="/exams" className="text-blue-500 hover:text-blue-600 font-bold underline">Return to Exam Center</Link>
            </div>
        );
    }

    if (!testStarted) {
        return (
            <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 max-w-2xl w-full rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{data.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">This is a strict implementation of the Computer-Delivered IELTS format. Ensure you have a stable internet connection, headphones, and a working microphone.</p>
                    
                    <div className="flex justify-center gap-8 mb-10 text-sm font-bold text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col items-center"><Headphones className="w-6 h-6 mb-2 text-indigo-500" /> 40 Mins</div>
                        <div className="flex flex-col items-center"><BookOpen className="w-6 h-6 mb-2 text-blue-500" /> 60 Mins</div>
                        <div className="flex flex-col items-center"><PenTool className="w-6 h-6 mb-2 text-orange-500" /> 60 Mins</div>
                        <div className="flex flex-col items-center"><Mic className="w-6 h-6 mb-2 text-rose-500" /> 15 Mins</div>
                    </div>

                    <button 
                        onClick={handleStartTest}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-xl text-lg transition-transform hover:scale-105 shadow-lg shadow-indigo-500/30"
                    >
                        Begin Examination
                    </button>
                    
                    <div className="mt-6">
                        <Link href="/exams" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">Cancel and return</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#121212] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold dark:text-white">AI is grading your exam...</h2>
                <p className="text-gray-500 mt-2">Listening to your audio and reading your essays</p>
            </div>
        );
    }

    if (resultData) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#121212] overflow-y-auto pt-10 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Test Completed</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">Your mock exam has been evaluated by Gemini AI.</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-12 mb-10 pb-10 border-b border-gray-100 dark:border-gray-700">
                            <div className={`w-48 h-48 rounded-full border-8 flex flex-col items-center justify-center shadow-inner ${resultData.evaluation.overallBand >= 7 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : resultData.evaluation.overallBand >= 5 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'}`}>
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">OVERALL BAND</span>
                                <span className={`text-5xl font-black ${resultData.evaluation.overallBand >= 7 ? 'text-emerald-600' : resultData.evaluation.overallBand >= 5 ? 'text-indigo-600' : 'text-orange-600'}`}>{resultData.evaluation.overallBand.toFixed(1)}</span>
                                <span className="text-xs font-bold text-gray-400 mt-1">/ 9.0</span>
                            </div>
                            <div className="flex-1 w-full flex flex-col gap-4">
                                {[
                                    { label: 'Listening', band: resultData.evaluation.listeningBand, icon: <Headphones className="w-5 h-5"/>, color: 'indigo' },
                                    { label: 'Reading', band: resultData.evaluation.readingBand, icon: <BookOpen className="w-5 h-5"/>, color: 'blue' },
                                    { label: 'Writing', band: resultData.evaluation.writingBand, icon: <PenTool className="w-5 h-5"/>, color: 'orange' },
                                    { label: 'Speaking', band: resultData.evaluation.speakingBand, icon: <Mic className="w-5 h-5"/>, color: 'rose' },
                                ].map(skill => (
                                    <div key={skill.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <span className={`font-bold flex items-center gap-2 text-${skill.color}-500`}>{skill.icon} {skill.label}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${skill.band >= 7 ? 'bg-emerald-500' : skill.band >= 5 ? 'bg-indigo-500' : skill.band >= 3 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${(skill.band / 9) * 100}%`}}></div>
                                            </div>
                                            <span className="font-black text-xl w-10 text-right dark:text-white">{skill.band.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold dark:text-white mb-4">Overall Assessment</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed p-6 bg-blue-50 dark:bg-[#0B1120] rounded-xl border border-blue-100 dark:border-blue-900/30">
                                {resultData.evaluation.feedback}
                            </p>
                        </div>

                        {resultData.evaluation.detailedFeedback && (
                            <div>
                                <h3 className="text-xl font-bold dark:text-white mb-4">Detailed Skill Feedback</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Listening', key: 'listening', icon: <Headphones className="w-5 h-5"/>, borderColor: 'border-indigo-200 dark:border-indigo-800', bgColor: 'bg-indigo-50 dark:bg-indigo-900/10', textColor: 'text-indigo-700 dark:text-indigo-400' },
                                        { label: 'Reading', key: 'reading', icon: <BookOpen className="w-5 h-5"/>, borderColor: 'border-blue-200 dark:border-blue-800', bgColor: 'bg-blue-50 dark:bg-blue-900/10', textColor: 'text-blue-700 dark:text-blue-400' },
                                        { label: 'Writing', key: 'writing', icon: <PenTool className="w-5 h-5"/>, borderColor: 'border-orange-200 dark:border-orange-800', bgColor: 'bg-orange-50 dark:bg-orange-900/10', textColor: 'text-orange-700 dark:text-orange-400' },
                                        { label: 'Speaking', key: 'speaking', icon: <Mic className="w-5 h-5"/>, borderColor: 'border-rose-200 dark:border-rose-800', bgColor: 'bg-rose-50 dark:bg-rose-900/10', textColor: 'text-rose-700 dark:text-rose-400' },
                                    ].map(item => (
                                        <div key={item.key} className={`p-5 rounded-xl border ${item.borderColor} ${item.bgColor}`}>
                                            <h4 className={`font-bold flex items-center gap-2 mb-3 ${item.textColor}`}>{item.icon} {item.label}</h4>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                {resultData.evaluation.detailedFeedback[item.key] || 'No feedback available.'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {resultData.roadmap && (
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 shadow-xl text-white">
                            <div className="mb-4 flex items-center gap-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Recommended Roadmap</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2">{resultData.roadmap.title}</h3>
                            <p className="text-blue-100 mb-8 max-w-2xl">{resultData.roadmap.description}</p>
                            
                            <div className="flex gap-4">
                                <Link href="/courses" className="bg-white text-indigo-600 hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-colors">
                                    Start Learning Now
                                </Link>
                                <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                                    Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212]">
            {/* Top Bar - Strict IELTS Computer Format */}
            <div className="h-16 bg-[#1A1A1A] text-white flex items-center justify-between px-6 shrink-0 border-b border-gray-800">
                <div className="font-bold tracking-widest uppercase flex items-center gap-4">
                    <span className="text-gray-400 border border-gray-600 px-2 py-0.5 rounded text-xs">CD-IELTS</span>
                    {sections[currentSectionIndex]}
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-lg font-mono font-bold tracking-widest text-[#FFC107] bg-[#333] px-4 py-1 rounded">
                        <Clock className="w-4 h-4 inline mr-2 text-gray-400" /> 
                        {formatTime(timeLeft)}
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <button className="text-sm font-bold bg-[#333] hover:bg-[#444] px-4 py-1.5 rounded transition-colors hidden md:block">Help</button>
                    <button className="text-sm font-bold bg-[#333] hover:bg-[#444] px-4 py-1.5 rounded transition-colors hidden md:block">Settings</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* 1. LISTENING SECTION */}
                {sections[currentSectionIndex] === 'Listening' && (
                    <div className="h-full flex flex-col relative bg-[#FAFAFA] dark:bg-[#121212]">
                        {/* Pinned Audio Player */}
                        <div className="bg-white dark:bg-[#1A1A1A] p-4 flex justify-center items-center shadow border-b border-gray-200 dark:border-gray-800 z-20 shrink-0 sticky top-0">
                            <div className="w-full max-w-3xl flex items-center gap-4">
                                <Headphones className="w-6 h-6 text-indigo-500 shrink-0" />
                                <audio controls className="w-full" controlsList="nodownload" preload="auto">
                                    <source src={data.listeningAudioUrl || "https://res.cloudinary.com/dw5fiywyd/video/upload/v1776280302/english-learning/ielts-mock/ielts-mock-listening-lecture.mp3"} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                                {(()=>{
                                    let qCounter = 1;
                                    return data.listeningParts?.length > 0 ? data.listeningParts.map((part: any, pIdx: number) => (
                                        <div key={pIdx} className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Part {part.partNumber}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 font-bold italic mb-8">{part.instruction}</p>
                                            
                                            <div className="space-y-8">
                                                {part.questions.map((q: any, qIdx: number) => {
                                                    const qNum = qCounter++;
                                                    
                                                    if (part.type === 'gap-fill') {
                                                        const parts = q.text.split('[GAP]');
                                                        return (
                                                            <div key={qIdx} className="flex flex-wrap items-center gap-2 text-lg text-gray-800 dark:text-gray-200 leading-10">
                                                                <span className="font-bold">{qNum}.</span>
                                                                <span>{parts[0]}</span>
                                                                {parts.length > 1 && (
                                                                    <>
                                                                        <input 
                                                                            type="text" 
                                                                            className="border border-gray-300 dark:border-gray-600 focus:border-indigo-500 bg-white dark:bg-gray-800 min-w-[150px] outline-none text-center px-2 py-1 rounded font-bold text-indigo-700 dark:text-indigo-400 shadow-inner" 
                                                                            value={listeningAnswers[qNum] || ''} 
                                                                            onChange={(e) => setListeningAnswers({ ...listeningAnswers, [qNum]: e.target.value })} 
                                                                        />
                                                                        <span>{parts[1]}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    } else if (part.type === 'multiple-choice') {
                                                        return (
                                                            <div key={qIdx} className="mb-6 p-6 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                                                <p className="text-lg text-gray-900 dark:text-gray-100 mb-4 font-medium"><strong className="mr-2">{qNum}.</strong> {q.text}</p>
                                                                <div className="flex flex-col gap-3 pl-6">
                                                                    {q.options.map((opt: string, oIdx: number) => {
                                                                        if (!opt) return null;
                                                                        const optLabel = String.fromCharCode(65 + oIdx);
                                                                        return (
                                                                            <label key={oIdx} className="flex items-center gap-4 cursor-pointer group">
                                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${listeningAnswers[qNum] === optLabel ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400 group-hover:border-indigo-400'}`}>
                                                                                    {listeningAnswers[qNum] === optLabel && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                                                                                </div>
                                                                                <input 
                                                                                    type="radio" 
                                                                                    name={`q_${pIdx}_${qIdx}`}
                                                                                    className="hidden"
                                                                                    value={optLabel}
                                                                                    checked={listeningAnswers[qNum] === optLabel}
                                                                                    onChange={() => setListeningAnswers({...listeningAnswers, [qNum]: optLabel})}
                                                                                />
                                                                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-lg">
                                                                                    <strong className="mr-2">{optLabel}.</strong> {opt}
                                                                                </span>
                                                                            </label>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center text-gray-500 py-20 font-bold border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">Listening simulation not configured.</div>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. READING SECTION (Split Screen) */}
                {sections[currentSectionIndex] === 'Reading' && (
                    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#121212]">
                        {/* Tabs for Reading Passages */}
                        <div className="bg-white dark:bg-[#1A1A1A] px-6 pt-4 flex gap-2 border-b border-gray-200 dark:border-gray-800">
                            {data.readingParts?.map((part: any, pIdx: number) => (
                                <button 
                                    key={pIdx}
                                    onClick={() => setReadingPassage(pIdx)}
                                    className={`px-6 py-3 rounded-t-xl font-bold transition-colors ${readingPassage === pIdx ? 'bg-[#FAFAFA] dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t-4 border-blue-600 dark:border-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-t-4 border-transparent'}`}
                                >
                                    {part.title || `Passage ${pIdx + 1}`}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Pane - Reading Passage */}
                            <div className="w-1/2 p-8 border-r border-gray-200 dark:border-gray-800 overflow-y-auto bg-[#FAFAFA] dark:bg-[#18181b]">
                                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300 leading-8">
                                    {data.readingParts?.[readingPassage]?.text.split('\n').map((para: string, i: number) => (
                                        <p key={i} className="mb-4">{para}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Right Pane - Questions */}
                            <div className="w-1/2 p-4 md:p-8 overflow-y-auto bg-white dark:bg-[#09090b]">
                                <div className="max-w-xl mx-auto pb-20">
                                {(()=>{
                                    // To compute continuous global question numbers, we must accumulate questions from ALL previous passages first
                                    let globalQNum = 1;
                                    for(let i=0; i<readingPassage; i++){
                                        data.readingParts[i].questionGroups?.forEach((g: any) => globalQNum += g.questions.length);
                                    }

                                    return data.readingParts?.[readingPassage]?.questionGroups?.map((group: any, gIdx: number) => {
                                        return (
                                            <div key={gIdx} className="mb-10 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                <p className="mb-6 font-bold text-gray-800 dark:text-gray-200 italic">{group.instruction}</p>
                                                
                                                {group.type === 'tfng' && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded text-sm mb-6 dark:text-gray-300 border border-blue-100 dark:border-blue-900/30 font-medium">
                                                        <p><strong>TRUE</strong> if the statement agrees with the information</p>
                                                        <p><strong>FALSE</strong> if the statement contradicts the information</p>
                                                        <p><strong>NOT GIVEN</strong> if there is no information on this</p>
                                                    </div>
                                                )}

                                                <div className="space-y-6">
                                                    {group.questions.map((q: any, qIdx: number) => {
                                                        const qNum = globalQNum++;
                                                        if (group.type === 'gap-fill') {
                                                            const parts = q.text.split('[GAP]');
                                                            return (
                                                                <div key={qIdx} className="flex flex-wrap items-center gap-2 text-lg text-gray-800 dark:text-gray-200 leading-10">
                                                                    <span className="font-bold">{qNum}.</span>
                                                                    <span>{parts[0]}</span>
                                                                    {parts.length > 1 && (
                                                                        <>
                                                                            <input 
                                                                                type="text" 
                                                                                className="border border-gray-300 dark:border-gray-600 focus:border-blue-500 bg-white dark:bg-gray-800 min-w-[150px] outline-none text-center px-2 py-1 rounded font-bold text-blue-700 dark:text-blue-400 shadow-inner" 
                                                                                value={readingAnswers[qNum] || ''} 
                                                                                onChange={(e) => setReadingAnswers({ ...readingAnswers, [qNum]: e.target.value })} 
                                                                            />
                                                                            <span>{parts[1]}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            );
                                                        } else if (group.type === 'tfng' || group.type === 'multiple-choice') {
                                                            return (
                                                                <div key={qIdx} className="flex flex-col gap-3">
                                                                    <span className="font-medium text-lg dark:text-gray-200"><strong className="mr-2">{qNum}.</strong> {q.text}</span>
                                                                    {group.type === 'tfng' ? (
                                                                        <div className="flex gap-6 mt-2 ml-6">
                                                                            {['True', 'False', 'Not Given'].map(opt => (
                                                                                <label key={opt} className="flex items-center gap-2 dark:text-gray-400 cursor-pointer text-base">
                                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${readingAnswers[qNum] === opt ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                                                                                        {readingAnswers[qNum] === opt && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                                                                                    </div>
                                                                                    <input type="radio" className="hidden" checked={readingAnswers[qNum] === opt} onChange={() => setReadingAnswers({ ...readingAnswers, [qNum]: opt })} />
                                                                                    <span className={readingAnswers[qNum] === opt ? 'text-blue-600 font-bold' : ''}>{opt}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col gap-3 ml-6 mt-1">
                                                                            {q.options.map((opt: string, oIdx: number) => {
                                                                                if (!opt) return null;
                                                                                const optLabel = String.fromCharCode(65 + oIdx);
                                                                                return (
                                                                                    <label key={oIdx} className="flex items-center gap-3 cursor-pointer group">
                                                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${readingAnswers[qNum] === optLabel ? 'border-blue-600 bg-blue-600' : 'border-gray-400 group-hover:border-blue-400'}`}>
                                                                                            {readingAnswers[qNum] === optLabel && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                                                        </div>
                                                                                        <input type="radio" className="hidden" checked={readingAnswers[qNum] === optLabel} onChange={() => setReadingAnswers({...readingAnswers, [qNum]: optLabel})} />
                                                                                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-base">
                                                                                            <strong className="mr-2">{optLabel}.</strong> {opt}
                                                                                        </span>
                                                                                    </label>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. WRITING SECTION (Split Screen) */}
                {sections[currentSectionIndex] === 'Writing' && (
                    <div className="h-full flex flex-col">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 flex gap-2 pl-6 shadow-sm border-b border-gray-200 dark:border-gray-700">
                            <button onClick={() => setWritingTask(1)} className={`px-6 py-2 rounded font-bold text-sm transition-colors ${writingTask === 1 ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Task 1</button>
                            <button onClick={() => setWritingTask(2)} className={`px-6 py-2 rounded font-bold text-sm transition-colors ${writingTask === 2 ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Task 2</button>
                        </div>
                        <div className="flex-1 flex">
                            {/* Left Pane - Prompt */}
                            <div className="w-1/2 p-8 border-r border-gray-200 dark:border-gray-800 overflow-y-auto bg-[#FAFAFA] dark:bg-[#1A1A1A]">
                                <h2 className="text-2xl font-bold dark:text-white mb-6">Writing Task {writingTask}</h2>
                                <div className="p-8 bg-white dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                                    <div className="prose dark:prose-invert font-medium text-gray-800 mb-8 whitespace-pre-line text-lg">
                                        {data.writingTasks?.find((t: any) => t.taskNumber === writingTask)?.instruction || `Please complete Writing Task ${writingTask}.`}
                                    </div>
                                    {data.writingTasks?.find((t: any) => t.taskNumber === writingTask)?.imageUrl && (
                                        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">Reference Material</p>
                                            <img 
                                                src={data.writingTasks.find((t: any) => t.taskNumber === writingTask).imageUrl} 
                                                alt={`Task ${writingTask} Reference`}
                                                className="w-full max-w-lg mx-auto rounded-xl shadow-md border border-gray-200 dark:border-gray-700" 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Right Pane - Textarea */}
                            <div className="w-1/2 flex flex-col bg-white dark:bg-[#121212]">
                                <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800 flex justify-end">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded">
                                        Word count: {writingTask === 1 ? essay1.trim().split(/\s+/).filter(w => w.length>0).length : essay2.trim().split(/\s+/).filter(w => w.length>0).length}
                                    </span>
                                </div>
                                <textarea 
                                    className="flex-1 w-full p-6 bg-transparent outline-none resize-none dark:text-white text-lg leading-relaxed"
                                    placeholder={`Start writing your Task ${writingTask} here... (Do not copy the prompt)`}
                                    value={writingTask === 1 ? essay1 : essay2}
                                    onChange={(e) => writingTask === 1 ? setEssay1(e.target.value) : setEssay2(e.target.value)}
                                    spellCheck={false}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. SPEAKING SECTION */}
                {sections[currentSectionIndex] === 'Speaking' && (
                    <div className="h-full flex items-center justify-center p-8 bg-gray-50 dark:bg-[#121212]">
                        <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-lg border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
                            
                            <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                                {isRecording && <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>}
                                <Mic className={`w-10 h-10 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-rose-500'}`} />
                            </div>
                            
                            <h2 className="text-3xl font-black dark:text-white mb-2">Speaking test - Part {speakingPart + 1}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Please speak clearly into your microphone when prompted.</p>

                            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-8 rounded-2xl mb-10 min-h-[200px] flex flex-col justify-center relative z-10 shadow-inner">
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100 italic mb-6">
                                    "{data.speakingParts?.[speakingPart]?.instruction}"
                                </p>
                                <ul className="text-left max-w-md mx-auto space-y-3">
                                    {data.speakingParts?.[speakingPart]?.questions?.map((q: string, qIdx: number) => (
                                        <li key={qIdx} className="flex gap-3 text-lg text-gray-700 dark:text-gray-300">
                                            <div className="w-6 h-6 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-300 shrink-0 flex items-center justify-center font-bold text-sm">{qIdx + 1}</div>
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {isRecording ? (
                                <div className="flex flex-col items-center mb-6">
                                    <div className="text-rose-600 dark:text-rose-400 font-bold mb-4 animate-pulse flex items-center gap-2"><Activity className="w-5 h-5"/> Recording... Speak now!</div>
                                    <button onClick={stopRecording} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-rose-600/30 transition-transform hover:scale-105">
                                        Stop Recording
                                    </button>
                                </div>
                            ) : (
                                <button onClick={startRecording} className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-rose-500/30 transition-transform hover:scale-105 mb-6">
                                    {audioUrlMap[speakingPart] ? 'Retake Recording' : 'Start Recording'}
                                </button>
                            )}

                            {audioUrlMap[speakingPart] && !isRecording && (
                                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 py-4 px-6 rounded-xl border border-emerald-100 dark:border-emerald-800 inline-block">
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Recorded Successfully!
                                    </p>
                                    <audio src={audioUrlMap[speakingPart]} controls className="mx-auto border border-rose-100 dark:border-gray-700 rounded-full shadow-sm" />
                                </div>
                            )}
                            
                            <div className="flex justify-center gap-2 mt-4">
                                <button onClick={() => setSpeakingPart(0)} className={`w-3 h-3 rounded-full ${speakingPart === 0 ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'}`}></button>
                                <button onClick={() => setSpeakingPart(1)} className={`w-3 h-3 rounded-full ${speakingPart === 1 ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'}`}></button>
                                <button onClick={() => setSpeakingPart(2)} className={`w-3 h-3 rounded-full ${speakingPart === 2 ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-600'}`}></button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Bottom Navigation Bar */}
            <div className="h-16 bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-between px-8 shrink-0 border-t border-gray-300 dark:border-gray-800">
                <div className="text-sm font-bold text-gray-500 flex gap-6">
                    {sections.map((sec, idx) => (
                        <div key={idx} className={`flex items-center gap-2 ${idx === currentSectionIndex ? 'text-blue-600 dark:text-blue-400' : 'opacity-50'}`}>
                            {idx < currentSectionIndex ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 border-2 rounded-full"></div>}
                            {sec}
                        </div>
                    ))}
                </div>
                <button 
                    onClick={handleNextSection}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2 rounded shadow transition-colors flex items-center gap-2 text-sm"
                >
                    {currentSectionIndex === sections.length - 1 ? 'Finish Exam' : 'Next Section'} <ArrowRight className="w-4 h-4" />
                </button>
            </div>

        </div>
    );
}
