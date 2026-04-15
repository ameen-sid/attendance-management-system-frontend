import api from './axios';

export const employeeService = {
  getAll: async (page: number, search: string) => {
    const { data } = await api.get(`/employees?page=${page}&limit=8&search=${search}`);
    return data; // Returns { success, data: { employees, total, totalPages } }
  },
  create: async (employeeData: any) => {
    const { data } = await api.post('/employees', employeeData);
    return data;
  },
  update: async (id: number, employeeData: any) => {
    const { data } = await api.put(`/employees/${id}`, employeeData);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/employees/${id}`);
    return data;
  }
};