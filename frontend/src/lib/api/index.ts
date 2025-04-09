export const getBackendURL = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://p0cit-app:8001";
}; 