import axios from 'axios';

// ✅ Use environment variable (Vite)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000, // increased for Render cold start
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Optional: Request interceptor (debugging)
api.interceptors.request.use((config) => {
  console.log(`📡 API Request → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// ✅ Optional: Response interceptor (error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🔥 API Error:', error?.response?.data || error.message);

    return Promise.reject(
      error?.response?.data || { message: 'Something went wrong' }
    );
  }
);

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