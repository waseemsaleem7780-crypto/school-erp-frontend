import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { downloadExcel } from '../../utils/exportUtils';

const Fees = () => {
    const [view, setView] = useState('structure');
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);

    const [structures, setStructures] = useState([]);
    const [structureForm, setStructureForm] = useState({
        class_id: '',
        month: '',
        yearly_fee: '',
        amount: '',
        due_date: '',
    });

    const [payments, setPayments] = useState([]);
    const [paymentForm, setPaymentForm] = useState({
        student_id: '',
        monthly_fee: '',
        yearly_fee: '',
        amount: '',
        payment_mod: 'cash',
    });

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchStudents = async (classId) => {
        if (!classId) { setStudents([]); return; }
        try {
            const res = await api.get(`/students/${classId}`);
            setStudents(res.data);
        } catch (err) { setStudents([]); }
    };

    const fetchStructures = async (classId) => {
        if (!classId) { setStructures([]); return; }
        try {
            const res = await api.get(`/fee-structure/class/${classId}`);
            setStructures(res.data);
        } catch (err) { setStructures([]); }
    };

    const fetchPayments = async (studentId) => {
        if (!studentId) { setPayments([]); return; }
        try {
            const res = await api.get(`/fee-payment/student/${studentId}`);
            setPayments(res.data);
        } catch (err) { setPayments([]); }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (view === 'structure' && selectedClass) fetchStructures(selectedClass);
        if (view === 'payment' && selectedClass) fetchStudents(selectedClass);
    }, [view, selectedClass]);

    useEffect(() => {
        if (view === 'payment' && selectedStudent) fetchPayments(selectedStudent);
    }, [view, selectedStudent]);

    const handleExport = async () => {
        setMessage({ type: '', text: 'Downloading...' });
        const result = await downloadExcel('/export/fees/excel', 'fees.xlsx');
        if (result.success) {
            setMessage({ type: 'success', text: 'Excel downloaded! ✅' });
        } else {
            setMessage({ type: 'error', text: result.error });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleStructureSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/fee-structure/', {
                class_id: parseInt(structureForm.class_id),
                month: parseInt(structureForm.month),
                yearly_fee: parseInt(structureForm.yearly_fee),
                amount: parseFloat(structureForm.amount),
                due_date: structureForm.due_date,
            });
            setStructureForm({ class_id: '', month: '', yearly_fee: '', amount: '', due_date: '' });
            setMessage({ type: 'success', text: 'Fee structure added! ✅' });
            if (selectedClass) fetchStructures(selectedClass);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to add fee structure' });
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/fee-payment/', {
                student_id: parseInt(paymentForm.student_id),
                monthly_fee: parseInt(paymentForm.monthly_fee),
                yearly_fee: parseInt(paymentForm.yearly_fee),
                amount: parseInt(paymentForm.amount),
                payment_mod: paymentForm.payment_mod,
            });
            setPaymentForm({ student_id: '', monthly_fee: '', yearly_fee: '', amount: '', payment_mod: 'cash' });
            setMessage({ type: 'success', text: 'Payment recorded! ✅' });
            if (selectedStudent) fetchPayments(selectedStudent);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to record payment' });
        } finally {
            setLoading(false);
        }
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Fees</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage fee structures and payments</p>
                </div>
                <button
                    onClick={handleExport}
                    style={{
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)',
                    }}
                >
                    📥 Export Excel
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 'fit-content' }}>
                <button
                    onClick={() => setView('structure')}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: view === 'structure' ? '#667eea' : 'transparent',
                        color: view === 'structure' ? 'white' : '#4a5568',
                    }}
                >
                    📋 Fee Structure
                </button>
                <button
                    onClick={() => setView('payment')}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: view === 'payment' ? '#667eea' : 'transparent',
                        color: view === 'payment' ? 'white' : '#4a5568',
                    }}
                >
                    💰 Fee Payment
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : message.type === 'error' ? '#fed7d7' : '#bee3f8',
                    color: message.type === 'success' ? '#22543d' : message.type === 'error' ? '#c53030' : '#2c5282',
                    border: `1px solid ${message.type === 'success' ? '#9ae6b4' : message.type === 'error' ? '#fc8181' : '#90cdf4'}`,
                    fontSize: '14px',
                }}>
                    {message.text}
                </div>
            )}

            {/* ================= FEE STRUCTURE ================= */}
            {view === 'structure' && (
                <>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <h3 style={{ marginTop: 0, color: '#1a202c', marginBottom: '20px' }}>➕ Add Fee Structure</h3>
                        <form onSubmit={handleStructureSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                                <select
                                    value={structureForm.class_id}
                                    onChange={(e) => setStructureForm({ ...structureForm, class_id: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Month</label>
                                <select
                                    value={structureForm.month}
                                    onChange={(e) => setStructureForm({ ...structureForm, month: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                    required
                                >
                                    <option value="">Select Month</option>
                                    {months.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Yearly Fee (Rs)</label>
                                <input
                                    type="number"
                                    value={structureForm.yearly_fee}
                                    onChange={(e) => setStructureForm({ ...structureForm, yearly_fee: e.target.value })}
                                    placeholder="60000"
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Monthly Fee (Rs)</label>
                                <input
                                    type="number"
                                    value={structureForm.amount}
                                    onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                                    placeholder="5000"
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Due Date</label>
                                <input
                                    type="date"
                                    value={structureForm.due_date}
                                    onChange={(e) => setStructureForm({ ...structureForm, due_date: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
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
                                    {loading ? 'Saving...' : '💾 Save Structure'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                            🔍 View Structure by Class
                        </label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, color: '#1a202c' }}>Fee Structures ({structures.length})</h3>
                        </div>
                        {structures.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                                <p style={{ color: '#718096' }}>No fee structures for this class yet</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f7fafc' }}>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Month</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Yearly Fee</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Monthly Fee</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {structures.map((s) => (
                                        <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{months[s.month - 1]}</td>
                                            <td style={{ padding: '16px 24px', color: '#718096' }}>Rs {s.yearly_fee}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#c6f6d5', color: '#22543d', fontSize: '13px', fontWeight: '600' }}>
                                                    Rs {s.amount}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#718096' }}>{s.due_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* ================= FEE PAYMENT ================= */}
            {view === 'payment' && (
                <>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}>
                        <h3 style={{ marginTop: 0, color: '#1a202c', marginBottom: '20px' }}>➕ Record Payment</h3>
                        <form onSubmit={handlePaymentSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => { setSelectedClass(e.target.value); setPaymentForm({ ...paymentForm, student_id: '' }); }}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                                <select
                                    value={paymentForm.student_id}
                                    onChange={(e) => { setPaymentForm({ ...paymentForm, student_id: e.target.value }); setSelectedStudent(e.target.value); }}
                                    disabled={!selectedClass}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>Roll {s.roll_number}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Monthly Fee</label>
                                <input
                                    type="number"
                                    value={paymentForm.monthly_fee}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, monthly_fee: e.target.value })}
                                    placeholder="5000"
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Yearly Fee</label>
                                <input
                                    type="number"
                                    value={paymentForm.yearly_fee}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, yearly_fee: e.target.value })}
                                    placeholder="60000"
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Amount Paid</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    placeholder="5000"
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Payment Mode</label>
                                <select
                                    value={paymentForm.payment_mod}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_mod: e.target.value })}
                                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                >
                                    <option value="cash">💵 Cash</option>
                                    <option value="online">💳 Online</option>
                                    <option value="bank">🏦 Bank Transfer</option>
                                    <option value="cheque">📝 Cheque</option>
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
                                    {loading ? 'Saving...' : '💰 Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, color: '#1a202c' }}>Payment History ({payments.length})</h3>
                        </div>
                        {payments.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💰</div>
                                <p style={{ color: '#718096' }}>Select a student to view payment history</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f7fafc' }}>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Amount</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Monthly</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Mode</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#c6f6d5', color: '#22543d', fontSize: '13px', fontWeight: '600' }}>
                                                    Rs {p.amount}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#718096' }}>Rs {p.monthly_fee}</td>
                                            <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500', textTransform: 'capitalize' }}>{p.payment_mod}</td>
                                            <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>
                                                {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Fees;