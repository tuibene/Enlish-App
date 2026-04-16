'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    cefrLevel: string;
    targetScore: number;
    studyHoursPerWeek: number;
    theme?: string;
    language?: string;
    avatar?: string;
    hasTakenPlacementTest?: boolean;
    enrolledCourse?: string;
    completedCourseDays?: number[];
    purchasedCourses?: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    updatePreferences: (theme: string, language: string) => Promise<void>;
    loading: boolean;
    setAuthData: (user: User, token: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const profile = await authService.getProfile(storedToken);
                    setUser(profile);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Failed to authenticate token', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Apply dark mode immediately based on user preference
    useEffect(() => {
        if (user?.theme) {
            if (user.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [user?.theme]);

    const login = async (userData: any) => {
        const data = await authService.login(userData);
        setAuthData(data, data.token);
    };

    const register = async (userData: any) => {
        const data = await authService.register(userData);
        setAuthData(data, data.token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const updatePreferences = async (theme: string, language: string) => {
        if (!token || !user) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ theme, language }),
            });
            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
            }
        } catch (err) {
            console.error('Failed to update preferences', err);
        }
    };

    const setAuthData = (userData: User, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updatePreferences, loading, setAuthData }}>
            {children}
        </AuthContext.Provider>
    );
};
