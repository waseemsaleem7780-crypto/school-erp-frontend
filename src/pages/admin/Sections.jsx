import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const Sections = () => {
    const t = useTerms();   // ✅ Mode-based labels
    const [sections, setSections] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        name: '',
        class_id: '',
    });

    useEffect(() => {
        fetchClasses();
        fetchAllSections();
    }, []);

    useEffect(() => {
        if (selectedClass) fetchSections(selectedClass);
        else fetchAllSections();
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllSections = async () => {
        try {
            const res = await api.get('/sections/');
            setSections(res.data);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                await api.put(`/sections/${editingId}`, {
                    name: form.name,
                    class_id: parseInt(form.class_id),
                });
                setMessage({ type: 'success', text: `${t.section} updated! ✅` });
            } else {
                await api.post('/sections/', {
                    name: form.name,
                    class_id: parseInt(form.class_id),
                });
                setMessage({ type: 'success', text: `${t.section} added! ✅` });
            }
            setForm({ name: '', class_id: '' });
            setEditingId(null);
            setShowForm(false);
            fetchAllSections();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section) => {
        setForm({ name: section.name, class_id: section.class_id });
        setEditingId(section.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Kya aap waqai ye ${t.section.toLowerCase()} delete karna chahte ho?`)) return;

        try {
            await api.delete(`/sections/${id}`);
            setMessage({ type: 'success', text: `${t.section} deleted! ✅` });
            fetchAllSections();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed: ' + (error.response?.data?.detail || error.message) });
        }
    };

    const handleCancel = () => {
        setForm({ name: '', class_id: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const getClassName = (classId) => {
        const cls = classes.find((c) => c.id === classId);
        return cls ? cls.name : `${t.class} #${classId}`;
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>{t.sections}</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage {t.class.toLowerCase()} {t.sections.toLowerCase()}</p>
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
                    {showForm ? '✕ Cancel' : `+ Add ${t.section}`}
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
                        {editingId ? `Edit ${t.section}` : `Add New ${t.section}`}
                    </h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.section} Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g., A"
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
                                {loading ? 'Saving...' : (editingId ? `💾 Update ${t.section}` : `💾 Save ${t.section}`)}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>🔍 Filter by {t.class}</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                >
                    <option value="">-- All {t.sections} --</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>{t.sections} ({sections.length})</h3>
                </div>
                {sections.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                        <p style={{ color: '#718096' }}>No {t.sections.toLowerCase()} found</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>{t.section}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>{t.class}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((s) => (
                                <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>#{s.id}</td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{s.name}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{getClassName(s.class_id)}</td>
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

export default Sections;