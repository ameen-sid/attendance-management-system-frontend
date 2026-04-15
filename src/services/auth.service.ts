import api from './api';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
}

export const loginWeb = async (credentials: LoginCredentials): Promise<AxiosResponse> => {
    const response = await api.post('/auth/web/login', credentials);
    return response;
};

export const logout = async (): Promise<ApiResponse<Record<string, never>>> => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const updatePassword = async (data: UpdatePasswordData): Promise<ApiResponse<Record<string, never>>> => {
    const response = await api.post('/auth/update-password', data);
    return response.data;
};