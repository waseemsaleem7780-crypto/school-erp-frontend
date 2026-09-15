import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentDashboard = () => {
    const [stats, setStats] = useState({
        attendance: 0,
        homework: 0,
        results: 0,
        fees: 'N/A',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Demo data — baad mein actual API lagayenge
            setStats({
                attendance: 18,
                homework: 3,
                results: 5,
                fees: 'Paid ✅',
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cards = [
        { title: 'Attendance (This Month)', value: stats.attendance + '/20', color: '#48bb78', emoji: '✅' },
        { title: 'Pending Homework', value: stats.homework, color: '#ed8936', emoji: '📝' },
        { title: 'Results Available', value: stats.results, color: '#667eea', emoji: '📊' },
        { title: 'Fee Status', value: stats.fees, color: '#38b2ac', emoji: '💰' },
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
                    Student Dashboard
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
                                    fontSize: '32px',
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
                    Welcome, Student! 👨‍🎓
                </h2>
                <p style={{ margin: 0, opacity: 0.9 }}>
                    Check your attendance, homework, results, and fees from the sidebar.
                </p>
            </div>
        </div>
    );
};

export default StudentDashboard;