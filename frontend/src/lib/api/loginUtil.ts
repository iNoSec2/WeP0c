import axios from 'axios';

/**
 * Set a cookie in the browser with proper encoding
 */
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
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
    // Validate inputs
    if (!email || !password) {
        console.error('Email and password are required for login');
        throw new Error('Email and password are required for login');
    }

    try {
        // First attempt to login using the Next.js API route
        console.log(`Attempting login via API route: /api/auth/login`);

        const response = await axios.post('/api/auth/login', {
            email,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            validateStatus: function (status) {
                return status < 500; // Only treat 5xx responses as errors
            }
        });

        // Check for authentication failure
        if (response.status !== 200) {
            console.error('Login failed:', response.data?.error || response.statusText);
            throw new Error(response.data?.error || 'Authentication failed');
        }

        const data = response.data;
        console.log('Login successful, token:', data.access_token);

        // Validate token
        if (!data.access_token) {
            console.error('No token received in login response');
            throw new Error('Authentication failed - No token received');
        }

        // Store token in localStorage without any modifications
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('access_token', data.access_token);

        // Set token as a cookie - exactly the same as received from the server
        setCookie('token', data.access_token);

        // Set the token in axios defaults for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

        // Test the token immediately with a simple API call
        try {
            console.log('Testing token with API call...');
            const testResponse = await axios.get('/direct-api/auth/test-token', {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`
                }
            });
            console.log('Token test successful:', testResponse.status);
        } catch (testError) {
            console.warn('Token test failed, but continuing login process:', testError);
        }

        return data;
    } catch (error: any) {
        console.error('Authentication error:', error.message || error);
        // Provide a clear error message
        throw new Error(error.response?.data?.error || error.message || 'Authentication failed');
    }
}
