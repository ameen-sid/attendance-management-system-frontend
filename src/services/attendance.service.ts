import api from './api';
import type { ApiResponse, DashboardStats, RecentActivity, Attendance, User, EmployeeHistoryResponse, ClientHistoryResponse } from '../types';

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
};

export const getRecentActivity = async (): Promise<ApiResponse<RecentActivity[]>> => {
    const response = await api.get<ApiResponse<RecentActivity[]>>('/dashboard/activity');
    return response.data;
};

export const getAllEmployees = async (): Promise<User[]> => {
    // This endpoint might need to be created in backend if not exists, 
    // or reused from an existing one. for now assuming we will need it for the full list.
    return [];
};


export const getDailyAttendance = async (date: Date): Promise<ApiResponse<Attendance[]>> => {
    const dateStr = date.toISOString().split('T')[0];
    const response = await api.get<ApiResponse<Attendance[]>>(`/attendance/daily?date=${dateStr}`);
    return response.data;
};

export const getEmployeeHistory = async (id: string, month: number, year: number): Promise<ApiResponse<EmployeeHistoryResponse>> => {
    const response = await api.get<ApiResponse<EmployeeHistoryResponse>>(`/attendance/employee/${id}?month=${month}&year=${year}`);
    return response.data;
};

export const getClientHistory = async (id: string, month?: number, year?: number): Promise<ApiResponse<ClientHistoryResponse>> => {
    const query = (month && year) ? `?month=${month}&year=${year}` : '';
    const response = await api.get<ApiResponse<ClientHistoryResponse>>(`/attendance/client/${id}${query}`);
    return response.data;
};