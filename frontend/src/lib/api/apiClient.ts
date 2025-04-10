import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to include token from cookie
apiClient.interceptors.request.use((config) => {
    // Get token from cookie
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

    if (token) {
        config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
    }
    
    return config;
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Redirect to login page
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;