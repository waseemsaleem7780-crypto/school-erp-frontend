import api from './axios';

export const studentsApi = {
    create: (data) => api.post('/students/', data),
    getByClass: (classId) => api.get(`/students/${classId}`),
};