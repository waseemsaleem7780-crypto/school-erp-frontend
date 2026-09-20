import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeacherTimetable = () => {
    const [classes, setClasses] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) fetchTimetable(selectedClass);
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
            if (res.data.length > 0) setSelectedClass(res.data[0].id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimetable = async (classId) => {
        try {
            const res = await api.get(`/timetable/class/${classId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setTimetable(data);
        } catch (err) {
            setTimetable([]);
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

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                    🔍 Select Class
                </label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                >
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
            ) : timetable.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕐</div>
                    <p style={{ color: '#718096' }}>No timetable entries yet</p>
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

export default TeacherTimetable;