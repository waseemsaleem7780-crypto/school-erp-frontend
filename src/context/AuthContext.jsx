import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

// ✅ JWT decode karne ka function
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

    // ✅ Token se user info nikalo (refresh par bhi kaam karega)
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            
            const payload = decodeToken(token);
            if (payload) {
                setUser({
                    id: payload.user_id || payload.id,
                    role: payload.role,
                    school_id: payload.school_id,
                    school_slug: payload.school_slug,
                });
            } else {
                // Invalid token — logout
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, role, school_slug, user_name } = response.data;

            localStorage.setItem('token', access_token);
            setToken(access_token);

            // ✅ Token decode karo — user info set karo
            const payload = decodeToken(access_token);
            setUser({
                id: payload?.user_id || payload?.id,
                email: email,
                full_name: user_name,
                role: role || payload?.role,
                school_id: payload?.school_id,
                school_slug: school_slug || payload?.school_slug,
            });

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