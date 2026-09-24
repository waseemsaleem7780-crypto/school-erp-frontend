import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const MyClasses = () => {
    const t = useTerms();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyClasses();
    }, []);

    // ✅ FIX: Teacher ki apni assigned classes lo
    const fetchMyClasses = async () => {
        try {
            const res = await api.get('/teachers/my-classes');
            setClasses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('My classes error:', err);
            setError(err.response?.data?.detail || `Failed to load ${t.classes.toLowerCase()}`);
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My {t.classes}
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    {t.classes} assigned to you
                </p>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                    Loading...
                </div>
            ) : error ? (
                <div style={{ padding: '40px' }}>
                    <div style={{
                        padding: '20px 24px',
                        borderRadius: '12px',
                        background: '#fed7d7',
                        color: '#c53030',
                    }}>
                        ⚠️ {error}
                    </div>
                </div>
            ) : classes.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏫</div>
                    <p style={{ color: '#718096' }}>No {t.classes.toLowerCase()} assigned yet</p>
                    <p style={{ color: '#a0aec0', fontSize: '13px', marginTop: '8px' }}>
                        Admin se contact karo — wo aap ko {t.classes.toLowerCase()} assign karega
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                }}>
                    {classes.map((c) => (
                        <div
                            key={c.id}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                borderTop: '4px solid #667eea',
                            }}
                        >
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏫</div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>{c.name}</h3>
                            <p style={{ color: '#718096', fontSize: '13px', margin: 0 }}>
                                {t.class} ID: #{c.id}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClasses;