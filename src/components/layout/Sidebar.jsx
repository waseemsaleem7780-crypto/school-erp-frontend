import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const token = localStorage.getItem('token');

    let role = 'admin';
    let schoolSlug = params.schoolSlug || null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role;
    } catch (err) {
        role = 'admin';
    }

    if (!schoolSlug) {
        const pathParts = location.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 3 && !['superadmin', 'admin', 'teacher', 'student', 'login'].includes(pathParts[0])) {
            schoolSlug = pathParts[0];
        }
    }

    const prefix = schoolSlug ? `/${schoolSlug}` : '';

    const superAdminMenu = [
        { name: 'Schools Management', path: '/superadmin/schools' },
    ];

    const adminMenu = [
        { name: 'Dashboard', path: `${prefix}/admin/dashboard` },
        { name: 'Students', path: `${prefix}/admin/students` },
        { name: 'Classes', path: `${prefix}/admin/classes` },
        { name: 'Sections', path: `${prefix}/admin/sections` },
        { name: 'Subjects', path: `${prefix}/admin/subjects` },
        { name: 'Teachers', path: `${prefix}/admin/teachers` },
        { name: 'Attendance', path: `${prefix}/admin/attendance` },
        { name: 'Fees', path: `${prefix}/admin/fees` },
        { name: 'Concession', path: `${prefix}/admin/concession` },
        { name: 'Homework', path: `${prefix}/admin/homework` },
        { name: 'Assignments', path: `${prefix}/admin/assignments` },
        { name: 'Exams', path: `${prefix}/admin/exams` },
        { name: 'Results', path: `${prefix}/admin/results` },
        { name: 'Notice Board', path: `${prefix}/admin/notice-board` },
        { name: 'Study Material', path: `${prefix}/admin/study-material` },
        { name: 'Guardians', path: `${prefix}/admin/guardians` },
        { name: 'Timetable', path: `${prefix}/admin/timetable` },
        { name: 'Academic Years', path: `${prefix}/admin/academic-years` },
        { name: 'School Settings', path: `${prefix}/admin/settings` },
        { name: 'Analytics', path: `${prefix}/admin/analytics` },
        { name: '📢 Broadcast', path: `${prefix}/admin/broadcast` },
    ];

    const teacherMenu = [
        { name: 'Dashboard', path: `${prefix}/teacher/dashboard` },
        { name: 'My Classes', path: `${prefix}/teacher/my-classes` },
        { name: 'My Students', path: `${prefix}/teacher/my-students` },
        { name: 'Mark Attendance', path: `${prefix}/teacher/mark-attendance` },
        { name: 'Homework', path: `${prefix}/teacher/homework` },
        { name: 'Assignments', path: `${prefix}/teacher/assignments` },
        { name: 'Marks Entry', path: `${prefix}/teacher/marks-entry` },
        { name: 'Timetable', path: `${prefix}/teacher/timetable` },
        { name: 'Study Material', path: `${prefix}/teacher/study-material` },
        { name: 'Notice Board', path: `${prefix}/teacher/notice-board` },
        { name: '💬 Message Parent', path: `${prefix}/teacher/message-parent` },
    ];

    const studentMenu = [
        { name: 'Dashboard', path: `${prefix}/student/dashboard` },
        { name: 'My Attendance', path: `${prefix}/student/my-attendance` },
        { name: 'My Homework', path: `${prefix}/student/my-homework` },
        { name: 'My Assignments', path: `${prefix}/student/my-assignments` },
        { name: 'My Timetable', path: `${prefix}/student/my-timetable` },
        { name: 'My Results', path: `${prefix}/student/my-results` },
        { name: 'My Fees', path: `${prefix}/student/my-fees` },
        { name: 'Study Material', path: `${prefix}/student/study-material` },
        { name: 'Notice Board', path: `${prefix}/student/notice-board` },
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