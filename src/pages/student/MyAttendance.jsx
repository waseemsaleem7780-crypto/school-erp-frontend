import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            // Demo: student_id = 1 (baad mein token se lega)
            const res = await api.get('/attendance/student/1');
            setAttendance(res.data);
        } catch (err) {
            setAttendance([]);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        present: { bg: '#c6f6d5', color: '#22543d', emoji: '✅' },
        absent: { bg: '#fed7d7', color: '#c53030', emoji: '❌' },
        half_day: { bg: '#feebc8', color: '#7b341e', emoji: '⏰' },
        leave: { bg: '#bee3f8', color: '#2c5282', emoji: '🏖️' },
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My Attendance
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Your attendance history
                </p>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Records ({attendance.length})</h3>
                </div>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
                ) : attendance.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                        <p style={{ color: '#718096' }}>No attendance records yet</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((a) => {
                                const c = statusColors[a.status.toLowerCase()] || statusColors.present;
                                return (
                                    <tr key={a.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{a.date}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                backgroundColor: c.bg,
                                                color: c.color,
                                                fontSize: '13px',
                                                fontWeight: '600',
                                            }}>
                                                {c.emoji} {a.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MyAttendance;