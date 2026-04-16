'use client';

import React, { useState, useContext, useRef } from 'react';
import { BookOpen, ArrowLeft, Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';

const modules = [
    {
        id: 'basic',
        label: 'Basic (Communication)',
        badge: 'A2 Level',
        articles: [
            {
                id: 'b1',
                title: 'Choosing a New Smartphone',
                paragraphs: [
                    "Hey Sarah, I'm thinking about buying a new smartphone but I'm completely lost. There are so many options out there right now.",
                    "That's exciting! What do you mainly use your phone for? If it's just for calling and texting, you might not need a very expensive one.",
                    "Well, I use social media a lot and I love taking photos when I travel. My current phone's battery dies really fast, which is super annoying.",
                    "In that case, you should look for a phone with a great camera and a large battery capacity. I recently bought the new Galaxy model, and the battery lasts for two days!"
                ]
            },
            {
                id: 'b2',
                title: 'At the Coffee Shop',
                paragraphs: [
                    "Welcome to StarBrew. What can I get for you today?",
                    "Hi, I'd like a medium iced caramel macchiato, please. Can I get that with almond milk instead of regular milk?",
                    "Absolutely. Would you like whipped cream on top? It comes included with the caramel macchiato.",
                    "No whipped cream, thank you. Oh, and can I also have one of those chocolate chip muffins?",
                    "Sure thing. That'll be $8.50. Cash or card? Your order will be ready at the pick-up counter on the left."
                ]
            },
            {
                id: 'b3',
                title: 'Weekend Plans',
                paragraphs: [
                    "Are you doing anything special this weekend, John? The weather is supposed to be really nice.",
                    "I haven't made any firm plans yet. I was thinking about going hiking in the mountains, but my car is in the repair shop until Monday.",
                    "That's too bad. Well, my friends and I are having a barbecue at the park by the lake on Saturday afternoon. You're welcome to join us!",
                    "That sounds wonderful! I'd love to come. Should I bring anything, like drinks or snacks?",
                    "Just bring yourself! We have plenty of food and drinks. We'll be at the picnic tables near the boathouse around 1 PM."
                ]
            }
        ]
    },
    {
        id: 'intermediate',
        label: 'Intermediate (TOEIC)',
        badge: 'B2 Level',
        articles: [
            {
                id: 'i1',
                title: 'Notice of Office Relocation',
                paragraphs: [
                    "To all department managers and general staff:",
                    "Please be advised that the corporate headquarters will be relocating to the new Apex Building in the downtown financial district, effective Monday, October 15th.",
                    "All employees are required to pack their personal belongings securely in the provided moving boxes by the end of business hours on Friday, October 12th. Please ensure that each box is clearly labeled with your corresponding name and department to avoid misplacement.",
                    "IT personnel will commence the disconnection and transfer of all computer terminals and network infrastructure promptly at 6:00 PM on Friday. We anticipate the new office will be fully operational prior to the start of the next business week. For further inquiries concerning the move, kindly contact the Human Resources department."
                ]
            },
            {
                id: 'i2',
                title: 'Customer Satisfaction Survey Results',
                paragraphs: [
                    "We recently concluded our annual Customer Satisfaction Survey for Q3, and the results indicate a shift in consumer preferences regarding our delivery services.",
                    "While overall satisfaction remains high at 88%, the primary source of complaints was the lack of real-time package tracking. Approximately 42% of respondents noted that they experienced anxiety when their shipments were delayed without prior notification.",
                    "To address this issue, management has decided to invest in a new logistics software system that will provide SMS updates to customers at every step of the delivery process.",
                    "Training sessions for the customer support team regarding the new software will be scheduled for next month. It is imperative that all agents familiarize themselves with the interface to assist customers effectively."
                ]
            },
            {
                id: 'i3',
                title: 'New Remote Work Policy',
                paragraphs: [
                    "Effective January 1st, the company will officially implement a hybrid remote work policy for all full-time corporate employees. This decision comes after a successful six-month pilot program.",
                    "Under the new guidelines, employees are permitted to work from home up to two days per week, subject to managerial approval. Tuesdays and Wednesdays will be designated as mandatory in-office days to facilitate departmental meetings and collaborative projects.",
                    "Employees opting to work remotely must ensure they have a stable internet connection and a conducive workspace. The company will provide a one-time stipend of $300 to help cover the costs of home office equipment, such as ergonomic chairs or additional monitors.",
                    "Please review the attached PDF document for comprehensive details regarding IT security protocols while working off-site."
                ]
            }
        ]
    },
    {
        id: 'advanced',
        label: 'Advanced (IELTS)',
        badge: 'C1 Level',
        articles: [
            {
                id: 'a1',
                title: 'The Psychology of Resilience',
                paragraphs: [
                    "Resilience is typically defined as the capacity to recover from difficult life events. It is not a rare ability; in reality, it is found in the average individual and it can be learned and developed by anyone.",
                    "Research has shown that resilience is ordinary, not extraordinary. People commonly demonstrate resilience. One example is the response of many Americans to the September 11, 2001 terrorist attacks and individuals' efforts to rebuild their lives. Unlike a trampoline, where down is instantly followed by up, resilience implies a journey. People do not snap back.",
                    "Being resilient does not mean that a person doesn't experience difficulty or distress. Emotional pain and sadness are common in people who have suffered major adversity or trauma. In fact, the road to resilience is likely to involve considerable emotional distress.",
                    "While there is no single established formula for fostering resilience, psychologists agree that several factors are crucial. The primary factor in resilience is having caring and supportive relationships within and outside the family."
                ]
            },
            {
                id: 'a2',
                title: 'The Paradox of Choice',
                paragraphs: [
                    "In modern capitalist societies, the prevailing dogma is that maximizing freedom maximizes well-being, and that the way to maximize freedom is to maximize choice. Consequently, supermarkets present consumers with hundreds of varieties of salad dressing, while healthcare providers offer myriad treatment plans.",
                    "However, psychologist Barry Schwartz argues that this abundance of choice often produces paralysis rather than liberation. When faced with an overwhelming number of options, individuals find it increasingly difficult to make a decision, fearing they might make the suboptimal choice.",
                    "Furthermore, even when a decision is ultimately made, the vast array of alternatives often leads to diminished satisfaction with the outcome. This phenomenon is attributed to 'opportunity costs'—the psychological burden of wondering whether one of the unchosen options would have yielded a better result.",
                    "To mitigate this anxiety, experts suggest adopting a 'satisficing' approach: establishing clear criteria for a decision and selecting the first option that meets those standards, rather than exhaustively searching for the elusive 'perfect' choice."
                ]
            },
            {
                id: 'a3',
                title: 'Urban Ecology and Green Spaces',
                paragraphs: [
                    "Historically, urban environments were perceived as sterile concrete jungles, entirely divorced from the natural world. However, the emerging field of urban ecology has radically altered this perspective, revealing that cities can sustain surprisingly diverse and complex ecosystems.",
                    "Municipal parks, rooftop gardens, and even neglected industrial sites serve as vital refuges for various species of flora and fauna. These green spaces are not merely aesthetic enhancements; they perform crucial ecological functions, such as mitigating the urban heat island effect and improving air quality.",
                    "A recent study conducted in London documented over fifty distinct species of pollinators thriving within a two-mile radius of the city center. This biodiversity is heavily reliant on the strategic integration of native plants in urban landscaping, which provides necessary sustenance for these insect populations.",
                    "Despite these positive trends, urban ecosystems remain highly fragile. Unregulated real estate development and pollution continue to pose severe threats to these habitats, necessitating robust conservation policies tailored specifically for metropolitan areas."
                ]
            }
        ]
    }
];

export default function ReadingPracticePage() {
    const { token } = useContext(AuthContext) || {};
    const [activeModuleId, setActiveModuleId] = useState(modules[0].id);
    const [activeArticleId, setActiveArticleId] = useState(modules[0].articles[0].id);
    const [selectedText, setSelectedText] = useState('');
    const [explanationData, setExplanationData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];
    const activeArticle = activeModule.articles.find(a => a.id === activeArticleId) || activeModule.articles[0];

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== '') {
            const text = selection.toString().trim();
            // Don't trigger if selection is too long (limit to ~15 words)
            if (text.split(' ').length > 15) {
                return;
            }
            setSelectedText(text);
            handleAiExplanation(text);
        }
    };

    const handleAiExplanation = async (text: string) => {
        setLoading(true);
        setExplanationData(null);
        
        try {
            const contextText = textRef.current?.innerText || '';
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ai-tutor/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({
                    text: text,
                    context: contextText
                })
            });

            if (res.ok) {
                const data = await res.json();
                setExplanationData(data);
            } else {
                setExplanationData({ definition: "Failed to fetch AI explanation. Please check your connection or login." });
            }
        } catch (error) {
            console.error(error);
            setExplanationData({ definition: "A network error occurred while connecting to the AI Tutor." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B1120]/80 pb-24 transition-colors">
            {/* Navbar */}
            <div className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 w-full backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/practice" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Hub
                    </Link>
                    <div className="font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <BookOpen className="w-5 h-5" /> Reading Comprehension
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
                
                {/* Auto-Reading Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Module Nav */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-nowrap overflow-x-auto hide-scrollbar w-full">
                        {modules.map((mod) => (
                            <button
                                key={mod.id}
                                onClick={() => {
                                    setActiveModuleId(mod.id);
                                    setActiveArticleId(mod.articles[0].id);
                                    setSelectedText('');
                                    setExplanationData(null);
                                }}
                                className={`min-w-[150px] md:flex-1 py-3 px-6 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeModuleId === mod.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'}`}
                            >
                                {mod.label}
                            </button>
                        ))}
                    </div>

                    {/* Article Nav (Sub-nav) */}
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar px-1 py-1 w-full">
                        {activeModule.articles.map((article, idx) => (
                            <button
                                key={article.id}
                                onClick={() => {
                                    setActiveArticleId(article.id);
                                    setSelectedText('');
                                    setExplanationData(null);
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap shrink-0 ${activeArticleId === article.id ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                            >
                                Passage {idx + 1}: {article.title}
                            </button>
                        ))}
                    </div>

                    {/* Reading Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-left w-full overflow-hidden">
                        <div className="mb-8">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 inline-block">
                                {activeModule.badge}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">{activeArticle.title}</h1>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium flex-wrap">
                                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" /> Highlight up to 15 words to get instant AI translations and grammar notes.
                            </p>
                        </div>

                        <div 
                            ref={textRef}
                            className="prose prose-base md:prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900/50 dark:selection:text-blue-100 cursor-text break-words"
                            onMouseUp={handleTextSelection}
                            onTouchEnd={handleTextSelection}
                        >
                            {activeArticle.paragraphs.map((p, idx) => (
                                <p key={idx} className="mb-6">{p}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Explanation Sidebar */}
                <div className="w-full md:w-[400px] lg:w-[420px] shrink-0">
                    <div className="sticky top-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-md border border-blue-100 dark:border-gray-700 h-[calc(100vh-8rem)] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-200/50 dark:border-gray-700">
                            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">AI Advanced Tutor</h2>
                        </div>

                        {!selectedText && (
                            <div className="flex flex-col items-center justify-center text-center h-48 text-gray-500 dark:text-gray-400">
                                <Search className="w-10 h-10 mb-4 opacity-20" />
                                <p className="font-medium text-sm px-4">Highlight words or phrases in the text to receive bilingual explanations, IPA pronunciation, and grammar rules.</p>
                            </div>
                        )}

                        {selectedText && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-lg border border-blue-200 dark:border-gray-600 isolate">
                                    <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                                        <div>
                                            <h3 className="font-black text-2xl text-blue-700 dark:text-blue-400 break-words leading-tight">"{selectedText}"</h3>
                                            {explanationData?.phonetic && <p className="text-gray-500 font-mono text-sm mt-1">{explanationData.phonetic}</p>}
                                        </div>
                                    </div>
                                    
                                    {loading ? (
                                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium py-4">
                                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                                            Deeply analyzing contextual meaning...
                                        </div>
                                    ) : explanationData ? (
                                        <div className="space-y-5 mt-4">
                                            {/* EN Definition */}
                                            {explanationData.definition && (
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Eng Definition</h4>
                                                    <p className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-relaxed">{explanationData.definition}</p>
                                                </div>
                                            )}
                                            
                                            {/* VI Translation */}
                                            {explanationData.translation && (
                                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                                                    <h4 className="text-[11px] font-bold text-blue-400 dark:text-blue-500 uppercase tracking-widest mb-1">Vietnamese Meaning</h4>
                                                    <p className="text-gray-900 dark:text-white text-sm font-bold leading-relaxed">{explanationData.translation}</p>
                                                </div>
                                            )}

                                            {/* Grammar */}
                                            {explanationData.grammar && (
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Grammar Notes</h4>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-l-2 border-gray-200 dark:border-gray-600 pl-3">{explanationData.grammar}</p>
                                                </div>
                                            )}

                                            {/* Example */}
                                            {explanationData.example && (
                                                <div>
                                                    <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Usage Example</h4>
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
