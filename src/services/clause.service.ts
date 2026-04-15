import api from './api';

export const clauseService = {
    // Categories
    getCategories: async () => {
        const response = await api.get('/clause/categories');
        return response.data;
    },
    createCategory: async (data: { name: string; order?: number }) => {
        const response = await api.post('/clause/categories', data);
        return response.data;
    },
    updateCategory: async (id: number, data: { name?: string; order?: number }) => {
        const response = await api.put(`/clause/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id: number) => {
        const response = await api.delete(`/clause/categories/${id}`);
        return response.data;
    },

    // Clauses
    createClause: async (data: { title: string; order?: number; categoryId: number }) => {
        const response = await api.post('/clause', data);
        return response.data;
    },
    updateClause: async (id: number, data: { title?: string; order?: number; categoryId?: number }) => {
        const response = await api.put(`/clause/${id}`, data);
        return response.data;
    },
    deleteClause: async (id: number) => {
        const response = await api.delete(`/clause/${id}`);
        return response.data;
    }
};
