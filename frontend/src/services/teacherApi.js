import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const teacherApi = axios.create({
  baseURL: API_BASE,
  timeout: 30000
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await teacherApi.post('/teacher/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
};

export default teacherApi;
