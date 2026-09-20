import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Results = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        class_id: '',
        exam_id: '',
        student_id: 'all',
        subject_id: '',
        marks_obtained: '',
        grade: '',
        remarks: '',
    });

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
        } catch (err) { setStudents([]); }
    };

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
        } catch (err) { setSubjects([]); }
    };

    const fetchExams = async (classId) => {
        if (!classId) { setExams([]); return; }
        try {
            const res = await api.get(`/exam/class/${classId}`);
            setExams(res.data);
        } catch (err) { setExams([]); }
    };

    const fetchResults = async (studentId) => {
        if (!studentId) { setResults([]); return; }
        try {
            const res = await api.get(`/results/student/${studentId}`);
            setResults(res.data);
        } catch (err) { setResults([]); }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (form.class_id) {
            fetchStudents(form.class_id);
            fetchSubjects(form.class_id);
            fetchExams(form.class_id);
        }
    }, [form.class_id]);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass);
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedStudent) fetchResults(selectedStudent);
    }, [selectedStudent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // ✅ "All Students" select — saare students ko result
        const targetStudentIds = form.student_id === 'all'
            ? students.map(s => s.id)
            : [parseInt(form.student_id)];

        try {
            for (const studentId of targetStudentIds) {
                await api.post('/results/', {
                    exam_id: parseInt(form.exam_id),
                    student_id: studentId,
                    subject_id: parseInt(form.subject_id),
                    marks_obtained: parseFloat(form.marks_obtained),
                    grade: form.grade,
                    remarks: form.remarks,
                });
            }

            setForm({
                class_id: '', exam_id: '', student_id: 'all', subject_id: '',
                marks_obtained: '', grade: '', remarks: '',
            });
            setMessage({
                type: 'success',
                text: form.student_id === 'all'
                    ? `Result added for ${targetStudentIds.length} students! ✅ WhatsApp bhi gaya!`
                    : 'Result added! ✅ WhatsApp bhi gaya!'
            });
            setShowForm(false);
            if (selectedStudent) fetchResults(selectedStudent);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to add result' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Results</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Enter and view student marks</p>
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
                    {showForm ? '✕ Cancel' : '+ Add Result'}
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
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add Student Result</h3>
                    <form onSubmit={handleSubmit} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                            <select
                                value={form.class_id}
                                onChange={(e) => setForm({ ...form, class_id: e.target.value, exam_id: '', student_id: 'all', subject_id: '' })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Exam</label>
                            <select
                                value={form.exam_id}
                                onChange={(e) => setForm({ ...form, exam_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                required
                            >
                                <option value="">Select Exam</option>
                                {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                            </select>
                            {form.class_id && exams.length === 0 && (
                                <p style={{ fontSize: '12px', color: '#e53e3e', margin: '4px 0 0 0' }}>No exams found</p>
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
                                {/* ✅ "All Students" option */}
                                <option value="all">📚 All Students (Poori Class)</option>
                                {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
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
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Marks Obtained</label>
                            <input
                                type="number"
                                step="0.5"
                                value={form.marks_obtained}
                                onChange={(e) => setForm({ ...form, marks_obtained: e.target.value })}
                                placeholder="85"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Grade</label>
                            <input
                                type="text"
                                value={form.grade}
                                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                                placeholder="A+"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Remarks</label>
                            <input
                                type="text"
                                value={form.remarks}
                                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                placeholder="Excellent work"
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
                                {loading ? 'Saving...' : '💾 Add Result'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px',
                marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex', gap: '16px', flexWrap: 'wrap',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
                        style={{ padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                    >
                        <option value="">Select Class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                    <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        disabled={!selectedClass}
                        style={{ padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}
                    >
                        <option value="">Select Student</option>
                        {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Results ({results.length})</h3>
                </div>
                {results.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                        <p style={{ color: '#718096' }}>Select a student to view results</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Exam ID</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Subject</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Marks</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Grade</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>#{r.exam_id}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{r.subject_id}</td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{r.marks_obtained}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#c6f6d5', color: '#22543d', fontSize: '13px', fontWeight: '600' }}>{r.grade}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{r.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Results;