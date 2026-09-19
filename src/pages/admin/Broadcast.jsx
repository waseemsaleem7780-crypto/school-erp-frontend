import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Broadcast = () => {
    const [form, setForm] = useState({ title: '', message: '', target_type: 'all', target_id: null });
    const [classes, setClasses] = useState([]);
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState([]);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchHistory();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/broadcast/history');
            setHistory(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!window.confirm(`Send to ${form.target_type === 'all' ? 'ALL parents' : 'selected group'}?`)) return;
        setSending(true);
        try {
            const res = await api.post('/broadcast/send', form);
            setResult(res.data);
            setForm({ title: '', message: '', target_type: 'all', target_id: null });
            setTimeout(fetchHistory, 5000);
        } catch (error) {
            alert('❌ Failed: ' + (error.response?.data?.detail || error.message));
        } finally { setSending(false); }
    };

    const inputStyle = { width: '100%', padding: '12px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial' }}>
            <h1>📢 Broadcast Message</h1>
            <p style={{ color: '#718096' }}>Send custom message to hundreds of parents in one click</p>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '700px' }}>
                <form onSubmit={handleSend}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Title</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., PTM Notice" style={inputStyle} required />

                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Message</label>
                    <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Assalam-o-Alaikum! ..." rows={6} style={inputStyle} required />

                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Target</label>
                    <select value={form.target_type} onChange={(e) => setForm({ ...form, target_type: e.target.value, target_id: null })} style={inputStyle}>
                        <option value="all">All Parents</option>
                        <option value="class">Specific Class</option>
                    </select>

                    {form.target_type === 'class' && (
                        <select value={form.target_id || ''} onChange={(e) => setForm({ ...form, target_id: parseInt(e.target.value) })} style={inputStyle} required>
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}

                    <button type="submit" disabled={sending} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: sending ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: sending ? 'not-allowed' : 'pointer', width: '100%' }}>
                        {sending ? 'Sending...' : '🚀 Send to All'}
                    </button>
                </form>

                {result && (
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#c6f6d5', borderRadius: '10px' }}>
                        ✅ Broadcast started! ID: {result.broadcast_id}
                    </div>
                )}
            </div>

            {history.length > 0 && (
                <div style={{ marginTop: '40px', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <h3>📜 Broadcast History</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Sent</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Failed</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(b => (
                                <tr key={b.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px' }}>{b.title}</td>
                                    <td style={{ padding: '12px' }}>{b.sent_count}/{b.total_recipients}</td>
                                    <td style={{ padding: '12px' }}>{b.failed_count}</td>
                                    <td style={{ padding: '12px' }}>{b.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Broadcast;