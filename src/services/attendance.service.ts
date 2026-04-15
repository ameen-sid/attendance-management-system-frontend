import api from './api';

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getRecentActivity = async () => {
    const response = await api.get('/dashboard/activity');
    return response.data;
};

export const getAllEmployees = async () => {
    // This endpoint might need to be created in backend if not exists, 
    // or reused from an existing one. for now assuming we will need it for the full list.
    // Based on analysis, we might fallback to attendance logs for now or add a user route later.
    // For specific dashboard needs:
    return [];
};

export const getDailyAttendance = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const response = await api.get(`/attendance/daily?date=${dateStr}`);
    return response.data;
};

export const getEmployeeHistory = async (id: string, month: number, year: number) => {
    const response = await api.get(`/attendance/employee/${id}?month=${month}&year=${year}`);
    return response.data;
};

export const getClientHistory = async (id: string, month?: number, year?: number) => {
    const query = (month && year) ? `?month=${month}&year=${year}` : '';
    const response = await api.get(`/attendance/client/${id}${query}`);
    return response.data;
};
