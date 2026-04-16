'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

function AuthCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuthData } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            // In a real flow, we might want to fetch that specific user's profile right here,
            // but Since getProfile is called in AuthProvider initialization, we can just 
            // save the token and redirect. The AuthProvider will pick it up.
            localStorage.setItem('token', token);

            // Force a hard reload to dashboard so AuthProvider re-mounts and fetches user
            window.location.href = '/dashboard';
        } else {
            router.push('/login?error=oauth_failed');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Authenticating securely...</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white/80 dark:bg-[#0B1120]/80 text-gray-800 dark:text-gray-200">Loading...</div>}>
            <AuthCallbackHandler />
        </Suspense>
    );
}
