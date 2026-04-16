'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users as UsersIcon, FileText, PlusCircle, Trash2, Activity, Eye, Upload, X, BookOpen, Brain } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../../hooks/useTranslation';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();

    const [usersList, setUsersList] = useState<any[]>([]);
    const [examsList, setExamsList] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    // AI Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [usersRes, examsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams`, { headers })
                ]);

                if (usersRes.ok && examsRes.ok) {
                    setUsersList(await usersRes.json());
                    setExamsList(await examsRes.json());
                }
            } catch (err) {
                console.error('Failed to fetch admin data', err);
            } finally {
                setPageLoading(false);
            }
        };

        if (user?.role === 'ADMIN') {
            fetchAdminData();
        }
    }, [user]);

    const handleDeleteExam = async (examId: string) => {
        if (!confirm('Are you sure you want to delete this exam?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams/${examId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setExamsList(examsList.filter(e => e._id !== examId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateDummyExam = async () => {
        const dummyExam = {
            title: 'Sample IELTS Reading Test',
            type: 'IELTS',
            description: 'A sample reading test generated for demonstration.',
            questions: [
                {
                    text: 'What is the synonym of "Ubiquitous"?',
                    options: ['Rare', 'Everywhere', 'Expensive', 'Hidden'],
                    correctAnswerIndex: 1,
                    points: 1
                },
                {
                    text: 'Choose the correct sentence:',
                    options: ['She do not like apples.', 'She does not likes apples.', 'She does not like apples.', 'She do not likes apples.'],
                    correctAnswerIndex: 2,
                    points: 1
                }
            ]
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dummyExam)
            });

            if (res.ok) {
                const newExam = await res.json();
                setExamsList([...examsList, newExam]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUploadAIExam = async () => {
        setUploadError('');
        setUploading(true);

        try {
            // 1. Parse JSON
            let parsedExam;
            try {
                parsedExam = JSON.parse(jsonInput);
            } catch (e) {
                throw new Error(t.admin ? t.admin.invalidJson : 'Invalid JSON format. Please check for syntax errors.');
            }

            // 2. Validate essential fields early
            if (!parsedExam.title || !parsedExam.type || !parsedExam.questions || !Array.isArray(parsedExam.questions)) {
                throw new Error(t.admin ? t.admin.missingFields : 'Missing required fields: title, type, or questions array.');
            }

            // Ensure type is uppercase incase AI outputs lowercase
            parsedExam.type = parsedExam.type.toUpperCase();
            if (!['IELTS', 'TOEIC', 'General'].includes(parsedExam.type)) {
                throw new Error(t.admin ? t.admin.invalidType : 'Invalid exam type. Must be IELTS, TOEIC, or General.');
            }

            // 3. Send to backend
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(parsedExam)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create exam on the server.');
            }

            const newExam = await res.json();
            setExamsList([...examsList, newExam]);

            // 4. Reset & Close
            setIsUploadModalOpen(false);
            setJsonInput('');
        } catch (err: any) {
            setUploadError(err.message || 'An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    const copyPromptToClipboard = () => {
        const prompt = `Please generate an English test in strict JSON format. It MUST match this exact structure:
{
  "title": "Exam Title (e.g., IELTS Academic Reading Test 1)",
  "type": "IELTS", // Must be EXACTLY 'IELTS', 'TOEIC', or 'General'
  "description": "Brief description of the exam.",
  "questions": [
    {
      "text": "Question text here?",
      "options": ["A. First", "B. Second", "C. Third", "D. Fourth"],
      "correctAnswerIndex": 0, // 0-based index of the correct option (0=A, 1=B, 2=C, 3=D)
      "points": 1
    }
  ]
}`;
        navigator.clipboard.writeText(prompt);
        alert(t.admin ? t.admin.promptCopied : 'Prompt copied to clipboard!');
    };

    if (loading || pageLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
            <div className="flex flex-col items-center gap-4 text-red-600 dark:text-red-400">
                <Activity className="w-12 h-12 animate-pulse" />
                <p className="font-semibold text-gray-600 dark:text-gray-300">{t.dashboard.loading || 'Loading Admin Portal...'}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white/80 dark:bg-[#0B1120]/80 transition-colors duration-300">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-2xl text-red-600 dark:text-red-400">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t.admin.ctrlPanel}</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">{t.admin.manageGlobal}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/admin/placement-config"
                            className="flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-purple-500/20"
                        >
                            <Brain className="w-5 h-5" /> Test Settings
                        </Link>
                        <Link
                            href="/admin/materials"
                            className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-indigo-500/20"
                        >
                            <BookOpen className="w-5 h-5" /> Manage Materials
                        </Link>
                        <Link
                            href="/admin/courses"
                            className="flex justify-center items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-pink-500/20"
                        >
                            <BookOpen className="w-5 h-5" /> Manage Master Courses
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* USERS LIST */}
                    <div className="flex flex-col gap-6">
                        <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.admin.regUsers}</h2>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-left border-collapse bg-white dark:bg-gray-800">
                                    <thead className="bg-white/80 dark:bg-[#0B1120]/80/50">
                                        <tr className="border-b dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                            <th className="py-4 px-4">{t.admin.name}</th>
                                            <th className="py-4 px-4">{t.admin.email}</th>
                                            <th className="py-4 px-4">{t.admin.role}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {usersList.map((u, i) => (
                                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-gray-200">{u.name}</td>
                                                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/50'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* EXAMS LIST */}
                    <div className="flex flex-col gap-6">
                        <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.admin.manageExams}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsUploadModalOpen(true)}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {t.admin ? t.admin.uploadAI : 'Upload AI Exam'}
                                    </button>
                                    <button
                                        onClick={handleCreateDummyExam}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        {t.admin.createSample}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {examsList.length === 0 ? (
                                    <div className="text-center py-10 bg-white/80 dark:bg-[#0B1120]/80/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t.admin.noExamsAvailable}</p>
                                    </div>
                                ) : (
                                    examsList.map(exam => (
                                        <div key={exam._id} className="flex justify-between items-center p-5 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{exam.title}</h3>
                                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${exam.type === 'IELTS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                                    {exam.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/exams/${exam._id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                    title="View Exam Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteExam(exam._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* AI JSON UPload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                {t.admin ? t.admin.uploadAI : 'Upload AI-Generated Exam'}
                            </h3>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <p className="text-sm text-blue-800 dark:text-blue-300 flex-1">
                                    {t.admin ? t.admin.promptInstruction : 'Ask ChatGPT or Claude to generate an exam strictly matching our required JSON schema, then paste it below.'}
                                </p>
                                <button
                                    onClick={copyPromptToClipboard}
                                    className="shrink-0 text-xs font-semibold bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t.admin ? t.admin.copyPrompt : 'Copy AI Prompt'}
                                </button>
                            </div>

                            {uploadError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl text-sm font-medium">
                                    {uploadError}
                                </div>
                            )}

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t.admin ? t.admin.pasteJson : 'Paste JSON Output Here:'}
                            </label>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-64 font-mono text-sm p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-[#0B1120]/80 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder='{\n  "title": "...",\n  "type": "IELTS",\n  "questions": [...]\n}'
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadAIExam}
                                disabled={uploading || !jsonInput.trim()}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 dark:disabled:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-500/20"
                            >
                                {uploading ? (
                                    <><Activity className="w-4 h-4 animate-pulse" /> Processing...</>
                                ) : (
                                    <><Upload className="w-4 h-4" /> {t.admin ? t.admin.saveExam : 'Save Exam'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
