import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTerms } from '../../utils/terminology';

const MarkAttendance = () => {
    const t = useTerms();
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [selectedStatus, setSelectedStatus] = useState('Present');
    const [selectedStudents, setSelectedStudents] = useState({}); // { studentId: status }
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        fetchMyClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
            setSelectedSection('');
            setStudents([]);
            setSelectedStudents({});
        }
    }, [selectedClass]);

    // ✅ Sirf assigned classes
    const fetchMyClasses = async () => {
        try {
            const res = await api.get('/teachers/my-classes');
            const data = Array.isArray(res.data) ? res.data : [];
            setClasses(data);
            if (data.length > 0) setSelectedClass(data[0].id);
        } catch (err) {
            console.error('fetchMyClasses error:', err);
            setClasses([]);
        }
    };

    const fetchSections = async (classId) => {
        try {
            const res = await api.get(`/sections/${classId}`);
            setSections(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setSections([]);
        }
    };

    // ✅ Students load karo + ticked mark karo
    const loadStudents = async () => {
        if (!selectedClass) {
            setMessage({ type: 'error', text: `Pehle ${t.class.toLowerCase()} select karo` });
            return;
        }

        setFetching(true);
        setMessage({ type: '', text: '' });

        try {
            // Students laao
            let stuRes;
            try {
                stuRes = await api.get(`/students/class/${selectedClass}`);
            } catch (e) {
                stuRes = await api.get(`/students/${selectedClass}`);
            }
            const studentList = Array.isArray(stuRes.data) ? stuRes.data : [];
            setStudents(studentList);

            // ✅ Default: sab ticked + present
            const initial = {};
            studentList.forEach((s) => {
                initial[s.id] = 'present';
            });
            setSelectedStudents(initial);

            // Already marked attendance load karo
            try {
                const attUrl = selectedSection
                    ? `/attendance/date/${selectedDate}/class/${selectedClass}?section_id=${selectedSection}`
                    : `/attendance/date/${selectedDate}/class/${selectedClass}`;
                const attRes = await api.get(attUrl);
                const existing = {};
                (attRes.data || []).forEach((a) => {
                    existing[a.student_id] = a.status;
                });
                const merged = {};
                studentList.forEach((s) => {
                    merged[s.id] = existing[s.id] || 'present';
                });
                setSelectedStudents(merged);
            } catch (e) {
                // Ignore
            }

            if (studentList.length === 0) {
                setMessage({ type: 'error', text: `Is ${t.class.toLowerCase()} mein koi ${t.student.toLowerCase()} nahi` });
            }
        } catch (err) {
            console.error('loadStudents error:', err);
            setMessage({ type: 'error', text: `Failed to load ${t.students.toLowerCase()}` });
        } finally {
            setFetching(false);
        }
    };

    // ✅ Individual student tick toggle
    const toggleStudent = (studentId) => {
        setSelectedStudents((prev) => {
            const copy = { ...prev };
            if (copy[studentId]) {
                delete copy[studentId];   // Untick
            } else {
                copy[studentId] = selectedStatus.toLowerCase().replace('-', '_').replace(' ', '_');
            }
            return copy;
        });
    };

    // ✅ Status change for a ticked student
    const setStudentStatus = (studentId, status) => {
        setSelectedStudents((prev) => ({
            ...prev,
            [studentId]: status,
        }));
    };

    // ✅ Select All
    const selectAll = () => {
        const all = {};
        students.forEach((s) => {
            all[s.id] = 'present';
        });
        setSelectedStudents(all);
    };

    // ✅ Deselect All
    const deselectAll = () => {
        setSelectedStudents({});
    };

    // ✅ Mark all selected as Present/Absent
    const markAllAs = (status) => {
        setSelectedStudents((prev) => {
            const copy = { ...prev };
            Object.keys(copy).forEach((id) => {
                copy[id] = status;
            });
            return copy;
        });
    };

    const selectedCount = Object.keys(selectedStudents).length;

    // ✅ Save
    const handleSave = async () => {
        if (selectedCount === 0) {
            setMessage({ type: 'error', text: 'Kam se kam ek student ko tick karo' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const records = Object.entries(selectedStudents).map(([sid, status]) => ({
                student_id: parseInt(sid),
                date: selectedDate,
                status: status,
            }));

            await api.post('/attendance/bulk', { records });
            setMessage({
                type: 'success',
                text: `✅ ${records.length} students ki ${t.attendance.toLowerCase()} mark ho gayi!`,
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error(error);
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to save',
            });
        } finally {
            setLoading(false);
        }
    };

    const getStudentName = (s) => s.student_name || s.name || `${t.student} #${s.id}`;

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    Mark {t.attendance}
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Tick karo aur {t.attendance.toLowerCase()} mark karo
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div style={{
                    padding: '14px 20px', borderRadius: '10px', marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                    color: message.type === 'success' ? '#22543d' : '#c53030',
                }}>
                    {message.text}
                </div>
            )}

            {/* Empty classes */}
            {classes.length === 0 ? (
                <div style={{
                    backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px',
                    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏫</div>
                    <p style={{ color: '#718096' }}>No {t.classes.toLowerCase()} assigned yet</p>
                    <p style={{ color: '#a0aec0', fontSize: '13px', marginTop: '8px' }}>
                        Admin se contact karo
                    </p>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div style={{
                        backgroundColor: 'white', borderRadius: '16px', padding: '24px',
                        marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                        alignItems: 'end',
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.class}</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                            >
                                <option value="">Select {t.class}</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>{t.section} (Optional)</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}
                            >
                                <option value="">All {t.sections}</option>
                                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <button
                                onClick={loadStudents}
                                disabled={!selectedClass || fetching}
                                style={{
                                    width: '100%', padding: '12px 24px', fontSize: '15px', fontWeight: '600',
                                    color: 'white',
                                    background: (!selectedClass || fetching) ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none', borderRadius: '10px',
                                    cursor: (!selectedClass || fetching) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {fetching ? 'Loading...' : `🔍 Load ${t.students}`}
                            </button>
                        </div>
                    </div>

                    {/* Students table with checkboxes */}
                    {students.length > 0 && (
                        <>
                            {/* Bulk actions */}
                            <div style={{
                                backgroundColor: 'white', borderRadius: '16px', padding: '16px 24px',
                                marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                                    ⚡ Bulk Actions:
                                </span>
                                <button
                                    onClick={selectAll}
                                    style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#48bb78', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    ✅ Select All ({students.length})
                                </button>
                                <button
                                    onClick={deselectAll}
                                    style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#a0aec0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    ⬜ Deselect All
                                </button>
                                <button
                                    onClick={() => markAllAs('present')}
                                    style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#38a169', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    ✅ Mark All Present
                                </button>
                                <button
                                    onClick={() => markAllAs('absent')}
                                    style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    ❌ Mark All Absent
                                </button>
                                <div style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: '600', color: '#667eea' }}>
                                    {selectedCount} / {students.length} selected
                                </div>
                            </div>

                            {/* Students List */}
                            <div style={{
                                backgroundColor: 'white', borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden',
                                marginBottom: '24px',
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f7fafc' }}>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase', width: '60px' }}>Tick</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Roll No</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>{t.student}</th>
                                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s) => {
                                            const isTicked = !!selectedStudents[s.id];
                                            const status = selectedStudents[s.id];
                                            return (
                                                <tr
                                                    key={s.id}
                                                    style={{
                                                        borderTop: '1px solid #e2e8f0',
                                                        backgroundColor: isTicked ? '#f0fff4' : 'white',
                                                    }}
                                                >
                                                    <td style={{ padding: '16px 24px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isTicked}
                                                            onChange={() => toggleStudent(s.id)}
                                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600', fontFamily: 'monospace' }}>
                                                        {s.roll_number}
                                                    </td>
                                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>
                                                        {getStudentName(s)}
                                                    </td>
                                                    <td style={{ padding: '16px 24px' }}>
                                                        {isTicked ? (
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => setStudentStatus(s.id, 'present')}
                                                                    style={{
                                                                        padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                                                                        color: status === 'present' ? 'white' : '#48bb78',
                                                                        background: status === 'present' ? '#48bb78' : 'white',
                                                                        border: '2px solid #48bb78', borderRadius: '8px', cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    ✅ Present
                                                                </button>
                                                                <button
                                                                    onClick={() => setStudentStatus(s.id, 'absent')}
                                                                    style={{
                                                                        padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                                                                        color: status === 'absent' ? 'white' : '#dc2626',
                                                                        background: status === 'absent' ? '#dc2626' : 'white',
                                                                        border: '2px solid #dc2626', borderRadius: '8px', cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    ❌ Absent
                                                                </button>
                                                                <button
                                                                    onClick={() => setStudentStatus(s.id, 'leave')}
                                                                    style={{
                                                                        padding: '6px 14px', fontSize: '12px', fontWeight: '600',
                                                                        color: status === 'leave' ? 'white' : '#ed8936',
                                                                        background: status === 'leave' ? '#ed8936' : 'white',
                                                                        border: '2px solid #ed8936', borderRadius: '8px', cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    🏖️ Leave
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '13px', color: '#a0aec0', fontStyle: 'italic' }}>
                                                                Not selected
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Save button */}
                            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={loading || selectedCount === 0}
                                    style={{
                                        padding: '16px 48px', fontSize: '16px', fontWeight: '600',
                                        color: 'white',
                                        background: (loading || selectedCount === 0) ? '#a0aec0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        border: 'none', borderRadius: '12px',
                                        cursor: (loading || selectedCount === 0) ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)',
                                    }}
                                >
                                    {loading ? 'Saving...' : `💾 Save ${t.attendance} (${selectedCount} students)`}
                                </button>
                            </div>
                        </>
                    )}

                    {/* No students */}
                    {students.length === 0 && !fetching && (
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px',
                            textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                            <p style={{ color: '#718096' }}>
                                {t.class} select karke "Load {t.students}" dabao
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MarkAttendance;