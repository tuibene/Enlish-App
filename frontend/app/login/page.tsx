'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '../../hooks/useTranslation';

function LoginContent() {
    const { login, register, user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();

    const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (activeTab === 'login') {
                await login({ email: formData.email, password: formData.password });
            } else {
                await register(formData);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/auth/google`;
    };

    if (loading || user) return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center dark:bg-gray-900">{t.dashboard.loading || 'Loading...'}</div>;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button
                        className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                        onClick={() => setActiveTab('login')}
                    >
                        {t.login.logInTab}
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-semibold transition-colors ${activeTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                        onClick={() => setActiveTab('register')}
                    >
                        {t.login.signUpTab}
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            {activeTab === 'login' ? t.login.welcomeBack : t.login.createAccount}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {activeTab === 'login' ? t.login.enterDetails : t.login.startJourney}
                        </p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {activeTab === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.login.fullName}</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.login.email}</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.login.password}</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-3 rounded-xl text-white font-bold text-lg transition-all transform hover:-translate-y-0.5 shadow-lg ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                        >
                            {submitting ? t.login.pleaseWait : (activeTab === 'login' ? t.login.logInTab : t.login.signUpTab)}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center">
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                        <span className="px-4 text-sm text-gray-400 dark:text-gray-500">{t.login.orContinue}</span>
                        <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {t.login.googleSignIn}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-gray-900">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
