import axios from 'axios';

// Use environment variable for API URL (set by Railway)
// Falls back to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

console.log('API Base URL:', API_BASE_URL);

// Authentication
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const logout = () => api.post('/auth/logout');
export const verifyToken = () => api.get('/auth/verify');

// Products
export const getProducts = () => api.get('/products');
export const getProductsWithStock = () => api.get('/products?with_stock=true');

// Messes
export const getMesses = () => api.get('/messes');

// Inventory
export const addStock = (data) => api.post('/inventory', data);
export const getInventory = () => api.get('/inventory');

// Distributions
export const createDistribution = (data) => api.post('/distributions', data);
export const getDistributions = () => api.get('/distributions');
export const getDetailedDistributionsByMess = () => api.get('/distributions/by-mess-detailed');

// Dashboard
export const getDashboardMetrics = () => api.get('/dashboard/metrics');
export const getCurrentStock = () => api.get('/dashboard/stock');
export const getProfitAnalysisByProduct = () => api.get('/dashboard/profit/analysis');
export const getProfitSummary = () => api.get('/dashboard/profit/summary');

// Payments
export const createPayment = (data) => api.post('/payments', data);
export const getPayments = () => api.get('/payments');
export const getPaymentsByMess = (messId) => api.get(`/payments/mess/${messId}`);
export const getMessFinancialSummary = (messId) => api.get(`/payments/mess/${messId}/summary`);
export const getAllMessFinancialSummaries = () => api.get('/payments/summaries/all');
export const deletePayment = (id) => api.delete(`/payments/${id}`);

// Attendants
export const getAttendants = () => api.get('/attendants');
export const getAttendantsByMess = (messId) => api.get(`/attendants/mess/${messId}`);
export const createAttendant = (data) => api.post('/attendants', data);

export default api;
