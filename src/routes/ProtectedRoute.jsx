import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // ✅ localStorage se seedha token check karo (state ka wait mat karo)
    const token = localStorage.getItem('token');

    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;