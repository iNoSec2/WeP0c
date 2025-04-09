import axios from 'axios';
import { getBackendURL } from './index';

/**
 * Set a cookie in the browser
 */
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

/**
 * Login to the backend API and get a valid token
 */
export async function loginToBackend(email: string, password: string): Promise<{
    access_token: string;
    token_type: string;
    user_id: string;
    username: string;
    email: string;
    role: string;
}> {
    // Require email and password for login
    if (!email || !password) {
        console.error('Email and password are required for login');
        throw new Error('Email and password are required for login');
    }

    // Actual authentication with the backend
    try {
        const backendURL = getBackendURL();
        console.log(`Attempting login to: ${backendURL}/api/auth/login`);

        // Create form data for OAuth2 password flow
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post(`${backendURL}/api/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        console.log('Login response received');

        // Store token in localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('access_token', data.access_token);

        // Also set token as a cookie for middleware to find
        setCookie('token', data.access_token);

        // Set the token in axios defaults for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

        return data;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}
