// ⬆️ Upar wale imports same — bas ye 3 lines add karo
import { saveToken, clearAllTokens } from '../../utils/authStorage';

// ... existing code ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // ✅ Pehle saare tokens clear karo — fresh login
        clearAllTokens();

        const result = await login(email, password);

        if (result.success) {
            const role = result.role;
            const tokenSchoolSlug = result.school_slug;

            // ✅ Final slug
            const finalSlug = tokenSchoolSlug || schoolSlug;

            // ✅ Role-based redirect
            if (role === 'super_admin') {
                window.location.href = '/superadmin/schools';
            } else if (role === 'admin') {
                window.location.href = finalSlug
                    ? `/${finalSlug}/admin/dashboard`
                    : '/admin/dashboard';
            } else if (role === 'teacher') {
                window.location.href = finalSlug
                    ? `/${finalSlug}/teacher/dashboard`
                    : '/teacher/dashboard';
            } else if (role === 'student') {
                window.location.href = finalSlug
                    ? `/${finalSlug}/student/dashboard`
                    : '/student/dashboard';
            } else {
                window.location.href = '/login';
            }
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

// ... baaki code same ...