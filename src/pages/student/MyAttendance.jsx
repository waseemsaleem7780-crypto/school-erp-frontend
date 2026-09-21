import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const MyAttendance = () => {
    const t = useTerms();   // ✅ Mode-based labels
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const meRes = await api.get('/auth/me');
            const studentId = meRes.data.student_id;

            if (!studentId) {
                setError('Student ID not found');
                setLoading(false);
                return;
            }

            const historyRes = await api.get(`/attendance/history/${studentId}`);
            const data = Array.isArray(historyRes.data) ? historyRes.data : [];
            setAttendance(data);

            const total = data.length;
            const present = data.filter((a) => a.status === 'present').length;
            const absent = data.filter((a) => a.status === 'absent').length;
            const late = data.filter((a) => a.status === 'late').length;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            setStats({ total, present, absent, late, percentage });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || `Failed to load ${t.attendance.toLowerCase()}`);
            setAttendance([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
                Loading {t.attendance.toLowerCase()}...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px' }}>
                <div style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: '#fed7d7',
                    color: '#c53030',
                }}>
                    ⚠️ {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My {t.attendance}
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Your {t.attendance.toLowerCase()} history and statistics
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '16px',
                    marginBottom: '30px',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '16px',
                        padding: '24px',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    }}>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '13px', fontWeight: '600' }}>
                            {t.attendance.toUpperCase()} %
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: '800' }}>
                            {stats.percentage}%
                        </p>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <p style={{ margin: 0, color: '#718096', fontSize: '13px', fontWeight: '600' }}>
                            TOTAL DAYS
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#1a202c' }}>
                            {stats.total}
                        </p>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <p style={{ margin: 0, color: '#48bb78', fontSize: '13px', fontWeight: '600' }}>
                            PRESENT
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#48bb78' }}>
                            {stats.present}
                        </p>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <p style={{ margin: 0, color: '#f56565', fontSize: '13px', fontWeight: '600' }}>
                            ABSENT
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#f56565' }}>
                            {stats.absent}
                        </p>
                    </div>

                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <p style={{ margin: 0, color: '#ed8936', fontSize: '13px', fontWeight: '600' }}>
                            LATE
                        </p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '800', color: '#ed8936' }}>
                            {stats.late}
                        </p>
                    </div>
                </div>
            )}

            {/* Attendance Table */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>
                        {t.attendance} History ({attendance.length})
                    </h3>
                </div>

                {attendance.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                        <p style={{ color: '#718096' }}>No {t.attendance.toLowerCase()} records yet</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '12px', fontWeight: '700' }}>#</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '12px', fontWeight: '700' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '12px', fontWeight: '700' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((a, i) => (
                                <tr key={a.id || i} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{i + 1}</td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600' }}>
                                        {a.date || '-'}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            background: a.status === 'present' ? '#c6f6d5' : a.status === 'late' ? '#feebc8' : '#fed7d7',
                                            color: a.status === 'present' ? '#22543d' : a.status === 'late' ? '#7b341e' : '#742a2a',
                                        }}>
                                            {a.status === 'present' ? '✅ Present' : a.status === 'late' ? '⏰ Late' : '❌ Absent'}
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

export default MyAttendance;