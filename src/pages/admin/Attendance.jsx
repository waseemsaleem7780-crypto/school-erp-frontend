import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { downloadExcel } from '../../utils/exportUtils';

const Attendance = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchStats();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
            setSelectedSection('');
        } else {
            setSections([]);
            setStudents([]);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes/');
            setClasses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSections = async (classId) => {
        try {
            const res = await api.get(`/sections/${classId}`);
            setSections(res.data);
        } catch (err) {
            setSections([]);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get(`/attendance/stats/${selectedDate}`);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadStudents = async () => {
        if (!selectedClass) {
            setMessage({ type: 'error', text: 'Pehle Class select karo' });
            return;
        }

        setFetching(true);
        setMessage({ type: '', text: '' });

        try {
            const url = selectedSection
                ? `/students/class/${selectedClass}/section/${selectedSection}`
                : `/students/class/${selectedClass}`;
            const stuRes = await api.get(url);
            setStudents(stuRes.data);

            const attUrl = selectedSection
                ? `/attendance/date/${selectedDate}/class/${selectedClass}?section_id=${selectedSection}`
                : `/attendance/date/${selectedDate}/class/${selectedClass}`;
            const attRes = await api.get(attUrl);

            const map = {};
            attRes.data.forEach((a) => {
                map[a.student_id] = a.status;
            });

            stuRes.data.forEach((s) => {
                if (!map[s.id]) map[s.id] = 'present';
            });

            setAttendanceMap(map);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load students' });
        } finally {
            setFetching(false);
        }
    };

    const handleExport = async () => {
        setMessage({ type: '', text: 'Downloading...' });
        const endpoint = selectedClass
            ? `/export/attendance/excel?class_id=${selectedClass}`
            : '/export/attendance/excel';
        const result = await downloadExcel(endpoint, 'attendance.xlsx');
        if (result.success) {
            setMessage({ type: 'success', text: 'Excel downloaded! ✅' });
        } else {
            setMessage({ type: 'error', text: result.error });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const toggleStatus = (studentId, status) => {
        setAttendanceMap({ ...attendanceMap, [studentId]: status });
    };

    const handleSave = async () => {
        if (students.length === 0) {
            setMessage({ type: 'error', text: 'Pehle students load karo' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const records = students.map((s) => ({
                student_id: s.id,
                date: selectedDate,
                status: attendanceMap[s.id] || 'present',
            }));

            await api.post('/attendance/bulk', { records });
            setMessage({ type: 'success', text: `${records.length} attendance records saved! ✅` });
            fetchStats();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to save attendance',
            });
        } finally {
            setLoading(false);
        }
    };

    const markAll = (status) => {
        const newMap = {};
        students.forEach((s) => {
            newMap[s.id] = status;
        });
        setAttendanceMap(newMap);
    };

    const getStudentName = (s) => {
        return s.student_name || s.name || `Student #${s.id}`;
    };

    const getRollNumber = (s) => {
        return s.roll_number || s.roll_no || '—';
    };

    const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
    const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header with Export Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Attendance</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Mark daily attendance for students</p>
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

            {message.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : message.type === 'error' ? '#fed7d7' : '#bee3f8',
                    color: message.type === 'success' ? '#22543d' : message.type === 'error' ? '#c53030' : '#2c5282',
                }}>
                    {message.text}
                </div>
            )}

            {/* Stats Card */}
            {stats && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px',
                }}>
                    <div>
                        <p style={{ margin: 0, color: '#718096', fontSize: '13px' }}>📅 Date</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>
                            {stats.date}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#718096', fontSize: '13px' }}>👥 Total</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                            {stats.total}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#718096', fontSize: '13px' }}>✅ Present</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#48bb78' }}>
                            {stats.present}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#718096', fontSize: '13px' }}>❌ Absent</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                            {stats.absent}
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#718096', fontSize: '13px' }}>📊 Percentage</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#764ba2' }}>
                            {stats.percentage}%
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                alignItems: 'end',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>📅 Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            fetchStats();
                        }}
                        style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>🏫 Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                    >
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>📚 Section</label>
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        disabled={!selectedClass}
                        style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: selectedClass ? 'white' : '#f7fafc' }}
                    >
                        <option value="">All Sections</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <button
                        onClick={loadStudents}
                        disabled={!selectedClass || fetching}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'white',
                            background: (!selectedClass || fetching) ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: (!selectedClass || fetching) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {fetching ? 'Loading...' : '🔍 Load Students'}
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            {students.length > 0 && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>⚡ Quick Actions:</span>
                    <button
                        onClick={() => markAll('present')}
                        style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#48bb78', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        ✅ Mark All Present
                    </button>
                    <button
                        onClick={() => markAll('absent')}
                        style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        ❌ Mark All Absent
                    </button>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', fontSize: '14px' }}>
                        <span style={{ color: '#48bb78', fontWeight: '600' }}>✅ {presentCount}</span>
                        <span style={{ color: '#dc2626', fontWeight: '600' }}>❌ {absentCount}</span>
                    </div>
                </div>
            )}

            {/* Students Table */}
            {students.length > 0 && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '24px' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: 0, color: '#1a202c' }}>Students ({students.length})</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f7fafc' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Roll No</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600', fontFamily: 'monospace' }}>
                                        {getRollNumber(s)}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '500' }}>
                                        {getStudentName(s)}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleStatus(s.id, 'present')}
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: attendanceMap[s.id] === 'present' ? 'white' : '#48bb78',
                                                    background: attendanceMap[s.id] === 'present' ? '#48bb78' : 'white',
                                                    border: '2px solid #48bb78',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ✅ Present
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(s.id, 'absent')}
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: attendanceMap[s.id] === 'absent' ? 'white' : '#dc2626',
                                                    background: attendanceMap[s.id] === 'absent' ? '#dc2626' : 'white',
                                                    border: '2px solid #dc2626',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ❌ Absent
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Save Button */}
            {students.length > 0 && (
                <div style={{ textAlign: 'right' }}>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            padding: '16px 48px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            background: loading ? '#a0aec0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)',
                        }}
                    >
                        {loading ? 'Saving...' : '💾 Save Attendance'}
                    </button>
                </div>
            )}

            {students.length === 0 && !fetching && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                    <p style={{ color: '#718096' }}>
                        Date, Class aur Section select karke "Load Students" dabao
                    </p>
                </div>
            )}
        </div>
    );
};

export default Attendance;