const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        if (role === 'admin') {
            window.location.href = '/admin/dashboard';
        } else if (role === 'teacher') {
            window.location.href = '/teacher/dashboard';
        } else if (role === 'student') {
            window.location.href = '/student/dashboard';
        } else {
            window.location.href = '/login';
        }
    } else {
        setError(result.message);
        setLoading(false);
    }
};