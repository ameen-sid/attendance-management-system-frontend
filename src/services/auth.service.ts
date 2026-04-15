import api from './api';

export const loginWeb = async (credentials: any) => {
    const response = await api.post('/auth/web/login', credentials);
    return response;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const updatePassword = async (data: any) => {
    const response = await api.post('/auth/update-password', data);
    return response.data;
};
