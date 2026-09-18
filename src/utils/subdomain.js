export const getSubdomain = () => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Localhost → null
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
        return null;
    }

    // Vercel URL → path-based check
    if (hostname.includes('vercel.app')) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length > 0 && !['login', 'superadmin', 'admin', 'teacher', 'student'].includes(parts[0])) {
            return parts[0];
        }
        return null;
    }

    // Real domain → subdomain check
    const hostParts = hostname.split('.');
    if (hostParts.length >= 3 && hostParts[0] !== 'www') {
        return hostParts[0];
    }

    return null;
};