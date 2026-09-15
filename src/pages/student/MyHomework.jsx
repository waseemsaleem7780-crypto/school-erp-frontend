import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyHomework = () => {
    const [homework, setHomework] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomework();
    }, []);

    const fetchHomework = async () => {
        try {
            // Demo: student_id = 1
            const res = await api.get('/homework/student/1');
            setHomework(res.data);
        } catch (err) {
            setHomework([]);
        } finally {
            setLoading(false);
        }
    };

    const isOverdue = (deadline) => new Date(deadline) < new Date();

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My Homework
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Your homework assignments
                </p>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
            ) : homework.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                    <p style={{ color: '#718096' }}>No homework assigned yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {homework.map((h) => (
                        <div key={h.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderLeft: `5px solid ${isOverdue(h.deadline) ? '#fc8181' : '#48bb78'}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ margin: 0, color: '#1a202c' }}>{h.title}</h3>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    backgroundColor: isOverdue(h.deadline) ? '#fed7d7' : '#feebc8',
                                    color: isOverdue(h.deadline) ? '#c53030' : '#7b341e',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                }}>
                                    {isOverdue(h.deadline) ? '⚠️ Overdue' : '📅'} {h.deadline}
                                </span>
                            </div>
                            <p style={{ color: '#718096', margin: '8px 0', fontSize: '14px', lineHeight: '1.6' }}>
                                {h.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyHomework;