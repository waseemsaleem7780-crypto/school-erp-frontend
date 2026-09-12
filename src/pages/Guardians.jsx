import { useState, useEffect } from 'react';
import api from '../api/axios';

const Guardians = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [guardians, setGuardians] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        user_id: '',
        student_id: '',
        full_name: '',
        relation: 'father',
        phone_number: '',
        email: '',
        address: '',
    });

    const fetchClasses = async () => {
        try { const res = await api.get('/classes/'); setClasses(res.data); } catch (err) { console.error(err); }
    };

    const fetchStudents = async (classId) => {
        if (!classId) { setStudents([]); return; }
        try { const res = await api.get(`/students/${classId}`); setStudents(res.data); } catch (err) { setStudents([]); }
    };

    const fetchGuardians = async (studentId) => {
        if (!studentId) { setGuardians([]); return; }
        try { const res = await api.get(`/guardians/student/${studentId}`); setGuardians(res.data); } catch (err) { setGuardians([]); }
    };

    useEffect(() => { fetchClasses(); }, []);
    useEffect(() => { if (selectedClass) fetchStudents(selectedClass); }, [selectedClass]);
    useEffect(() => { if (selectedStudent) fetchGuardians(selectedStudent); }, [selectedStudent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/guardians/', {
                user_id: parseInt(form.user_id),
                student_id: parseInt(form.student_id),
                full_name: form.full_name,
                relation: form.relation,
                phone_number: form.phone_number,
                email: form.email,
                address: form.address,
            });
            setForm({ user_id: '', student_id: '', full_name: '', relation: 'father', phone_number: '', email: '', address: '' });
            setMessage({ type: 'success', text: 'Guardian added! ✅' });
            setShowForm(false);
            if (selectedStudent) fetchGuardians(selectedStudent);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to add guardian' });
        } finally { setLoading(false); }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Guardians</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage parent/guardian details</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
                    {showForm ? '✕ Cancel' : '+ Add Guardian'}
                </button>
            </div>

            {message.text && (
                <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7', color: message.type === 'success' ? '#22543d' : '#c53030', border: `1px solid ${message.type === 'success' ? '#9ae6b4' : '#fc8181'}`, fontSize: '14px' }}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add New Guardian</h3>
                    <div style={{ backgroundColor: '#ebf8ff', border: '1px solid #90cdf4', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#2c5282' }}>
                        💡 <strong>Pehle User banao:</strong> Swagger mein <code>POST /api/auth/register</code> se Parent user banao (role: "parent"), phir yahan uski ID daalo.
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>User ID</label>
                            <input type="number" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} placeholder="e.g., 4" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student ID</label>
                            <input type="number" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} placeholder="e.g., 1" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Full Name</label>
                            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Mr. Ahmed Ali" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Relation</label>
                            <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }} required>
                                <option value="father">👨 Father</option>
                                <option value="mother">👩 Mother</option>
                                <option value="guardian">🧑 Guardian</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Phone Number</label>
                            <input type="text" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="0300-1234567" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="father@email.com" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Address</label>
                            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House #10, Street 5, Lahore" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: loading ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Saving...' : '💾 Save Guardian'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Class</label>
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
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Guardians ({guardians.length})</h3>
                </div>
                {guardians.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍👩‍👧</div>
                        <p style={{ color: '#718096' }}>Select a student to view guardians</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Relation</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Phone</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guardians.map((g) => (
                                <tr key={g.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{g.full_name}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#ebf8ff', color: '#2c5282', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{g.relation}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{g.phone_number}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>{g.email}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>{g.address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Guardians;