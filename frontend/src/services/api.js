import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ── Students ────────────────────────────────────────────────────
export const getStudents = async (params = {}) => {
  const { data } = await api.get('/students', { params });
  return data;
};

export const getStudentById = async (id) => {
  const { data } = await api.get(`/students/${id}`);
  return data;
};

// ── Analytics ───────────────────────────────────────────────────
export const getAnalytics = async () => {
  const { data } = await api.get('/analytics');
  return data;
};

// ── Predictions ─────────────────────────────────────────────────
export const predictPlacement = async (studentData) => {
  const { data } = await api.post('/predict', studentData);
  return data;
};

export const getFeatureImportance = async () => {
  const { data } = await api.get('/predict/feature-importance');
  return data;
};

export default api;
