const API_BASE = "/api";

function normalizePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function apiUrl(path) {
  return `${API_BASE}${normalizePath(path)}`;
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), {
    ...options,
    credentials: "include",
  });
}
