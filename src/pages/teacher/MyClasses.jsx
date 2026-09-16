import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My Classes
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Classes assigned to you
                </p>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                    Loading...
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
                    <p style={{ color: '#718096' }}>No classes assigned yet</p>
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
                                Class ID: #{c.id}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClasses;