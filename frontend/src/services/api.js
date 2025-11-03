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

console.log('API Base URL:', API_BASE_URL);

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

export default api;
