import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeacherDashboard = () => {
    const [stats, setStats] = useState({
        classes: 0,
        students: 0,
        homework: 0,
        attendance: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [classesRes, homeworkRes] = await Promise.all([
                api.get('/classes/'),
                api.get('/homework/student/1').catch(() => ({ data: [] })),
            ]);
            
            setStats({
                classes: classesRes.data.length || 0,
                students: 0,
                homework: homeworkRes.data.length || 0,
                attendance: 0,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { title: 'My Classes', value: stats.classes, color: '#667eea', emoji: '🏫' },
        { title: 'My Students', value: stats.students, color: '#764ba2', emoji: '👨‍🎓' },
        { title: 'Homework Given', value: stats.homework, color: '#f093fb', emoji: '📝' },
        { title: 'Attendance Marked', value: stats.attendance, color: '#4facfe', emoji: '✅' },
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