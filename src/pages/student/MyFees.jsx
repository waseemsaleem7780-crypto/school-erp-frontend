import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyFees = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            // Login wale student ki asli ID lo
            const meRes = await api.get('/auth/me');
            const studentId = meRes.data.student_id;

            if (!studentId) {
                setError('Student profile not found');
                setLoading(false);
                return;
            }

            // Sirf usi student ki fees lo
            const res = await api.get(`/fee-payment/student/${studentId}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setPayments(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load fees');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    My Fees
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Your fee payment history
                </p>
            </div>

            {error && (
                <div style={{
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: '#fed7d7',
                    color: '#c53030',
                    marginBottom: '20px',
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Payments ({payments.length})</h3>
                </div>

                {payments.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💰</div>
                        <p style={{ color: '#718096' }}>No payment records yet</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Mode</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            backgroundColor: '#c6f6d5',
                                            color: '#22543d',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                        }}>
                                            Rs {p.amount}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500', textTransform: 'capitalize' }}>
                                        {p.payment_mod || p.payment_mode}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>
                                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}
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

export default MyFees;