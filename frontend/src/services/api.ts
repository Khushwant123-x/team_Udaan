import axios from 'axios';
import { User, Manufacturer, Instrument, TestSession, DashboardStats } from '../types';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const manufacturerApi = {
  list: async (): Promise<Manufacturer[]> => {
    const response = await api.get('/manufacturers');
    return response.data;
  },
  create: async (data: Partial<Manufacturer>): Promise<Manufacturer> => {
    const response = await api.post('/manufacturers', data);
    return response.data;
  },
};

export const instrumentApi = {
  list: async (): Promise<Instrument[]> => {
    const response = await api.get('/instruments');
    return response.data;
  },
  get: async (id: number): Promise<Instrument> => {
    const response = await api.get(`/instruments/${id}`);
    return response.data;
  },
  create: async (data: Partial<Instrument>): Promise<Instrument> => {
    const response = await api.post('/instruments', data);
    return response.data;
  },
};

export const sessionApi = {
  list: async (statusFilter?: string): Promise<TestSession[]> => {
    const url = statusFilter ? `/sessions?status_filter=${statusFilter}` : '/sessions';
    const response = await api.get(url);
    return response.data;
  },
  get: async (id: number): Promise<TestSession> => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },
  create: async (data: any): Promise<TestSession> => {
    const response = await api.post('/sessions', data);
    return response.data;
  },
  update: async (id: number, data: any): Promise<TestSession> => {
    const response = await api.patch(`/sessions/${id}`, data);
    return response.data;
  },
  recordObservation: async (sessionId: number, testType: string, rawData: any) => {
    const response = await api.post(`/sessions/${sessionId}/observations`, {
      session_id: sessionId,
      test_type: testType,
      raw_data_json: rawData,
    });
    return response.data;
  },
  evaluateSession: async (sessionId: number): Promise<TestSession> => {
    const response = await api.post(`/sessions/${sessionId}/evaluate`);
    return response.data;
  },
  downloadPdf: async (sessionId: number) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OIML_R76_Report_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF report', err);
      alert('Failed to download PDF report');
    }
  },
  downloadDocx: async (sessionId: number) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/docx`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OIML_R76_Report_${sessionId}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download DOCX report', err);
      alert('Failed to download DOCX report');
    }
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
