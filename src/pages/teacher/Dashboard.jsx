import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const TeacherDashboard = () => {
    const t = useTerms();   // ✅ Mode-based labels
    const [stats, setStats] = useState({
        classes_count: 0,
        students_count: 0,
        subjects_count: 0,
        attendance_marked_today: 0,
    });
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [statsRes, classesRes] = await Promise.all([
                api.get('/teacher/my-stats'),
                api.get('/teacher/my-classes'),
            ]);
            setStats(statsRes.data);
            setClasses(classesRes.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

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
        { title: `My ${t.classes}`, value: stats.classes_count, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', emoji: '🏫', subtitle: `Total ${t.classes.toLowerCase()}`, shadow: 'rgba(102, 126, 234, 0.4)' },
        { title: `My ${t.students}`, value: stats.students_count, color: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)', emoji: '👨‍🎓', subtitle: `Enrolled ${t.students.toLowerCase()}`, shadow: 'rgba(237, 137, 54, 0.4)' },
        { title: `My ${t.subjects}`, value: stats.subjects_count, color: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', emoji: '📚', subtitle: `${t.subjects} taught`, shadow: 'rgba(72, 187, 120, 0.4)' },
        { title: `Today ${t.attendance}`, value: stats.attendance_marked_today, color: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)', emoji: '✅', subtitle: 'Marked today', shadow: 'rgba(56, 178, 172, 0.4)' },
    ];

    return (
        <div style={{
            padding: '40px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
        }}>
            {/* Header */}
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
                    👨‍🏫 {t.teacher} Dashboard
                </h1>
                <p style={{ color: '#4a5568', margin: 0, fontSize: '15px' }}>
                    👋 Welcome back! Here's your teaching overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '35px',
            }}>
                {cards.map((card, i) => (
                    <div key={i} style={{
                        background: card.color,
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
                        }}>{card.emoji}</div>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{card.emoji}</div>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {card.title}
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '42px', fontWeight: '800' }}>
                            {card.value}
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                            {card.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '24px',
                padding: '36px',
                color: 'white',
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                marginBottom: '35px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    fontSize: '200px',
                    opacity: 0.08,
                }}>🎓</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                    Welcome, {t.teacher}! 👋
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
                    Mark {t.attendance.toLowerCase()}, assign {t.homework.toLowerCase()}, and enter {t.marks.toLowerCase()} from the sidebar.
                </p>
            </div>

            {/* My Subjects/Classes */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '24px 28px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                }}>
                    <h3 style={{ margin: 0, color: '#1a202c', fontSize: '20px', fontWeight: '700' }}>
                        📚 My {t.subjects} ({classes.length})
                    </h3>
                </div>
                {classes.length === 0 ? (
                    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '72px', marginBottom: '16px' }}>📭</div>
                        <p style={{ color: '#718096', fontSize: '15px' }}>
                            No {t.subjects.toLowerCase()} assigned yet. Contact admin.
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{t.subject}</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Code</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{t.class}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((c) => (
                                <tr key={c.subject_id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 28px', color: '#1a202c', fontWeight: '600' }}>
                                        📖 {c.subject_name}
                                    </td>
                                    <td style={{ padding: '16px 28px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            background: 'linear-gradient(135deg, #bee3f8 0%, #90cdf4 100%)',
                                            color: '#2a4365',
                                        }}>
                                            {c.subject_code}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 28px', color: '#718096' }}>
                                        🏫 {c.class_name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;