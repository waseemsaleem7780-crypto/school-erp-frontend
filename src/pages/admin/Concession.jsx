import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Concession = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [years, setYears] = useState([]);
    const [concessions, setConcessions] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        user_id: '1',
        student_id: '',
        academic_year_id: '',
        concession_type: 'partial',
        concession_value: '',
        reason: '',
    });

    const fetchData = async () => {
        try {
            const [c, y] = await Promise.all([api.get('/classes/'), api.get('/academic-years/')]);
            setClasses(c.data);
            setYears(y.data);
        } catch (err) { console.error(err); }
    };

    const fetchStudents = async (classId) => {
        if (!classId) { setStudents([]); return; }
        try { const res = await api.get(`/students/${classId}`); setStudents(res.data); } catch (err) { setStudents([]); }
    };

    const fetchConcessions = async (studentId) => {
        if (!studentId) { setConcessions([]); return; }
        try { const res = await api.get(`/concession/student/${studentId}`); setConcessions(res.data); } catch (err) { setConcessions([]); }
    };

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (selectedClass) fetchStudents(selectedClass); }, [selectedClass]);
    useEffect(() => { if (selectedStudent) fetchConcessions(selectedStudent); }, [selectedStudent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/concession/', {
                student_id: parseInt(form.student_id),
                user_id: parseInt(form.user_id),
                academic_year_id: parseInt(form.academic_year_id),
                concession_type: form.concession_type,
                concession_value: parseFloat(form.concession_value),
                reason: form.reason,
            });
            setForm({ ...form, concession_value: '', reason: '' });
            setMessage({ type: 'success', text: 'Concession added! ✅' });
            setShowForm(false);
            if (selectedStudent) fetchConcessions(selectedStudent);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to add concession' });
        } finally { setLoading(false); }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Concession</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage fee discounts and scholarships</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
                    {showForm ? '✕ Cancel' : '+ Add Concession'}
                </button>
            </div>

            {message.text && (
                <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7', color: message.type === 'success' ? '#22543d' : '#c53030', border: `1px solid ${message.type === 'success' ? '#9ae6b4' : '#fc8181'}`, fontSize: '14px' }}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add Fee Concession</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                            <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setForm({ ...form, student_id: '' }); }} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                                <option value="">Select Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} disabled={!selectedClass} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: selectedClass ? 'white' : '#f7fafc' }} required>
                                <option value="">Select Student</option>
                                {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Academic Year</label>
                            <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }} required>
                                <option value="">Select Session</option>
                                {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Type</label>
                            <select value={form.concession_type} onChange={(e) => setForm({ ...form, concession_type: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}>
                                <option value="partial">📊 Partial</option>
                                <option value="full">🎁 Full</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Value (Rs / %)</label>
                            <input type="number" value={form.concession_value} onChange={(e) => setForm({ ...form, concession_value: e.target.value })} placeholder="20" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Reason</label>
                            <input type="text" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Financial need - Single parent" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: loading ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Saving...' : '💾 Save Concession'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Filter by Class</label>
                    <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }} style={{ padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}>
                        <option value="">Select Class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                    <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={!selectedClass} style={{ padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}>
                        <option value="">Select Student</option>
                        {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Concessions ({concessions.length})</h3>
                </div>
                {concessions.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎁</div>
                        <p style={{ color: '#718096' }}>Select a student to view concessions</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Type</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Value</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Reason</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {concessions.map((c) => (
                                <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: c.concession_type === 'full' ? '#c6f6d5' : '#feebc8', color: c.concession_type === 'full' ? '#22543d' : '#7b341e', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
                                            {c.concession_type === 'full' ? '🎁' : '📊'} {c.concession_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600' }}>{c.concession_value}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{c.reason}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>
                                        {c.granted_at ? new Date(c.granted_at).toLocaleDateString() : 'N/A'}
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

export default Concession;