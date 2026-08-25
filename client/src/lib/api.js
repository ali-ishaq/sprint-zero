const configuredBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
const API_BASE = configuredBase === '' ? '/api' : configuredBase.replace(/\/+$/, '');

function normalizePath(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

export function apiUrl(path) {
  return `${API_BASE}${normalizePath(path)}`;
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), {
    ...options,
    credentials: 'include'
  });
}
