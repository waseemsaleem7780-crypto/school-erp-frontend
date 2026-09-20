import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            // Step 1: Login wale student ki info lo
            const meRes = await api.get('/auth/me');
            console.log('ME RESPONSE:', meRes.data);
            setDebugInfo(meRes.data);

            const studentId = meRes.data.student_id;

            if (!studentId) {
                setError('Aap ka student profile abhi tak admin se link nahi hua. Admin se rabta karo.');
                setLoading(false);
                return;
            }

            // Step 2: Us student ke results lo
            const res = await api.get(`/results/student/${studentId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setResults(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load results');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>
                Loading results...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px' }}>
                <div style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: '#fed7d7',
                    color: '#c53030',
                    marginBottom: '16px',
                }}>
                    ⚠️ {error}
                </div>
                {debugInfo && (
                    <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        background: '#f7fafc',
                        fontSize: '13px',
                        color: '#4a5568',
                    }}>
                        <strong>Debug Info:</strong>
                        <pre style={{ margin: '8px 0 0 0' }}>
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My Results
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Your exam results
                </p>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Results ({results.length})</h3>
                </div>

                {results.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                        <p style={{ color: '#718096' }}>No results yet</p>
                        <p style={{ color: '#a0aec0', fontSize: '13px', marginTop: '8px' }}>
                            Aap ke results abhi upload nahi hue
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Exam</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Subject</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Marks</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Grade</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>
                                        {r.exam_name || `#${r.exam_id}`}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>
                                        {r.subject_name || `#${r.subject_id}`}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>
                                        {r.marks_obtained}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            backgroundColor: '#c6f6d5',
                                            color: '#22543d',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                        }}>
                                            {r.grade || '-'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>
                                        {r.remarks || '-'}
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

export default MyResults;