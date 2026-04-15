import api from './api';

export const clientService = {
    getAll: async (page = 1, search = '') => {
        const response = await api.get(`/client?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
        return {
            success: true,
            data: response.data.data
        };
    },

    getById: async (id: number) => {
        const response = await api.get(`/client/${id}`);
        return response.data;
    },

    create: async (data: { name: string; description?: string }) => {
        const response = await api.post('/client', data);
        return response.data;
    },

    update: async (id: number, data: { name?: string; description?: string }) => {
        const response = await api.put(`/client/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/client/${id}`);
        return response.data;
    }
};
