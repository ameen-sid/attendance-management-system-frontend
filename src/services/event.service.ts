import axios from '../api/axios';

export const getEvents = async () => {
    return axios.get('/event');
};

export const createEvent = async (eventData: any) => {
    return axios.post('/event', eventData);
};

export const updateEvent = async (id: number, eventData: any) => {
    return axios.patch(`/event/${id}`, eventData);
};

export const deleteEvent = async (id: number) => {
    return axios.delete(`/event/${id}`);
};
