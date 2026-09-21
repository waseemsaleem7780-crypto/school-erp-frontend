import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const Subjects = () => {
    const t = useTerms();   // ✅ Mode-based labels
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [form, setForm] = useState({
        name: '',
        code: '',
        class_id: '',
        teacher_id: '',
    });

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
        fetchAllSubjects();
    }, []);

    useEffect(() => {
        if (selectedClass) fetchSubjectsByClass(selectedClass);
        else fetchAllSubjects();
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers/');
            setTeachers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllSubjects = async () => {
        try {
            const res = await api.get('/subjects/');
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const fetchSubjectsByClass = async (classId) => {
        try {
            const res = await api.get(`/subjects/class/${classId}`);
            setSubjects(res.data);
        } catch (err) {
            setSubjects([]);
        }
    };

    const filteredSubjects = subjects.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const payload = {
            name: form.name,
            code: form.code,
            class_id: parseInt(form.class_id),
            teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null,
        };

        try {
            if (editingId) {
                await api.put(`/subjects/${editingId}`, payload);
                setMessage({ type: 'success', text: `${t.subject} updated! ✅` });
            } else {
                await api.post('/subjects/', payload);
                setMessage({ type: 'success', text: `${t.subject} added! ✅` });
            }
            setForm({ name: '', code: '', class_id: '', teacher_id: '' });
            setEditingId(null);
            setShowForm(false);
            fetchAllSubjects();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || `Failed to save ${t.subject.toLowerCase()}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setForm({
            name: subject.name,
            code: subject.code,
            class_id: subject.class_id,
            teacher_id: subject.teacher_id || '',
        });
        setEditingId(subject.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Kya aap waqai ye ${t.subject.toLowerCase()} delete karna chahte ho?`)) return;

        try {
            await api.delete(`/subjects/${id}`);
            setMessage({ type: 'success', text: `${t.subject} deleted! ✅` });
            fetchAllSubjects();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed: ' + (error.response?.data?.detail || error.message) });
        }
    };

    const handleCancel = () => {
        setForm({ name: '', code: '', class_id: '', teacher_id: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const getClassName = (classId) => {
        const cls = classes.find((c) => c.id === classId);
        return cls ? cls.name : `${t.class} #${classId}`;
    };

    const getTeacherName = (teacherId) => {
        if (!teacherId) return '—';
        const tch = teachers.find((t) => t.id === teacherId);
        if (!tch) return `${t.teacher} #${teacherId}`;
        return `${t.teacher} #${tch.id} (User ${tch.user_id}) - ${tch.qualification}`;
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>{t.subjects}</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage {t.subjects.toLowerCase()} per {t.class.toLowerCase()}</p>
                </div>
                <button
                    onClick={() => showForm ? handleCancel() : setShowForm(true)}
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
                    {showForm ? '✕ Cancel' : `+ Add ${t.subject}`}
                </button>
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

            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>
                        {editingId ? `Edit ${t.subject}` : `Add New ${t.subject}`}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.subject} Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g., Mathematics"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.subject} Code</label>
                            <input
                                type="text"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                placeholder="e.g., MATH-101"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.class}</label>
                            <select
                                value={form.class_id}
                                onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select {t.class}</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>
                                {t.teacher} (Optional)
                            </label>
                            <select
                                value={form.teacher_id}
                                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                            >
                                <option value="">-- No {t.teacher} --</option>
                                {teachers.map((tch) => (
                                    <option key={tch.id} value={tch.id}>
                                        {t.teacher} #{tch.id} (User {tch.user_id}) - {tch.qualification}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '14px 32px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: 'white',
                                    background: loading ? '#a0aec0' : '#48bb78',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Saving...' : (editingId ? `💾 Update ${t.subject}` : `💾 Save ${t.subject}`)}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
            }}>
                <div style={{ fontSize: '36px' }}>📚</div>
                <div>
                    <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Total {t.subjects}</p>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                        {subjects.length}
                    </p>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                        🔎 Search {t.subjects}
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, code, or ID..."
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '15px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '10px',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                        🔍 Filter by {t.class}
                    </label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                    >
                        <option value="">-- All {t.classes} --</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>All {t.subjects} ({filteredSubjects.length})</h3>
                </div>

                {fetching ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                        Loading...
                    </div>
                ) : filteredSubjects.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                        <p style={{ color: '#718096' }}>
                            {searchTerm ? `No ${t.subjects.toLowerCase()} match your search` : `No ${t.subjects.toLowerCase()} yet`}
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>{t.subject}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Code</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>{t.class}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>{t.teacher}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects.map((s) => (
                                <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>#{s.id}</td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{s.name}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontFamily: 'monospace' }}>{s.code}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{getClassName(s.class_id)}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>
                                        {s.teacher_name || getTeacherName(s.teacher_id)}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEdit(s)}
                                                style={{
                                                    padding: '6px 14px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    background: '#667eea',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                style={{
                                                    padding: '6px 14px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: 'white',
                                                    background: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
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

export default Subjects;