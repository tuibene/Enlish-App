'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Brain, Send, CheckCircle, ArrowRight, BookOpen, PenTool, Headphones, Mic, Square, Play, Sparkles } from 'lucide-react';

export default function PlacementTestPage() {
    const { user, token, setAuthData } = useContext(AuthContext) || {};
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [testConfig, setTestConfig] = useState({
        readingContext: '',
        readingQuestion: '',
        listeningAudioUrl: '',
        listeningQuestion: '',
        writingPrompt: '',
        speakingPrompt: ''
    });

    const [readingAnswer, setReadingAnswer] = useState('');
    const [listeningAnswer, setListeningAnswer] = useState('');
    const [essay, setEssay] = useState('');

    // Fetch configuration on mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/placement-config`);
                if (res.ok) {
                    const data = await res.json();
                    setTestConfig({
                        readingContext: data.readingContext || 'The advent of renewable energy sources such as solar and wind power has begun to reshape the global energy landscape. While initial setup costs can be high, the long-term environmental benefits and decreasing reliance on fossil fuels make them an attractive investment for many nations. However, the intermittency of these energy sources presents a significant challenge that requires advancement in energy storage technologies.',
                        readingQuestion: data.readingQuestion || 'Based on the text, what are the primary advantages and the main challenge of adopting renewable energy sources? Summarize in your own words.',
                        listeningAudioUrl: data.listeningAudioUrl || '/ielts-lecture.mp3',
                        listeningQuestion: data.listeningQuestion || 'Listen to the lecture on urban ecology. What did researchers discover about the variety of insect species in city parks? Explain briefly.',
                        writingPrompt: data.writingPrompt || 'Some people believe that technological advancements have made humans less socially active, while others argue that technology has connected us more than ever before. Discuss both views and give your own opinion. (Min: 50 words)',
                        speakingPrompt: data.speakingPrompt || 'Press record and speak clearly into your microphone for about 30-45 seconds. Describe a skill you would like to learn in the future. Explain why you want to learn it and how it would benefit you.'
                    });
                }
            } catch (err) {
                console.error("Config fetch error:", err);
            } finally {
                setIsLoadingConfig(false);
            }
        };
        fetchConfig();
    }, []);

    // Audio Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ cefrLevel: string; feedback: string; recommendedMaterials?: any[] } | null>(null);
    const [error, setError] = useState('');

    const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).length;

    const nextStep = () => {
        setError('');
        setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => s - 1);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access your microphone. Please check browser permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const retakeRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
    };

    const handleSubmit = async () => {
        setError('');
        if (!readingAnswer.trim() || !listeningAnswer.trim() || !essay.trim() || !audioBlob) {
            setError('Please complete all 4 parts of the test.');
            return;
        }

        if (wordCount < 50) {
            setError('Please write at least 50 words in the Writing section.');
            setStep(4);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('readingAnswer', readingAnswer);
            formData.append('listeningAnswer', listeningAnswer);
            formData.append('essayAnswer', essay);
            formData.append('audioBlob', audioBlob, 'speaking-test.webm');

            const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/placement`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}` // Notice no Content-Type required for FormData
                },
                body: formData
            });

            const data = await apiRes.json();

            if (apiRes.ok) {
                setResult({
                    cefrLevel: data.cefrLevel,
                    feedback: data.feedback,
                    recommendedMaterials: data.recommendedMaterials
                });

                // Try refreshing the user context
                const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profileRes.ok && setAuthData) {
                    const profileData = await profileRes.json();
                    setAuthData(profileData, token as string);
                }
            } else {
                setError(data.message || 'Evaluation failed. Please try again.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError('Network error. Be sure the backend server is running and API keys are configured.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingConfig) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Test Environment...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <p className="text-gray-500">Please log in to take the placement test.</p>
            </div>
        );
    }

    // RESULT SCREEN
    if (result) {
        return (
            <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 py-16 px-4 flex items-center justify-center">
                <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl p-10 md:p-14 text-center shadow-2xl border border-gray-100 dark:border-gray-700 animate-scale-in">
                    <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Assessment Complete!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                        Based on your 4-skills performance, our AI has determined your proficiency level.
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-8 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold mb-2">Your CEFR Level</p>
                        <p className="text-7xl font-black text-blue-600 dark:text-blue-400 mb-6 drop-shadow-sm">
                            {result.cefrLevel}
                        </p>
                        <div className="text-left bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                                <Brain className="w-5 h-5 mr-2 text-purple-500" /> Examiner Feedback
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                "{result.feedback}"
                            </p>
                        </div>
                    </div>

                    <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800 text-left">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                            <Sparkles className="w-5 h-5 mr-2 text-purple-500" /> Recommended Courses for You
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We've mapped your {result.cefrLevel} proficiency to these specific lessons to help you progress:
                        </p>

                        {result.recommendedMaterials && result.recommendedMaterials.length > 0 ? (
                            <div className="space-y-3 mb-6">
                                {result.recommendedMaterials.map((mat: any) => (
                                    <div key={mat._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 flex justify-between items-center group">
                                        <div>
                                            <h5 className="font-bold text-gray-900 dark:text-white text-lg">{mat.title}</h5>
                                            <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-md">
                                                {mat.type}
                                            </span>
                                        </div>
                                        <button onClick={() => router.push(`/materials/${mat._id}`)} className="text-purple-600 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300 p-2">
                                            <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 mb-6 italic text-gray-500">
                                Your personalized {result.cefrLevel} curriculum is being prepared. In the meantime, explore our library.
                            </div>
                        )}

                        <button onClick={() => router.push(`/materials`)} className="w-full flex items-center justify-center py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors">
                            Explore Full Knowledge Base <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // TEST WIZARD SCREEN
    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 py-12 px-4 transition-colors">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-4">
                        <Brain className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">4-Skills Placement Test</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Show us what you know. This will take about 5-10 minutes.
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center items-center space-x-2 mb-10">
                    {[1, 2, 3, 4, 5].map((idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= idx ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                {idx}
                            </div>
                            {idx < 5 && <div className={`w-10 h-1 transition-colors ${step > idx ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`}></div>}
                        </div>
                    ))}
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="animate-fade-in-up">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <BookOpen className="w-6 h-6 mr-3 text-purple-500" /> Part 1: Reading & Grammar
                            </h2>
                            <div className="bg-white/80 dark:bg-[#0B1120]/80 p-6 rounded-2xl mb-6 text-gray-800 dark:text-gray-200 leading-relaxed border border-gray-100 dark:border-gray-800">
                                <strong>Context:</strong> "{testConfig.readingContext}"
                            </div>
                            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                                {testConfig.readingQuestion}
                            </label>
                            <textarea
                                value={readingAnswer}
                                onChange={(e) => setReadingAnswer(e.target.value)}
                                className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]"
                                placeholder="Type your answer here..."
                            ></textarea>
                            <div className="mt-8 flex justify-end">
                                <button onClick={nextStep} disabled={!readingAnswer.trim()} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl disabled:opacity-50">Next Part</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in-up">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <Headphones className="w-6 h-6 mr-3 text-emerald-500" /> Part 2: Listening
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Listen to the short dialogue excerpt and answer the question below. (Sample Audio)</p>

                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl mb-8 border border-emerald-100 dark:border-emerald-800 flex flex-col items-center">
                                {/* Sample remote audio for demo purposes */}
                                <audio controls className="w-full max-w-sm rounded-full" key={testConfig.listeningAudioUrl}>
                                    <source src={testConfig.listeningAudioUrl} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>

                            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                                {testConfig.listeningQuestion}
                            </label>
                            <textarea
                                value={listeningAnswer}
                                onChange={(e) => setListeningAnswer(e.target.value)}
                                className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                                placeholder="Type your answer here..."
                            ></textarea>

                            <div className="mt-8 flex justify-between">
                                <button onClick={prevStep} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Back</button>
                                <button onClick={nextStep} disabled={!listeningAnswer.trim()} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl disabled:opacity-50">Next Part</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in-up">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <PenTool className="w-6 h-6 mr-3 text-blue-500" /> Part 3: Writing
                            </h2>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl mb-6 border border-blue-100 dark:border-blue-800">
                                <strong>Prompt:</strong> {testConfig.writingPrompt}
                            </div>

                            <textarea
                                value={essay}
                                onChange={(e) => setEssay(e.target.value)}
                                className="w-full bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                                placeholder="Start writing here..."
                            ></textarea>

                            <div className="flex justify-between items-center mt-4 text-sm font-medium">
                                <span className={`${wordCount >= 50 ? 'text-green-500' : 'text-gray-400'}`}>
                                    {wordCount} / 50 words minimum
                                </span>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button onClick={prevStep} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Back</button>
                                <button onClick={nextStep} disabled={wordCount < 50} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl disabled:opacity-50">Next Part</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-fade-in-up text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center">
                                <Mic className="w-6 h-6 mr-3 text-orange-500" /> Part 4: Speaking
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                                {testConfig.speakingPrompt}
                            </p>

                            {!audioBlob ? (
                                <div className="mb-8 p-10 bg-white/80 dark:bg-[#0B1120]/80 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center">
                                    {isRecording ? (
                                        <>
                                            <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                                                <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping"></div>
                                                <button onClick={stopRecording} className="relative w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/50 transition-colors">
                                                    <Square className="w-8 h-8 fill-current" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-red-500 animate-pulse">Recording... Speak now!</p>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={startRecording} className="w-24 h-24 mb-6 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105">
                                                <Mic className="w-10 h-10" />
                                            </button>
                                            <p className="font-bold text-gray-700 dark:text-gray-300">Tap to start recording</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-8 p-10 bg-green-50 dark:bg-green-900/10 rounded-3xl border border-green-200 dark:border-green-800 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-md">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold text-green-700 dark:text-green-400 mb-6">Recording captured!</p>

                                    <audio src={audioUrl!} controls className="w-full max-w-xs mb-6" />

                                    <button onClick={retakeRecording} className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
                                        Retake Recording
                                    </button>
                                </div>
                            )}

                            <div className="mt-8 flex justify-between">
                                <button onClick={prevStep} disabled={isRecording} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Back</button>
                                <button onClick={nextStep} disabled={!audioBlob || isRecording} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">Ready to Submit</button>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="animate-fade-in-up text-center py-10">
                            {isSubmitting ? (
                                <div>
                                    <div className="relative w-32 h-32 mx-auto mb-8">
                                        <div className="absolute inset-0 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-2 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shadow-inner">
                                            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Analyzing Your Profile</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                                        Gemini AI is carefully evaluating your pronunciation, grammar, and comprehension...
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
                                        <Send className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">All Set!</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                                        You've completed all 4 sections. Send your answers to our AI examiner to get your official CEFR Band.
                                    </p>

                                    <div className="flex justify-center space-x-4">
                                        <button onClick={prevStep} className="px-6 py-4 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Review Answers</button>
                                        <button onClick={handleSubmit} className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg rounded-xl shadow-xl shadow-blue-500/30 transform hover:-translate-y-1 transition-all">Submit Evaluation</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
