import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyTimetable = () => {
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            // Demo: class_id = 1
            const res = await api.get('/timetable/class/1');
            setTimetable(res.data);
        } catch (err) {
            setTimetable([]);
        } finally {
            setLoading(false);
        }
    };

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

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
            ) : timetable.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕐</div>
                    <p style={{ color: '#718096' }}>No timetable yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {days.map((day) => {
                        const dayEntries = timetable.filter((t) => t.day_of_week === day);
                        if (dayEntries.length === 0) return null;
                        return (
                            <div key={day} style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
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
                                                    Subject #{entry.subject_id}
                                                </p>
                                                <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '13px' }}>
                                                    Teacher #{entry.teacher_id}
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