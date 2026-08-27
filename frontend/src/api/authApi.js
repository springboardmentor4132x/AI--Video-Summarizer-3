import { apiClient } from './client';

export const registerUser = async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

// src/api/authApi.js
/*export const registerUser = async (userData) => {
    // TEMPORARY MOCK FOR TESTING FRONTEND UI
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ message: "User registered successfully" });
        }, 500);
    });
};*/