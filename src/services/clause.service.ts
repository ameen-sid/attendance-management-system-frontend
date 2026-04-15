import api from './api';
import type { ApiResponse, ClauseCategory, Clause } from '../types';

export const clauseService = {
    // Categories
    getCategories: async (): Promise<ApiResponse<ClauseCategory[]>> => {
        const response = await api.get<ApiResponse<ClauseCategory[]>>('/clause/categories');
        return response.data;
    },
    createCategory: async (data: { name: string; order?: number }): Promise<ApiResponse<ClauseCategory>> => {
        const response = await api.post<ApiResponse<ClauseCategory>>('/clause/categories', data);
        return response.data;
    },
    updateCategory: async (id: number, data: { name?: string; order?: number }): Promise<ApiResponse<ClauseCategory>> => {
        const response = await api.put<ApiResponse<ClauseCategory>>(`/clause/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/clause/categories/${id}`);
        return response.data;
    },

    // Clauses
    createClause: async (data: { title: string; order?: number; categoryId: number }): Promise<ApiResponse<Clause>> => {
        const response = await api.post<ApiResponse<Clause>>('/clause', data);
        return response.data;
    },
    updateClause: async (id: number, data: { title?: string; order?: number; categoryId?: number }): Promise<ApiResponse<Clause>> => {
        const response = await api.put<ApiResponse<Clause>>(`/clause/${id}`, data);
        return response.data;
    },
    deleteClause: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/clause/${id}`);
        return response.data;
    }
};