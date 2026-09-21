import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,   // ✅ Cookies automatically bhejo
});

// ═══════════════════════════════════════════════════════════════
//  REQUEST INTERCEPTOR — Kuch nahi karna, cookies auto
// ═══════════════════════════════════════════════════════════════
api.interceptors.request.use(
    (config) => {
        // ✅ Cookies automatically bhejta hai browser
        // ❌ Koi token header nahi
        return config;
    },
    (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════════════════════════
//  RESPONSE INTERCEPTOR — 401 par refresh token try karo
// ═══════════════════════════════════════════════════════════════

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onTokenRefreshed() {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ✅ 401 par refresh token try karo (ek baar)
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh') &&
            !originalRequest.url.includes('/auth/login')
        ) {
            if (isRefreshing) {
                // Wait karo jab tak refresh ho jaye
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // ✅ Refresh token se naya access token lo
                await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                isRefreshing = false;
                onTokenRefreshed();

                // Original request retry karo
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];

                // ❌ Refresh bhi fail — logout
                if (!window.location.pathname.includes('/login')) {
                    const slug = window.location.pathname.split('/').filter(Boolean)[0];
                    const isSlug = slug && !['superadmin', 'admin', 'teacher', 'student', 'login'].includes(slug);
                    window.location.href = isSlug ? `/${slug}/login` : '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;