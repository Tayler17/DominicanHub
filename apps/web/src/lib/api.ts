import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  products: {
    list: '/products',
    one: (slug: string) => `/products/${slug}`,
    categories: '/products/categories',
    myProducts: '/products/my-products',
  },
  vendors: {
    list: '/vendors',
    one: (id: string) => `/vendors/${id}`,
    dashboard: '/vendors/me/dashboard',
    create: '/vendors',
  },
};
