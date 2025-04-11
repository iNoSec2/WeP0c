import axios from 'axios';

/**
 * Vulnerabilities API functions
 */
export const vulnerabilitiesAPI = {
    getAll: async () => {
        try {
            const response = await axios.get('/api/vulnerabilities');
            return response.data;
        } catch (error) {
            console.error('Error fetching vulnerabilities:', error);
            throw error;
        }
    },

    getRecent: async () => {
        try {
            const response = await axios.get('/api/vulnerabilities/recent');
            return response.data;
        } catch (error) {
            console.error('Error fetching recent vulnerabilities:', error);
            throw error;
        }
    },

    getById: async (id: string) => {
        try {
            const response = await axios.get(`/api/vulnerabilities/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching vulnerability ${id}:`, error);
            throw error;
        }
    },

    create: async (data: any) => {
        try {
            console.log('Creating vulnerability with data:', data);
            // Send the data to the API route
            const response = await axios.post('/api/vulnerabilities', data);
            return response.data;
        } catch (error) {
            console.error('Error creating vulnerability:', error);
            throw error;
        }
    },

    update: async (id: string, data: any) => {
        try {
            const response = await axios.put(`/api/vulnerabilities/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating vulnerability ${id}:`, error);
            throw error;
        }
    },

    execute: async (id: string) => {
        try {
            console.log(`Executing vulnerability with ID: ${id}`);
            const response = await axios.post(`/api/vulnerabilities/execute/${id}`);
            console.log('Execution response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error executing vulnerability ${id}:`, error);
            throw error;
        }
    }
};

export default vulnerabilitiesAPI;