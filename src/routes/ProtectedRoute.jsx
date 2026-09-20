import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getToken, clearToken, detectRoleFromUrl } from '../utils/authStorage';

const ProtectedRoute = ({ allowedRoles }) => {
    const [status, setStatus] = useState('checking');
    const [redirectTo, setRedirectTo] = useState('/login');
    const { schoolSlug } = useParams();
    const location = useLocation();

    const token = getToken();

    useEffect(() => {
        let cancelled = false;

        const verifyAccess = async () => {
            const currentToken = getToken();

            if (!currentToken) {
                if (cancelled) return;
                setStatus('denied');
                setRedirectTo(schoolSlug ? `/${schoolSlug}/login` : '/login');
                return;
            }

            try {
                const payload = JSON.parse(atob(currentToken.split('.')[1]));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    clearToken();
                    if (cancelled) return;
                    setStatus('denied');
                    setRedirectTo(schoolSlug ? `/${schoolSlug}/login` : '/login');
                    return;
                }
            } catch (err) {
                clearToken();
                if (cancelled) return;
                setStatus('denied');
                setRedirectTo(schoolSlug ? `/${schoolSlug}/login` : '/login');
                return;
            }

            let backendUser = null;
            try {
                const res = await api.get('/auth/me');
                backendUser = res.data;
                if (!backendUser || !backendUser.role) {
                    clearToken();
                    if (cancelled) return;
                    setStatus('denied');
                    setRedirectTo(schoolSlug ? `/${schoolSlug}/login` : '/login');
                    return;
                }
            } catch (error) {
                clearToken();
                if (cancelled) return;
                setStatus('denied');
                setRedirectTo(schoolSlug ? `/${schoolSlug}/login` : '/login');
                return;
            }

            const userRole = backendUser.role;

            if (schoolSlug && backendUser.school_slug) {
                if (schoolSlug !== backendUser.school_slug) {
                    if (cancelled) return;
                    setStatus('denied');
                    setRedirectTo(`/${backendUser.school_slug}/login`);
                    return;
                }
            }

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

            if (cancelled) return;
            setStatus('allowed');
        };

        verifyAccess();

        return () => {
            cancelled = true;
        };
    }, [allowedRoles, schoolSlug, location.pathname, token]);

    if (status === 'checking') {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontSize: '16px',
                color: '#718096', gap: '16px',
            }}>
                <div style={{ fontSize: '48px' }}>🔒</div>
                <div>Verifying access...</div>
            </div>
        );
    }

    if (status === 'denied') {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;