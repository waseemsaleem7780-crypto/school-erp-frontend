import { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';
import api from '../../api/axios';

const Analytics = () => {
    const [attendanceTrend, setAttendanceTrend] = useState([]);
    const [feeCollection, setFeeCollection] = useState([]);
    const [topStudents, setTopStudents] = useState([]);
    const [defaulters, setDefaulters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [attRes, feeRes, topRes, defRes] = await Promise.all([
                api.get('/analytics/attendance-trend'),
                api.get('/analytics/fee-collection'),
                api.get('/analytics/top-students'),
                api.get('/analytics/defaulters'),
            ]);
            setAttendanceTrend(attRes.data);
            setFeeCollection(feeRes.data);
            setTopStudents(topRes.data);
            setDefaulters(defRes.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                padding: '40px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
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
            <div style={{ padding: '40px' }}>
                <div style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
                    color: '#c53030',
                }}>
                    ⚠️ {error}
                </div>
            </div>
        );
    }

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
                    📊 Reports & Analytics
                </h1>
                <p style={{ color: '#4a5568', margin: 0, fontSize: '15px' }}>
                    Insights and trends for your school
                </p>
            </div>

            {/* Chart 1: Attendance Trend */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                marginBottom: '30px',
            }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '22px', color: '#1a202c', fontWeight: '700' }}>
                    📈 Attendance Trend (Last 6 Months)
                </h2>
                {attendanceTrend.length === 0 ? (
                    <p style={{ color: '#718096', textAlign: 'center', padding: '40px' }}>No data yet</p>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={attendanceTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#718096" />
                            <YAxis stroke="#718096" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="#667eea"
                                strokeWidth={3}
                                dot={{ fill: '#667eea', r: 6 }}
                                name="Attendance %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Chart 2: Fee Collection */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                marginBottom: '30px',
            }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '22px', color: '#1a202c', fontWeight: '700' }}>
                    💰 Fee Collection (Last 6 Months)
                </h2>
                {feeCollection.length === 0 ? (
                    <p style={{ color: '#718096', textAlign: 'center', padding: '40px' }}>No data yet</p>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={feeCollection}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#718096" />
                            <YAxis stroke="#718096" />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                }}
                                formatter={(value) => `Rs. ${value}`}
                            />
                            <Legend />
                            <Bar dataKey="total" fill="#48bb78" radius={[8, 8, 0, 0]} name="Amount (Rs.)" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Chart 3: Top Students */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                marginBottom: '30px',
            }}>
                <div style={{
                    padding: '24px 28px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                }}>
                    <h2 style={{ margin: 0, fontSize: '22px', color: '#1a202c', fontWeight: '700' }}>
                        🏆 Top Students (Best Attendance)
                    </h2>
                </div>
                {topStudents.length === 0 ? (
                    <p style={{ color: '#718096', textAlign: 'center', padding: '40px' }}>No data yet</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Rank</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Student</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Roll No</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Present / Total</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topStudents.map((s, i) => (
                                <tr key={s.student_id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 28px', fontSize: '24px' }}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                    </td>
                                    <td style={{ padding: '16px 28px', color: '#1a202c', fontWeight: '600' }}>
                                        {s.student_name}
                                    </td>
                                    <td style={{ padding: '16px 28px', color: '#718096' }}>{s.roll_number}</td>
                                    <td style={{ padding: '16px 28px', color: '#718096' }}>
                                        {s.present_days} / {s.total_days}
                                    </td>
                                    <td style={{ padding: '16px 28px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            background: s.percentage >= 90 ? 'linear-gradient(135deg, #c6f6d5, #9ae6b4)' : s.percentage >= 75 ? 'linear-gradient(135deg, #fefcbf, #faf089)' : 'linear-gradient(135deg, #fed7d7, #fc8181)',
                                            color: s.percentage >= 90 ? '#22543d' : s.percentage >= 75 ? '#744210' : '#742a2a',
                                        }}>
                                            {s.percentage}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Chart 4: Fee Defaulters */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '24px 28px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                }}>
                    <h2 style={{ margin: 0, fontSize: '22px', color: '#742a2a', fontWeight: '700' }}>
                        ⚠️ Fee Defaulters ({defaulters.length})
                    </h2>
                </div>
                {defaulters.length === 0 ? (
                    <p style={{ color: '#718096', textAlign: 'center', padding: '40px' }}>
                        🎉 No defaulters! All fees paid.
                    </p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#fff5f5' }}>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#742a2a', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#742a2a', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Student</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#742a2a', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Roll No</th>
                                <th style={{ textAlign: 'left', padding: '16px 28px', color: '#742a2a', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {defaulters.map((s, i) => (
                                <tr key={s.student_id} style={{ borderTop: '1px solid #fed7d7' }}>
                                    <td style={{ padding: '16px 28px', color: '#742a2a', fontWeight: '600' }}>{i + 1}</td>
                                    <td style={{ padding: '16px 28px', color: '#1a202c', fontWeight: '600' }}>{s.student_name}</td>
                                    <td style={{ padding: '16px 28px', color: '#718096' }}>{s.roll_number}</td>
                                    <td style={{ padding: '16px 28px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            background: 'linear-gradient(135deg, #fed7d7 0%, #fc8181 100%)',
                                            color: '#742a2a',
                                        }}>
                                            ❌ Pending
                                        </span>
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

export default Analytics;