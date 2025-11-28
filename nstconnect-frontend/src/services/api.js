import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// REPLACE WITH YOUR LOCAL IP ADDRESS FOR ANDROID EMULATOR (e.g., 10.0.2.2) OR YOUR MACHINE IP FOR PHYSICAL DEVICE
// For iOS Simulator, localhost works.
const BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('[API Error Response]', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
            });
        } else if (error.request) {
            // Request made but no response received
            console.error('[API No Response]', {
                url: error.config?.url,
                method: error.config?.method,
                message: 'No response received from server',
            });
        } else {
            // Error setting up request
            console.error('[API Setup Error]', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
