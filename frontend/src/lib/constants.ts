/**
 * Global application constants
 */

// Environment settings
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Feature flags
export const FEATURES = {
    // Only show database initialization welcome message in development mode
    SHOW_WELCOME_MESSAGE: IS_DEVELOPMENT,

    // Enable detailed error logging
    DETAILED_ERRORS: process.env.FEATURES_DETAILED_ERRORS === 'true',

    // Mock data is disabled across all environments
    USE_MOCK_DATA: false,

    // Controls whether PoC uploads are allowed
    POC_UPLOAD: process.env.ENABLE_POC_UPLOAD === 'true',
    
    // Controls whether PoC execution is enabled
    POC_EXEC: process.env.ENABLE_POC_EXEC === 'true',
    
    // Network access for PoCs (disabled by default)
    NETWORK_ACCESS: process.env.DISABLE_NETWORK !== 'true',
};

// API configurations
export const API_CONFIG = {
    TIMEOUT: 15000, // Default timeout for API requests (15 seconds)
    RETRIES: 3,     // Number of retries for failed requests
    
    // Upload limits (matching backend)
    MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50', 10),
    ALLOWED_EXTENSIONS: (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,pdf,txt,md,zip').split(','),
};

// User roles
export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    PENTESTER: 'PENTESTER',
    CLIENT: 'CLIENT',
    USER: 'USER',
};

// Default pagination settings
export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    DEFAULT_SKIP: 0,
}; 