// src/utils/authStorage.js
// ═══════════════════════════════════════════════════════════════
//  Auth Helpers — NO token storage (HTTP-Only cookies use hoti hain)
//  Sirf role detection + URL helpers
// ═══════════════════════════════════════════════════════════════

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
// 2. School slug detect karo URL se
// ───────────────────────────────────────────
export const detectSlugFromUrl = (path = window.location.pathname) => {
    const parts = path.split('/').filter(Boolean);
    if (
        parts.length >= 1 &&
        !['superadmin', 'admin', 'teacher', 'student', 'login', 'api'].includes(parts[0])
    ) {
        return parts[0];
    }
    return null;
};


// ───────────────────────────────────────────
// 3. Logout URL banao — slug preserve karo
// ───────────────────────────────────────────
export const getLoginUrl = () => {
    const slug = detectSlugFromUrl();
    return slug ? `/${slug}/login` : '/login';
};


// ───────────────────────────────────────────
// 4. Logout — sirf URL redirect (cookies backend clear karega)
// ───────────────────────────────────────────
export const clearToken = () => {
    // ❌ localStorage mein kuch nahi hai — cookies backend clear karega
    // ✅ Sirf redirect URL banao
    // Actual logout: backend ke /auth/logout endpoint ko call karo
};


// ───────────────────────────────────────────
// 5. Full reset (agar emergency mein kuch clear karna ho)
// ───────────────────────────────────────────
export const clearAllTokens = () => {
    // Kuch bhi localStorage mein store nahi — ye function no-op hai
    // Sirf legacy cleanup ke liye
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('last_role');
        ['super_admin', 'admin', 'teacher', 'student'].forEach((r) => {
            localStorage.removeItem(`token_${r}`);
        });
        sessionStorage.clear();
    } catch (e) {
        // Ignore errors
    }
};