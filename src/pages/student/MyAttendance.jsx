import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TeacherAssignments = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const [form, setForm] = useState({
        class_id: '',
        subject_id: '',
        student_id: '',
        teacher_id: '',
        title: '',
        description: '',
        deadline: '',
        file: null,
        file_url: '',
    });
    
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (form.class_id) {
            fetchSubjects(form.class_id);
            fetchStudents(form.class_id);
        }
    }, [form.class_id]);

    const fetchData = async () => {
        try {
            const [c, t] = await Promise.all([api.get('/classes/'), api.get('/teachers/')]);
            setClasses(c.data);
            setTeachers(t.data);
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

    const fetchAssignments = async (studentId) => {
        if (!studentId) return;
        try {
            const res = await api.get(`/assignment/student/${studentId}`);
            setAssignments(res.data);
        } catch (err) {
            setAssignments([]);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, file });
        }
    };

    const handleUpload = async () => {
        if (!form.file) {
            setMessage({ type: 'error', text: 'Please select a file first' });
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('file', form.file);
            formData.append('folder', 'assignments');

            const uploadRes = await api.post('/upload/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });

            setForm({ ...form, file_url: uploadRes.data.url });
            setMessage({ type: 'success', text: 'File uploaded! Ab Save dabao.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Upload failed: ' + (error.response?.data?.detail || error.message) });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/assignment/', {
                student_id: parseInt(form.student_id),
                subject_id: parseInt(form.subject_id),
                teacher_id: parseInt(form.teacher_id),
                title: form.title,
                description: form.description,
                deadline: form.deadline,
            });
            setMessage({ type: 'success', text: 'Assignment saved! ✅' });
            setForm({ ...form, title: '', description: '', deadline: '', file: null, file_url: '' });
            setShowForm(false);
            if (form.student_id) fetchAssignments(form.student_id);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Assignments</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Create assignments for students</p>
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
                    {showForm ? '✕ Cancel' : '+ Create Assignment'}
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
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Create New Assignment</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                            <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value, subject_id: '', student_id: '' })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }} required>
                                <option value="">Select Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} disabled={!form.class_id} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }} required>
                                <option value="">Select Student</option>
                                {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Teacher</label>
                            <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }} required>
                                <option value="">Select Teacher</option>
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.qualification} (ID: {t.id})</option>)}
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Title</label>
                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Arial' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Deadline</label>
                            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        {/* File Upload Section */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Assignment File (Optional - PDF, JPG, PNG, DOC)</label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    style={{
                                        flex: 1,
                                        padding: '12px 14px',
                                        fontSize: '14px',
                                        border: '2px dashed #667eea',
                                        borderRadius: '8px',
                                        backgroundColor: '#f7fafc',
                                        cursor: 'pointer',
                                    }}
                                />
                                {form.file && (
                                    <button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        style={{
                                            padding: '12px 24px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: 'white',
                                            background: uploading ? '#a0aec0' : '#48bb78',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {uploading ? `Uploading ${uploadProgress}%` : '📤 Upload'}
                                    </button>
                                )}
                            </div>
                            {form.file_url && (
                                <p style={{ fontSize: '12px', color: '#22543d', marginTop: '8px', fontWeight: '600' }}>
                                    ✅ File uploaded! Ab "Save Assignment" dabao.
                                </p>
                            )}
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: loading ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Saving...' : '💾 Save Assignment'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Recent Assignments */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Recent Assignments ({assignments.length})</h3>
                </div>
                {assignments.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                        <p style={{ color: '#718096' }}>No assignments yet</p>
                    </div>
                ) : (
                    <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                        {assignments.map((a) => (
                            <div key={a.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#f7fafc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0, color: '#1a202c' }}>{a.title}</h4>
                                    <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#feebc8', color: '#7b341e', fontSize: '12px', fontWeight: '600' }}>
                                        📅 {a.deadline}
                                    </span>
                                </div>
                                <p style={{ color: '#718096', margin: '8px 0', fontSize: '14px' }}>{a.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherAssignments;