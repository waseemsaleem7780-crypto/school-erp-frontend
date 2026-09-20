import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const ProtectedRoute = ({ allowedRoles }) => {
    const [status, setStatus] = useState('checking');
    const [redirectTo, setRedirectTo] = useState('/login');
    const { schoolSlug } = useParams();

    useEffect(() => {
        const verifyAccess = async () => {
            const token = localStorage.getItem('token');

            // 1. Token nahi — login par bhejo
            if (!token) {
                setStatus('denied');
                setRedirectTo('/login');
                return;
            }

            try {
                // 2. Backend se actual role lo
                const res = await api.get('/auth/me');
                const userRole = res.data.role;

                // 3. Role check
                if (allowedRoles && !allowedRoles.includes(userRole)) {
                    const prefix = schoolSlug ? `/${schoolSlug}` : '';

                    if (userRole === 'admin') setRedirectTo(`${prefix}/admin/dashboard`);
                    else if (userRole === 'teacher') setRedirectTo(`${prefix}/teacher/dashboard`);
                    else if (userRole === 'student') setRedirectTo(`${prefix}/student/dashboard`);
                    else if (userRole === 'super_admin') setRedirectTo('/superadmin/schools');
                    else setRedirectTo('/login');

                    setStatus('denied');
                    return;
                }

                // 4. Access allowed
                setStatus('allowed');
            } catch (error) {
                console.error('Access verification failed:', error);
                localStorage.removeItem('token');
                setStatus('denied');
                setRedirectTo('/login');
            }
        };

        verifyAccess();
    }, [allowedRoles, schoolSlug]);

    if (status === 'checking') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '16px',
                color: '#718096',
            }}>
                🔒 Verifying access...
            </div>
        );
    }

    if (status === 'denied') {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;