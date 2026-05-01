import api from './api';
import type { ApiResponse, TaskCategory, Task } from '../types';

export const taskService = {
    // Categories
    getCategories: async (): Promise<ApiResponse<TaskCategory[]>> => {
        const response = await api.get<ApiResponse<TaskCategory[]>>('/task/categories');
        return response.data;
    },
    createCategory: async (data: { name: string; order?: number }): Promise<ApiResponse<TaskCategory>> => {
        const response = await api.post<ApiResponse<TaskCategory>>('/task/categories', data);
        return response.data;
    },
    updateCategory: async (id: number, data: { name?: string; order?: number }): Promise<ApiResponse<TaskCategory>> => {
        const response = await api.put<ApiResponse<TaskCategory>>(`/task/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/task/categories/${id}`);
        return response.data;
    },

    // Tasks
    createTask: async (data: { title: string; order?: number; categoryId: number }): Promise<ApiResponse<Task>> => {
        const response = await api.post<ApiResponse<Task>>('/task', data);
        return response.data;
    },
    updateTask: async (id: number, data: { title?: string; order?: number; categoryId?: number }): Promise<ApiResponse<Task>> => {
        const response = await api.put<ApiResponse<Task>>(`/task/${id}`, data);
        return response.data;
    },
    deleteTask: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/task/${id}`);
        return response.data;
    }
};
