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
    DETAILED_ERRORS: IS_DEVELOPMENT,

    // Mock data is disabled across all environments
    USE_MOCK_DATA: false,
}; 