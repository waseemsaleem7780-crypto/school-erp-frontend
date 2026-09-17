import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    let role = 'admin';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role;
    } catch (err) {
        role = 'admin';
    }

    const superAdminMenu = [
        { name: 'Schools Management', path: '/superadmin/schools', icon: '🏫' },
    ];

    const adminMenu = [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'Students', path: '/admin/students' },
        { name: 'Classes', path: '/admin/classes' },
        { name: 'Sections', path: '/admin/sections' },
        { name: 'Subjects', path: '/admin/subjects' },
        { name: 'Teachers', path: '/admin/teachers' },
        { name: 'Attendance', path: '/admin/attendance' },
        { name: 'Fees', path: '/admin/fees' },
        { name: 'Concession', path: '/admin/concession' },
        { name: 'Homework', path: '/admin/homework' },
        { name: 'Assignments', path: '/admin/assignments' },
        { name: 'Exams', path: '/admin/exams' },
        { name: 'Results', path: '/admin/results' },
        { name: 'Notice Board', path: '/admin/notice-board' },
        { name: 'Study Material', path: '/admin/study-material' },
        { name: 'Guardians', path: '/admin/guardians' },
        { name: 'Timetable', path: '/admin/timetable' },
        { name: 'Academic Years', path: '/admin/academic-years' },
        { name: 'School Settings', path: '/admin/settings' },
        { name: 'Analytics', path: '/admin/analytics' }
    ];

    const teacherMenu = [
        { name: 'Dashboard', path: '/teacher/dashboard' },
        { name: 'My Classes', path: '/teacher/my-classes' },
        { name: 'My Students', path: '/teacher/my-students' },
        { name: 'Mark Attendance', path: '/teacher/mark-attendance' },
        { name: 'Homework', path: '/teacher/homework' },
        { name: 'Assignments', path: '/teacher/assignments' },
        { name: 'Marks Entry', path: '/teacher/marks-entry' },
        { name: 'Timetable', path: '/teacher/timetable' },
        { name: 'Study Material', path: '/teacher/study-material' },
        { name: 'Notice Board', path: '/teacher/notice-board' },
    ];

    const studentMenu = [
        { name: 'Dashboard', path: '/student/dashboard' },
        { name: 'My Attendance', path: '/student/my-attendance' },
        { name: 'My Homework', path: '/student/my-homework' },
        { name: 'My Assignments', path: '/student/my-assignments' },
        { name: 'My Timetable', path: '/student/my-timetable' },
        { name: 'My Results', path: '/student/my-results' },
        { name: 'My Fees', path: '/student/my-fees' },
        { name: 'Study Material', path: '/student/study-material' },
        { name: 'Notice Board', path: '/student/notice-board' },
    ];

    let menuItems = [];
    let roleLabel = 'Admin';

    if (role === 'super_admin') {
        menuItems = superAdminMenu;
        roleLabel = 'Super Admin';
    } else if (role === 'admin') {
        menuItems = adminMenu;
        roleLabel = 'Admin';
    } else if (role === 'teacher') {
        menuItems = teacherMenu;
        roleLabel = 'Teacher';
    } else if (role === 'student') {
        menuItems = studentMenu;
        roleLabel = 'Student';
    } else {
        menuItems = adminMenu;
        roleLabel = 'Admin';
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{
            width: '250px',
            backgroundColor: '#1e293b',
            color: 'white',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0,
        }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #334155', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>School ERP</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {roleLabel} Panel
                </p>
            </div>

            <nav style={{
                flex: 1,
                padding: '12px',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'block',
                            padding: '10px 14px',
                            marginBottom: '4px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'white',
                            fontSize: '14px',
                            backgroundColor: isActive ? '#4f46e5' : 'transparent',
                        })}
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '12px', borderTop: '1px solid #334155', flexShrink: 0 }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                    }}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;