import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
    throw new Error('VITE_API_URL must be set before starting the frontend');
}

export const apiClient = axios.create({
    baseURL: apiUrl.replace(/\/$/, ''),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach JWT token to headers if available
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default apiClient;