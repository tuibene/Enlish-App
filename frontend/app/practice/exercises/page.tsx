'use client';

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';

interface Exercise {
    _id: string;
    topic: string;
    difficulty: string;
    type: 'multiple_choice' | 'fill_in' | 'sorting';
    questionPrompt?: string;
    options?: string[];
    correctAnswer?: string;
    textWithBlanks?: string;
    blanksAnswers?: string[];
    jumbledWords?: string[];
    correctSentence?: string;
    explanation?: string;
}

export default function ExercisesPage() {
    const { user, token } = useContext(AuthContext) || {};
    const router = useRouter();

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for user answers
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [fillInText, setFillInText] = useState<string>('');
    const [constructedWords, setConstructedWords] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);

    // State for checking
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (!token) return;

        const fetchExercises = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exercises`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setExercises(data);
                    if (data.length > 0 && data[0].type === 'sorting') {
                        setAvailableWords(data[0].jumbledWords || []);
                    }
                } else {
                    setError('Failed to load exercises.');
                }
            } catch (err) {
                setError('Network error loading exercises.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExercises();
    }, [token]);

    const currentEx = exercises[currentIndex];

    const resetInputs = (nextEx: Exercise) => {
        setSelectedOption('');
        setFillInText('');
        if (nextEx?.type === 'sorting') {
            setAvailableWords(nextEx.jumbledWords || []);
            setConstructedWords([]);
        } else {
            setAvailableWords([]);
            setConstructedWords([]);
        }
        setIsChecked(false);
        setIsCorrect(false);
    };

    const handleCheck = () => {
        let correct = false;
        if (currentEx.type === 'multiple_choice') {
            correct = selectedOption === currentEx.correctAnswer;
        } else if (currentEx.type === 'fill_in') {
            // Very simple check: case insensitive
            correct = currentEx.blanksAnswers?.[0].toLowerCase() === fillInText.trim().toLowerCase();
        } else if (currentEx.type === 'sorting') {
            const userSentence = constructedWords.join(' ');
            correct = userSentence.toLowerCase() === currentEx.correctSentence?.toLowerCase();
        }

        setIsCorrect(!!correct);
        setIsChecked(true);
        if (correct) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetInputs(exercises[currentIndex + 1]);
        } else {
            setIsFinished(true);
        }
    };

    const toggleWord = (word: string, fromAvailable: boolean) => {
        if (isChecked) return;

        if (fromAvailable) {
            // Remove from available, add to constructed (only one instance)
            const index = availableWords.indexOf(word);
            if (index > -1) {
                const newAvailable = [...availableWords];
                newAvailable.splice(index, 1);
                setAvailableWords(newAvailable);
                setConstructedWords(prev => [...prev, word]);
            }
        } else {
            // Remove from constructed, add back to available
            const index = constructedWords.indexOf(word);
            if (index > -1) {
                const newConstructed = [...constructedWords];
                newConstructed.splice(index, 1);
                setConstructedWords(newConstructed);
                setAvailableWords(prev => [...prev, word]);
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <p className="text-gray-500">Please log in to access exercises.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-500">Loading exercises...</p>
            </div>
        );
    }

    if (error || exercises.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
                <p className="text-red-500 mb-4">{error || 'No exercises available at the moment.'}</p>
                <Link href="/practice" className="text-indigo-600 hover:underline">Return to Practice Hub</Link>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 py-12 px-4 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Great Job!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">You completed the session.</p>

                    <div className="bg-white/80 dark:bg-[#0B1120]/80 rounded-2xl p-6 mb-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Your Score</p>
                        <p className="text-5xl font-black text-purple-600 dark:text-purple-400">
                            {score} <span className="text-2xl text-gray-400">/ {exercises.length}</span>
                        </p>
                    </div>

                    <Link href="/practice" className="block w-full py-4 text-center rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-bold transition-all shadow-md">
                        Return to Hub
                    </Link>
                </div>
            </div>
        );
    }

    const progress = ((currentIndex) / exercises.length) * 100;

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 py-8 px-4 transition-colors">

            <div className="max-w-3xl mx-auto">
                {/* Header Navbar */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/practice" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-500 hover:text-indigo-600 transition-colors border border-gray-200 dark:border-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                        <Layers className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {currentIndex + 1} of {exercises.length}
                        </span>
                    </div>

                    <div className="w-9"></div> {/* Placeholder for centering */}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-10 overflow-hidden">
                    <div className="bg-purple-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all relative">

                    {/* Topic Badge */}
                    <div className="absolute top-6 right-6">
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                            {currentEx.topic} • {currentEx.difficulty}
                        </span>
                    </div>

                    <div className="p-8 md:p-12">

                        {/* TYPE: Multiple Choice */}
                        {currentEx.type === 'multiple_choice' && (
                            <div className="animate-fade-in-up">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 mt-4 leading-relaxed">
                                    {currentEx.questionPrompt}
                                </h3>
                                <div className="space-y-4">
                                    {currentEx.options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            disabled={isChecked}
                                            onClick={() => setSelectedOption(opt)}
                                            className={`w-full text-left px-6 py-5 rounded-2xl border-2 font-medium text-lg transition-all
                                                ${isChecked
                                                    ? opt === currentEx.correctAnswer
                                                        ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400'
                                                        : opt === selectedOption
                                                            ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400'
                                                            : 'border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800 opacity-50'
                                                    : selectedOption === opt
                                                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-300 ring-4 ring-purple-500/20'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800'
                                                }
                                            `}
                                        >
                                            {opt}
                                            {isChecked && opt === currentEx.correctAnswer && <CheckCircle className="inline float-right text-green-500 w-6 h-6" />}
                                            {isChecked && opt === selectedOption && opt !== currentEx.correctAnswer && <XCircle className="inline float-right text-red-500 w-6 h-6" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TYPE: Fill in */}
                        {currentEx.type === 'fill_in' && (
                            <div className="animate-fade-in-up">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 mt-4 leading-relaxed">
                                    Fill in the blank
                                </h3>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-xl text-gray-800 dark:text-gray-200 leading-loose text-center">
                                    {currentEx.textWithBlanks?.split('___').map((part, index, array) => (
                                        <React.Fragment key={index}>
                                            {part}
                                            {index < array.length - 1 && (
                                                <input
                                                    type="text"
                                                    value={fillInText}
                                                    onChange={(e) => setFillInText(e.target.value)}
                                                    disabled={isChecked}
                                                    className={`mx-2 text-center w-40 border-b-2 bg-transparent focus:outline-none focus:border-purple-500 font-bold px-2
                                                        ${isChecked
                                                            ? isCorrect
                                                                ? 'border-green-500 text-green-600'
                                                                : 'border-red-500 text-red-600'
                                                            : 'border-gray-400 text-purple-600 dark:text-purple-400'
                                                        }
                                                    `}
                                                    placeholder="type here"
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {isChecked && !isCorrect && (
                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 font-medium text-center">
                                        Correct Answer: {currentEx.blanksAnswers?.[0]}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TYPE: Sorting */}
                        {currentEx.type === 'sorting' && (
                            <div className="animate-fade-in-up">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 mt-4">
                                    Construct the sentence
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8">Tap the words below to build the correct sentence.</p>

                                {/* Constructed Area */}
                                <div className={`min-h-[80px] p-6 rounded-2xl border-2 mb-8 flex flex-wrap gap-3 items-center transition-all shadow-inner
                                    ${isChecked
                                        ? isCorrect
                                            ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500'
                                            : 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500'
                                        : 'bg-gray-50 border-dashed border-gray-300 dark:bg-gray-900 dark:border-gray-700'
                                    }
                                `}>
                                    {constructedWords.length === 0 && !isChecked && (
                                        <span className="text-gray-400 italic">Select words from below...</span>
                                    )}
                                    {constructedWords.map((word, i) => (
                                        <button
                                            key={`c-${i}`}
                                            disabled={isChecked}
                                            onClick={() => toggleWord(word, false)}
                                            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow border border-gray-200 dark:border-gray-700 font-bold text-lg hover:-translate-y-1 transition-transform"
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>

                                {/* Available Words Bank */}
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {availableWords.map((word, i) => (
                                        <button
                                            key={`a-${i}`}
                                            disabled={isChecked}
                                            onClick={() => toggleWord(word, true)}
                                            className={`px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-lg shadow-sm hover:shadow-md transition-all
                                                ${isChecked
                                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 opacity-50 cursor-not-allowed'
                                                    : 'bg-white text-gray-800 hover:border-purple-400 dark:bg-gray-800 dark:text-white dark:hover:border-purple-500 hover:-translate-y-1'
                                                }
                                            `}
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>

                                {isChecked && !isCorrect && (
                                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 font-medium text-center shadow-sm">
                                        Correct Sentence: <span className="font-bold">{currentEx.correctSentence}</span>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Bottom Action Area */}
                    <div className="bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 p-6 md:px-12 flex justify-between items-center transition-colors">

                        {/* Explanation Area (Visible when checked) */}
                        <div className={`flex-1 ${!isChecked ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-500`}>
                            {isChecked && (
                                <div className="pr-6">
                                    <h4 className={`font-bold flex items-center mb-1 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                        {isCorrect ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
                                        {isCorrect ? 'Awesome!' : 'Keep learning!'}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {currentEx.explanation}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex-shrink-0 ml-4">
                            {!isChecked ? (
                                <button
                                    onClick={handleCheck}
                                    disabled={
                                        (currentEx.type === 'multiple_choice' && !selectedOption) ||
                                        (currentEx.type === 'fill_in' && !fillInText.trim()) ||
                                        (currentEx.type === 'sorting' && constructedWords.length === 0)
                                    }
                                    className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                                >
                                    Check
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="group flex items-center justify-center px-8 py-4 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-bold text-lg transition-all shadow-md min-w-[150px]"
                                >
                                    Next <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
