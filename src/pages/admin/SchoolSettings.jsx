import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getModeIcon, getModeName } from '../../utils/terminology';

const SchoolSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        setting_key: 'school_name',
        setting_value: '',
    });

    const fetchSettings = async () => {
        try {
            const res = await api.get('/school-settings/');
            setSettings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/school-settings/', {
                setting_key: form.setting_key,
                setting_value: form.setting_value,
            });
            setForm({ setting_key: 'school_name', setting_value: '' });
            setMessage({ type: 'success', text: 'Setting saved! ✅' });
            setShowForm(false);
            fetchSettings();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save setting' });
        } finally { setLoading(false); }
    };

    const settingLabels = {
        school_name: { label: 'School Name', emoji: '🏫' },
        address: { label: 'Address', emoji: '📍' },
        phone: { label: 'Phone', emoji: '📞' },
    };

    const instituteType = user?.institute_type || 'school';

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>School Settings</h1>
                    <p style={{ color: '#718096', margin: 0 }}>Configure your school information</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '12px 24px',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    {showForm ? '✕ Cancel' : '+ Add Setting'}
                </button>
            </div>

            {message.text && (
                <div style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
                    color: message.type === 'success' ? '#22543d' : '#c53030',
                    border: `1px solid ${message.type === 'success' ? '#9ae6b4' : '#fc8181'}`,
                    fontSize: '14px',
                }}>
                    {message.text}
                </div>
            )}

            {/* ✅ Institute Type (Read-Only) */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid #c3dafe',
                background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '48px' }}>{getModeIcon(instituteType)}</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, color: '#4a5568', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>
                            Institute Mode
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#2d3748' }}>
                            {getModeName(instituteType)}
                        </p>
                        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#718096' }}>
                            Mode change karne ke liye Super Admin se contact karo
                        </p>
                    </div>
                </div>
            </div>

            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid #e2e8f0',
                }}>
                    <h3 style={{ marginTop: 0, color: '#1a202c' }}>Add / Update Setting</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Setting Type</label>
                            <select
                                value={form.setting_key}
                                onChange={(e) => setForm({ ...form, setting_key: e.target.value })}
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', backgroundColor: 'white' }}
                                required
                            >
                                <option value="school_name">🏫 School Name</option>
                                <option value="address">📍 Address</option>
                                <option value="phone">📞 Phone</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Value</label>
                            <input
                                type="text"
                                value={form.setting_value}
                                onChange={(e) => setForm({ ...form, setting_value: e.target.value })}
                                placeholder={
                                    form.setting_key === 'school_name' ? 'Bright Future School' :
                                    form.setting_key === 'address' ? '123 Main Street, Lahore' :
                                    '0300-1234567'
                                }
                                style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={loading} style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: loading ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'Saving...' : '💾 Save Setting'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Settings Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {fetching ? (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#718096' }}>Loading...</div>
                ) : settings.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', backgroundColor: 'white', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚙️</div>
                        <p style={{ color: '#718096' }}>No settings configured yet. Add your first one!</p>
                    </div>
                ) : (
                    settings.map((s) => {
                        const info = settingLabels[s.setting_key] || { label: s.setting_key, emoji: '⚙️' };
                        return (
                            <div key={s.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                borderLeft: '5px solid #667eea',
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{info.emoji}</div>
                                <p style={{ color: '#718096', fontSize: '13px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                                    {info.label}
                                </p>
                                <p style={{ color: '#1a202c', fontSize: '18px', fontWeight: '600', margin: 0, wordBreak: 'break-word' }}>
                                    {s.setting_value}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SchoolSettings;