import api from './api';

export const employeeService = {
    getAll: async (page = 1, search = '') => {
        const response = await api.get(`/employee?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
        // Backend returns: { statusCode: 200, data: { employees: [], total: 0, ... }, ... }
        // We need to return structure expected by UI: { success: true, data: { employees, total, totalPages } }
        return {
            success: true,
            data: response.data.data
        };
    },

    create: async (data: any) => {
        const response = await api.post('/employee', data); // Corrected from /auth/register to /employee
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.put(`/employee/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/employee/${id}`);
        return response.data;
    }
};
