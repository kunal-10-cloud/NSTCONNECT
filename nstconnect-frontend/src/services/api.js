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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
