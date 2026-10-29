import axios from 'axios';

// Browser calls always use the same-origin /api proxy, which each app's Next
// config rewrites to API_URL on the server. That keeps auth cookies first-party
// with no CORS, and the browser never needs to know where the API lives.
function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') return '/api';
  return process.env.API_URL || 'http://localhost:3001/api';
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true, // Important for cookies
});

// Add interceptor to handle 401s (refresh token logic)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login or clear auth store
        if (typeof window !== 'undefined') {
          // window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
