import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);

    // ✅ Full form fields
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        qualification: '',
        phone: '',
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers/');
            setTeachers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const filteredTeachers = teachers.filter((t) =>
        (t.teacher_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.teacher_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.teacher_phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.qualification || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toString().includes(searchTerm) ||
        t.user_id.toString().includes(searchTerm)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                // Edit — only qualification + phone
                await api.put(`/teachers/${editingId}`, {
                    user_id: 1,
                    qualification: form.qualification,
                    phone: form.phone || null,
                });
                setMessage({ type: 'success', text: 'Teacher updated! ✅' });
            } else {
                // ✅ Naya endpoint — user + teacher ek saath
                await api.post('/teachers/create-with-user', {
                    full_name: form.full_name,
                    email: form.email,
                    password: form.password,
                    qualification: form.qualification,
                    phone: form.phone || null,
                });
                setMessage({ type: 'success', text: 'Teacher created! ✅' });
            }
            setForm({ full_name: '', email: '', password: '', qualification: '', phone: '' });
            setEditingId(null);
            fetchTeachers();
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                setActiveTab('list');
            }, 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to save teacher',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (teacher) => {
        setForm({
            full_name: teacher.teacher_name || '',
            email: teacher.teacher_email || '',
            password: '',
            qualification: teacher.qualification,
            phone: teacher.teacher_phone !== '—' ? teacher.teacher_phone : '',
        });
        setEditingId(teacher.id);
        setActiveTab('add');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Kya aap waqai ye teacher delete karna chahte ho?')) return;

        try {
            await api.delete(`/teachers/${id}`);
            setMessage({ type: 'success', text: 'Teacher deleted! ✅' });
            fetchTeachers();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed: ' + (error.response?.data?.detail || error.message) });
        }
    };

    const handleCancel = () => {
        setForm({ full_name: '', email: '', password: '', qualification: '', phone: '' });
        setEditingId(null);
        setActiveTab('list');
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Teachers</h1>
                <p style={{ color: '#718096', margin: 0 }}>Manage all teaching staff</p>
            </div>

            {/* 2 TABS */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                backgroundColor: 'white',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                width: 'fit-content',
            }}>
                <button
                    onClick={() => { setActiveTab('list'); handleCancel(); }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'list' ? '#667eea' : 'transparent',
                        color: activeTab === 'list' ? 'white' : '#4a5568',
                    }}
                >
                    📋 All Teachers ({teachers.length})
                </button>
                <button
                    onClick={() => { setActiveTab('add'); setEditingId(null); setForm({ full_name: '', email: '', password: '', qualification: '', phone: '' }); }}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'add' ? '#667eea' : 'transparent',
                        color: activeTab === 'add' ? 'white' : '#4a5568',
                    }}
                >
                    ➕ Add Teacher
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

            {/* ADD TAB */}
            {activeTab === 'add' && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>
                        {editingId ? '✏️ Edit Teacher' : '➕ Add New Teacher'}
                    </h3>

                    <div style={{
                        backgroundColor: '#e6fffa',
                        border: '1px solid #81e6d9',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        color: '#285e61',
                    }}>
                        ✅ <strong>Ek hi step mein:</strong> User + Teacher dono ban jayenge. Koi Swagger ki zaroorat nahi!
                    </div>

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
                                placeholder="teacher@school.com"
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

                        {/* Qualification */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Qualification *</label>
                            <input
                                type="text"
                                value={form.qualification}
                                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                                placeholder="e.g., M.Sc Mathematics"
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
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
                                {loading ? 'Saving...' : (editingId ? '💾 Update Teacher' : '💾 Save Teacher')}
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

            {/* LIST TAB */}
            {activeTab === 'list' && (
                <>
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
                        <div style={{ fontSize: '36px' }}>👨‍🏫</div>
                        <div>
                            <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Total Teachers</p>
                            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                                {teachers.length}
                            </p>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                            🔎 Search Teachers
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, phone, qualification, ID..."
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
                            <h3 style={{ margin: 0, color: '#1a202c' }}>All Teachers ({filteredTeachers.length})</h3>
                        </div>

                        {fetching ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
                        ) : filteredTeachers.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                                <p style={{ color: '#718096' }}>
                                    {searchTerm ? 'No teachers match your search' : 'No teachers yet'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f7fafc' }}>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Teacher Name</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Email</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Phone</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Qualification</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Hired Date</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers.map((t) => (
                                            <tr key={t.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '16px 24px', color: '#718096' }}>#{t.id}</td>
                                                <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600' }}>
                                                    {t.teacher_name || `Teacher #${t.id}`}
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>
                                                    {t.teacher_email || '—'}
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>
                                                    📱 {t.teacher_phone || '—'}
                                                </td>
                                                <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{t.qualification}</td>
                                                <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>
                                                    {t.hired_date ? new Date(t.hired_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleEdit(t)}
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
                                                            onClick={() => handleDelete(t.id)}
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
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Teachers;