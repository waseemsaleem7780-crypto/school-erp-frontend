import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Homework = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        class_id: '',
        subject_id: '',
        student_id: 'all',
        teacher_id: '',
        title: '',
        description: '',
        deadline: '',
    });

    const fetchData = async () => {
        try {
            const [c, t] = await Promise.all([
                api.get('/classes/'),
                api.get('/teachers/')
            ]);
            setClasses(c.data);
            setTeachers(t.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Sahi endpoint — /subjects/class/{class_id}
    const fetchSubjects = async (classId) => {
        if (!classId) { setSubjects([]); return; }
        try {
            let res;
            try {
                res = await api.get(`/subjects/class/${classId}`);
            } catch (e) {
                res = await api.get(`/subjects/${classId}`);
            }
            setSubjects(res.data);
        } catch (err) {
            setSubjects([]);
        }
    };

    // ✅ Sahi endpoint — /students/class/{class_id}
    const fetchStudents = async (classId) => {
        if (!classId) { setStudents([]); return; }
        try {
            let res;
            try {
                res = await api.get(`/students/class/${classId}`);
            } catch (e) {
                res = await api.get(`/students/${classId}`);
            }
            setStudents(res.data);
        } catch (err) {
            setStudents([]);
        }
    };

    const fetchHomework = async (studentId) => {
        if (!studentId) { setHomework([]); return; }
        try {
            const res = await api.get(`/homework/student/${studentId}`);
            setHomework(res.data);
        } catch (err) {
            setHomework([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (form.class_id) {
            fetchSubjects(form.class_id);
            fetchStudents(form.class_id);
        }
    }, [form.class_id]);

    useEffect(() => {
        if (form.student_id && form.student_id !== 'all') {
            fetchHomework(form.student_id);
        }
    }, [form.student_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // ✅ "All Students" select — saare students ko homework
        const targetStudentIds = form.student_id === 'all'
            ? students.map(s => s.id)
            : [parseInt(form.student_id)];

        try {
            for (const studentId of targetStudentIds) {
                await api.post('/homework/', {
                    student_id: studentId,
                    subject_id: parseInt(form.subject_id),
                    teacher_id: parseInt(form.teacher_id),
                    title: form.title,
                    description: form.description,
                    deadline: form.deadline,
                });
            }

            setForm({ ...form, title: '', description: '', deadline: '' });
            setMessage({
                type: 'success',
                text: form.student_id === 'all'
                    ? `Homework assigned to ${targetStudentIds.length} students! ✅`
                    : 'Homework assigned! ✅'
            });
            setShowForm(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to add homework'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Homework</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Assign homework to students</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none', borderRadius: '10px', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ Assign Homework'}
                </button>
            </div>

            {message.text && (
                <div style={{
                    padding: '14px 20px', borderRadius: '10px', marginBottom: '20px',
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
                    backgroundColor: 'white', borderRadius: '16px', padding: '24px',
                    marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid #e2e8f0',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Assign New Homework</h3>
                    <form onSubmit={handleSubmit} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                            <select
                                value={form.class_id}
                                onChange={(e) => setForm({ ...form, class_id: e.target.value, subject_id: '', student_id: 'all' })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Subject</label>
                            <select
                                value={form.subject_id}
                                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {form.class_id && subjects.length === 0 && (
                                <p style={{ fontSize: '12px', color: '#e53e3e', margin: '4px 0 0 0' }}>No subjects found</p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                            <select
                                value={form.student_id}
                                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                required
                            >
                                {/* ✅ All Students option */}
                                <option value="all">📚 All Students (Poori Class)</option>
                                {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Teacher</label>
                            <select
                                value={form.teacher_id}
                                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.qualification} (ID: {t.id})</option>)}
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g., Algebra Exercise 5.1"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the assignment..."
                                rows="3"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Arial' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Deadline</label>
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white',
                                    background: loading ? '#a0aec0' : '#48bb78',
                                    border: 'none', borderRadius: '10px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Saving...' : '💾 Assign Homework'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Homework List ({homework.length})</h3>
                </div>
                {homework.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                        <p style={{ color: '#718096' }}>Select a student to view homework</p>
                    </div>
                ) : (
                    <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                        {homework.map((h) => (
                            <div key={h.id} style={{
                                border: '1px solid #e2e8f0', borderRadius: '12px',
                                padding: '20px', backgroundColor: '#f7fafc',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0, color: '#1a202c' }}>{h.title}</h4>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px',
                                        backgroundColor: '#feebc8', color: '#7b341e',
                                        fontSize: '12px', fontWeight: '600',
                                    }}>
                                        📅 {h.deadline}
                                    </span>
                                </div>
                                <p style={{ color: '#718096', margin: '8px 0', fontSize: '14px' }}>{h.description}</p>
                                <p style={{ color: '#a0aec0', margin: 0, fontSize: '12px' }}>
                                    Subject ID: {h.subject_id} | Teacher ID: {h.teacher_id}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Homework;