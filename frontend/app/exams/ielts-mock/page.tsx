'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Headphones, BookOpen, PenTool, Mic, ArrowRight, ArrowLeft, CheckCircle, Volume2 } from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---
const MOCK_READING_TEXT = `
You should spend about 20 minutes on Questions 1-5, which are based on Reading Passage 1 below.

The History of the Bicycle

The bicycle is one of the most ubiquitous forms of transport in the world, yet its history is a complex tale of innovation, failed experiments, and societal impact. Before the invention of the bicycle as we know it, humans relied primarily on walking or animal-drawn vehicles for overland travel. 

The first verifiable claim for a practically used bicycle belongs to the German Baron Karl von Drais, a civil servant to the Grand Duke of Baden in Germany. Drais invented his 'Laufmaschine' (running machine) in 1817. It was known by many names, including the velocipede, hobby-horse, and draisine, and was made almost entirely of wood. The rider straddled the wooden frame and pushed along the ground with their feet, while steering with the front wheel. Although it enjoyed a brief period of popularity, its lack of pedals made it impractical for long journeys or uneven terrain.

The next major leap forward occurred in the 1860s in France, where Pierre Michaux and Pierre Lallement attached pedals directly to the front wheel of a velocipede. This invention, often referred to as the 'boneshaker' due to its stiff wrought-iron frame and wooden wheels surrounded by iron tires, provided a notoriously jarring ride over the cobblestone streets of the era. Despite its discomfort, the boneshaker sparked a craze, particularly in Western Europe and the United States.

In an effort to increase speed, inventors began enlarging the front wheel to which the pedals were attached. This led to the iconic 'penny-farthing' or 'ordinary' bicycle in the 1870s. The penny-farthing was fast but dangerous; the rider sat high above the center of gravity, making headers (falling over the handlebars) a common and perilous occurrence. Therefore, it was primarily a pastime for athletic young men rather than a practical mode of transport for the masses.

The definitive step towards the modern bicycle was the development of the 'safety bicycle' in the late 1880s. John Kemp Starley's Rover, introduced in 1885, featured wheels of equal size, a chain-driven rear wheel, and a diamond-shaped frame. The subsequent addition of John Boyd Dunlop's pneumatic (air-filled) tire in 1888 transformed the bicycle from an uncomfortable and dangerous novelty into a smooth-riding, practical vehicle for everyone. The safety bicycle triggered a massive boom in the 1890s, fundamentally changing society by providing affordable, independent mobility for both men and women, thus playing a significant role in the women's emancipation movement.
`;

const MOCK_WRITING_PROMPT_1 = `You should spend about 20 minutes on this task.
The graph below shows the number of tourists visiting a particular Caribbean island between 2010 and 2017.
Summarise the information by selecting and reporting the main features, and make comparisons where relevant.
Write at least 150 words.`;

const MOCK_WRITING_PROMPT_2 = `You should spend about 40 minutes on this task.
In many countries today, people in cities either live alone or in small family units, rather than in large, extended family groups. Is this a positive or negative trend?
Give reasons for your answer and include any relevant examples from your own knowledge or experience.
Write at least 250 words.`;

const MOCK_SPEAKING_PROMPTS = [
    "Part 1: Let's talk about your hometown. Has your hometown changed much since you were a child?",
    "Part 2: Describe a memorable journey you have made. You should have 1 minute to prepare.",
    "Part 3: Do you think public transport will improve in the future? Why or why not?"
];

// --- MAIN COMPONENT ---
export default function IELTSMockTestPage() {
    const sections = ['Listening', 'Reading', 'Writing', 'Speaking'];
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(2400); // 40 mins initial for Listening
    const [timerActive, setTimerActive] = useState(false);
    
    // Test Start State
    const [testStarted, setTestStarted] = useState(false);

    // Section Data States
    const [speakingPart, setSpeakingPart] = useState(0);
    const [writingTask, setWritingTask] = useState(1);
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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
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

            // Fetch Blobs from object URLs
            for (const [part, url] of Object.entries(audioUrlMap)) {
                if (url) {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    formData.append('audioFiles', blob, `speakingPart${part}.webm`);
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

    if (!testStarted) {
        return (
            <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 max-w-2xl w-full rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">IELTS Academic Mock Test Vol. 1</h1>
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
                            <div className="w-48 h-48 rounded-full border-8 border-indigo-500 flex flex-col items-center justify-center bg-indigo-50 dark:bg-gray-800 shadow-inner">
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">OVERALL BAND</span>
                                <span className="text-5xl font-black text-indigo-600">{resultData.evaluation.overallBand.toFixed(1)}</span>
                            </div>
                            <div className="flex-1 w-full flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <span className="font-bold flex items-center gap-2 text-blue-500"><BookOpen className="w-5 h-5"/> Reading</span>
                                    <span className="font-bold text-xl">{resultData.evaluation.readingBand.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <span className="font-bold flex items-center gap-2 text-indigo-500"><Headphones className="w-5 h-5"/> Listening</span>
                                    <span className="font-bold text-xl">{resultData.evaluation.listeningBand.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <span className="font-bold flex items-center gap-2 text-orange-500"><PenTool className="w-5 h-5"/> Writing</span>
                                    <span className="font-bold text-xl">{resultData.evaluation.writingBand.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <span className="font-bold flex items-center gap-2 text-rose-500"><Mic className="w-5 h-5"/> Speaking</span>
                                    <span className="font-bold text-xl">{resultData.evaluation.speakingBand.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold dark:text-white mb-4">AI Feedback</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed p-6 bg-blue-50 dark:bg-[#0B1120] rounded-xl border border-blue-100 dark:border-blue-900/30">
                                {resultData.evaluation.feedback}
                            </p>
                        </div>
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
                    <div className="h-full flex flex-col p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto w-full">
                            <h2 className="text-xl font-bold dark:text-white mb-6">Part 3 - Questions 1-3</h2>
                            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
                                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                                    <Headphones className="w-5 h-5 text-indigo-500" /> Audio Track: Lecture on Urban Ecology
                                </h3>
                                <audio controls className="w-full" controlsList="nodownload" preload="auto">
                                    <source src="https://res.cloudinary.com/dw5fiywyd/video/upload/v1776280302/english-learning/ielts-mock/ielts-mock-listening-lecture.mp3" type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                            
                            <div className="space-y-6 dark:text-gray-300">
                                <p className="font-bold italic mb-4">Complete the notes below. Listen to the audio and write NO MORE THAN TWO WORDS for each answer.</p>
                                <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-[#0B1120]/80 shadow-sm leading-10 text-lg">
                                    <h3 className="font-bold text-xl mb-6 text-center text-gray-800 dark:text-gray-100 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-4">Biology Lecture Notes</h3>
                                    
                                    <div className="mb-6 flex flex-wrap items-center gap-2">
                                        <span>1. The lecture focuses on micro ecosystems found in</span>
                                        <input type="text" className="border-b-2 border-indigo-400 focus:border-indigo-600 bg-transparent w-40 outline-none text-center px-2 dark:text-white font-bold text-indigo-700 dark:text-indigo-400" placeholder="(1)" value={listeningAnswers[1] || ''} onChange={(e) => setListeningAnswers({ ...listeningAnswers, 1: e.target.value })} />.
                                    </div>
                                    
                                    <div className="mb-6 flex flex-wrap items-center gap-2">
                                        <span>2. Researchers found that city parks contain over</span>
                                        <input type="text" className="border-b-2 border-indigo-400 focus:border-indigo-600 bg-transparent w-32 outline-none text-center px-2 dark:text-white font-bold text-indigo-700 dark:text-indigo-400" placeholder="(2)" value={listeningAnswers[2] || ''} onChange={(e) => setListeningAnswers({ ...listeningAnswers, 2: e.target.value })} />
                                        <span>distinct insect species.</span>
                                    </div>
                                    
                                    <div className="mb-6 flex flex-wrap items-center gap-2">
                                        <span>3. Common</span>
                                        <input type="text" className="border-b-2 border-indigo-400 focus:border-indigo-600 bg-transparent w-40 outline-none text-center px-2 dark:text-white font-bold text-indigo-700 dark:text-indigo-400" placeholder="(3)" value={listeningAnswers[3] || ''} onChange={(e) => setListeningAnswers({ ...listeningAnswers, 3: e.target.value })} />
                                        <span>provide a vital sanctuary for these insects.</span>
                                    </div>
                                    
                                    <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-400 flex items-start gap-3 leading-snug">
                                        <span className="font-bold">Tip:</span> Answers can be found sequentially in the original audio clip. Write them exactly as spoken (e.g., "urban environments", "fifty", "roof gardens").
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. READING SECTION (Split Screen) */}
                {sections[currentSectionIndex] === 'Reading' && (
                    <div className="h-full flex">
                        {/* Left Pane - Reading Passage */}
                        <div className="w-1/2 p-8 border-r border-gray-200 dark:border-gray-800 overflow-y-auto bg-[#FAFAFA] dark:bg-[#1A1A1A]">
                            <h2 className="text-2xl font-bold dark:text-white mb-6 text-center">Reading Passage 1</h2>
                            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300">
                                {MOCK_READING_TEXT.split('\n').map((para, i) => (
                                    <p key={i} className={i === 1 ? 'font-bold' : ''}>{para}</p>
                                ))}
                            </div>
                        </div>
                        {/* Right Pane - Questions */}
                        <div className="w-1/2 p-8 overflow-y-auto bg-white dark:bg-[#121212]">
                            <h3 className="font-bold dark:text-white mb-6">Questions 1 - 3</h3>
                            <p className="mb-6 italic dark:text-gray-400 text-sm">Do the following statements agree with the information given in Reading Passage 1?</p>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded text-sm mb-6 dark:text-gray-300 border border-blue-100 dark:border-blue-900/30">
                                <p><strong>TRUE</strong> if the statement agrees with the information</p>
                                <p><strong>FALSE</strong> if the statement contradicts the information</p>
                                <p><strong>NOT GIVEN</strong> if there is no information on this</p>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    "1. The 'Laufmaschine' invented by Karl von Drais featured pedals attached to the front wheel.",
                                    "2. The 'boneshaker' was popular despite providing an uncomfortable ride.",
                                    "3. The penny-farthing bicycle was considered safe for the general public."
                                ].map((q, idx) => (
                                    <div key={idx} className="flex flex-col gap-2">
                                        <span className="font-medium dark:text-gray-200">{q}</span>
                                        <div className="flex gap-4 mt-1">
                                            <label className="flex items-center gap-2 dark:text-gray-400 cursor-pointer text-sm">
                                                <input type="radio" name={`q${idx}`} value="True" checked={readingAnswers[idx+1] === "True"} onChange={() => setReadingAnswers({ ...readingAnswers, [idx+1]: "True" })} className="w-4 h-4 accent-blue-600" /> True
                                            </label>
                                            <label className="flex items-center gap-2 dark:text-gray-400 cursor-pointer text-sm">
                                                <input type="radio" name={`q${idx}`} value="False" checked={readingAnswers[idx+1] === "False"} onChange={() => setReadingAnswers({ ...readingAnswers, [idx+1]: "False" })} className="w-4 h-4 accent-blue-600" /> False
                                            </label>
                                            <label className="flex items-center gap-2 dark:text-gray-400 cursor-pointer text-sm">
                                                <input type="radio" name={`q${idx}`} value="Not Given" checked={readingAnswers[idx+1] === "Not Given"} onChange={() => setReadingAnswers({ ...readingAnswers, [idx+1]: "Not Given" })} className="w-4 h-4 accent-blue-600" /> Not Given
                                            </label>
                                        </div>
                                    </div>
                                ))}
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
                                <h2 className="text-xl font-bold dark:text-white mb-6">Writing Task {writingTask}</h2>
                                <div className="p-6 bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
                                    <div className="prose dark:prose-invert font-medium text-gray-800 mb-6 whitespace-pre-line">
                                        {writingTask === 1 ? MOCK_WRITING_PROMPT_1 : MOCK_WRITING_PROMPT_2}
                                    </div>
                                    {writingTask === 1 && (
                                        <div className="w-full bg-white dark:bg-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
                                            <svg viewBox="0 0 500 250" className="w-full h-auto text-gray-800">
                                                {/* Axes */}
                                                <line x1="50" y1="200" x2="450" y2="200" stroke="currentColor" strokeWidth="2" />
                                                <line x1="50" y1="20" x2="50" y2="200" stroke="currentColor" strokeWidth="2" />
                                                
                                                {/* Y-axis Labels */}
                                                <text x="40" y="200" fontSize="10" textAnchor="end" fill="currentColor">0</text>
                                                <text x="40" y="155" fontSize="10" textAnchor="end" fill="currentColor">1.0</text>
                                                <text x="40" y="110" fontSize="10" textAnchor="end" fill="currentColor">2.0</text>
                                                <text x="40" y="65" fontSize="10" textAnchor="end" fill="currentColor">3.0</text>
                                                <text x="40" y="20" fontSize="10" textAnchor="end" fill="currentColor">4.0 (Millions)</text>
                                                
                                                {/* Grid lines */}
                                                <line x1="50" y1="155" x2="450" y2="155" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                                                <line x1="50" y1="110" x2="450" y2="110" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                                                <line x1="50" y1="65" x2="450" y2="65" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                                                
                                                {/* X-axis Labels */}
                                                <text x="50" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2010</text>
                                                <text x="107" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2011</text>
                                                <text x="164" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2012</text>
                                                <text x="221" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2013</text>
                                                <text x="278" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2014</text>
                                                <text x="335" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2015</text>
                                                <text x="392" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2016</text>
                                                <text x="450" y="220" fontSize="10" textAnchor="middle" fill="currentColor">2017</text>

                                                {/* Data Points line: 1M, 1.2M, 1.5M, 2.0M, 1.8M, 2.5M, 2.8M, 3.5M */}
                                                {/* Y = 200 - (Value * 45) */}
                                                <polyline 
                                                    fill="none" 
                                                    stroke="#4F46E5" 
                                                    strokeWidth="3"
                                                    points="50,155 107,146 164,132.5 221,110 278,119 335,87.5 392,74 450,42.5" 
                                                />
                                                
                                                {/* Points */}
                                                <circle cx="50" cy="155" r="4" fill="#4F46E5" />
                                                <circle cx="107" cy="146" r="4" fill="#4F46E5" />
                                                <circle cx="164" cy="132.5" r="4" fill="#4F46E5" />
                                                <circle cx="221" cy="110" r="4" fill="#4F46E5" />
                                                <circle cx="278" cy="119" r="4" fill="#4F46E5" />
                                                <circle cx="335" cy="87.5" r="4" fill="#4F46E5" />
                                                <circle cx="392" cy="74" r="4" fill="#4F46E5" />
                                                <circle cx="450" cy="42.5" r="4" fill="#4F46E5" />
                                            </svg>
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
                        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                                <Mic className="w-10 h-10 text-rose-500" />
                            </div>
                            
                            <h2 className="text-2xl font-bold dark:text-white mb-2">Automated Speaking Examiner</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Please speak clearly into your microphone when prompted.</p>

                            <div className="bg-white/80 dark:bg-[#0B1120]/80 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl mb-8 min-h-[150px] flex items-center justify-center">
                                <p className="text-xl font-medium text-gray-800 dark:text-gray-200">
                                    "{MOCK_SPEAKING_PROMPTS[speakingPart]}"
                                </p>
                            </div>

                            {isRecording ? (
                                <div className="flex flex-col items-center mb-4">
                                    <div className="text-rose-500 font-bold mb-4 animate-pulse">Recording... Speak now!</div>
                                    <button onClick={stopRecording} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-rose-600/30 transition-transform hover:scale-105">
                                        Stop Recording
                                    </button>
                                </div>
                            ) : (
                                <button onClick={startRecording} className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-rose-500/30 transition-transform hover:scale-105 mb-4">
                                    {audioUrlMap[speakingPart] ? 'Ghi Âm Lại (Retake)' : 'Mở Microphone Ghi Âm'}
                                </button>
                            )}

                            {audioUrlMap[speakingPart] && !isRecording && (
                                <div className="mb-4">
                                    <p className="font-bold text-emerald-500 mb-2 flex items-center justify-center gap-2">
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
