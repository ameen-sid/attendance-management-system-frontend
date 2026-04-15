import api from './api';
import type { ApiResponse, CalendarEvent } from '../types';

export const getEvents = async (): Promise<ApiResponse<CalendarEvent[]>> => {
    const response = await api.get<ApiResponse<CalendarEvent[]>>('/event');
    return response.data;
};

export const createEvent = async (eventData: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> => {
    const response = await api.post<ApiResponse<CalendarEvent>>('/event', eventData);
    return response.data;
};

export const updateEvent = async (id: number, eventData: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> => {
    const response = await api.patch<ApiResponse<CalendarEvent>>(`/event/${id}`, eventData);
    return response.data;
};

export const deleteEvent = async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/event/${id}`);
    return response.data;
};