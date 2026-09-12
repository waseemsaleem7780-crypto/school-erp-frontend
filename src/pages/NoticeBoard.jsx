import { useState, useEffect } from 'react';
import api from '../api/axios';

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: '',
        context: '',
        class_id: '',
        section_id: '',
        posted_by: '1',
        target_audience_id: '1',
        is_active: true,
    });

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
            if (res.data.length > 0) setSelectedClass(res.data[0].id);
        } catch (err) { console.error(err); }
    };

    const fetchSections = async (classId) => {
        if (!classId) { setSections([]); return; }
        try { const res = await api.get(`/sections/${classId}`); setSections(res.data); } catch (err) { setSections([]); }
    };

    const fetchNotices = async (classId) => {
        if (!classId) { setNotices([]); return; }
        try { const res = await api.get(`/notice-board/class/${classId}`); setNotices(res.data); } catch (err) { setNotices([]); }
    };

    useEffect(() => { fetchClasses(); }, []);
    useEffect(() => { if (form.class_id) fetchSections(form.class_id); }, [form.class_id]);
    useEffect(() => { if (selectedClass) fetchNotices(selectedClass); }, [selectedClass]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/notice-board/', {
                title: form.title,
                context: form.context,
                class_id: parseInt(form.class_id),
                section_id: parseInt(form.section_id),
                posted_by: parseInt(form.posted_by),
                target_audience_id: parseInt(form.target_audience_id),
                is_active: form.is_active,
            });
            setForm({ ...form, title: '', context: '' });
            setMessage({ type: 'success', text: 'Notice posted! ✅' });
            setShowForm(false);
            if (selectedClass) fetchNotices(selectedClass);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to post notice' });
        } finally { setLoading(false); }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Notice Board</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Post and manage announcements</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
                    {showForm ? '✕ Cancel' : '+ Post Notice'}
                </button>
            </div>

            {message.text && (
                <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7', color: message.type === 'success' ? '#22543d' : '#c53030', border: `1px solid ${message.type === 'success' ? '#9ae6b4' : '#fc8181'}`, fontSize: '14px' }}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Post New Notice</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Title</label>
                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="School Holiday" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Content</label>
                            <textarea value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} placeholder="School will remain closed on..." rows="3" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Arial' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                            <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '' })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }} required>
                                <option value="">Select Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Section</label>
                            <select value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value })} disabled={!form.class_id} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }} required>
                                <option value="">Select Section</option>
                                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: loading ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Posting...' : '📢 Post Notice'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>🔍 View Notices by Class</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}>
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {notices.length === 0 ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📢</div>
                        <p style={{ color: '#718096' }}>No notices posted yet</p>
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

export default NoticeBoard;