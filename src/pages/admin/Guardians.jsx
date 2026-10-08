import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Guardians = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [guardians, setGuardians] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        relation: 'father',
        phone_number: '',
        email: '',
        address: '',
    });

    // ✅ Classes laao
    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) { console.error(err); }
    };

    // ✅ Sections laao (class ke hisaab se)
    const fetchSections = async (classId) => {
        if (!classId) { setSections([]); return; }
        try {
            const res = await api.get(`/sections/${classId}`);
            setSections(res.data);
        } catch (err) { setSections([]); }
    };

    // ✅ Students laao (class + section ke hisaab se)
    const fetchStudents = async (classId, sectionId = null) => {
        if (!classId) { setStudents([]); return; }
        try {
            let url = `/students/class/${classId}`;
            if (sectionId) url += `?section_id=${sectionId}`;
            const res = await api.get(url);
            // Fallback
            if (!Array.isArray(res.data)) {
                const r2 = await api.get(`/students/${classId}`);
                setStudents(Array.isArray(r2.data) ? r2.data : []);
            } else {
                setStudents(res.data);
            }
        } catch (err) {
            try {
                const r2 = await api.get(`/students/${classId}`);
                setStudents(Array.isArray(r2.data) ? r2.data : []);
            } catch (e) {
                setStudents([]);
            }
        }
    };

    const fetchGuardians = async (studentId) => {
        if (!studentId) { setGuardians([]); return; }
        try {
            const res = await api.get(`/guardians/student/${studentId}`);
            setGuardians(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setGuardians([]);
        }
    };

    useEffect(() => { fetchClasses(); }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
            fetchStudents(selectedClass, selectedSection || null);
        } else {
            setSections([]);
            setStudents([]);
        }
        setSelectedStudent('');
    }, [selectedClass]);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass, selectedSection || null);
        }
        setSelectedStudent('');
    }, [selectedSection]);

    useEffect(() => {
        if (selectedStudent) fetchGuardians(selectedStudent);
        else setGuardians([]);
    }, [selectedStudent]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStudent) {
            setMessage({ type: 'error', text: 'Pehle Class, Section aur Student select karo' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/guardians/auto', {
                student_id: parseInt(selectedStudent),
                full_name: form.full_name,
                relation: form.relation,
                phone_number: form.phone_number,
                email: form.email,
                address: form.address,
            });

            setForm({ full_name: '', relation: 'father', phone_number: '', email: '', address: '' });
            setMessage({ type: 'success', text: 'Guardian add ho gaya! WhatsApp welcome message bhej diya ✅' });
            setShowForm(false);
            if (selectedStudent) fetchGuardians(selectedStudent);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Guardian add nahi hua'
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedStudentInfo = students.find((s) => String(s.id) === String(selectedStudent));
    const selectedClassName = classes.find((c) => String(c.id) === String(selectedClass))?.name || '';
    const selectedSectionName = sections.find((s) => String(s.id) === String(selectedSection))?.name || '';

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Guardians</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage parent/guardian details</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none', borderRadius: '10px', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ Add Guardian'}
                </button>
            </div>

            {message.text && (
                <div style={{
                    padding: '14px 20px', borderRadius: '10px', marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                    color: message.type === 'success' ? '#22543d' : '#c53030',
                    border: `1px solid ${message.type === 'success' ? '#9ae6b4' : '#fc8181'}`,
                    fontSize: '14px',
                }}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add New Guardian</h3>

                    <div style={{ backgroundColor: '#fef5e7', border: '1px solid #f6ad55', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#7b341e' }}>
                        <strong>📌 Pehle Class, Section aur Student select karo</strong> — phir parent ki details bhar do. Parent ka account automatically ban jayega aur WhatsApp par welcome message jayega.
                    </div>

                    {/* Step 1: Student Selection */}
                    <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#4a5568', fontSize: '14px' }}>👨‍🎓 Student Select Karo</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class *</label>
                                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', backgroundColor: 'white' }} required>
                                    <option value="">Select Class</option>
                                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Section</label>
                                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}>
                                    <option value="">All Sections</option>
                                    {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Student (Roll No) *</label>
                                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={!selectedClass} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', backgroundColor: selectedClass ? 'white' : '#f7fafc' }} required>
                                    <option value="">Select Student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>Roll {s.roll_number}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Selected Student Info */}
                        {selectedStudentInfo && (
                            <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: '#ebf8ff', border: '1px solid #90cdf4', borderRadius: '8px', fontSize: '13px', color: '#2c5282' }}>
                                <strong>✅ Selected:</strong> {selectedStudentInfo.student_name || selectedStudentInfo.name || 'Student'} | Roll No: <strong>{selectedStudentInfo.roll_number}</strong> | Class: <strong>{selectedClassName}</strong> {selectedSectionName && `| Section: ${selectedSectionName}`}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Parent Details */}
                    <h4 style={{ margin: '0 0 12px 0', color: '#4a5568', fontSize: '14px' }}>👨‍👩‍👧 Parent Details Bharo</h4>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Full Name *</label>
                            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Mr. Ahmed Ali" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Relation *</label>
                            <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }} required>
                                <option value="father">👨 Father</option>
                                <option value="mother">👩 Mother</option>
                                <option value="guardian">🧑 Guardian</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>WhatsApp Number *</label>
                            <input type="text" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+923001234567" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                            <p style={{ fontSize: '11px', color: '#718096', margin: '4px 0 0 0' }}>Country code ke saath (+92...)</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Email *</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="parent@email.com" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Address *</label>
                            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House #10, Street 5, Lahore" style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading || !selectedStudent} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: (loading || !selectedStudent) ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: (loading || !selectedStudent) ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Saving...' : '💾 Save Guardian & Send WhatsApp'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* View Section */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>🔍 View Guardians by Student</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }} style={{ padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}>
                        <option value="">Select Class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} style={{ padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}>
                        <option value="">All Sections</option>
                        {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={!selectedClass} style={{ padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}>
                        <option value="">Select Student (Roll No)</option>
                        {students.map((s) => <option key={s.id} value={s.id}>Roll {s.roll_number}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1a202c' }}>Guardians ({guardians.length})</h3>
                </div>
                {guardians.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍👩‍👧</div>
                        <p style={{ color: '#718096' }}>Select a student to view guardians</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Relation</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Phone</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {guardians.map((g) => (
                                <tr key={g.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>{g.full_name}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ padding: '6px 14px', borderRadius: '20px', backgroundColor: '#ebf8ff', color: '#2c5282', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{g.relation}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#718096' }}>{g.phone_number}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>{g.email}</td>
                                    <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>{g.address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Guardians;
