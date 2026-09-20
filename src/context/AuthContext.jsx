import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

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
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }

        const payload = decodeToken(storedToken);
        if (!payload) {
            localStorage.removeItem('token');
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
                student_id: res.data.student_id,
                teacher_id: res.data.teacher_id,
            });
            setToken(storedToken);
        } catch (err) {
            console.error('User verification failed:', err);
            localStorage.removeItem('token');
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

    // ✅ Cross-tab sync — dusri tab mein login/logout hua to yahan bhi update ho
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'token') {
                loadUser();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [loadUser]);

    const login = async (email, password) => {
        try {
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);

            const response = await api.post('/auth/login', { email, password });
            const { access_token, role, user_name } = response.data;

            localStorage.setItem('token', access_token);
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
                    student_id: meRes.data.student_id,
                    teacher_id: meRes.data.teacher_id,
                });
            } catch {
                setUser({
                    id: payload?.user_id || payload?.id,
                    email: email,
                    full_name: user_name,
                    role: role || payload?.role,
                    school_id: payload?.school_id,
                });
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.detail || 'Login failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);