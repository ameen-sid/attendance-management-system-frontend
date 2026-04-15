import api from './api';
import type { ApiResponse, Client, PaginatedResponse } from '../types';

export const clientService = {
    getAll: async (page: number = 1, search: string = ''): Promise<{ success: boolean; data: PaginatedResponse<Client> }> => {
        const response = await api.get<ApiResponse<PaginatedResponse<Client>>>(`/client?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
        return {
            success: true,
            data: response.data.data
        };
    },

    getById: async (id: number): Promise<ApiResponse<Client>> => {
        const response = await api.get<ApiResponse<Client>>(`/client/${id}`);
        return response.data;
    },

    create: async (data: { name: string; description?: string }): Promise<ApiResponse<Client>> => {
        const response = await api.post<ApiResponse<Client>>('/client', data);
        return response.data;
    },

    update: async (id: number, data: { name?: string; description?: string }): Promise<ApiResponse<Client>> => {
        const response = await api.put<ApiResponse<Client>>(`/client/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/client/${id}`);
        return response.data;
    }
};