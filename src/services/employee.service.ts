import api from './api';
import type { User, PaginatedResponse, ApiResponse } from '../types';

export const employeeService = {
    getAll: async (page: number = 1, search: string = ''): Promise<{ success: boolean; data: PaginatedResponse<User> }> => {
        const response = await api.get<ApiResponse<PaginatedResponse<User>>>(`/employee?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
        // Backend returns: { statusCode: 200, data: { employees: [], total: 0, ... }, ... }
        // We need to return structure expected by UI: { success: true, data: { employees, total, totalPages } }
        return {
            success: true,
            data: response.data.data
        };
    },

    create: async (data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
        const response = await api.post<ApiResponse<User>>('/employee', data);
        return response.data;
    },

    update: async (id: number, data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>(`/employee/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/employee/${id}`);
        return response.data;
    }
};