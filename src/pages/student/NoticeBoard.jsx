import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentNoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            // Login wale student ki class_id lo
            const meRes = await api.get('/auth/me');
            const classId = meRes.data.class_id;

            if (!classId) {
                setError('Class not assigned');
                setLoading(false);
                return;
            }

            // Us class ki notices lo
            const res = await api.get(`/notice-board/class/${classId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setNotices(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load notices');
            setNotices([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>;
    }

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

            {error && (
                <div style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: '#fed7d7',
                    color: '#c53030',
                    marginBottom: '20px',
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: 'grid', gap: '16px' }}>
                {notices.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '60px 20px',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📢</div>
                        <p style={{ color: '#718096' }}>No notices yet</p>
                        <p style={{ color: '#a0aec0', fontSize: '13px', marginTop: '8px' }}>
                            Aap ki class ke liye koi notice post nahi hua
                        </p>
                    </div>
                ) : (
                    notices.map((n) => (
                        <div key={n.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderLeft: '5px solid #667eea',
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', color: '#1a202c' }}>{n.title}</h3>
                            <p style={{ color: '#4a5568', margin: '0 0 12px 0', lineHeight: '1.6' }}>{n.content || n.context}</p>
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

export default StudentNoticeBoard;