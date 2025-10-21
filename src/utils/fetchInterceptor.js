/**
 * Fetch interceptor for handling 403/401 authentication errors
 */

// Store original fetch
const originalFetch = window.fetch;

const fetchInterceptor = async (url, options = {}) => {
  const response = await originalFetch(url, options);

  if (response.status === 403 || response.status === 401) {
    console.warn(`🔒 Authentication Error (${response.status}):`, {
      url,
      status: response.status,
      statusText: response.statusText,
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (window.showError) {
      window.showError("Session expired. Please log in again.");
    } else {
      console.error("Session expired. Please log in again.");
    }

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return response;
};

// Replace global fetch with interceptor
window.fetch = fetchInterceptor;

export default fetchInterceptor;
