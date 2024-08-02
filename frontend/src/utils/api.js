import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const login = (username, password) => 
  api.post('/login', { username, password });

export const register = (username, password) => 
  api.post('/register', { username, password });

export const getTests = () => api.get('/tests');

export const getTest = (testId) => api.get(`/tests/${testId}`);

export const submitTest = (testId, answers) =>
  api.post(`/tests/${testId}/submit`, { answers });

export const checkAnswer = (testId, questionId, optionId) =>
  api.post(`/tests/${testId}/check-answer`, { question_id: questionId, option_id: optionId });

export const getProfile = () => api.get('/profile');

export const getTestHistory = () => api.get('/test-history');

export const getUsers = () => api.get('/users');

export const createUser = (userData) => api.post('/users', userData);

export const updateUser = (userId, userData) => api.put(`/users/${userId}`, userData);

export const deleteUser = (userId) => api.delete(`/users/${userId}`);

export const getMaterials = (search, topic) => 
  api.get('/materials', { params: { search, topic } });

export const createMaterial = (materialData) => api.post('/materials', materialData);

export const updateMaterial = (materialId, materialData) => 
  api.put(`/materials/${materialId}`, materialData);

export const deleteMaterial = (materialId) => api.delete(`/materials/${materialId}`);

export const getTopics = () => api.get('/materials/topics');

export const getStatistics = () => api.get('/admin/statistics');

export default api;