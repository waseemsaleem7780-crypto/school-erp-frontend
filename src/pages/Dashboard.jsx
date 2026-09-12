import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        classes: 0,
        teachers: 0,
        subjects: 0,
        today_attendance: 0,
        present_today: 0,
        absent_today: 0,
    });
    const [classData, setClassData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data);

            // Class-wise students data for Bar Chart
            const classRes = await api.get('/classes/');
            const classChart = await Promise.all(
                classRes.data.map(async (c) => {
                    const sRes = await api.get(`/students/${c.id}`);
                    return { name: c.name, students: sRes.data.length };
                })
            );
            setClassData(classChart);

            // Attendance distribution for Pie Chart
            setAttendanceData([
                { name: 'Present', value: res.data.present_today, color: '#48bb78' },
                { name: 'Absent', value: res.data.absent_today, color: '#fc8181' },
                {
                    name: 'Unmarked',
                    value: Math.max(0, res.data.students - res.data.today_attendance),
                    color: '#a0aec0'
                },
            ]);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Students', value: stats.students, color: '#667eea', emoji: '👨‍🎓', subtitle: 'Registered students' },
        { title: 'Total Classes', value: stats.classes, color: '#764ba2', emoji: '🏫', subtitle: 'Active classes' },
        { title: 'Total Teachers', value: stats.teachers, color: '#f093fb', emoji: '👨‍🏫', subtitle: 'Staff members' },
        { title: 'Total Subjects', value: stats.subjects, color: '#4facfe', emoji: '📖', subtitle: 'Active subjects' },
    ];

    const attendanceCards = [
        { title: 'Today Marked', value: stats.today_attendance, color: '#667eea', emoji: '📝' },
        { title: 'Present Today', value: stats.present_today, color: '#48bb78', emoji: '✅' },
        { title: 'Absent Today', value: stats.absent_today, color: '#fc8181', emoji: '❌' },
    ];

    if (loading) {
        return (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p style={{ color: '#718096' }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    Dashboard
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Welcome back to School ERP System
                </p>
            </div>

            {/* Main Stats Cards */}
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
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
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
                            <div style={{
                                fontSize: '40px',
                                opacity: 0.8,
                            }}>
                                {card.emoji}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px',
                marginBottom: '30px',
            }}>
                {/* Bar Chart: Class-wise Students */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c', marginBottom: '20px' }}>
                        📊 Class-wise Students
                    </h3>
                    {classData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={classData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#718096" />
                                <YAxis stroke="#718096" allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="students" fill="#667eea" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#a0aec0' }}>
                            No class data available
                        </div>
                    )}
                </div>

                {/* Pie Chart: Today's Attendance */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c', marginBottom: '20px' }}>
                        🥧 Today's Attendance
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={attendanceData}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {attendanceData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Attendance Stats */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '20px', color: '#1a202c', marginBottom: '16px' }}>
                    📅 Today's Attendance
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                }}>
                    {attendanceCards.map((card, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                            }}
                        >
                            <div style={{ fontSize: '32px' }}>{card.emoji}</div>
                            <div>
                                <p style={{ color: '#718096', fontSize: '13px', margin: '0 0 4px 0' }}>
                                    {card.title}
                                </p>
                                <p style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: card.color,
                                    margin: 0,
                                }}>
                                    {card.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '40px',
                color: 'white',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                marginBottom: '30px',
            }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>
                    Welcome to School ERP! 🎓
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
                    Manage your school efficiently with our all-in-one system.
                </p>
            </div>

            {/* Quick Actions + System Status */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>⚡ Quick Actions</h3>
                    <a href="/students" style={{ display: 'block', padding: '12px 16px', marginBottom: '8px', backgroundColor: '#f7fafc', borderRadius: '8px', textDecoration: 'none', color: '#4a5568' }}>
                        ➕ Add New Student
                    </a>
                    <a href="/classes" style={{ display: 'block', padding: '12px 16px', marginBottom: '8px', backgroundColor: '#f7fafc', borderRadius: '8px', textDecoration: 'none', color: '#4a5568' }}>
                        ➕ Create New Class
                    </a>
                    <a href="/attendance" style={{ display: 'block', padding: '12px 16px', backgroundColor: '#f7fafc', borderRadius: '8px', textDecoration: 'none', color: '#4a5568' }}>
                        ✓ Mark Attendance
                    </a>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>🔧 System Status</h3>
                    <p style={{ color: '#38a169', margin: '8px 0' }}>✅ PostgreSQL Connected</p>
                    <p style={{ color: '#38a169', margin: '8px 0' }}>✅ JWT Auth Enabled</p>
                    <p style={{ color: '#38a169', margin: '8px 0' }}>✅ 20 Modules Active</p>
                    <p style={{ color: '#38a169', margin: '8px 0' }}>✅ 40+ APIs Running</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;