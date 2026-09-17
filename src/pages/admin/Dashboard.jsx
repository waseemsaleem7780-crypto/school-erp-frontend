import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const attendancePercent = stats && stats.today_attendance > 0
        ? Math.round((stats.present_today / stats.today_attendance) * 100)
        : 0;

    if (loading) {
        return (
            <div style={{
                padding: '40px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
            }}>
                <div style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
                    color: '#c53030',
                    border: '1px solid #fc8181',
                }}>
                    ⚠️ {error}
                </div>
            </div>
        );
    }

    const cards = [
        { title: 'Students', value: stats.students, icon: '👨‍🎓', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102, 126, 234, 0.4)' },
        { title: 'Teachers', value: stats.teachers, icon: '👨‍🏫', gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', shadow: 'rgba(72, 187, 120, 0.4)' },
        { title: 'Classes', value: stats.classes, icon: '🏫', gradient: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)', shadow: 'rgba(237, 137, 54, 0.4)' },
        { title: 'Subjects', value: stats.subjects, icon: '📚', gradient: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)', shadow: 'rgba(159, 122, 234, 0.4)' },
    ];

    return (
        <div style={{
            padding: '40px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
        }}>
            <div style={{ marginBottom: '35px' }}>
                <h1 style={{
                    fontSize: '36px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: '0 0 8px 0',
                    fontWeight: '800',
                }}>
                    📊 Admin Dashboard
                </h1>
                <p style={{ color: '#4a5568', margin: 0, fontSize: '15px' }}>
                    🎯 Welcome back! Here's your school overview.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '35px',
            }}>
                {cards.map((card, i) => (
                    <div key={i} style={{
                        background: card.gradient,
                        borderRadius: '20px',
                        padding: '28px',
                        boxShadow: `0 10px 30px ${card.shadow}`,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            fontSize: '100px',
                            opacity: 0.15,
                        }}>{card.icon}</div>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{card.icon}</div>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Total {card.title}
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '42px', fontWeight: '800' }}>
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                marginBottom: '35px',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '24px', color: '#1a202c', fontWeight: '700' }}>
                            📅 Today's Attendance
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>
                            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        background: attendancePercent >= 80
                            ? 'linear-gradient(135deg, #48bb78, #38a169)'
                            : attendancePercent >= 60
                            ? 'linear-gradient(135deg, #f6ad55, #ed8936)'
                            : 'linear-gradient(135deg, #fc8181, #e53e3e)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {attendancePercent}%
                    </div>
                </div>

                <div style={{
                    width: '100%',
                    height: '24px',
                    background: 'linear-gradient(90deg, #f7fafc, #edf2f7)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '24px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                }}>
                    <div style={{
                        width: `${attendancePercent}%`,
                        height: '100%',
                        background: attendancePercent >= 80
                            ? 'linear-gradient(90deg, #48bb78, #38a169)'
                            : attendancePercent >= 60
                            ? 'linear-gradient(90deg, #f6ad55, #ed8936)'
                            : 'linear-gradient(90deg, #fc8181, #e53e3e)',
                        transition: 'width 1s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: '12px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '13px',
                    }}>
                        {attendancePercent > 15 && `${attendancePercent}%`}
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '16px',
                }}>
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
                        borderRadius: '16px',
                        border: '2px solid #9ae6b4',
                    }}>
                        <p style={{ margin: 0, color: '#22543d', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
                            ✅ Present
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#22543d' }}>
                            {stats.present_today}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #fefcbf 0%, #faf089 100%)',
                        borderRadius: '16px',
                        border: '2px solid #f6e05e',
                    }}>
                        <p style={{ margin: 0, color: '#744210', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
                            ⚡ Half Day
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#744210' }}>
                            {stats.half_day_today || 0}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                        borderRadius: '16px',
                        border: '2px solid #fc8181',
                    }}>
                        <p style={{ margin: 0, color: '#742a2a', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
                            ❌ Not Present
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#742a2a' }}>
                            {stats.absent_today}
                        </p>
                    </div>
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)',
                        borderRadius: '16px',
                        border: '2px solid #90cdf4',
                    }}>
                        <p style={{ margin: 0, color: '#2a4365', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
                            📊 Total Marked
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#2a4365' }}>
                            {stats.today_attendance}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a202c', fontWeight: '700' }}>
                    ⚡ Quick Actions
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                }}>
                    <a href="/admin/students" style={{ textDecoration: 'none' }}>
                        <div style={{
                            padding: '24px',
                            background: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border: '2px solid #90cdf4',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍🎓</div>
                            <p style={{ margin: 0, fontWeight: '700', color: '#2a4365', fontSize: '15px' }}>Manage Students</p>
                        </div>
                    </a>
                    <a href="/admin/teachers" style={{ textDecoration: 'none' }}>
                        <div style={{
                            padding: '24px',
                            background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border: '2px solid #9ae6b4',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍🏫</div>
                            <p style={{ margin: 0, fontWeight: '700', color: '#22543d', fontSize: '15px' }}>Manage Teachers</p>
                        </div>
                    </a>
                    <a href="/admin/attendance" style={{ textDecoration: 'none' }}>
                        <div style={{
                            padding: '24px',
                            background: 'linear-gradient(135deg, #fffaf0 0%, #feebc8 100%)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border: '2px solid #f6ad55',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                            <p style={{ margin: 0, fontWeight: '700', color: '#7b341e', fontSize: '15px' }}>Mark Attendance</p>
                        </div>
                    </a>
                    <a href="/admin/subjects" style={{ textDecoration: 'none' }}>
                        <div style={{
                            padding: '24px',
                            background: 'linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border: '2px solid #9f7aea',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
                            <p style={{ margin: 0, fontWeight: '700', color: '#44337a', fontSize: '15px' }}>Manage Subjects</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;