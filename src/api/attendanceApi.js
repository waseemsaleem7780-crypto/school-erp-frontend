import api from './axios';

export const attendanceApi = {
    create: (data) => api.post('/attendance/', data),
    getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
};