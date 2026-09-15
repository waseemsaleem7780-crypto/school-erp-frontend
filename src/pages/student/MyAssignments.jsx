import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignment/student/1');
            setAssignments(res.data);
        } catch (err) {
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const isOverdue = (deadline) => new Date(deadline) < new Date();

    const getFileIcon = (url) => {
        if (!url) return '📄';
        const ext = url.split('.').pop().toLowerCase();
        if (ext === 'pdf') return '📕';
        if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
        if (['doc', 'docx'].includes(ext)) return '📘';
        return '📄';
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My Assignments
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Your assignment submissions
                </p>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
            ) : assignments.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                    <p style={{ color: '#718096' }}>No assignments yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {assignments.map((a) => (
                        <div key={a.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderLeft: `5px solid ${isOverdue(a.deadline) ? '#fc8181' : '#48bb78'}`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ margin: 0, color: '#1a202c' }}>{a.title}</h3>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    backgroundColor: isOverdue(a.deadline) ? '#fed7d7' : '#feebc8',
                                    color: isOverdue(a.deadline) ? '#c53030' : '#7b341e',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                }}>
                                    {isOverdue(a.deadline) ? '⚠️ Overdue' : '📅'} {a.deadline}
                                </span>
                            </div>
                            <p style={{ color: '#718096', margin: '8px 0', fontSize: '14px', lineHeight: '1.6' }}>
                                {a.description}
                            </p>
                            
                            {/* Download Button (agar file hai) */}
                            {a.file_path && (
                                <a 
                                    href={a.file_path} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{
                                        display: 'inline-block',
                                        marginTop: '12px',
                                        padding: '10px 20px',
                                        backgroundColor: '#48bb78',
                                        color: 'white',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                    }}
                                >
                                    📥 Download Assignment
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAssignments;