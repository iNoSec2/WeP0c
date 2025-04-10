import axios from 'axios';

/**
 * Dashboard API functions
 */
export const dashboardAPI = {
    /**
     * Fetches dashboard statistics
     */
    getStats: async () => {
        try {
            // Use relative path to hit the Next.js API route
            // This will proxy to the backend through the server-side handler
            const response = await axios.get('/api/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
};

export default dashboardAPI; 