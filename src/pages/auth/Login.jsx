import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role;

            // ✅ Role-based redirect
            if (role === 'super_admin') {
                window.location.href = '/superadmin/schools';
            } else if (role === 'admin') {
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

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                width: '100%',
                maxWidth: '420px',
                padding: '50px 40px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        marginBottom: '15px',
                        fontSize: '32px',
                    }}>
                        🎓
                    </div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#1a202c',
                        margin: '0 0 8px 0',
                    }}>
                        School ERP
                    </h1>
                    <p style={{
                        color: '#718096',
                        fontSize: '14px',
                        margin: 0,
                    }}>
                        Sign in to your account
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fed7d7',
                        color: '#c53030',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        border: '1px solid #fc8181',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#4a5568',
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: '15px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                            placeholder="admin@school.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#4a5568',
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                fontSize: '15px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '15px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            background: loading
                                ? '#a0aec0'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: '#a0aec0',
                    fontSize: '13px',
                    marginTop: '30px',
                    marginBottom: 0,
                }}>
                    © 2026 School ERP Management System
                </p>
            </div>
        </div>
    );
};

export default Login;