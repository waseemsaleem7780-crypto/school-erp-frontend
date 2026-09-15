import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MarksEntry = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [form, setForm] = useState({
        class_id: '',
        exam_id: '',
        student_id: '',
        subject_id: '',
        marks_obtained: '',
        grade: '',
        remarks: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (form.class_id) {
            fetchSubjects(form.class_id);
            fetchStudents(form.class_id);
            fetchExams(form.class_id);
        }
    }, [form.class_id]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubjects = async (classId) => {
        try {
            const res = await api.get(`/subjects/${classId}`);
            setSubjects(res.data);
        } catch (err) {
            setSubjects([]);
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

    const fetchExams = async (classId) => {
        try {
            const res = await api.get(`/exam/class/${classId}`);
            setExams(res.data);
        } catch (err) {
            setExams([]);
        }
    };

    const fetchResults = async (studentId) => {
        if (!studentId) return;
        try {
            const res = await api.get(`/results/student/${studentId}`);
            setResults(res.data);
        } catch (err) {
            setResults([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/results/', {
                exam_id: parseInt(form.exam_id),
                student_id: parseInt(form.student_id),
                subject_id: parseInt(form.subject_id),
                marks_obtained: parseFloat(form.marks_obtained),
                grade: form.grade,
                remarks: form.remarks,
            });
            setMessage({ type: 'success', text: 'Marks saved! ✅' });
            setForm({ ...form, marks_obtained: '', grade: '', remarks: '' });
            setShowForm(false);
            if (form.student_id) fetchResults(form.student_id);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save marks' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Marks Entry</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Enter exam marks for students</p>
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
                    {showForm ? '✕ Cancel' : '+ Enter Marks'}
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
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Enter Student Marks</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                            <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value, exam_id: '', student_id: '', subject_id: '' })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }} required>
                                <option value="">Select Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Exam</label>
                            <select value={form.exam_id} onChange={(e) => setForm({ ...form, exam_id: e.target.value })} disabled={!form.class_id} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }} required>
                                <option value="">Select Exam</option>
                                {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} disabled={!form.class_id} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }} required>
                                <option value="">Select Student</option>
                                {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Subject</label>
                            <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} disabled={!form.class_id} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }} required>
                                <option value="">Select Subject</option>
                                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Marks Obtained</label>
                            <input type="number" step="0.5" value={form.marks_obtained} onChange={(e) => setForm({ ...form, marks_obtained: e.target.value })} placeholder="85" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Grade</label>
                            <input type="text" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="A+" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Remarks</label>
                            <input type="text" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Excellent work" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: loading ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Saving...' : '💾 Save Marks'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Recent Results ({results.length})</h3>
                </div>
                {results.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                        <p style={{ color: '#718096' }}>No marks entered yet</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Exam ID</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Subject</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Marks</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>#{r.exam_id}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>#{r.subject_id}</td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{r.marks_obtained}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#c6f6d5', color: '#22543d', fontSize: '13px', fontWeight: '600' }}>{r.grade}</span>
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

export default MarksEntry;