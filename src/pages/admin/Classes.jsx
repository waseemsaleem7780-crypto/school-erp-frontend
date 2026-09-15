import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes/');
            setClasses(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load classes' });
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const filteredClasses = classes.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/classes/', { name });
            setName('');
            setMessage({ type: 'success', text: 'Class added successfully! ✅' });
            setShowForm(false);
            fetchClasses();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to add class',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '16px',
            }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                        Classes
                    </h1>
                    <p style={{ color: '#718096', margin: 0 }}>
                        Manage all school classes
                    </p>
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
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    {showForm ? '✕ Cancel' : '+ Add Class'}
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                    color: message.type === 'success' ? '#22543d' : '#c53030',
                    border: `1px solid ${message.type === 'success' ? '#9ae6b4' : '#fc8181'}`,
                    fontSize: '14px',
                }}>
                    {message.text}
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid #e2e8f0',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add New Class</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter class name (e.g., Class 5)"
                            style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '14px 16px',
                                fontSize: '15px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '14px 28px',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: 'white',
                                background: loading ? '#a0aec0' : '#48bb78',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Class'}
                        </button>
                    </form>
                </div>
            )}

            {/* Stats */}
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
                <div style={{
                    fontSize: '36px',
                }}>🏫</div>
                <div>
                    <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>Total Classes</p>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                        {classes.length}
                    </p>
                </div>
            </div>

            {/* Search Box */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                    🔎 Search Classes
                </label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by class name or ID..."
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '15px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
            </div>

            {/* Classes List */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>All Classes ({filteredClasses.length})</h3>
                </div>

                {fetching ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                        Loading...
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                        <p style={{ color: '#718096', fontSize: '15px' }}>
                            {searchTerm ? 'No classes match your search' : 'No classes yet. Click "Add Class" to create your first one!'}
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Class Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.map((c) => (
                                <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>#{c.id}</td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>
                                        {c.name}
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