import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, GraduationCap, BookOpen,
    CalendarCheck, DollarSign, UserCheck, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Students', path: '/students', icon: Users },
        { name: 'Classes', path: '/classes', icon: GraduationCap },
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Fees', path: '/fees', icon: DollarSign },
        { name: 'Teachers', path: '/teachers', icon: UserCheck },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <GraduationCap className="text-indigo-400" />
                    School ERP
                </h1>
                <p className="text-xs text-slate-400 mt-1">Management System</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-300 hover:bg-slate-800'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;