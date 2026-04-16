const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authService = {
    async register(userData: any) {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error occurred');
        return data;
    },

    async login(userData: any) {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error occurred');
        return data;
    },

    async getProfile(token: string) {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error occurred');
        return data;
    },

    loginWithGoogle() {
        window.location.href = `${API_URL}/users/auth/google`;
    },
};
