import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const Layout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Students', path: '/students' },
    { name: 'Classes', path: '/classes' },
    { name: 'Sections', path: '/sections' },
    { name: 'Subjects', path: '/subjects' },
    { name: 'Attendance', path: '/attendance' },
    { name: 'Timetable', path: '/timetable' },           // Naya
    { name: 'Fees', path: '/fees' },
    { name: 'Concession', path: '/concession' },         // Naya
    { name: 'Teachers', path: '/teachers' },
    { name: 'Homework', path: '/homework' },
    { name: 'Assignments', path: '/assignments' },       // Naya
    { name: 'Exams', path: '/exams' },
    { name: 'Results', path: '/results' },
    { name: 'Notice Board', path: '/notice-board' },
    { name: 'Study Material', path: '/study-material' },
    { name: 'Guardians', path: '/guardians' },
    { name: 'Academic Years', path: '/academic-years' },
    { name: 'School Settings', path: '/settings' },
];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px' }}>
                <h2 style={{ marginBottom: '30px' }}>School ERP</h2>
                <nav>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'block',
                                padding: '12px 16px',
                                marginBottom: '4px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: 'white',
                                backgroundColor: isActive ? '#4f46e5' : 'transparent',
                            })}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 16px',
                            marginTop: '20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '14px',
                        }}
                    >
                        Logout
                    </button>
                </nav>
            </div>

            <div style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;