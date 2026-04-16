'use client';

import React, { useState, useContext, useRef, useEffect } from 'react';
import { PenTool, ArrowLeft, Send, Loader2, Target, CheckCircle, AlertCircle, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';

const writingPrompts = [
    {
        id: 'prompt_1',
        title: 'Technology & Social Media',
        text: 'Some people think that strict punishments for driving offences are the key to reducing traffic accidents. Others, however, believe that other measures would be more effective. Discuss both these views and give your own opinion.'
    },
    {
        id: 'prompt_2',
        title: 'Education & Future',
        text: 'In many countries, schools have severe problems with student behaviour. What do you think are the causes of this? What solutions can you suggest?'
    },
    {
        id: 'prompt_3',
        title: 'Environment & Lifestyle',
        text: 'Nowadays many people choose to live and work in the city while others prefer the countryside. Discuss the advantages and disadvantages of each and give your own opinion.'
    }
];

export default function WritingPracticePage() {
    const { token } = useContext(AuthContext) || {};
    
    const [activePromptId, setActivePromptId] = useState(writingPrompts[0].id);
    const activePrompt = writingPrompts.find(p => p.id === activePromptId) || writingPrompts[0];

    const [essay, setEssay] = useState('');
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Reset stuff when prompt changes
    useEffect(() => {
        setEssay('');
        setResult(null);
    }, [activePromptId]);

    const handleGradeEssay = async () => {
        if (!essay.trim() || essay.trim().length < 50) {
            alert("Please write at least a few complete sentences (50 characters minimum) for the AI to provide meaningful feedback.");
            return;
        }
        
        setGrading(true);
        setResult(null);
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ai-tutor/grade-essay`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({ 
                    prompt: activePrompt.text,
                    essay: essay 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
            } else {
                setResult({
                    score: "ERR",
                    feedback: "Failed to grade essay. The server returned an unauthorized or internal error. Make sure you are logged in.",
                    improvements: []
                });
            }
        } catch (error) {
            setResult({
                score: "ERR",
                feedback: "A network error occurred while reaching the AI Grader.",
                improvements: []
            });
        } finally {
            setGrading(false);
            // Optionally scroll to result on mobile
            if (window.innerWidth < 1024) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        }
    };

    const wordCount = essay.trim().split(/\s+/).filter(w => w.length > 0).length;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B1120]/80 pb-24 transition-colors">
            {/* Navbar */}
            <div className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 w-full backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/practice" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Hub
                    </Link>
                    <div className="font-bold flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <PenTool className="w-5 h-5" /> Writing Composition
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
                
                {/* Editor Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* Prompt Selector */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 flex overflow-x-auto hide-scrollbar">
                        {writingPrompts.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setActivePromptId(p.id)}
                                className={`flex-1 min-w-[180px] py-3 px-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex flex-col items-center gap-1 ${
                                    activePromptId === p.id 
                                    ? 'bg-orange-500 text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
                                }`}
                            >
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4"/> {p.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-3 flex items-center gap-2">
                            IELTS Task 2 Prompt
                        </h2>
                        <p className="text-gray-800 dark:text-gray-200 text-lg font-medium leading-relaxed italic">
                            "{activePrompt.text}"
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px] focus-within:ring-2 focus-within:ring-orange-500/50 transition-all">
                        <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <span className="font-bold text-gray-700 dark:text-gray-300">Your Essay</span>
                            <div className="flex gap-4">
                                <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm border ${
                                    wordCount >= 250 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                                }`}>
                                    {wordCount} / 250 words
                                </span>
                            </div>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={essay}
                            onChange={(e) => setEssay(e.target.value)}
                            placeholder="Type or paste your essay here. A minimum of 250 words is recommended for IELTS Task 2..."
                            className="flex-1 w-full p-6 lg:p-8 text-lg bg-transparent text-gray-800 dark:text-gray-200 outline-none resize-none leading-relaxed"
                            spellCheck={false}
                        />
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button 
                                onClick={handleGradeEssay}
                                disabled={grading || !essay.trim()}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-transform shadow-lg shadow-orange-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:scale-95"
                            >
                                {grading ? <><Loader2 className="w-5 h-5 animate-spin" /> Deep AI Analysis in progress...</> : <><Send className="w-5 h-5" /> Submit to AI Examiner</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Grading Result Sidebar */}
                <div className="w-full lg:w-[450px] shrink-0">
                    <div className="sticky top-24 h-[calc(100vh-8rem)]">
                        {result ? (
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-md border border-orange-200/60 dark:border-gray-700 h-full overflow-y-auto animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-orange-200 dark:border-gray-700 relative">
                                    <div>
                                        <div className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em] mb-2">Estimated Band Score</div>
                                        <div className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter">{result.score}</div>
                                    </div>
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 text-white rounded-full flex items-center justify-center shadow-inner shadow-white/30 transform rotate-12">
                                        <Target className="w-10 h-10" />
                                    </div>
                                </div>
                                
                                <div className="mb-8">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg flex items-center gap-2">
                                        <PenTool className="w-5 h-5 text-orange-500" /> General Feedback
                                    </h3>
                                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-5 border border-orange-100 dark:border-gray-600 shadow-sm">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {result.feedback}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-500" /> Target Improvements
                                    </h3>
                                    
                                    {result.improvements && result.improvements.length > 0 ? (
                                        <div className="space-y-4 pb-4">
                                            {result.improvements.map((imp: any, idx: number) => (
                                                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm group hover:border-orange-300 transition-colors">
                                                    
                                                    <div className="flex items-start gap-3 mb-3 pb-3 border-b border-dashed border-gray-200 dark:border-gray-700">
                                                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                                            <span className="text-red-600 dark:text-red-400 text-xs font-bold">X</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 line-through decoration-red-300/50">
                                                            "{imp.original}"
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                            "{imp.better}"
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pl-9 text-xs text-gray-500 dark:text-gray-400 border-l-2 border-orange-200 dark:border-gray-600 ml-3">
                                                        <span className="font-bold text-orange-500 uppercase tracking-wider text-[10px] block mb-1">Why?</span>
                                                        {imp.explanation}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No specific improvements suggested by AI.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 h-full flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <PenTool className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="font-black text-gray-900 dark:text-white text-xl mb-3">Awaiting Submission</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] leading-relaxed">
                                    Type your essay on the left and submit it. Our AI Examiner will instantly provide a band score and specific corrections.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
