'use client';

import React, { useEffect, useState, useContext, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function PaymentResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, token, setAuthData } = useContext(AuthContext) || {};
    const [loading, setLoading] = useState(true);

    const status = searchParams?.get('status');
    const courseId = searchParams?.get('courseId');
    const amount = searchParams?.get('amount');
    const code = searchParams?.get('code');

    useEffect(() => {
        // Refresh user data if payment was successful to sync purchased courses
        const refreshUser = async () => {
            if (status === 'success' && token) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        if (setAuthData) {
                            setAuthData(userData, token);
                        }
                    }
                } catch (error) {
                    console.error('Failed to refresh user profile:', error);
                }
            }
            setLoading(false);
        };

        refreshUser();
    }, [status, token, setAuthData]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Processing payment result...</p>
            </div>
        );
    }

    const isSuccess = status === 'success';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className={`p-6 md:p-8 text-center ${isSuccess ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <div className="flex justify-center mb-6">
                        {isSuccess ? (
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-300" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-600 dark:text-red-300" />
                            </div>
                        )}
                    </div>
                    
                    <h1 className={`text-2xl md:text-3xl font-extrabold mb-2 ${isSuccess ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                    </h1>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {isSuccess 
                            ? 'Your course has been successfully unlocked. You can now start learning.'
                            : `Unfortunately, your payment could not be processed. Error code: ${code || 'Unknown'}`
                        }
                    </p>

                    {isSuccess && amount && (
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-4">
                            Amount Paid: {(Number(amount) / 100).toLocaleString('vi-VN')} VNĐ
                        </p>
                    )}
                </div>

                <div className="p-6 md:p-8 bg-white dark:bg-gray-800">
                    {isSuccess ? (
                        <Link 
                            href={`/courses/${courseId}`}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-bold transition-transform hover:-translate-y-1 shadow-lg"
                        >
                            Go to Course <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => router.back()}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold transition-all"
                            >
                                Try Again
                            </button>
                            <Link 
                                href="/courses"
                                className="w-full text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-xl font-bold transition-all"
                            >
                                Back to Courses
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PaymentResultPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        }>
            <PaymentResultContent />
        </Suspense>
    );
}
