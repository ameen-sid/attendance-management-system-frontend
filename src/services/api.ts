import axios from 'axios';

// Replace with your local machine's IP if testing on mobile, 
// but for Web-View on same machine 'localhost' works best.
// Ensure Backend is running on port 3000.
// NOTE: Vite proxying could also be used, but direct URL is simpler for now.
const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const currentPath = window.location.pathname;

        if (error.response?.status === 401 || error.response?.status === 403) {
            // Only auto-redirect to login if we're NOT already on the login page
            // This allows the Login component to handle its own errors and show the modal
            if (currentPath !== '/login') {
                // Token expired or invalid - redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
                window.location.href = '/login';
            }
            // If we're on login page, let the error propagate to the Login component
        }
        return Promise.reject(error);
    }
);

export default api;
