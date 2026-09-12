import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';

const Navbar = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                <p className="text-sm text-slate-500">Welcome back!</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">
                        {user?.email || 'Admin'}
                    </p>
                    <p className="text-xs text-slate-400">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;