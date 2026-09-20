import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const ProtectedRoute = ({ allowedRoles }) => {
    const [status, setStatus] = useState('checking');
    const [redirectTo, setRedirectTo] = useState('/login');
    const { schoolSlug } = useParams();
    const location = useLocation();

    useEffect(() => {
        const verifyAccess = async () => {
            // ═══════════════════════════════════════════
            // 🔒 LAYER 1: Token Check
            // ═══════════════════════════════════════════
            const token = localStorage.getItem('token');

            if (!token) {
                console.log('❌ Layer 1 failed: No token');
                setStatus('denied');
                setRedirectTo('/login');
                return;
            }

            // ═══════════════════════════════════════════
            // 🔒 LAYER 2: Token Format Check
            // ═══════════════════════════════════════════
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));

                // Expiry check
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    console.log('❌ Layer 2 failed: Token expired');
                    localStorage.removeItem('token');
                    setStatus('denied');
                    setRedirectTo('/login');
                    return;
                }
            } catch (err) {
                console.log('❌ Layer 2 failed: Invalid token format');
                localStorage.removeItem('token');
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
                    console.log('❌ Layer 3 failed: No role from backend');
                    localStorage.removeItem('token');
                    setStatus('denied');
                    setRedirectTo('/login');
                    return;
                }
            } catch (error) {
                console.log('❌ Layer 3 failed: Backend verification error');
                localStorage.removeItem('token');
                setStatus('denied');
                setRedirectTo('/login');
                return;
            }

            const userRole = backendUser.role;

            // ═══════════════════════════════════════════
            // 🔒 LAYER 4: School Slug Match Check
            // ═══════════════════════════════════════════
            if (schoolSlug && backendUser.school_slug) {
                if (schoolSlug !== backendUser.school_slug) {
                    console.log('❌ Layer 4 failed: School slug mismatch');
                    console.log(`Expected: ${backendUser.school_slug}, Got: ${schoolSlug}`);
                    setStatus('denied');
                    setRedirectTo(`/${backendUser.school_slug}/login`);
                    return;
                }
            }

            // ═══════════════════════════════════════════
            // 🔒 LAYER 5: Role Match Check
            // ═══════════════════════════════════════════
            if (allowedRoles && !allowedRoles.includes(userRole)) {
                console.log('❌ Layer 5 failed: Role not allowed');
                console.log(`Allowed: ${allowedRoles.join(', ')}, Got: ${userRole}`);

                const prefix = schoolSlug ? `/${schoolSlug}` : '';

                if (userRole === 'admin') setRedirectTo(`${prefix}/admin/dashboard`);
                else if (userRole === 'teacher') setRedirectTo(`${prefix}/teacher/dashboard`);
                else if (userRole === 'student') setRedirectTo(`${prefix}/student/dashboard`);
                else if (userRole === 'super_admin') setRedirectTo('/superadmin/schools');
                else setRedirectTo('/login');

                setStatus('denied');
                return;
            }

            // ✅ All layers passed
            console.log('✅ Access granted for:', userRole);
            setStatus('allowed');
        };

        verifyAccess();
    }, [allowedRoles, schoolSlug, location.pathname]);

    // ═══════════════════════════════════════════
    // LOADING STATE
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
                    Checking 5 security layers
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // DENIED STATE
    // ═══════════════════════════════════════════
    if (status === 'denied') {
        return <Navigate to={redirectTo} replace />;
    }

    // ═══════════════════════════════════════════
    // ACCESS GRANTED
    // ═══════════════════════════════════════════
    return <Outlet />;
};

export default ProtectedRoute;