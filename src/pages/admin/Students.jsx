import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { downloadExcel } from '../../utils/exportUtils';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ Full form fields
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        roll_number: '',
        class_id: '',
        section_id: '',
        phone: '',
    });

    useEffect(() => {
        fetchClasses();
        fetchAllStudents();
    }, []);

    useEffect(() => {
        if (form.class_id) fetchSections(form.class_id);
    }, [form.class_id]);

    useEffect(() => {
        if (selectedClass) fetchStudents(selectedClass);
        else fetchAllStudents();
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const res = await api.get('/students/');
            setStudents(res.data);
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

    const getClassName = (classId) => {
        const cls = classes.find((c) => c.id === classId);
        return cls ? cls.name : `Class #${classId}`;
    };

    const filteredStudents = students.filter((s) => {
        const roll = (s.roll_number || '').toString().toLowerCase();
        const id = (s.id || '').toString();
        const userId = (s.user_id || '').toString();
        const name = (s.student_name || '').toString().toLowerCase();
        const term = searchTerm.toLowerCase();
        return roll.includes(term) || id.includes(term) || userId.includes(term) || name.includes(term);
    });

    const handleExport = async () => {
        setMessage({ type: '', text: 'Downloading...' });
        const result = await downloadExcel('/export/students/excel', 'students.xlsx');
        if (result.success) {
            setMessage({ type: 'success', text: 'Excel downloaded! ✅' });
        } else {
            setMessage({ type: 'error', text: result.error });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleDownloadPDF = async (studentId) => {
        setMessage({ type: '', text: 'Generating PDF...' });
        try {
            const response = await api.get(`/pdf/student/${studentId}/report-card`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report_card_${studentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setMessage({ type: 'success', text: 'PDF downloaded! ✅' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to download PDF' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                // Edit — only roll, class, section
                await api.put(`/students/${editingId}`, {
                    user_id: 1,
                    roll_number: form.roll_number,
                    class_id: parseInt(form.class_id),
                    section_id: parseInt(form.section_id),
                });
                setMessage({ type: 'success', text: 'Student updated! ✅' });
            } else {
                // ✅ Naya endpoint — user + student ek saath
                await api.post('/students/create-with-user', {
                    full_name: form.full_name,
                    email: form.email,
                    password: form.password,
                    roll_number: form.roll_number,
                    class_id: parseInt(form.class_id),
                    section_id: parseInt(form.section_id),
                    phone: form.phone || null,
                });
                setMessage({ type: 'success', text: 'Student created! ✅' });
            }
            setForm({
                full_name: '', email: '', password: '',
                roll_number: '', class_id: '', section_id: '', phone: '',
            });
            setEditingId(null);
            setShowForm(false);
            fetchAllStudents();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to save student',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (student) => {
        setForm({
            full_name: student.student_name || '',
            email: student.student_email || '',
            password: '',
            roll_number: student.roll_number,
            class_id: student.class_id,
            section_id: student.section_id,
            phone: student.student_phone || '',
        });
        setEditingId(student.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Kya aap waqai ye student delete karna chahte ho?')) return;

        try {
            await api.delete(`/students/${id}`);
            setMessage({ type: 'success', text: 'Student deleted! ✅' });
            fetchAllStudents();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed: ' + (error.response?.data?.detail || error.message) });
        }
    };

    const handleCancel = () => {
        setForm({
            full_name: '', email: '', password: '',
            roll_number: '', class_id: '', section_id: '', phone: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Students</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage all enrolled students</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleExport}
                        style={{
                            padding: '12px 24px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'white',
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        📥 Export Excel
                    </button>
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
                        }}
                    >
                        {showForm ? '✕ Cancel' : '+ Add Student'}
                    </button>
                </div>
            </div>

            {message.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : message.type === 'error' ? '#fed7d7' : '#bee3f8',
                    color: message.type === 'success' ? '#22543d' : message.type === 'error' ? '#c53030' : '#2c5282',
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
                        {editingId ? '✏️ Edit Student' : '➕ Add New Student'}
                    </h3>

                    {!editingId && (
                        <div style={{
                            backgroundColor: '#e6fffa',
                            border: '1px solid #81e6d9',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            color: '#285e61',
                        }}>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {/* Full Name */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Full Name *</label>
                            <input
                                type="text"
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                placeholder="e.g., Ali Khan"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                                disabled={!!editingId}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Email *</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="student@school.com"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                                disabled={!!editingId}
                            />
                        </div>

                        {/* Password (only add) */}
                        {!editingId && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Password *</label>
                                <input
                                    type="text"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Min 8 characters"
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required={!editingId}
                                    minLength={8}
                                />
                            </div>
                        )}

                        {/* Roll Number */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Roll Number *</label>
                            <input
                                type="text"
                                value={form.roll_number}
                                onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                                placeholder="e.g., 101"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        {/* Class */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class *</label>
                            <select
                                value={form.class_id}
                                onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '' })}
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
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Section *</label>
                            <select
                                value={form.section_id}
                                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                required
                            >
                                <option value="">Select Section</option>
                                {sections.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Phone (Optional)</label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="e.g., +92-300-1234567"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
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
                                {loading ? 'Saving...' : (editingId ? '💾 Update Student' : '💾 Save Student')}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    padding: '14px 32px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    background: '#e2e8f0',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✕ Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                    🔍 Filter Students by Class
                </label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                >
                    <option value="">-- All Students --</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                    🔎 Search Students
                </label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, roll number, ID, user ID..."
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

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Students List ({filteredStudents.length})</h3>
                </div>

                {filteredStudents.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍🎓</div>
                        <p style={{ color: '#718096' }}>
                            {searchTerm ? 'No students match your search' : 'No students yet'}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f7fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Student Name</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Roll No</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Class</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Section</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s) => (
                                    <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px 24px', color: '#718096' }}>#{s.id}</td>
                                        <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600' }}>
                                            {s.student_name || `Student #${s.user_id}`}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600', fontFamily: 'monospace' }}>{s.roll_number || '—'}</td>
                                        <td style={{ padding: '16px 24px', color: '#718096' }}>{getClassName(s.class_id)}</td>
                                        <td style={{ padding: '16px 24px', color: '#718096' }}>{s.section_id || '—'}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => handleEdit(s)}
                                                    style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#667eea', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPDF(s.id)}
                                                    style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#48bb78', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    📄 Report Card
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Students;