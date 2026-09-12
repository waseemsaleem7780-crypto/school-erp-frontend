import api from './axios';

export const classesApi = {
    create: (data) => api.post('/classes/', data),
    getAll: () => api.get('/classes/'),
};