import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Timetable = () => {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        class_id: '',
        section_id: '',
        subject_id: '',
        teacher_id: '',
        day_of_week: 'Monday',
        start_time: '',
        end_time: '',
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fetchData = async () => {
        try {
            const [c, t] = await Promise.all([
                api.get('/classes/'),
                api.get('/teachers/')
            ]);
            setClasses(c.data);
            setTeachers(t.data);
            if (c.data.length > 0) setSelectedClass(c.data[0].id);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Sections endpoint sahi hai
    const fetchSections = async (classId) => {
        if (!classId) { setSections([]); return; }
        try {
            const res = await api.get(`/sections/${classId}`);
            setSections(res.data);
        } catch (err) {
            setSections([]);
        }
    };

    // ✅ Sahi endpoint — /subjects/class/{class_id}
    const fetchSubjects = async (classId) => {
        if (!classId) { setSubjects([]); return; }
        try {
            let res;
            try {
                res = await api.get(`/subjects/class/${classId}`);
            } catch (e) {
                res = await api.get(`/subjects/${classId}`);
            }
            setSubjects(res.data);
        } catch (err) {
            setSubjects([]);
        }
    };

    const fetchTimetable = async (classId) => {
        if (!classId) { setTimetable([]); return; }
        setFetching(true);
        try {
            const res = await api.get(`/timetable/class/${classId}`);
            setTimetable(res.data);
        } catch (err) {
            setTimetable([]);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (form.class_id) {
            fetchSections(form.class_id);
            fetchSubjects(form.class_id);
        }
    }, [form.class_id]);

    useEffect(() => {
        if (selectedClass) fetchTimetable(selectedClass);
    }, [selectedClass]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/timetable/', {
                class_id: parseInt(form.class_id),
                section_id: parseInt(form.section_id),
                subject_id: parseInt(form.subject_id),
                teacher_id: parseInt(form.teacher_id),
                day_of_week: form.day_of_week,
                start_time: form.start_time,
                end_time: form.end_time,
            });
            setForm({ ...form, start_time: '', end_time: '' });
            setMessage({ type: 'success', text: 'Timetable entry added! ✅' });
            setShowForm(false);
            if (selectedClass) fetchTimetable(selectedClass);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to add entry'
            });
        } finally {
            setLoading(false);
        }
    };

    const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || `ID: ${id}`;
    const getTeacherName = (id) => teachers.find((t) => t.id === id)?.qualification || `Teacher #${id}`;

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>Timetable</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Manage class schedules</p>
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
                    {showForm ? '✕ Cancel' : '+ Add Entry'}
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
                <div style={{
                    backgroundColor: 'white', borderRadius: '16px', padding: '24px',
                    marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid #e2e8f0',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add Timetable Entry</h3>
                    <form onSubmit={handleSubmit} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '16px',
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Class</label>
                            <select
                                value={form.class_id}
                                onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '', subject_id: '' })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Section</label>
                            <select
                                value={form.section_id}
                                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                required
                            >
                                <option value="">Select Section</option>
                                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Subject</label>
                            <select
                                value={form.subject_id}
                                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                                disabled={!form.class_id}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: form.class_id ? 'white' : '#f7fafc' }}
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {form.class_id && subjects.length === 0 && (
                                <p style={{ fontSize: '12px', color: '#e53e3e', margin: '4px 0 0 0' }}>No subjects found</p>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Teacher</label>
                            <select
                                value={form.teacher_id}
                                onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.qualification} (ID: {t.id})</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Day</label>
                            <select
                                value={form.day_of_week}
                                onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                {days.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Start Time</label>
                            <input
                                type="time"
                                value={form.start_time}
                                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>End Time</label>
                            <input
                                type="time"
                                value={form.end_time}
                                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white',
                                    background: loading ? '#a0aec0' : '#48bb78',
                                    border: 'none', borderRadius: '10px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Saving...' : '💾 Save Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '20px 24px',
                marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>🔍 View Timetable by Class</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ width: '100%', maxWidth: '300px', padding: '12px 16px', fontSize: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none', backgroundColor: 'white' }}
                >
                    <option value="">-- Select Class --</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {fetching ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
            ) : timetable.length === 0 ? (
                <div style={{
                    backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px',
                    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🕐</div>
                    <p style={{ color: '#718096' }}>No timetable entries yet</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {days.map((day) => {
                        const dayEntries = timetable.filter((t) => t.day_of_week === day);
                        if (dayEntries.length === 0) return null;
                        return (
                            <div key={day} style={{
                                backgroundColor: 'white', borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden',
                            }}>
                                <div style={{ padding: '16px 24px', backgroundColor: '#667eea', color: 'white' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px' }}>📅 {day}</h3>
                                </div>
                                <div style={{ padding: '16px', display: 'grid', gap: '8px' }}>
                                    {dayEntries.map((entry) => (
                                        <div key={entry.id} style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            backgroundColor: '#f7fafc',
                                            borderLeft: '4px solid #764ba2',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                        }}>
                                            <div>
                                                <p style={{ margin: 0, color: '#1a202c', fontWeight: '600' }}>
                                                    {getSubjectName(entry.subject_id)}
                                                </p>
                                                <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '13px' }}>
                                                    👨‍🏫 {getTeacherName(entry.teacher_id)}
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                backgroundColor: '#ebf8ff',
                                                color: '#2c5282',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                            }}>
                                                🕐 {entry.start_time} - {entry.end_time}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Timetable;