import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MessageParent = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [parentPhone, setParentPhone] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        try {
            const res = await api.get('/teacher-message/my-classes');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClassChange = async (classId) => {
        setSelectedClass(classId);
        setSelectedStudent(null);
        setParentPhone('');
        try {
            const res = await api.get(`/teacher-message/students/${classId}`);
            setStudents(res.data);
        } catch (err) {
            setStudents([]);
        }
    };

    const handleStudentChange = (studentId) => {
        const student = students.find(s => String(s.id) === String(studentId));
        setSelectedStudent(student);
        setParentPhone(student?.parent_phone || '');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;
        if (!window.confirm(`Send to ${selectedStudent.parent_name}?`)) return;

        setSending(true);
        try {
            await api.post('/teacher-message/send', {
                student_id: selectedStudent.id,
                message
            });
            alert('✅ Message sent!');
            setMessage('');
        } catch (error) {
            alert('❌ Failed: ' + (error.response?.data?.detail || error.message));
        } finally {
            setSending(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        fontSize: '14px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '16px'
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial' }}>
            <h1>💬 Message Parent</h1>
            <p style={{ color: '#718096' }}>Send direct WhatsApp to your students' parents</p>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '700px' }}>
                <form onSubmit={handleSend}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class (Your Assigned)</label>
                    <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} style={inputStyle} required>
                        <option value="">Select Class</option>
                        {classes.map((c, i) => (
                            <option key={i} value={c.class_id}>
                                {c.class_name} {c.section_name ? `- ${c.section_name}` : ''}
                            </option>
                        ))}
                    </select>

                    {selectedClass && (
                        <>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student</label>
                            <select onChange={(e) => handleStudentChange(e.target.value)} style={inputStyle} required>
                                <option value="">Select Student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>Roll #{s.roll_number} - {s.student_name}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {parentPhone && (
                        <>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Parent WhatsApp</label>
                            <input type="text" value={parentPhone} readOnly style={{ ...inputStyle, backgroundColor: '#f7fafc' }} />
                            <p style={{ fontSize: '12px', color: '#718096', marginTop: '-8px' }}>
                                Parent: {selectedStudent?.parent_name || 'N/A'}
                            </p>
                        </>
                    )}

                    {selectedStudent && (
                        <>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Message</label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Assalam-o-Alaikum! ..." style={inputStyle} required />
                        </>
                    )}

                    <button type="submit" disabled={sending || !selectedStudent} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: sending ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: sending ? 'not-allowed' : 'pointer', width: '100%' }}>
                        {sending ? 'Sending...' : '🚀 Send WhatsApp'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessageParent;