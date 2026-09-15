import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeacherNoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) fetchNotices(selectedClass);
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

    const fetchNotices = async (classId) => {
        try {
            const res = await api.get(`/notice-board/class/${classId}`);
            setNotices(res.data);
        } catch (err) {
            setNotices([]);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    Notice Board
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    School announcements
                </p>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                    🔍 Filter by Class
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

            <div style={{ display: 'grid', gap: '16px' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
                ) : notices.length === 0 ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📢</div>
                        <p style={{ color: '#718096' }}>No notices yet</p>
                    </div>
                ) : (
                    notices.map((n) => (
                        <div key={n.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderLeft: '5px solid #667eea' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, color: '#1a202c' }}>{n.title}</h3>
                                <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: n.is_active ? '#c6f6d5' : '#fed7d7', color: n.is_active ? '#22543d' : '#c53030', fontSize: '12px', fontWeight: '600' }}>
                                    {n.is_active ? '✓ Active' : '✕ Inactive'}
                                </span>
                            </div>
                            <p style={{ color: '#4a5568', margin: '12px 0', lineHeight: '1.6' }}>{n.context}</p>
                            <p style={{ color: '#a0aec0', margin: 0, fontSize: '12px' }}>
                                Posted: {n.posted_at ? new Date(n.posted_at).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeacherNoticeBoard;