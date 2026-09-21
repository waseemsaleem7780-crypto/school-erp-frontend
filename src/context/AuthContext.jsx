import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { clearAllTokens, getLoginUrl } from '../utils/authStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ═══════════════════════════════════════════
    //  Load user from backend (cookie se verify)
    // ═══════════════════════════════════════════
    const loadUser = useCallback(async () => {
        try {
            // ✅ Cookie automatically bhejta hai — koi token nahi
            const res = await api.get('/auth/me');
            setUser({
                id: res.data.id,
                email: res.data.email,
                full_name: res.data.full_name,
                role: res.data.role,
                school_id: res.data.school_id,
                school_slug: res.data.school_slug,
                school_name: res.data.school_name,
                student_id: res.data.student_id,
                teacher_id: res.data.teacher_id,
                institute_type: res.data.institute_type || 'school',
            });
        } catch (err) {
            // ❌ Cookie invalid/expired — kuch nahi karo, sirf user null
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Initial load
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // ═══════════════════════════════════════════
    //  Login
    // ═══════════════════════════════════════════
    const login = async (email, password) => {
        try {
            clearAllTokens();  // Legacy cleanup
            setUser(null);

            // ✅ Backend cookie set karega
            const response = await api.post('/auth/login', { email, password });

            const { role, user_name, school_slug, institute_type } = response.data;

            // ✅ Cookie se user info lo
            try {
                const meRes = await api.get('/auth/me');
                setUser({
                    id: meRes.data.id,
                    email: meRes.data.email,
                    full_name: meRes.data.full_name,
                    role: meRes.data.role,
                    school_id: meRes.data.school_id,
                    school_slug: meRes.data.school_slug,
                    school_name: meRes.data.school_name,
                    student_id: meRes.data.student_id,
                    teacher_id: meRes.data.teacher_id,
                    institute_type: meRes.data.institute_type || 'school',
                });
            } catch {
                // Fallback
                setUser({
                    email: email,
                    full_name: user_name,
                    role: role,
                    school_slug: school_slug,
                    institute_type: institute_type || 'school',
                });
            }

            return {
                success: true,
                role,
                school_slug,
                institute_type: institute_type || 'school',
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.detail || 'Login failed',
            };
        }
    };

    // ═══════════════════════════════════════════
    //  Logout — backend cookie clear karega
    // ═══════════════════════════════════════════
    const logout = async () => {
        try {
            // ✅ Backend ko call karo — cookie clear karega
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        }

        setUser(null);
        clearAllTokens();  // Legacy cleanup

        // ✅ Login page par redirect
        window.location.href = getLoginUrl();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);