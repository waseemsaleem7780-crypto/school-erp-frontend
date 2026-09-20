import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

// ✅ JWT decode function
const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (err) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // ✅ Page load / refresh par — backend se user verify karo
    useEffect(() => {
        const verifyUser = async () => {
            const storedToken = localStorage.getItem('token');

            if (!storedToken) {
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }

            // Token format check
            const payload = decodeToken(storedToken);
            if (!payload) {
                localStorage.removeItem('token');
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }

            try {
                // ✅ Backend se actual user info lo
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
        };

        verifyUser();
    }, []);

    const login = async (email, password) => {
        try {
            // ✅ Pehle purana data saaf karo
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);

            const response = await api.post('/auth/login', { email, password });
            const { access_token, role, school_slug, user_name } = response.data;

            localStorage.setItem('token', access_token);
            setToken(access_token);

            // ✅ Token decode — user info set karo
            const payload = decodeToken(access_token);

            // ✅ Backend se full user info lo
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
                // Fallback — token se
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
        // ✅ Saara data saaf karo
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