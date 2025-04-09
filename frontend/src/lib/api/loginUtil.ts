import axios from 'axios';

// Force using localhost for browser environment to fix Docker networking issues
function getApiUrl() {
    // Always use localhost with port 8001 for browser-side API calls
    // This is because the browser can't resolve Docker container names
    return 'http://localhost:8001';
}

const API_URL = getApiUrl();

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
export async function loginToBackend(email: string = '', password: string = ''): Promise<{
    access_token: string;
    token_type: string;
    user_id: string;
    username: string;
    email: string;
    role: string;
}> {
    // For development/demo, use hardcoded credentials if empty
    if (!email || !password) {
        console.log('Using demo token for authentication');

        // Create a default token for development
        const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOGE2MGFlYi01N2ViLTQ0MmUtOTA1MS1kNzY5ZGUyOTlhOWEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3NDQxMjUxMzh9.0oQ3zlw4FCIVXodMg9C4TV2jtRG4JtQZ6bE8pC2ZTBA";

        // Store the token for future use
        localStorage.setItem('token', defaultToken);
        localStorage.setItem('access_token', defaultToken);

        // Also set token as a cookie for middleware to find
        setCookie('token', defaultToken);

        // Create a user object with super_admin role
        const userObj = {
            id: 1,
            email: 'admin@p0cit.com',
            full_name: 'Super Admin',
            role: 'super_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userObj));

        return {
            access_token: defaultToken,
            token_type: 'bearer',
            user_id: '1',
            username: 'Super Admin',
            email: 'admin@p0cit.com',
            role: 'SUPER_ADMIN'
        };
    }

    // Actual authentication with the backend
    try {
        console.log(`Attempting login to: ${API_URL}/api/auth/login`);

        // Create form data for OAuth2 password flow
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        console.log('Login response:', data);

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
