import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    saveToken,
    getToken,
    clearToken,
    detectRoleFromUrl,
    getActiveRole,
} from '../utils/authStorage';

const AuthContext = createContext();

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (err) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(getToken());
    const [loading, setLoading] = useState(true);

    // ═══════════════════════════════════════════
    //  Load user from backend
    // ═══════════════════════════════════════════
    const loadUser = useCallback(async () => {
        const activeToken = getToken();

        if (!activeToken) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        const payload = decodeToken(activeToken);
        if (!payload) {
            clearToken();
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            setUser({
                id: res.data.id,
                email: res.data.email,
                full_name: res.data.full_name,
                role: res.data.role,
                school_id: res.data.school_id,
                school_slug: res.data.school_slug,
                school_name: res.data.school_name,                    // ✅ NEW
                student_id: res.data.student_id,
                teacher_id: res.data.teacher_id,
                institute_type: res.data.institute_type || 'school',  // ✅ NEW
            });
            setToken(activeToken);
        } catch (err) {
            console.error('User verification failed:', err);
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Initial load
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // ✅ Cross-tab sync
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key && e.key.startsWith('token')) {
                loadUser();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadUser]);

    // ═══════════════════════════════════════════
    //  Login
    // ═══════════════════════════════════════════
    const login = async (email, password) => {
        try {
            setUser(null);
            setToken(null);

            const response = await api.post('/auth/login', { email, password });
            const { access_token, role, user_name, institute_type } = response.data;

            // ✅ Role-specific token save karo
            saveToken(role, access_token);
            setToken(access_token);

            const payload = decodeToken(access_token);

            try {
                const meRes = await api.get('/auth/me');
                setUser({
                    id: meRes.data.id,
                    email: meRes.data.email,
                    full_name: meRes.data.full_name,
                    role: meRes.data.role,
                    school_id: meRes.data.school_id,
                    school_slug: meRes.data.school_slug,
                    school_name: meRes.data.school_name,                    // ✅ NEW
                    student_id: meRes.data.student_id,
                    teacher_id: meRes.data.teacher_id,
                    institute_type: meRes.data.institute_type || 'school',  // ✅ NEW
                });
            } catch {
                setUser({
                    id: payload?.user_id || payload?.id,
                    email: email,
                    full_name: user_name,
                    role: role || payload?.role,
                    school_id: payload?.school_id,
                    school_slug: payload?.school_slug,
                    institute_type: institute_type || payload?.institute_type || 'school',  // ✅ NEW
                });
            }

            return {
                success: true,
                role,
                school_slug: payload?.school_slug,
                institute_type: institute_type || payload?.institute_type || 'school',  // ✅ NEW
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.detail || 'Login failed',
            };
        }
    };

    // ═══════════════════════════════════════════
    //  Logout — sirf current role
    // ═══════════════════════════════════════════
    const logout = () => {
        const activeRole = getActiveRole();
        clearToken(activeRole);
        setToken(null);
        setUser(null);

        const slug = window.location.pathname.split('/').filter(Boolean)[0];
        const isSlug = slug && !['superadmin', 'admin', 'teacher', 'student', 'login'].includes(slug);
        window.location.href = isSlug ? `/${slug}/login` : '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);