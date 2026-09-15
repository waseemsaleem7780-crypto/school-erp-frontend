import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Attendance = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [history, setHistory] = useState([]);
    const [view, setView] = useState('mark'); // 'mark' or 'history'

    const [form, setForm] = useState({
        class_id: '',
        section_id: '',
        student_id: '',
        teacher_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers/');
            setTeachers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchSections = async (classId) => {
        if (!classId) { setSections([]); return; }
        try {
            const res = await api.get(`/sections/${classId}`);
            setSections(res.data);
        } catch (err) { setSections([]); }
    };

    const fetchStudents = async (classId) => {
        if (!classId) { setStudents([]); return; }
        try {
            const res = await api.get(`/students/${classId}`);
            setStudents(res.data);
        } catch (err) { setStudents([]); }
    };

    const fetchHistory = async (studentId) => {
        if (!studentId) { setHistory([]); return; }
        try {
            const res = await api.get(`/attendance/student/${studentId}`);
            setHistory(res.data);
        } catch (err) { setHistory([]); }
    };

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (form.class_id) {
            fetchSections(form.class_id);
            fetchStudents(form.class_id);
        }
    }, [form.class_id]);

    useEffect(() => {
        if (form.student_id) fetchHistory(form.student_id);
    }, [form.student_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/attendance/', {
                student_id: parseInt(form.student_id),
                date: form.date,
                status: form.status,
                marked_by: parseInt(form.teacher_id),
            });
            setMessage({ type: 'success', text: 'Attendance marked successfully! ✅' });
            if (form.student_id) fetchHistory(form.student_id);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to mark attendance',
            });
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        present: { bg: '#c6f6d5', color: '#22543d', emoji: '✅' },
        absent: { bg: '#fed7d7', color: '#c53030', emoji: '❌' },
        half_day: { bg: '#feebc8', color: '#7b341e', emoji: '⏰' },
        leave: { bg: '#bee3f8', color: '#2c5282', emoji: '🏖️' },
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Attendance</h1>
                <p style={{ color: '#718096', margin: 0 }}>Mark and track daily attendance</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 'fit-content' }}>
                <button
                    onClick={() => setView('mark')}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: view === 'mark' ? '#667eea' : 'transparent',
                        color: view === 'mark' ? 'white' : '#4a5568',
                    }}
                >
                    ✏️ Mark Attendance
                </button>
                <button
                    onClick={() => setView('history')}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: view === 'history' ? '#667eea' : 'transparent',
                        color: view === 'history' ? 'white' : '#4a5568',
                    }}
                >
                    📊 View History
                </button>
            </div>

            {/* Message */}
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

            {view === 'mark' && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c', marginBottom: '24px' }}>Mark Today's Attendance</h3>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                            {/* Class */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                                <select
                                    value={form.class_id}
                                    onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '', student_id: '' })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Section</label>
                                <select
                                    value={form.section_id}
                                    onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                                    disabled={!form.class_id}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Student */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                                <select
                                    value={form.student_id}
                                    onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                                    disabled={!form.class_id}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>Roll {s.roll_number} (ID: {s.id})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Teacher */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Marked By (Teacher)</label>
                                <select
                                    value={form.teacher_id}
                                    onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                    required
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>{t.qualification} (ID: {t.id})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Date</label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                    required
                                >
                                    <option value="present">✅ Present</option>
                                    <option value="absent">❌ Absent</option>
                                    <option value="half_day">⏰ Half Day</option>
                                    <option value="leave">🏖️ Leave</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '14px 32px',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'white',
                                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            }}
                        >
                            {loading ? 'Marking...' : '✓ Mark Attendance'}
                        </button>
                    </form>

                    {/* Quick History Preview */}
                    {form.student_id && history.length > 0 && (
                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                            <h4 style={{ color: '#1a202c', marginBottom: '16px' }}>Recent Attendance for this Student</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {history.slice(0, 10).map((h) => {
                                    const c = statusColors[h.status.toLowerCase()] || statusColors.present;
                                    return (
                                        <div key={h.id} style={{
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            backgroundColor: c.bg,
                                            color: c.color,
                                            fontSize: '13px',
                                            fontWeight: '600',
                                        }}>
                                            {c.emoji} {h.date}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {view === 'history' && (
                <div>
                    {/* Filter */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                            🔍 Select Class to View Students
                        </label>
                        <select
                            value={form.class_id}
                            onChange={(e) => setForm({ ...form, class_id: e.target.value, student_id: '' })}
                            style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        {form.class_id && (
                            <div style={{ marginTop: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                                    Select Student
                                </label>
                                <select
                                    value={form.student_id}
                                    onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                                    style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                                >
                                    <option value="">-- Select Student --</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>Roll {s.roll_number}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* History Table */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, color: '#1a202c' }}>Attendance History ({history.length})</h3>
                        </div>

                        {history.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                                <p style={{ color: '#718096' }}>Select a student to view attendance history</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f7fafc' }}>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Marked By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((h) => {
                                        const c = statusColors[h.status.toLowerCase()] || statusColors.present;
                                        return (
                                            <tr key={h.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{h.date}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        backgroundColor: c.bg,
                                                        color: c.color,
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                    }}>
                                                        {c.emoji} {h.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#718096' }}>Teacher #{h.marked_by}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;