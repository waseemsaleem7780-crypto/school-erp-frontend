// src/utils/authStorage.js
// ═══════════════════════════════════════════════════════════════
//  Multi-Role Auth Storage — Per-Role + Per-Tab Tokens
// ═══════════════════════════════════════════════════════════════

const ROLES = ['super_admin', 'admin', 'teacher', 'student'];

// ───────────────────────────────────────────
// 1. URL se current role detect karo
// ───────────────────────────────────────────
export const detectRoleFromUrl = (path = window.location.pathname) => {
    if (path.includes('/superadmin/')) return 'super_admin';
    if (path.includes('/admin/')) return 'admin';
    if (path.includes('/teacher/')) return 'teacher';
    if (path.includes('/student/')) return 'student';
    return null;
};

// ───────────────────────────────────────────
// 2. Per-tab ID (sessionStorage)
// ───────────────────────────────────────────
export const getTabId = () => {
    let tabId = sessionStorage.getItem('__tabId');
    if (!tabId) {
        tabId = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        sessionStorage.setItem('__tabId', tabId);
    }
    return tabId;
};

// ───────────────────────────────────────────
// 3. Role-specific token save
// ───────────────────────────────────────────
export const saveToken = (role, token) => {
    if (!role || !token) return;

    // ✅ Primary: role-specific key
    localStorage.setItem(`token_${role}`, token);

    // ✅ Per-tab: sessionStorage mein bhi rakho
    sessionStorage.setItem(`active_role`, role);
    sessionStorage.setItem(`token`, token);

    // ✅ Fallback: legacy key (purane code ke liye)
    localStorage.setItem('token', token);
    localStorage.setItem('last_role', role);
};

// ───────────────────────────────────────────
// 4. Active token read karo
// ───────────────────────────────────────────
export const getToken = () => {
    // ✅ Priority 1: sessionStorage (per-tab)
    const tabToken = sessionStorage.getItem('token');
    const tabRole = sessionStorage.getItem('active_role');

    if (tabToken && tabRole) {
        // Verify: ye token abhi bhi localStorage mein hai
        const storedToken = localStorage.getItem(`token_${tabRole}`);
        if (storedToken === tabToken) {
            return tabToken;
        }
    }

    // ✅ Priority 2: URL se role detect karke
    const urlRole = detectRoleFromUrl();
    if (urlRole) {
        const roleToken = localStorage.getItem(`token_${urlRole}`);
        if (roleToken) {
            // Session mein bhi set kar do
            sessionStorage.setItem('active_role', urlRole);
            sessionStorage.setItem('token', roleToken);
            return roleToken;
        }
    }

    // ✅ Priority 3: Legacy fallback
    return localStorage.getItem('token');
};

// ───────────────────────────────────────────
// 5. Current role
// ───────────────────────────────────────────
export const getActiveRole = () => {
    const tabRole = sessionStorage.getItem('active_role');
    if (tabRole) return tabRole;

    const urlRole = detectRoleFromUrl();
    if (urlRole) return urlRole;

    return localStorage.getItem('last_role');
};

// ───────────────────────────────────────────
// 6. Logout — sirf current role ka token hatao
// ───────────────────────────────────────────
export const clearToken = (role = null) => {
    const activeRole = role || getActiveRole();

    if (activeRole) {
        localStorage.removeItem(`token_${activeRole}`);
    }

    sessionStorage.removeItem('active_role');
    sessionStorage.removeItem('token');

    // ✅ Agar koi aur role ka token bacha hai, to legacy `token` set karo
    const remainingRole = ROLES.find((r) => localStorage.getItem(`token_${r}`));
    if (remainingRole) {
        localStorage.setItem('token', localStorage.getItem(`token_${remainingRole}`));
        localStorage.setItem('last_role', remainingRole);
    } else {
        // ✅ Koi role nahi — legacy bhi hatao
        localStorage.removeItem('token');
        localStorage.removeItem('last_role');
    }
};

// ───────────────────────────────────────────
// 7. Saare tokens delete (full reset)
// ───────────────────────────────────────────
export const clearAllTokens = () => {
    ROLES.forEach((r) => localStorage.removeItem(`token_${r}`));
    localStorage.removeItem('token');
    localStorage.removeItem('last_role');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    sessionStorage.removeItem('active_role');
    sessionStorage.removeItem('token');
};