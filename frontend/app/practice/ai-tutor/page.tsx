'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Send, Bot, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AITutorPage() {
    const { user, token } = useContext(AuthContext) || {};
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome-msg',
            role: 'assistant',
            content: "Hello! I'm your English Tutor. I'm here to practice conversation with you and help you improve naturally. How are you doing today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || !user || !token) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare message history for backend
            const chatHistory = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content
            }));

            // Retry logic for transient failures (cold start, timeout, etc.)
            const maxRetries = 2;
            let lastError: Error | null = null;

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ai-tutor`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ messages: chatHistory }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);
                    const data = await res.json();

                    if (res.ok && data.text) {
                        const botMsg: Message = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: data.text,
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, botMsg]);
                        return; // Success — exit
                    }

                    // Non-OK response but not retryable (e.g. 400 bad request)
                    if (res.status === 400) throw new Error(data.message || 'Bad request');

                    // Server returned error — retry
                    lastError = new Error(data.message || `Server error ${res.status}`);
                } catch (err: unknown) {
                    lastError = err instanceof Error ? err : new Error(String(err));
                    if (lastError.name === 'AbortError') {
                        lastError = new Error('Request timed out');
                    }
                }

                // Wait before retrying (1.5s, 3s)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
                }
            }

            // All retries exhausted
            console.error("AI Error after retries:", lastError);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Oops! I'm having trouble connecting right now. Please try sending your message again in a moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);

        } catch (error) {
            console.error("Network Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Hmm, my connection seems to be down. Please check your internet or try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <p className="text-gray-500">Please log in to chat with the AI Tutor.</p>
            </div>
        );
    }

    // Function to render text with markdown-styled bolding for grammar corrections (e.g. *Correction: ...*)
    const renderMarkdownText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index} className="italic text-indigo-200 bg-indigo-900/40 px-1 rounded">{part.slice(1, -1)}</em>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 pb-12 transition-colors">
            {/* Standard App Header area - handled by layout, but we add a sub-header */}
            <div className="bg-white/80 dark:bg-[#0B1120]/80 shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-16 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/practice" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mr-4 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3 relative">
                                <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">EngPrep AI Tutor</h1>
                                <p className="text-xs text-green-500 font-medium">Online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="max-w-4xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 flex flex-col h-[calc(100vh-220px)] overflow-hidden">

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/50 dark:bg-[#0B1120]/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {msg.role === 'user' ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center ml-3 shadow-sm border border-blue-200 dark:border-blue-800">
                                                <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3 shadow-sm border border-indigo-200 dark:border-indigo-800">
                                                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`
                                        px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative
                                        ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-sm'
                                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'}
                                    `}>
                                        {renderMarkdownText(msg.content)}
                                        <div className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex flex-row max-w-[80%]">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                                            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm relative overflow-hidden">
                                        <div className="flex space-x-1.5 items-center h-4">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <form onSubmit={handleSend} className="relative flex items-end">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                placeholder="Type your message... (Press Enter to send)"
                                disabled={isLoading}
                                className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-14 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none overflow-hidden max-h-32"
                                rows={1}
                                style={{
                                    height: 'auto',
                                    minHeight: '56px'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 bottom-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
