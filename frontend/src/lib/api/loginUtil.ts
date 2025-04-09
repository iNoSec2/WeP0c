import axios from 'axios';
import { getBackendURL } from './index';

/**
 * Login to the backend API and get a valid token
 * @param username The username (email)
 * @param password The password
 * @returns The authentication response with token
 */
export async function loginToBackend(username: string = 'admin@p0cit.com', password: string = 'admin'): Promise<{
    access_token: string;
    token_type: string;
    user_id: string;
    username: string;
    email: string;
    role: string;
}> {
    try {
        const backendURL = getBackendURL();
        console.log('Logging in to backend at:', `${backendURL}/api/auth/login`);
        
        // Create form data for login
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        // Make the login request
        const response = await axios.post(`${backendURL}/api/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        
        console.log('Login successful, received token');
        
        // Store the token in localStorage
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('access_token', response.data.access_token);
            
            // Create a user object with the role from the response
            const userObj = {
                id: response.data.user_id,
                email: response.data.email,
                full_name: response.data.username,
                role: response.data.role.toLowerCase(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            localStorage.setItem('user', JSON.stringify(userObj));
        }
        
        return response.data;
    } catch (error) {
        console.error('Login failed:', error);
        
        // For development, create a mock token if login fails
        if (process.env.NODE_ENV === 'development') {
            console.log('Creating mock token for development');
            
            const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOGE2MGFlYi01N2ViLTQ0MmUtOTA1MS1kNzY5ZGUyOTlhOWEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3NDQxMjUxMzh9.0oQ3zlw4FCIVXodMg9C4TV2jtRG4JtQZ6bE8pC2ZTBA";
            
            // Store the mock token in localStorage
            localStorage.setItem('token', mockToken);
            localStorage.setItem('access_token', mockToken);
            
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
                access_token: mockToken,
                token_type: 'bearer',
                user_id: '1',
                username: 'Super Admin',
                email: 'admin@p0cit.com',
                role: 'SUPER_ADMIN'
            };
        }
        
        throw error;
    }
}
