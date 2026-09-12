import { useState, useEffect } from 'react';
import api from '../api/axios';

const AcademicYears = () => {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        year: '',
        start_date: '',
        end_date: '',
    });

    const fetchYears = async () => {
        try {
            const res = await api.get('/academic-years/');
            setYears(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchYears(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/academic-years/', {
                year: form.year,
                start_date: form.start_date,
                end_date: form.end_date,
            });
            setForm({ year: '', start_date: '', end_date: '' });
            setMessage({ type: 'success', text: 'Academic year added! ✅' });
            setShowForm(false);
            fetchYears();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to add academic year' });
        } finally { setLoading(false); }
    };

    const isCurrent = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        return end >= today;
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Academic Years</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage school sessions</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ Add Session'}
                </button>
            </div>

            {message.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                    color: message.type === 'success' ? '#22543d' : '#c53030',
                    border: `1px solid ${message.type === 'success' ? '#9ae6b4' : '#fc8181'}`,
                    fontSize: '14px',
                }}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid #e2e8f0',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add New Academic Year</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Session Name</label>
                            <input
                                type="text"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                placeholder="e.g., 2026-27"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Start Date</label>
                            <input
                                type="date"
                                value={form.start_date}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>End Date</label>
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: loading ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Saving...' : '💾 Save Session'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Years List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {fetching ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
                ) : years.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                        <p style={{ color: '#718096' }}>No academic years yet. Add your first session!</p>
                    </div>
                ) : (
                    years.map((y) => {
                        const active = isCurrent(y.end_date);
                        return (
                            <div key={y.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                borderTop: `4px solid ${active ? '#48bb78' : '#a0aec0'}`,
                                position: 'relative',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '32px' }}>📅</span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        backgroundColor: active ? '#c6f6d5' : '#e2e8f0',
                                        color: active ? '#22543d' : '#4a5568',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                    }}>
                                        {active ? '✓ Active' : 'Expired'}
                                    </span>
                                </div>
                                <h3 style={{ margin: '0 0 16px 0', color: '#1a202c', fontSize: '22px' }}>{y.year}</h3>
                                <div style={{ fontSize: '13px', color: '#718096' }}>
                                    <p style={{ margin: '4px 0' }}>📆 Start: <strong>{y.start_date}</strong></p>
                                    <p style={{ margin: '4px 0' }}>🏁 End: <strong>{y.end_date}</strong></p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AcademicYears;