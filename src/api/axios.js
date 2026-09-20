import axios from 'axios';
import { getToken, detectRoleFromUrl, clearToken } from '../utils/authStorage';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ═══════════════════════════════════════════════════════════════
//  Request Interceptor — role-specific token bhejo
// ═══════════════════════════════════════════════════════════════
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════════════
//  Response Interceptor — 401 par logout
// ═══════════════════════════════════════════════════════════════
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const role = detectRoleFromUrl();
            clearToken(role);

            // Sirf login page par redirect karo agar already wahan nahi
            if (!window.location.pathname.includes('/login')) {
                const slug = window.location.pathname.split('/').filter(Boolean)[0];
                const isSlug = slug && !['superadmin', 'admin', 'teacher', 'student', 'login'].includes(slug);
                window.location.href = isSlug ? `/${slug}/login` : '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;