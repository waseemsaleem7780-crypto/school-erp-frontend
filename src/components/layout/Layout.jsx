import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
    const { loading, user } = useAuth();

    // ═══════════════════════════════════════════════════════════════
    // ✅ CRITICAL FIX: Loading ya user null par poora page loading dikhao
    // Isse Outlet (dashboard content) render nahi hoga jab tak user load na ho
    // ═══════════════════════════════════════════════════════════════
    if (loading || !user) {
        return (
            <div
                style={{
                    display: 'flex',
                    minHeight: '100vh',
                    fontFamily: 'Arial, sans-serif',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f5f9',
                }}
            >
                <div style={{ textAlign: 'center', color: '#718096' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <div style={{ fontSize: '16px' }}>Verifying access...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <Sidebar />
            <div style={{ flex: 1, backgroundColor: '#f1f5f9', marginLeft: '250px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;