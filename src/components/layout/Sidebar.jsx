import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { getToken, clearToken } from '../../utils/authStorage';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const token = getToken();

    let role = 'admin';
    let schoolSlug = params.schoolSlug || null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role;
    } catch (err) {
        role = 'admin';
    }

    // ... baaki code same ...

    const handleLogout = () => {
        clearToken(role);
        const slug = schoolSlug || null;
        navigate(slug ? `/${slug}/login` : '/login');
    };

    // ... baaki render code same ...
};