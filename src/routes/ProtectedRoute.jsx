import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role;

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
            if (userRole === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
            if (userRole === 'student') return <Navigate to="/student/dashboard" replace />;
            return <Navigate to="/login" replace />;
        }

        return <Outlet />;
    } catch (error) {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;