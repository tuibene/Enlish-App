'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Mic, Square, Loader2, User, Bot, AlertTriangle, ArrowLeft, Activity, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    pronunciation_feedback?: string;
    grammar_corrections?: string;
};

export default function SpeakingPracticePage() {
    const { token } = useContext(AuthContext) || {};
    
    // Core states
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am EngPrep AI, your native English speaking partner. Whenever you are ready, press the microphone button, tell me about your day, and I will give you detailed feedback on your pronunciation!' }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const startRecording = async () => {
        try {
            // Cancel any ongoing AI speech
            if (synthRef.current && isSpeaking) {
                synthRef.current.cancel();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Note: Different browsers support different mimeTypes. WebM is standard for Chromium.
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
            
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Release mic
            };

            mediaRecorderRef.current.start();
            setIsListening(true);
            setErrorMsg('');
        } catch (err) {
            console.error("Microphone access denied:", err);
            setErrorMsg("Microphone access denied. Please allow permissions in your browser.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const processAudio = async (blob: Blob) => {
        setIsThinking(true);
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            // Prepare messages context (send last 4 messages to keep it light)
            const chatContext = messages.slice(-4);

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ai-tutor/speak`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` })
                    },
                    body: JSON.stringify({ audioBase64: base64Audio, messages: chatContext })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    const newUserMsg: Message = { 
                        role: 'user', 
                        content: data.transcript || '(Unintelligible audio)',
                        pronunciation_feedback: data.pronunciation_feedback,
                        grammar_corrections: data.grammar_corrections
                    };
                    const newAiMsg: Message = { 
                        role: 'assistant', 
                        content: data.ai_response || "I didn't quite catch that."
                    };
                    
                    setMessages(prev => [...prev, newUserMsg, newAiMsg]);
                    speakText(newAiMsg.content);
                } else {
                    throw new Error("Server rejected request");
                }
            } catch (err) {
                console.error("API Error:", err);
                setErrorMsg("Failed to connect to the AI server. Please check your connection.");
            } finally {
                setIsThinking(false);
            }
        };
    };

    const speakText = (text: string) => {
        if (!synthRef.current) return;
        
        synthRef.current.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0; 
        utterance.pitch = 1.0;

        const voices = synthRef.current.getVoices();
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        const preferredVoice = enVoices.find(v => v.name.includes('Google') || v.name.includes('Female')) || enVoices[0];
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B1120]/80 pb-24 transition-colors font-sans overflow-hidden flex flex-col">
            {/* Navbar */}
            <div className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 w-full backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/practice" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Hub
                    </Link>
                    <div className="font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-full border border-rose-100 dark:border-rose-800/30">
                        <Mic className="w-4 h-4" /> Live Speaking & Evaluation
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-6 w-full px-6 flex-1 flex gap-6 h-[calc(100vh-8rem)]">

                {/* Left Side: Avatar & Controls */}
                <div className="w-1/3 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-[2rem] p-8 shadow-sm border border-rose-100 dark:border-gray-800 flex-1 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 w-full">
                        
                        {/* Animated Background rings if listening */}
                        {isListening && (
                            <>
                                <div className="absolute w-[250px] h-[250px] bg-rose-400/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                                <div className="absolute w-[350px] h-[350px] bg-rose-300/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                            </>
                        )}
                        
                        {/* Pulsing state when AI is thinking */}
                        {isThinking && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        )}

                        {/* Soundwave animation placeholder when AI speaks */}
                        {isSpeaking && !isListening && !isThinking && (
                            <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-30 pointer-events-none">
                                 <div className="w-3 h-24 bg-rose-500 rounded-full animate-pulse"></div>
                                 <div className="w-3 h-32 bg-rose-500 rounded-full animate-pulse delay-75"></div>
                                 <div className="w-3 h-48 bg-rose-500 rounded-full animate-pulse delay-150"></div>
                                 <div className="w-3 h-32 bg-rose-500 rounded-full animate-pulse delay-200"></div>
                                 <div className="w-3 h-24 bg-rose-500 rounded-full animate-pulse delay-300"></div>
                            </div>
                        )}

                        <div className="z-10 mb-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">EngPrep AI</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Native Voice Partner</p>
                        </div>

                        <button 
                            onClick={toggleListening}
                            disabled={isThinking}
                            className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 text-white shadow-xl transition-all duration-300 ${
                                isListening 
                                ? 'bg-red-500 hover:bg-red-600 scale-105 shadow-red-500/50' 
                                : isThinking
                                ? 'bg-gray-400 shadow-gray-400/20 cursor-not-allowed scale-95'
                                : 'bg-gradient-to-tr from-rose-500 to-pink-500 hover:scale-105 active:scale-95 shadow-rose-500/40'
                            }`}
                        >
                            {isListening ? (
                                <>
                                    <Square className="w-12 h-12 fill-white" />
                                    <span className="text-xs uppercase font-bold tracking-widest opacity-90 mt-1">Stop</span>
                                </>
                            ) : isThinking ? (
                                <>
                                    <Loader2 className="w-12 h-12 animate-spin" />
                                    <span className="text-xs uppercase font-bold tracking-widest opacity-90 mt-1">Analyzing</span>
                                </>
                            ) : (
                                <>
                                    <Mic className="w-14 h-14 mb-1" />
                                    <span className="text-xs uppercase font-bold tracking-widest opacity-90 text-center leading-tight">Tap to<br/>Speak</span>
                                </>
                            )}
                        </button>
                        
                        <div className="mt-10 h-10 flex items-center justify-center">
                            <p className="text-sm font-medium text-center z-10 text-gray-500 dark:text-gray-400">
                                {isListening 
                                    ? "Recording your voice... Speak naturally." 
                                    : isSpeaking 
                                    ? "AI is speaking..." 
                                    : "Hold the microphone and start talking!"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Conversation Live Transcript & Feedback */}
                <div className="w-2/3 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden relative">
                    
                    {errorMsg && (
                        <div className="absolute top-4 left-4 right-4 z-20 bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-800/50 shadow-sm backdrop-blur-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-medium">{errorMsg}</span>
                        </div>
                    )}

                    <div className="bg-gray-50/50 dark:bg-gray-900/30 px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center z-10 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                           <MessageSquare className="w-4 h-4 text-gray-400" />
                           <span className="font-bold text-gray-700 dark:text-gray-200 text-sm tracking-wide">Live Conversation & Feedback</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                             <span className="relative flex h-2.5 w-2.5">
                              {isListening || isThinking || isSpeaking ? (
                                  <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                  </>
                              ) : (
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-300 dark:bg-gray-600"></span>
                              )}
                            </span>
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {isListening ? 'Recording' : isThinking ? 'Analyzing' : isSpeaking ? 'Playing' : 'Standby'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex gap-4 max-w-[90%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                    m.role === 'user' 
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'bg-gradient-to-br from-rose-400 to-pink-500 text-white'
                                }`}>
                                    {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                </div>
                                <div className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-3.5 rounded-2xl ${
                                        m.role === 'user'
                                        ? 'bg-blue-500 text-white rounded-tr-none shadow-md inline-block max-w-full text-left'
                                        : 'bg-gray-100/80 text-gray-800 dark:bg-gray-700/80 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-600 inline-block max-w-full'
                                    }`}>
                                        <p className="text-[15px] leading-relaxed font-medium">{m.content}</p>
                                    </div>

                                    {/* Actionable Feedback Cards for User Messages */}
                                    {m.role === 'user' && (m.pronunciation_feedback || m.grammar_corrections) && (
                                        <div className="mt-1 w-full max-w-[400px] bg-rose-50/80 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30 rounded-2xl p-4 text-sm shadow-sm backdrop-blur-sm text-left">
                                            {m.pronunciation_feedback && (
                                                <div className="mb-3">
                                                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold mb-1.5">
                                                        <Activity className="w-4 h-4" /> Pronunciation Check
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300/90 leading-relaxed text-[13.5px]">
                                                        {m.pronunciation_feedback}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {m.grammar_corrections && !m.grammar_corrections.toLowerCase().includes("perfect grammar") && m.grammar_corrections.toLowerCase() !== "none" && (
                                                <div className={`pt-3 border-t border-rose-200/60 dark:border-rose-800/50 ${!m.pronunciation_feedback ? 'border-t-0 pt-0' : ''}`}>
                                                   <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold mb-1.5">
                                                      <CheckCircle2 className="w-4 h-4" /> Grammar Fixes
                                                   </div>
                                                   <p className="text-gray-700 dark:text-gray-300/90 leading-relaxed text-[13.5px]">
                                                      {m.grammar_corrections}
                                                   </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Recording status indicator in chat */}
                        {isListening && (
                            <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse opacity-70">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                    <Mic className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-tr-none flex items-center gap-2 shadow-sm">
                                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                     <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

            </div>
        </div>
    );
}
