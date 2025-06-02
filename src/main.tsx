import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';
import './components/responsiveUtils.css';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Add request interceptor to handle authorization
axios.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or invalid token
      if (error.response.data?.tokenExpired || error.response.data?.message === 'Invalid token') {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e3f',
              color: '#fff',
              border: '1px solid #4f46e5',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#1e1e3f',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1e1e3f',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);