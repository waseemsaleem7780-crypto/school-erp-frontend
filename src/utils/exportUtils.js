import api from '../api/axios';

/**
 * Download Excel file from API endpoint
 */
export const downloadExcel = async (endpoint, filename) => {
    try {
        const response = await api.get(endpoint, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Export failed:', error);
        return {
            success: false,
            error: error.response?.data?.detail || 'Export failed',
        };
    }
};