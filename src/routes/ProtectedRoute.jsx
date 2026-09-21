import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const { schoolSlug } = useParams();

    // ═══════════════════════════════════════════════════════════════
    // ✅ Loading — AuthContext se (koi API call nahi)
    // ═══════════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    fontSize: '16px',
                    color: '#718096',
                    gap: '16px',
                }}
            >
                <div style={{ fontSize: '48px' }}>🔒</div>
                <div>Verifying access...</div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ Not logged in — login par redirect
    // ═══════════════════════════════════════════════════════════════
    if (!user) {
        return <Navigate to={schoolSlug ? `/${schoolSlug}/login` : '/login'} replace />;
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ School slug match
    // ═══════════════════════════════════════════════════════════════
    if (schoolSlug && user.school_slug && schoolSlug !== user.school_slug) {
        return <Navigate to={`/${user.school_slug}/login`} replace />;
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ Role check
    // ═══════════════════════════════════════════════════════════════
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const prefix = schoolSlug ? `/${schoolSlug}` : '';

        if (user.role === 'admin') {
            return <Navigate to={`${prefix}/admin/dashboard`} replace />;
        }
        if (user.role === 'teacher') {
            return <Navigate to={`${prefix}/teacher/dashboard`} replace />;
        }
        if (user.role === 'student') {
            return <Navigate to={`${prefix}/student/dashboard`} replace />;
        }
        if (user.role === 'super_admin') {
            return <Navigate to="/superadmin/schools" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // ✅ Sab check pass — route render
    return <Outlet />;
};

export default ProtectedRoute;