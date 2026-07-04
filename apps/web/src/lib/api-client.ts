import axios from 'axios';

// Resolve the API base for browser (client-side) calls. Talk to the API on the
// SAME host the page was loaded from, on port 3001 — so it works over localhost
// AND from other devices on the LAN (e.g. a phone at http://192.168.x.x:3000)
// with no hardcoded IP. Going straight to the API (rather than via Next's /api
// proxy) keeps the auth Set-Cookie flow reliable; the cookies are same-site
// (lax) so the browser sends them on these cross-port requests, and the API's
// dev CORS allows LAN origins. Override with NEXT_PUBLIC_API_URL in production.
function resolveApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  // In the browser, use the SAME-ORIGIN /api proxy (Next rewrites it to the API
  // server-side). This works over localhost, from a phone on the LAN, and in
  // production — without the browser ever needing to reach the API's port
  // directly (which a firewall or hotspot client-isolation can block, and which
  // was causing the widget to get no config on mobile).
  if (typeof window !== 'undefined') return '/api';
  return 'http://localhost:3001/api';
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
