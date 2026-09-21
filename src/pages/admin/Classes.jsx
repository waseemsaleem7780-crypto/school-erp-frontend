import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const Classes = () => {
    const t = useTerms();   // ✅ Mode-based labels
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        name: '',
    });

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const filteredClasses = classes.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                await api.put(`/classes/${editingId}`, {
                    name: form.name,
                });
                setMessage({ type: 'success', text: `${t.class} updated! ✅` });
            } else {
                await api.post('/classes/', {
                    name: form.name,
                });
                setMessage({ type: 'success', text: `${t.class} added! ✅` });
            }
            setForm({ name: '' });
            setEditingId(null);
            setShowForm(false);
            fetchClasses();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || `Failed to save ${t.class.toLowerCase()}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cls) => {
        setForm({ name: cls.name });
        setEditingId(cls.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Kya aap waqai ye ${t.class.toLowerCase()} delete karna chahte ho?`)) return;

        try {
            await api.delete(`/classes/${id}`);
            setMessage({ type: 'success', text: `${t.class} deleted! ✅` });
            fetchClasses();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed: ' + (error.response?.data?.detail || error.message) });
        }
    };

    const handleCancel = () => {
        setForm({ name: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>{t.classes}</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage all {t.classes.toLowerCase()}</p>
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
                    {showForm ? '✕ Cancel' : `+ Add ${t.class}`}
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
                        {editingId ? `Edit ${t.class}` : `Add New ${t.class}`}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.class} Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder={`e.g., ${t.class} 1`}
                                style={{ width: '100%', maxWidth: '400px', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

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
                            {loading ? 'Saving...' : (editingId ? `💾 Update ${t.class}` : `💾 Save ${t.class}`)}
                        </button>
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
                <div style={{ fontSize: '36px' }}>🏫</div>
                <div>
                    <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Total {t.classes}</p>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                        {classes.length}
                    </p>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                    🔎 Search {t.classes}
                </label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or ID..."
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
                    <h3 style={{ margin: 0, color: '#1a202c' }}>All {t.classes} ({filteredClasses.length})</h3>
                </div>

                {fetching ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                        Loading...
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                        <p style={{ color: '#718096' }}>
                            {searchTerm ? `No ${t.classes.toLowerCase()} match your search` : `No ${t.classes.toLowerCase()} yet`}
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>{t.class} Name</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.map((c) => (
                                <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>#{c.id}</td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{c.name}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEdit(c)}
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
                                                onClick={() => handleDelete(c.id)}
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

export default Classes;