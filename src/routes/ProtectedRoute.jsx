import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const ProtectedRoute = ({ allowedRoles }) => {
    const [status, setStatus] = useState('checking');
    const [redirectTo, setRedirectTo] = useState('/login');
    const { schoolSlug } = useParams();
    const location = useLocation();

    // ✅ Har render par fresh token lo
    const token = localStorage.getItem('token');

    useEffect(() => {
        let cancelled = false;

        const verifyAccess = async () => {
            // ═══════════════════════════════════════════
            // 🔒 LAYER 1: Token Check
            // ═══════════════════════════════════════════
            const currentToken = localStorage.getItem('token');

            if (!currentToken) {
                if (cancelled) return;
                setStatus('denied');
                setRedirectTo('/login');
                return;
            }

            // ═══════════════════════════════════════════
            // 🔒 LAYER 2: Token Format Check
            // ═══════════════════════════════════════════
            try {
                const payload = JSON.parse(atob(currentToken.split('.')[1]));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    if (cancelled) return;
                    setStatus('denied');
                    setRedirectTo('/login');
                    return;
                }
            } catch (err) {
                localStorage.removeItem('token');
                if (cancelled) return;
                setStatus('denied');
                setRedirectTo('/login');
                return;
            }

            // ═══════════════════════════════════════════
            // 🔒 LAYER 3: Backend Verification (/auth/me)
            // ═══════════════════════════════════════════
            let backendUser = null;
            try {
                const res = await api.get('/auth/me');
                backendUser = res.data;

                if (!backendUser || !backendUser.role) {
                    localStorage.removeItem('token');
                    if (cancelled) return;
                    setStatus('denied');
                    setRedirectTo('/login');
                    return;
                }
            } catch (error) {
                localStorage.removeItem('token');
                if (cancelled) return;
                setStatus('denied');
                setRedirectTo('/login');
                return;
            }

            const userRole = backendUser.role;

            // ═══════════════════════════════════════════
            // 🔒 LAYER 4: School Slug Match
            // ═══════════════════════════════════════════
            if (schoolSlug && backendUser.school_slug) {
                if (schoolSlug !== backendUser.school_slug) {
                    if (cancelled) return;
                    setStatus('denied');
                    setRedirectTo(`/${backendUser.school_slug}/login`);
                    return;
                }
            }

            // ═══════════════════════════════════════════
            // 🔒 LAYER 5: Role Match Check
            // ═══════════════════════════════════════════
            if (allowedRoles && !allowedRoles.includes(userRole)) {
                const prefix = schoolSlug ? `/${schoolSlug}` : '';

                if (userRole === 'admin') setRedirectTo(`${prefix}/admin/dashboard`);
                else if (userRole === 'teacher') setRedirectTo(`${prefix}/teacher/dashboard`);
                else if (userRole === 'student') setRedirectTo(`${prefix}/student/dashboard`);
                else if (userRole === 'super_admin') setRedirectTo('/superadmin/schools');
                else setRedirectTo('/login');

                if (cancelled) return;
                setStatus('denied');
                return;
            }

            // ✅ All layers passed
            if (cancelled) return;
            setStatus('allowed');
        };

        verifyAccess();

        return () => {
            cancelled = true;
        };
    }, [allowedRoles, schoolSlug, location.pathname, token]);   // ✅ token add — role change par re-verify

    // ═══════════════════════════════════════════
    // LOADING
    // ═══════════════════════════════════════════
    if (status === 'checking') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '16px',
                color: '#718096',
                gap: '16px',
            }}>
                <div style={{ fontSize: '48px' }}>🔒</div>
                <div>Verifying access...</div>
                <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                    Checking security layers
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // DENIED
    // ═══════════════════════════════════════════
    if (status === 'denied') {
        return <Navigate to={redirectTo} replace />;
    }

    // ═══════════════════════════════════════════
    // ALLOWED
    // ═══════════════════════════════════════════
    return <Outlet />;
};

export default ProtectedRoute;