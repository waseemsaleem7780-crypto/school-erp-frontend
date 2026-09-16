import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [results, setResults] = useState([]);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [statsRes, attRes, resRes, feeRes] = await Promise.all([
                api.get('/student/dashboard/stats'),
                api.get('/student/dashboard/attendance'),
                api.get('/student/dashboard/results'),
                api.get('/student/dashboard/fees'),
            ]);
            setStats(statsRes.data);
            setAttendance(attRes.data);
            setResults(resRes.data);
            setFees(feeRes.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const attendancePercent = stats && stats.attendance_total > 0
        ? Math.round((stats.attendance_present / stats.attendance_total) * 100)
        : 0;

    // Loading Skeleton
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
            <div style={{
                padding: '40px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
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

    // Tab styles
    const tabStyle = (isActive) => ({
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        color: isActive ? 'white' : '#4a5568',
        background: isActive
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'rgba(255, 255, 255, 0.7)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        boxShadow: isActive
            ? '0 8px 20px rgba(102, 126, 234, 0.4)'
            : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    });

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
                    📊 My Dashboard
                </h1>
                <p style={{ color: '#4a5568', margin: 0, fontSize: '15px' }}>
                    👋 Welcome back! Here's your overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '35px',
            }}>
                {/* Attendance Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
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
                    }}>📋</div>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Attendance
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '42px', fontWeight: '800' }}>
                        {attendancePercent}%
                    </p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                        {stats.attendance_present} / {stats.attendance_total} days
                    </p>
                </div>

                {/* Homework Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 10px 30px rgba(237, 137, 54, 0.4)',
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
                    }}>📝</div>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Homework
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '42px', fontWeight: '800' }}>
                        {stats.homework_pending}
                    </p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                        pending tasks
                    </p>
                </div>

                {/* Results Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 10px 30px rgba(72, 187, 120, 0.4)',
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
                    }}>🏆</div>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</div>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Results
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '42px', fontWeight: '800' }}>
                        {stats.results_count}
                    </p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                        exams appeared
                    </p>
                </div>

                {/* Fee Status Card */}
                <div style={{
                    background: stats.fee_status.includes('Paid')
                        ? 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)'
                        : 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: stats.fee_status.includes('Paid')
                        ? '0 10px 30px rgba(56, 178, 172, 0.4)'
                        : '0 10px 30px rgba(229, 62, 62, 0.4)',
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
                    }}>💰</div>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Fee Status
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '22px', fontWeight: '800' }}>
                        {stats.fee_status}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('overview')} style={tabStyle(activeTab === 'overview')}>
                    📊 Overview
                </button>
                <button onClick={() => setActiveTab('attendance')} style={tabStyle(activeTab === 'attendance')}>
                    📋 Attendance
                </button>
                <button onClick={() => setActiveTab('results')} style={tabStyle(activeTab === 'results')}>
                    🏆 Results
                </button>
                <button onClick={() => setActiveTab('fees')} style={tabStyle(activeTab === 'fees')}>
                    💰 Fees
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '32px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{
                        margin: '0 0 24px 0',
                        fontSize: '24px',
                        color: '#1a202c',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        📊 Attendance Overview
                    </h2>

                    {/* Progress Bar */}
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

                    {/* Breakdown Cards */}
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
                                {stats.attendance_present}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                            borderRadius: '16px',
                            border: '2px solid #fc8181',
                        }}>
                            <p style={{ margin: 0, color: '#742a2a', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
                                ❌ Absent
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#742a2a' }}>
                                {stats.attendance_total - stats.attendance_present}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)',
                            borderRadius: '16px',
                            border: '2px solid #90cdf4',
                        }}>
                            <p style={{ margin: 0, color: '#2a4365', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>
                                📅 Total Days
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#2a4365' }}>
                                {stats.attendance_total}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
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
                            📋 Attendance History ({attendance.length})
                        </h3>
                    </div>
                    {attendance.length === 0 ? (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📭</div>
                            <p style={{ color: '#718096', fontSize: '15px' }}>No attendance records yet</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f7fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((a) => {
                                    const isPresent = a.status.toLowerCase() === 'present';
                                    return (
                                        <tr key={a.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px 28px', color: '#1a202c', fontWeight: '500' }}>
                                                📅 {a.date}
                                            </td>
                                            <td style={{ padding: '16px 28px' }}>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    background: isPresent
                                                        ? 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)'
                                                        : 'linear-gradient(135deg, #fed7d7 0%, #fc8181 100%)',
                                                    color: isPresent ? '#22543d' : '#742a2a',
                                                }}>
                                                    {isPresent ? '✅' : '❌'} {a.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
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
                            🏆 My Results ({results.length})
                        </h3>
                    </div>
                    {results.length === 0 ? (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📭</div>
                            <p style={{ color: '#718096', fontSize: '15px' }}>No results yet</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f7fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Subject</th>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Marks</th>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Grade</th>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px 28px', color: '#718096' }}>
                                            📚 Subject #{r.subject_id}
                                        </td>
                                        <td style={{ padding: '16px 28px', color: '#1a202c', fontWeight: '700', fontSize: '16px' }}>
                                            {r.marks_obtained}
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
                                                {r.grade}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 28px', color: '#718096' }}>{r.remarks || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Fees Tab */}
            {activeTab === 'fees' && (
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
                            💰 Fee Payments ({fees.length})
                        </h3>
                    </div>
                    {fees.length === 0 ? (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📭</div>
                            <p style={{ color: '#718096', fontSize: '15px' }}>No fee payments yet</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f7fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Amount</th>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Mode</th>
                                    <th style={{ textAlign: 'left', padding: '16px 28px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fees.map((f) => (
                                    <tr key={f.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px 28px', color: '#1a202c', fontWeight: '700', fontSize: '16px' }}>
                                            💵 Rs. {f.amount}
                                        </td>
                                        <td style={{ padding: '16px 28px', color: '#718096' }}>{f.payment_mod}</td>
                                        <td style={{ padding: '16px 28px', color: '#718096' }}>📅 {f.payment_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;