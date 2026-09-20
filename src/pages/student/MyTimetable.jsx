import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyTimetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            // Step 1: Student ki info lo
            const meRes = await api.get('/auth/me');
            const classId = meRes.data.class_id;

            if (!classId) {
                setError('Aap ki class assign nahi hui');
                setLoading(false);
                return;
            }

            // Step 2: Us class ki timetable lo
            const res = await api.get(`/timetable/class/${classId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setTimetable(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load timetable');
            setTimetable([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                Loading timetable...
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
                    My Timetable
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Your class schedule
                </p>
            </div>

            {timetable.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕐</div>
                    <p style={{ color: '#718096' }}>No timetable yet</p>
                    <p style={{ color: '#a0aec0', fontSize: '13px', marginTop: '8px' }}>
                        Admin ne abhi tak aap ki class ka timetable add nahi kiya
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {days.map((day) => {
                        const dayEntries = timetable.filter((t) => t.day_of_week === day);
                        if (dayEntries.length === 0) return null;
                        return (
                            <div key={day} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                overflow: 'hidden',
                            }}>
                                <div style={{ padding: '16px 24px', backgroundColor: '#667eea', color: 'white' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px' }}>📅 {day}</h3>
                                </div>
                                <div style={{ padding: '16px', display: 'grid', gap: '8px' }}>
                                    {dayEntries.map((entry) => (
                                        <div key={entry.id} style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            backgroundColor: '#f7fafc',
                                            borderLeft: '4px solid #764ba2',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                        }}>
                                            <div>
                                                <p style={{ margin: 0, color: '#1a202c', fontWeight: '600' }}>
                                                    {entry.subject_name || `Subject #${entry.subject_id}`}
                                                </p>
                                                <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '13px' }}>
                                                    👨‍🏫 {entry.teacher_name || `Teacher #${entry.teacher_id}`}
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                backgroundColor: '#ebf8ff',
                                                color: '#2c5282',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                            }}>
                                                🕐 {entry.start_time} - {entry.end_time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyTimetable;