import { useState, useEffect } from 'react';
import api from '../../api/axios';

const SuperAdminSchools = () => {
    const [schools, setSchools] = useState([]);
    const [stats, setStats] = useState(null);
    const [adminActivity, setAdminActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeTab, setActiveTab] = useState('schools');
    const [createdSchool, setCreatedSchool] = useState(null);
    const [setupMode, setSetupMode] = useState('manual');

    // ✅ Mode change modal
    const [modeModalSchool, setModeModalSchool] = useState(null);
    const [newMode, setNewMode] = useState('');
    const [modeSaving, setModeSaving] = useState(false);

    const [form, setForm] = useState({
        name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '',
        phone: '', address: '',
        institute_type: 'school',   // ✅ NEW
        whatsapp_provider: '', whatsapp_number: '',
        whatsapp_account_sid: '', whatsapp_auth_token: '',
        whatsapp_api_key: '', whatsapp_phone_id: '',
    });

    const [fullForm, setFullForm] = useState({
        name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '',
        phone: '', address: '', num_classes: 10, num_sections: 3, num_teachers: 30, num_students: 100,
    });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [schoolsRes, statsRes, activityRes] = await Promise.all([
                api.get('/schools/'),
                api.get('/schools/stats'),
                api.get('/schools/admin-activity'),
            ]);
            setSchools(schoolsRes.data);
            setStats(statsRes.data);
            setAdminActivity(activityRes.data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const cleanSubdomain = (value) => {
        return value.toLowerCase().replace(/\s/g, '-').replace(/\./g, '').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    };

    const resetForm = () => {
        setForm({
            name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '',
            phone: '', address: '', institute_type: 'school',
            whatsapp_provider: '', whatsapp_number: '',
            whatsapp_account_sid: '', whatsapp_auth_token: '',
            whatsapp_api_key: '', whatsapp_phone_id: '',
        });
    };

    // ✅ MODE CHANGE
    const handleOpenModeModal = (school) => {
        setModeModalSchool(school);
        setNewMode(school.institute_type || 'school');
    };

    const handleSaveMode = async () => {
        if (!modeModalSchool) return;
        setModeSaving(true);
        try {
            await api.put(`/schools/${modeModalSchool.id}/institute-type`, {
                institute_type: newMode,
            });
            setMessage({ type: 'success', text: `✅ ${modeModalSchool.name} ka mode "${newMode}" set ho gaya!` });
            setModeModalSchool(null);
            fetchAll();
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update mode' });
        } finally {
            setModeSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            if (editingId) {
                await api.put(`/schools/${editingId}`, {
                    name: form.name, subdomain: form.subdomain, admin_email: form.admin_email,
                    phone: form.phone, address: form.address,
                    whatsapp_provider: form.whatsapp_provider || null,
                    whatsapp_number: form.whatsapp_number || null,
                    whatsapp_account_sid: form.whatsapp_account_sid || null,
                    whatsapp_auth_token: form.whatsapp_auth_token || null,
                    whatsapp_api_key: form.whatsapp_api_key || null,
                    whatsapp_phone_id: form.whatsapp_phone_id || null,
                });
                setMessage({ type: 'success', text: 'School updated! ✅' });
                setShowForm(false); setEditingId(null); resetForm(); fetchAll();
            } else {
                const res = await api.post('/schools/with-admin', form);
                setCreatedSchool(res.data);
                setMessage({ type: 'success', text: 'School created! ✅' });
                setShowForm(false); resetForm(); fetchAll();
            }
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save school' });
        }
    };

    const handleFullSetup = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: 'Creating school with teachers and students... (may take 1-2 min)' });
        try {
            const res = await api.post('/schools/full-setup', fullForm);
            setCreatedSchool({ ...res.data, isFullSetup: true });
            setMessage({ type: 'success', text: `School created with ${res.data.total_students || 0} students and ${res.data.total_teachers || 0} teachers! ✅` });
            setShowForm(false);
            setFullForm({ name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '', phone: '', address: '', num_classes: 10, num_sections: 3, num_teachers: 30, num_students: 100 });
            fetchAll();
            setTimeout(() => setMessage({ type: '', text: '' }), 8000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to create school' });
        }
    };

    const handleEdit = (school) => {
        setForm({
            name: school.name, subdomain: school.subdomain || '',
            admin_name: '', admin_email: school.admin_email || '', admin_password: '',
            phone: school.phone || '', address: school.address || '',
            institute_type: school.institute_type || 'school',
            whatsapp_provider: school.whatsapp_provider || '',
            whatsapp_number: school.whatsapp_number || '',
            whatsapp_account_sid: school.whatsapp_account_sid || '',
            whatsapp_auth_token: '', whatsapp_api_key: '',
            whatsapp_phone_id: school.whatsapp_phone_id || '',
        });
        setEditingId(school.id);
        setShowForm(true);
        setCreatedSchool(null);
        setSetupMode('manual');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Kya aap waqai ye school delete karna chahte ho?')) return;
        try {
            await api.delete(`/schools/${id}`);
            setMessage({ type: 'success', text: 'School deleted! ✅' });
            fetchAll();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed' });
        }
    };

    const handleCancel = () => {
        resetForm();
        setFullForm({ name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '', phone: '', address: '', num_classes: 10, num_sections: 3, num_teachers: 30, num_students: 100 });
        setEditingId(null); setShowForm(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return { bg: '#c6f6d5', color: '#22543d', icon: '✅' };
            case 'inactive': return { bg: '#fefcbf', color: '#744210', icon: '⚠️' };
            case 'dormant': return { bg: '#fed7d7', color: '#742a2a', icon: '❌' };
            case 'never': return { bg: '#e2e8f0', color: '#4a5568', icon: '🆕' };
            default: return { bg: '#e2e8f0', color: '#4a5568', icon: '•' };
        }
    };

    const getModeIcon = (mode) => {
        const icons = { school: '🏫', academy: '📚', college: '🎓', madrassa: '🕌' };
        return icons[mode] || '🏫';
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString + 'Z');
            return date.toLocaleString('en-PK', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { return dateString; }
    };

    const inputStyle = { width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>🏫 Schools Management</h1>
                <p style={{ color: '#718096', margin: 0 }}>Super Admin — Manage all schools on the platform</p>
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '24px', color: 'white' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏫</div>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Total Schools</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>{stats.total_schools}</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', borderRadius: '16px', padding: '24px', color: 'white' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>👨‍💼</div>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Total Admins</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>{stats.total_admins}</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)', borderRadius: '16px', padding: '24px', color: 'white' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>👨‍🎓</div>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Total Students</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '32px', fontWeight: 'bold' }}>{stats.total_students}</p>
                    </div>
                </div>
            )}

            {/* Created School Credentials */}
            {createdSchool && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #48bb78' }}>
                    <h3 style={{ marginTop: 0, color: '#22543d' }}>✅ School Created Successfully!</h3>
                    <p style={{ color: '#718096', marginBottom: '20px' }}>Ye credentials school admin ko bhejo:</p>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>🔗 LOGIN URL</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <code style={{ flex: 1, fontSize: '13px', color: '#2d3748', wordBreak: 'break-all' }}>{createdSchool.login_url}</code>
                            <button onClick={() => { navigator.clipboard.writeText(createdSchool.login_url); alert('URL copied!'); }} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '600', color: 'white', background: '#667eea', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📋 Copy</button>
                        </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>📧 EMAIL</label>
                        <div style={{ padding: '12px 16px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}><code style={{ fontSize: '14px', color: '#2d3748' }}>{createdSchool.admin_email}</code></div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>🔑 PASSWORD</label>
                        <div style={{ padding: '12px 16px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}><code style={{ fontSize: '14px', color: '#2d3748' }}>{createdSchool.admin_password}</code></div>
                    </div>
                    <button onClick={() => setCreatedSchool(null)} style={{ marginTop: '12px', padding: '8px 16px', fontSize: '13px', color: '#718096', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>Close</button>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 'fit-content' }}>
                <button onClick={() => setActiveTab('schools')} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeTab === 'schools' ? '#667eea' : 'transparent', color: activeTab === 'schools' ? 'white' : '#4a5568' }}>🏫 Schools ({schools.length})</button>
                <button onClick={() => setActiveTab('admins')} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeTab === 'admins' ? '#667eea' : 'transparent', color: activeTab === 'admins' ? 'white' : '#4a5568' }}>👨‍💼 Admin Activity ({adminActivity.length})</button>
            </div>

            {message.text && (
                <div style={{ padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', backgroundColor: message.type === 'success' ? '#c6f6d5' : message.type === 'error' ? '#fed7d7' : '#bee3f8', color: message.type === 'success' ? '#22543d' : message.type === 'error' ? '#c53030' : '#2c5282' }}>{message.text}</div>
            )}

            {activeTab === 'schools' && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <button onClick={() => { setShowForm(!showForm); setCreatedSchool(null); }} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                            {showForm ? '✕ Cancel' : '+ Add School'}
                        </button>
                    </div>

                    {showForm && (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ marginTop: 0, color: '#1a202c' }}>{editingId ? 'Edit School' : 'Add New School'}</h3>

                            {!editingId && (
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f7fafc', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
                                    <button type="button" onClick={() => setSetupMode('manual')} style={{ padding: '8px 20px', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', background: setupMode === 'manual' ? '#667eea' : 'transparent', color: setupMode === 'manual' ? 'white' : '#4a5568' }}>📝 Manual</button>
                                    <button type="button" onClick={() => setSetupMode('full')} style={{ padding: '8px 20px', fontSize: '14px', fontWeight: '600', border: 'none', borderRadius: '8px', cursor: 'pointer', background: setupMode === 'full' ? '#667eea' : 'transparent', color: setupMode === 'full' ? 'white' : '#4a5568' }}>🚀 Full Setup (1 Click)</button>
                                </div>
                            )}

                            {setupMode === 'manual' && (
                                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>School Name *</label>
                                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Subdomain *</label>
                                        <input type="text" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: cleanSubdomain(e.target.value) })} style={inputStyle} required />
                                    </div>

                                    {/* ✅ Institute Type Dropdown */}
                                    <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: '#f0f4ff', borderRadius: '10px', border: '1px solid #c3dafe' }}>
                                        <label style={labelStyle}>🎛️ Institute Type *</label>
                                        <select value={form.institute_type} onChange={(e) => setForm({ ...form, institute_type: e.target.value })} style={inputStyle}>
                                            <option value="school">🏫 School — Class, Section, Teacher</option>
                                            <option value="academy">📚 Academy / Coaching — Batch, Slot, Instructor</option>
                                            <option value="college">🎓 College — Program, Group, Faculty</option>
                                            <option value="madrassa">🕌 Madrassa — Level, Group, Ustad</option>
                                        </select>
                                        <p style={{ fontSize: '12px', color: '#4a5568', margin: '8px 0 0 0' }}>ℹ️ Ye school ka terminology set karega</p>
                                    </div>

                                    {!editingId && (
                                        <>
                                            <div>
                                                <label style={labelStyle}>Admin Name *</label>
                                                <input type="text" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })} style={inputStyle} required />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Admin Password *</label>
                                                <input type="text" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} style={inputStyle} required minLength={8} />
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label style={labelStyle}>Admin Email *</label>
                                        <input type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Phone</label>
                                        <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Address</label>
                                        <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} />
                                    </div>

                                    {/* WhatsApp Config */}
                                    <div style={{ gridColumn: '1 / -1', marginTop: '16px', padding: '16px', backgroundColor: '#f0fff4', borderRadius: '10px', border: '1px solid #9ae6b4' }}>
                                        <h4 style={{ margin: '0 0 16px 0', color: '#22543d' }}>📱 WhatsApp Configuration (Optional)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                            <div>
                                                <label style={labelStyle}>WhatsApp Provider</label>
                                                <select value={form.whatsapp_provider || ''} onChange={(e) => setForm({ ...form, whatsapp_provider: e.target.value })} style={inputStyle}>
                                                    <option value="">Select Provider</option>
                                                    <option value="twilio">Twilio</option>
                                                    <option value="wab2c">WAB2C</option>
                                                    <option value="meta">Meta Cloud API</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>WhatsApp Number</label>
                                                <input type="text" value={form.whatsapp_number || ''} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="+92 300 1234567" style={inputStyle} />
                                            </div>
                                        </div>
                                        {form.whatsapp_provider === 'twilio' && (
                                            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                                <div><label style={labelStyle}>Twilio Account SID</label><input type="text" value={form.whatsapp_account_sid || ''} onChange={(e) => setForm({ ...form, whatsapp_account_sid: e.target.value })} placeholder="ACxxxx..." style={inputStyle} /></div>
                                                <div><label style={labelStyle}>Twilio Auth Token</label><input type="text" value={form.whatsapp_auth_token || ''} onChange={(e) => setForm({ ...form, whatsapp_auth_token: e.target.value })} placeholder="xxxx..." style={inputStyle} /></div>
                                            </div>
                                        )}
                                        {form.whatsapp_provider === 'wab2c' && (
                                            <div style={{ marginTop: '16px' }}>
                                                <label style={labelStyle}>WAB2C API Key</label>
                                                <input type="text" value={form.whatsapp_api_key || ''} onChange={(e) => setForm({ ...form, whatsapp_api_key: e.target.value })} placeholder="wab2c_xxxx..." style={inputStyle} />
                                            </div>
                                        )}
                                        {form.whatsapp_provider === 'meta' && (
                                            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                                <div><label style={labelStyle}>Meta Access Token</label><input type="text" value={form.whatsapp_api_key || ''} onChange={(e) => setForm({ ...form, whatsapp_api_key: e.target.value })} placeholder="EAAxxxx..." style={inputStyle} /></div>
                                                <div><label style={labelStyle}>Phone Number ID</label><input type="text" value={form.whatsapp_phone_id || ''} onChange={(e) => setForm({ ...form, whatsapp_phone_id: e.target.value })} placeholder="112083..." style={inputStyle} /></div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <button type="submit" style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: '#48bb78', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                                            {editingId ? '💾 Update School' : '💾 Create School + Admin'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {setupMode === 'full' && !editingId && (
                                <div>
                                    <div style={{ backgroundColor: '#e6fffa', border: '1px solid #81e6d9', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#285e61' }}>
                                        🚀 <strong>Full Setup:</strong> 1 click pe school + admin + teachers + students + classes sab ban jayenge!
                                    </div>
                                    <form onSubmit={handleFullSetup} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        <div><label style={labelStyle}>School Name *</label><input type="text" value={fullForm.name} onChange={(e) => setFullForm({ ...fullForm, name: e.target.value })} style={inputStyle} required /></div>
                                        <div><label style={labelStyle}>Subdomain *</label><input type="text" value={fullForm.subdomain} onChange={(e) => setFullForm({ ...fullForm, subdomain: cleanSubdomain(e.target.value) })} style={inputStyle} required /></div>
                                        <div><label style={labelStyle}>Admin Name *</label><input type="text" value={fullForm.admin_name} onChange={(e) => setFullForm({ ...fullForm, admin_name: e.target.value })} style={inputStyle} required /></div>
                                        <div><label style={labelStyle}>Admin Email *</label><input type="email" value={fullForm.admin_email} onChange={(e) => setFullForm({ ...fullForm, admin_email: e.target.value })} style={inputStyle} required /></div>
                                        <div><label style={labelStyle}>Admin Password *</label><input type="text" value={fullForm.admin_password} onChange={(e) => setFullForm({ ...fullForm, admin_password: e.target.value })} style={inputStyle} required minLength={8} /></div>
                                        <div><label style={labelStyle}>Phone</label><input type="text" value={fullForm.phone} onChange={(e) => setFullForm({ ...fullForm, phone: e.target.value })} style={inputStyle} /></div>
                                        <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                                            <h4 style={{ color: '#1a202c', marginBottom: '12px' }}>🚀 Auto-Generate</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                                <div><label style={labelStyle}>Classes</label><input type="number" value={fullForm.num_classes} onChange={(e) => setFullForm({ ...fullForm, num_classes: parseInt(e.target.value) || 10 })} min={1} max={20} style={inputStyle} /></div>
                                                <div><label style={labelStyle}>Sections/Class</label><input type="number" value={fullForm.num_sections} onChange={(e) => setFullForm({ ...fullForm, num_sections: parseInt(e.target.value) || 3 })} min={1} max={5} style={inputStyle} /></div>
                                                <div><label style={labelStyle}>Teachers</label><input type="number" value={fullForm.num_teachers} onChange={(e) => setFullForm({ ...fullForm, num_teachers: parseInt(e.target.value) || 30 })} min={1} max={100} style={inputStyle} /></div>
                                                <div><label style={labelStyle}>Students</label><input type="number" value={fullForm.num_students} onChange={(e) => setFullForm({ ...fullForm, num_students: parseInt(e.target.value) || 100 })} min={1} max={1000} style={inputStyle} /></div>
                                            </div>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={labelStyle}>Address</label>
                                            <input type="text" value={fullForm.address} onChange={(e) => setFullForm({ ...fullForm, address: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <button type="submit" style={{ padding: '16px 48px', fontSize: '16px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}>
                                                🚀 Create School (1 Click Setup)
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Schools Table */}
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, color: '#1a202c' }}>All Schools ({schools.length})</h3>
                        </div>
                        {schools.length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                                <p style={{ color: '#718096' }}>No schools yet</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f7fafc' }}>
                                        <th style={{ textAlign: 'left', padding: '16px 20px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase' }}>ID</th>
                                        <th style={{ textAlign: 'left', padding: '16px 20px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '16px 20px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase' }}>Subdomain</th>
                                        <th style={{ textAlign: 'left', padding: '16px 20px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase' }}>Mode</th>
                                        <th style={{ textAlign: 'left', padding: '16px 20px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase' }}>Plan</th>
                                        <th style={{ textAlign: 'left', padding: '16px 20px', color: '#4a5568', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.map((s) => (
                                        <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px 20px', color: '#718096' }}>#{s.id}</td>
                                            <td style={{ padding: '16px 20px', color: '#1a202c', fontWeight: '600' }}>{s.name}</td>
                                            <td style={{ padding: '16px 20px', color: '#718096', fontFamily: 'monospace', fontSize: '13px' }}>{s.subdomain || '—'}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: '#ebf8ff', color: '#2c5282' }}>
                                                    {getModeIcon(s.institute_type || 'school')} {s.institute_type || 'school'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: s.subscription_plan === 'trial' ? '#fefcbf' : '#c6f6d5', color: s.subscription_plan === 'trial' ? '#744210' : '#22543d' }}>{s.subscription_plan}</span>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button onClick={() => handleOpenModeModal(s)} style={{ padding: '6px 10px', fontSize: '12px', fontWeight: '600', color: 'white', background: '#ed8936', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🎛️ Mode</button>
                                                    <button onClick={() => handleEdit(s)} style={{ padding: '6px 10px', fontSize: '12px', fontWeight: '600', color: 'white', background: '#667eea', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                                                    <button onClick={() => handleDelete(s.id)} style={{ padding: '6px 10px', fontSize: '12px', fontWeight: '600', color: 'white', background: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* Admin Activity Tab */}
            {activeTab === 'admins' && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: 0, color: '#1a202c' }}>Admin Activity ({adminActivity.length})</h3>
                    </div>
                    {adminActivity.length === 0 ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                            <p style={{ color: '#718096' }}>No admins found</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f7fafc' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Admin</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>School</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Last Login</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Logins</th>
                                    <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminActivity.map((admin) => {
                                    const statusStyle = getStatusColor(admin.status);
                                    return (
                                        <tr key={admin.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ color: '#1a202c', fontWeight: '600' }}>{admin.full_name}</div>
                                                <div style={{ color: '#718096', fontSize: '13px' }}>{admin.email}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#718096' }}>{admin.school_name || `School #${admin.school_id || '—'}`}</td>
                                            <td style={{ padding: '16px 24px', color: '#718096', fontSize: '13px' }}>{formatDateTime(admin.last_login)}</td>
                                            <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600' }}>{admin.login_count}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', background: statusStyle.bg, color: statusStyle.color }}>
                                                    {statusStyle.icon} {admin.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ✅ Mode Change Modal */}
            {modeModalSchool && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModeModalSchool(null)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>🎛️ Change Mode</h3>
                        <p style={{ color: '#718096', marginBottom: '20px', fontSize: '14px' }}>
                            <strong>{modeModalSchool.name}</strong> ka institute type change karo
                        </p>

                        <label style={labelStyle}>New Mode</label>
                        <select value={newMode} onChange={(e) => setNewMode(e.target.value)} style={{ ...inputStyle, marginBottom: '20px' }}>
                            <option value="school">🏫 School — Class, Section, Teacher</option>
                            <option value="academy">📚 Academy / Coaching — Batch, Slot, Instructor</option>
                            <option value="college">🎓 College — Program, Group, Faculty</option>
                            <option value="madrassa">🕌 Madrassa — Level, Group, Ustad</option>
                        </select>

                        <div style={{ padding: '12px 16px', background: '#fffaf0', borderRadius: '10px', border: '1px solid #fbd38d', marginBottom: '20px', fontSize: '13px', color: '#744210' }}>
                            ⚠️ <strong>Note:</strong> Mode change karne se school walon ko alag terminology dikhega — lekin data safe rahega.
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleSaveMode} disabled={modeSaving} style={{ flex: 1, padding: '14px', fontSize: '15px', fontWeight: '600', color: 'white', background: modeSaving ? '#a0aec0' : '#48bb78', border: 'none', borderRadius: '10px', cursor: modeSaving ? 'not-allowed' : 'pointer' }}>
                                {modeSaving ? 'Saving...' : '💾 Save Mode'}
                            </button>
                            <button onClick={() => setModeModalSchool(null)} style={{ padding: '14px 24px', fontSize: '15px', fontWeight: '600', color: '#4a5568', background: '#e2e8f0', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminSchools;