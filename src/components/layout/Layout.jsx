import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
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