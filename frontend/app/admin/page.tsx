'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users as UsersIcon, FileText, PlusCircle, Trash2, Activity, Eye, Upload, X, BookOpen, Brain, Settings, ChevronRight, BarChart3, GraduationCap, Headphones, Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../../hooks/useTranslation';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();

    const [usersList, setUsersList] = useState<any[]>([]);
    const [examsList, setExamsList] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchUser, setSearchUser] = useState('');

    // AI Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploading, setUploading] = useState(false);

    // Custom Delete Modal State
    const [examToDelete, setExamToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'ROOT'))) {
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

        if (user?.role === 'ADMIN' || user?.role === 'ROOT') {
            fetchAdminData();
        }
    }, [user]);

    const executeDeleteExam = async (examId: string) => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/exams/${examId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setExamsList(examsList.filter(e => e._id !== examId));
                setExamToDelete(null);
            } else {
                const errorData = await res.json();
                alert(`Error deleting exam: ${errorData.message || 'Unknown error'}`);
                console.error(errorData);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to execute delete request');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUsersList(usersList.map(u => u._id === userId ? { ...u, role: updatedUser.role } : u));
            } else {
                const errorData = await res.json();
                alert(`Error changing role: ${errorData.message}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to execute role change request');
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
            let parsedExam;
            try {
                parsedExam = JSON.parse(jsonInput);
            } catch (e) {
                throw new Error(t.admin ? t.admin.invalidJson : 'Invalid JSON format. Please check for syntax errors.');
            }

            if (!parsedExam.title || !parsedExam.type || !parsedExam.questions || !Array.isArray(parsedExam.questions)) {
                throw new Error(t.admin ? t.admin.missingFields : 'Missing required fields: title, type, or questions array.');
            }

            parsedExam.type = parsedExam.type.toUpperCase();
            if (!['IELTS', 'TOEIC', 'General'].includes(parsedExam.type)) {
                throw new Error(t.admin ? t.admin.invalidType : 'Invalid exam type. Must be IELTS, TOEIC, or General.');
            }

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

    const filteredUsers = usersList.filter(u =>
        u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    const adminCount = usersList.filter(u => u.role === 'ADMIN' || u.role === 'ROOT').length;
    const studentCount = usersList.filter(u => u.role === 'USER').length;

    if (loading || pageLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0a0f1a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-semibold text-gray-500 dark:text-gray-400">{t.dashboard?.loading || 'Loading Admin Portal...'}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0f1a] transition-colors duration-300">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIj48cGF0aCBkPSJNMzYgMzRWMGgtMnYzNGgtMnYtMThoLTJ2MThoLTJ2LTI2aC0ydjI2aC0ydi0xMmgtMnYxMmgtMnYtOGgtMnY4SDB2Mmg4djhoMnYtOGgydjEyaDJ2LTEyaDJ2MjZoMnYtMjZoMnYxOGgydi0xOGgyVjBoMnYzNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-24 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                <ShieldCheck className="w-7 h-7 text-indigo-300" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{t.admin?.ctrlPanel || 'Admin Control Panel'}</h1>
                                <p className="text-indigo-300/80 mt-1">{t.admin?.manageGlobal || 'Manage users, exams and platform records globally.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions + Stats */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-14 relative z-20 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Users', value: usersList.length, icon: <UsersIcon className="w-5 h-5"/>, color: 'from-blue-500 to-cyan-500', bgIcon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                        { label: 'Total Exams', value: examsList.length, icon: <FileText className="w-5 h-5"/>, color: 'from-indigo-500 to-purple-500', bgIcon: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
                        { label: 'Admins', value: adminCount, icon: <ShieldCheck className="w-5 h-5"/>, color: 'from-rose-500 to-pink-500', bgIcon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
                        { label: 'Students', value: studentCount, icon: <GraduationCap className="w-5 h-5"/>, color: 'from-emerald-500 to-teal-500', bgIcon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgIcon}`}>{stat.icon}</div>
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {[
                        { href: '/admin/placement-config', label: 'Placement Test', desc: 'Configure test settings', icon: <Settings className="w-5 h-5"/>, gradient: 'from-violet-500 to-purple-600' },
                        { href: '/admin/materials', label: 'Materials', desc: 'Manage learning resources', icon: <FileText className="w-5 h-5"/>, gradient: 'from-blue-500 to-cyan-600' },
                        { href: '/admin/courses', label: 'Master Courses', desc: 'Manage course curriculum', icon: <BookOpen className="w-5 h-5"/>, gradient: 'from-emerald-500 to-teal-600' },
                        { href: '/admin/official-mocks', label: 'IELTS Simulations', desc: 'Manage CBT mock exams', icon: <Headphones className="w-5 h-5"/>, gradient: 'from-orange-500 to-red-600' },
                        { href: '/admin/orders', label: 'Transactions', desc: 'VNPay Orders & Revenue', icon: <Activity className="w-5 h-5"/>, gradient: 'from-pink-500 to-rose-600' },
                    ].map(nav => (
                        <Link key={nav.href} href={nav.href} className="group bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${nav.gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                {nav.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1">
                                {nav.label}
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{nav.desc}</p>
                        </Link>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                    {/* USERS LIST - takes 3 cols */}
                    <section className="xl:col-span-3 bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.admin?.regUsers || 'Registered Users'}</h2>
                                    <p className="text-xs text-gray-500">{usersList.length} total accounts</p>
                                </div>
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchUser}
                                    onChange={e => setSearchUser(e.target.value)}
                                    className="w-full sm:w-64 pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-[#0f172a] z-10">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                                        <th className="py-3 px-6">{t.admin?.name || 'Name'}</th>
                                        <th className="py-3 px-6">{t.admin?.email || 'Email'}</th>
                                        <th className="py-3 px-6 text-right">{t.admin?.role || 'Role'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${u.role === 'ROOT' ? 'bg-gradient-to-br from-amber-500 to-yellow-600' : u.role === 'ADMIN' ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                            <td className="py-3.5 px-6 text-right">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    disabled={user?.role !== 'ROOT' || u._id === user?._id}
                                                    className={`appearance-none bg-transparent outline-none ${user?.role === 'ROOT' && u._id !== user?._id ? 'cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800' : 'cursor-not-allowed opacity-80'} inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-center border border-transparent focus:ring-2 focus:ring-indigo-500/50 ${
                                                        u.role === 'ROOT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' : 
                                                        u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50' : 
                                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                                                    }`}
                                                >
                                                    <option value="USER" className="text-gray-900 font-bold bg-white dark:bg-gray-800 dark:text-white">USER</option>
                                                    <option value="ADMIN" className="text-gray-900 font-bold bg-white dark:bg-gray-800 dark:text-white">ADMIN</option>
                                                    {user?.role === 'ROOT' && <option value="ROOT" className="text-gray-900 font-bold bg-white dark:bg-gray-800 dark:text-white">ROOT</option>}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12 text-gray-400 font-medium">No users found.</div>
                            )}
                        </div>
                    </section>

                    {/* EXAMS LIST - takes 2 cols */}
                    <section className="xl:col-span-2 bg-white dark:bg-[#111827] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t.admin?.manageExams || 'Practice Exams'}</h2>
                                        <p className="text-xs text-gray-500">{examsList.length} available</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsUploadModalOpen(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    <Upload className="w-3.5 h-3.5" /> Upload AI
                                </button>
                                <button
                                    onClick={handleCreateDummyExam}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" /> Create Sample
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3">
                            {examsList.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                                    <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">{t.admin?.noExamsAvailable || 'No exams available'}</p>
                                </div>
                            ) : (
                                examsList.map(exam => (
                                    <div key={exam._id} className="group flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-[#0a0f1a] hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{exam.title}</h3>
                                            <span className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${exam.type === 'IELTS' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                                {exam.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/exams/${exam._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="View">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => setExamToDelete(exam._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* AI JSON Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-500" />
                                {t.admin ? t.admin.uploadAI : 'Upload AI-Generated Exam'}
                            </h3>
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                <p className="text-sm text-indigo-800 dark:text-indigo-300 flex-1">
                                    {t.admin ? t.admin.promptInstruction : 'Ask ChatGPT or Claude to generate an exam strictly matching our required JSON schema, then paste it below.'}
                                </p>
                                <button
                                    onClick={copyPromptToClipboard}
                                    className="shrink-0 text-xs font-bold bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {t.admin ? t.admin.copyPrompt : 'Copy AI Prompt'}
                                </button>
                            </div>

                            {uploadError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-xl text-sm font-medium">
                                    {uploadError}
                                </div>
                            )}

                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {t.admin ? t.admin.pasteJson : 'Paste JSON Output Here:'}
                            </label>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full h-64 font-mono text-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0a0f1a] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                placeholder={'{\n  "title": "...",\n  "type": "IELTS",\n  "questions": [...]\n}'}
                            />
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                            <button
                                onClick={() => setIsUploadModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadAIExam}
                                disabled={uploading || !jsonInput.trim()}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                {uploading ? (
                                    <><Activity className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><Upload className="w-4 h-4" /> {t.admin ? t.admin.saveExam : 'Save Exam'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {examToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6 text-red-500 ring-8 ring-red-50/50 dark:ring-red-900/10">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Practice Exam?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
                                Are you totally sure? This exam and its questions will be completely wiped from the database.
                            </p>
                            <div className="flex items-center gap-3 w-full">
                                <button 
                                    onClick={() => setExamToDelete(null)}
                                    className="flex-1 py-3 px-4 font-bold rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => executeDeleteExam(examToDelete)}
                                    className="flex-1 py-3 px-4 font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white flex justify-center items-center gap-2 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Activity className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
