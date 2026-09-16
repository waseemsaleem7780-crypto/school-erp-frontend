import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeacherDashboard = () => {
    const [stats, setStats] = useState({
        total_classes: 0,
        total_students: 0,
        total_homework: 0,
        today_attendance: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/teacher/my-stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { title: 'My Classes', value: stats.total_classes, color: '#667eea', emoji: '🏫', subtitle: 'Total classes' },
        { title: 'My Students', value: stats.total_students, color: '#764ba2', emoji: '👨‍🎓', subtitle: 'Enrolled students' },
        { title: 'Homework Given', value: stats.total_homework, color: '#f093fb', emoji: '📝', subtitle: 'Total assignments' },
        { title: 'Today Attendance', value: stats.today_attendance, color: '#4facfe', emoji: '✅', subtitle: 'Marked today' },
    ];

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px' }}>⏳</div>
                <p style={{ color: '#718096' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    Teacher Dashboard
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Welcome back! Here's your overview.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '30px',
            }}>
                {cards.map((card, i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderLeft: `5px solid ${card.color}`,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: '#718096', fontSize: '14px', margin: '0 0 8px 0' }}>
                                    {card.title}
                                </p>
                                <p style={{
                                    fontSize: '36px',
                                    fontWeight: 'bold',
                                    color: card.color,
                                    margin: 0,
                                }}>
                                    {card.value}
                                </p>
                                <p style={{ color: '#a0aec0', fontSize: '12px', margin: '4px 0 0 0' }}>
                                    {card.subtitle}
                                </p>
                            </div>
                            <div style={{ fontSize: '40px' }}>{card.emoji}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '40px',
                color: 'white',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>
                    Welcome, Teacher! 👨‍🏫
                </h2>
                <p style={{ margin: 0, opacity: 0.9 }}>
                    Mark attendance, assign homework, and enter marks from the sidebar.
                </p>
            </div>
        </div>
    );
};

export default TeacherDashboard;