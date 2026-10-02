import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// =================== COMPLAINTS ===================

export const createComplaint = async (data) => {
  const response = await api.post('/complaints', data);
  return response.data;
};

export const getMyComplaints = async (params = {}) => {
  const response = await api.get('/complaints/my', { params });
  return response.data;
};

export const getAllComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const updateComplaint = async (id, data) => {
  const response = await api.put(`/complaints/${id}`, data);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

// =================== CATEGORIES ===================

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export default api;

// =================== USERS / AGENTS ===================

export const getAgents = async () => {
  const response = await api.get('/users/agents');
  return response.data;
};

export const assignAgent = async (complaintId, agentId) => {
  const response = await api.patch(`/complaints/${complaintId}/assign`, { agentId });
  return response.data;
};

export const updatePriority = async (complaintId, priority) => {
  const response = await api.patch(`/complaints/${complaintId}/priority`, { priority });
  return response.data;
};

// =================== WORKFLOW (PHASE 5) ===================

export const startComplaint = async (id) => {
  const response = await api.patch(`/complaints/${id}/start`);
  return response.data;
};

export const addNote = async (id, note) => {
  const response = await api.post(`/complaints/${id}/notes`, { note });
  return response.data;
};

export const resolveComplaint = async (id, resolution) => {
  const response = await api.patch(`/complaints/${id}/resolve`, { resolution });
  return response.data;
};

export const escalateComplaint = async (id, note) => {
  const response = await api.patch(`/complaints/${id}/escalate`, { note });
  return response.data;
};

export const closeComplaint = async (id, note) => {
  const response = await api.patch(`/complaints/${id}/close`, { note });
  return response.data;
};

export const reopenComplaint = async (id, reason) => {
  const response = await api.patch(`/complaints/${id}/reopen`, { reason });
  return response.data;
};

export const getComplaintHistory = async (id) => {
  const response = await api.get(`/complaints/${id}/history`);
  return response.data;
};

// =================== DASHBOARDS & ANALYTICS (PHASE 7) ===================

export const getDashboardStats = async () => {
  const response = await api.get('/complaints/stats');
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};
