import axios from 'axios';

/**
 * Set a cookie in the browser with proper encoding
 */
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

/**
 * Get the base API URL for direct backend connections
 */
function getDirectApiUrl() {
    // In Docker environment, always use the service name
    return 'http://api:8001';
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

        try {
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
                console.warn('Next.js API route login failed, trying direct backend');
                throw new Error('API route login failed');
            }

            const data = response.data;
            console.log('Login successful through Next.js API route');

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

            return data;
        } catch (nextJsError) {
            // If the Next.js API route fails, try direct backend connection
            console.log('Falling back to direct backend login');

            const apiUrl = getDirectApiUrl();
            console.log(`Attempting direct login to: ${apiUrl}/api/auth/token`);

            const directResponse = await axios.post(`${apiUrl}/api/auth/token`, {
                username: email, // Backend expects username field
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = directResponse.data;
            console.log('Direct backend login successful');

            // Validate token
            if (!data.access_token) {
                throw new Error('Authentication failed - No token received from direct backend');
            }

            // Store token
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('access_token', data.access_token);
            setCookie('token', data.access_token);

            // Set the token in axios defaults
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

            return data;
        }
    } catch (error: any) {
        console.error('Authentication error:', error.message || error);
        // Provide a clear error message
        throw new Error(error.response?.data?.error || error.message || 'Authentication failed');
    }
}
