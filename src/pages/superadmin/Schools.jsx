cat > src/pages/superadmin/Schools.jsx << 'EOF'
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

    const [form, setForm] = useState({
        name: '',
        subdomain: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        phone: '',
        address: '',
    });

    const [fullForm, setFullForm] = useState({
        name: '',
        subdomain: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        phone: '',
        address: '',
        num_classes: 10,
        num_sections: 3,
        num_teachers: 30,
        num_students: 100,
    });

    useEffect(() => {
        fetchAll();
    }, []);

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
        return value
            .toLowerCase()
            .replace(/\s/g, '-')
            .replace(/\./g, '')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                await api.put(`/schools/${editingId}`, {
                    name: form.name,
                    subdomain: form.subdomain,
                    admin_email: form.admin_email,
                    phone: form.phone,
                    address: form.address,
                });
                setMessage({ type: 'success', text: 'School updated! ✅' });
                setShowForm(false);
                setEditingId(null);
                setForm({ name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '', phone: '', address: '' });
                fetchAll();
            } else {
                const res = await api.post('/schools/with-admin', form);
                setCreatedSchool(res.data);
                setMessage({ type: 'success', text: 'School created! ✅' });
                setShowForm(false);
                setForm({ name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '', phone: '', address: '' });
                fetchAll();
            }
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to save school',
            });
        }
    };

    const handleFullSetup = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: 'Creating school... please wait' });

        try {
            const res = await api.post('/schools/full-setup', fullForm);
            setCreatedSchool({ ...res.data, isFullSetup: true });
            setMessage({ type: 'success', text: 'School created successfully! ✅' });
            setShowForm(false);
            setFullForm({
                name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '',
                phone: '', address: '', num_classes: 10, num_sections: 3, num_teachers: 30, num_students: 100,
            });
            fetchAll();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to create school',
            });
        }
    };

    const handleEdit = (school) => {
        setForm({
            name: school.name,
            subdomain: school.subdomain || '',
            admin_name: '',
            admin_email: school.admin_email || '',
            admin_password: '',
            phone: school.phone || '',
            address: school.address || '',
        });
        setEditingId(school.id);
        setShowForm(true);
        setCreatedSchool(null);
        setSetupMode('manual');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this school?')) return;
        try {
            await api.delete(`/schools/${id}`);
            setMessage({ type: 'success', text: 'School deleted! ✅' });
            fetchAll();
        } catch (error) {
            setMessage({ type: 'error', text: 'Delete failed' });
        }
    };

    const handleCancel = () => {
        setForm({ name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '', phone: '', address: '' });
        setFullForm({
            name: '', subdomain: '', admin_name: '', admin_email: '', admin_password: '',
            phone: '', address: '', num_classes: 10, num_sections: 3, num_teachers: 30, num_students: 100,
        });
        setEditingId(null);
        setShowForm(false);
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

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString + 'Z');
            return date.toLocaleString('en-PK', {
                timeZone: 'Asia/Karachi',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#1a202c', margin: '0 0 8px 0' }}>
                    🏫 Schools Management
                </h1>
                <p style={{ color: '#718096', margin: 0 }}>
                    Super Admin — Manage all schools on the platform
                </p>
            </div>

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

            {createdSchool && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #48bb78' }}>
                    <h3 style={{ marginTop: 0, color: '#22543d' }}>✅ School Created!</h3>
                    <p style={{ color: '#718096' }}>Ye credentials admin ko bhejo:</p>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>🔗 LOGIN URL</label>
                        <div style={{ padding: '12px 16px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                            <code style={{ fontSize: '13px', wordBreak: 'break-all' }}>{createdSchool.login_url}</code>
                        </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>📧 EMAIL</label>
                        <div style={{ padding: '12px 16px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                            <code style={{ fontSize: '14px' }}>{createdSchool.admin_email}</code>
                        </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>🔑 PASSWORD</label>
                        <div style={{ padding: '12px 16px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                            <code style={{ fontSize: '14px' }}>{createdSchool.admin_password}</code>
                        </div>
                    </div>
                    <button onClick={() => setCreatedSchool(null)} style={{ padding: '8px 16px', fontSize: '13px', color: '#718096', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>Close</button>
                </div>
            )}

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
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>School Name *</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Subdomain *</label>
                                    <input type="text" value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: cleanSubdomain(e.target.value) })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                                </div>
                                {!editingId && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Admin Name *</label>
                                            <input type="text" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Admin Password *</label>
                                            <input type="text" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required minLength={8} />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Admin Email *</label>
                                    <input type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Phone</label>
                                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#4a5568' }}>Address</label>
                                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <button type="submit" style={{ padding: '14px 32px', fontSize: '15px', fontWeight: '600', color: 'white', background: '#48bb78', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                                        {editingId ? '💾 Update School' : '💾 Create School + Admin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

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
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>ID</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Subdomain</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Plan</th>
                                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#4a5568', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schools.map((s) => (
                                        <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px 24px', color: '#718096' }}>#{s.id}</td>
                                            <td style={{ padding: '16px 24px', color: '#1a202c', fontWeight: '600' }}>{s.name}</td>
                                            <td style={{ padding: '16px 24px', color: '#718096', fontFamily: 'monospace' }}>{s.subdomain || '—'}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: s.subscription_plan === 'trial' ? '#fefcbf' : '#c6f6d5', color: s.subscription_plan === 'trial' ? '#744210' : '#22543d' }}>{s.subscription_plan}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleEdit(s)} style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#667eea', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                                                    <button onClick={() => handleDelete(s.id)} style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: 'white', background: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Delete</button>
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
        </div>
    );
};

export default SuperAdminSchools;
EOF