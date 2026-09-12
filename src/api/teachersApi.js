import api from './axios';

export const teachersApi = {
    create: (data) => api.post('/teachers/', data),
    getAll: () => api.get('/teachers/'),
};