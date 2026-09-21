import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const MarkAttendance = () => {
    const t = useTerms();   // ✅ Mode-based labels
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [form, setForm] = useState({
        class_id: '',
        section_id: '',
        student_id: '',
        teacher_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (form.class_id) {
            fetchSections(form.class_id);
            fetchStudents(form.class_id);
        }
    }, [form.class_id]);

    const fetchData = async () => {
        try {
            const [c, tch] = await Promise.all([
                api.get('/classes/'),
                api.get('/teachers/'),
            ]);
            setClasses(c.data);
            setTeachers(tch.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSections = async (classId) => {
        try {
            const res = await api.get(`/sections/${classId}`);
            setSections(res.data);
        } catch (err) {
            setSections([]);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const res = await api.get(`/students/${classId}`);
            setStudents(res.data);
        } catch (err) {
            setStudents([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (form.student_id === 'all') {
                if (students.length === 0) {
                    setMessage({ type: 'error', text: `Is ${t.class.toLowerCase()} mein koi ${t.student.toLowerCase()} nahi` });
                    setLoading(false);
                    return;
                }

                const records = students.map((s) => ({
                    student_id: s.id,
                    date: form.date,
                    status: form.status,
                    marked_by: parseInt(form.teacher_id),
                }));

                await api.post('/attendance/bulk', { records });
                setMessage({
                    type: 'success',
                    text: `✅ ${students.length} ${t.students.toLowerCase()} ki ${t.attendance.toLowerCase()} mark ho gayi!`,
                });
            } else {
                await api.post('/attendance/', {
                    student_id: parseInt(form.student_id),
                    date: form.date,
                    status: form.status,
                    marked_by: parseInt(form.teacher_id),
                });
                setMessage({ type: 'success', text: `${t.attendance} marked! ✅` });
            }

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || `Failed to mark ${t.attendance.toLowerCase()}`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    Mark {t.attendance}
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Mark daily {t.attendance.toLowerCase()} for {t.students.toLowerCase()}
                </p>
            </div>

            {message.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                    color: message.type === 'success' ? '#22543d' : '#c53030',
                }}>
                    {message.text}
                </div>
            )}

            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.class}</label>
                            <select
                                value={form.class_id}
                                onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '', student_id: '' })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select {t.class}</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.section}</label>
                            <select
                                value={form.section_id}
                                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                            >
                                <option value="">Select {t.section}</option>
                                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.student}</label>
                            <select
                                value={form.student_id}
                                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                required
                            >
                                <option value="">Select {t.student}</option>
                                {students.length > 0 && (
                                    <option value="all" style={{ fontWeight: 'bold', color: '#667eea' }}>
                                        ✅ All {t.students} ({students.length})
                                    </option>
                                )}
                                {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.teacher}</label>
                            <select
                                value={form.teacher_id}
                                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select {t.teacher}</option>
                                {teachers.map((tch) => <option key={tch.id} value={tch.id}>{tch.qualification} (ID: {tch.id})</option>)}
                            </select>
                        </div>

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

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="Present">✅ Present</option>
                                <option value="Absent">❌ Absent</option>
                                <option value="Half-Day">⏰ Half Day</option>
                                <option value="Leave">🏖️ Leave</option>
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
                        {loading
                            ? 'Marking...'
                            : form.student_id === 'all'
                                ? `✓ Mark All (${students.length})`
                                : `✓ Mark ${t.attendance}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MarkAttendance;