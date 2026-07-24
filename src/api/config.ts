/**
 * Centralized API configuration.
 *
 * In development Vite proxies `/api` → `http://localhost:3001/api`,
 * so the base URL can simply be '' (same-origin relative path).
 *
 * In production set the VITE_API_URL env var to the Render backend URL,
 * e.g. https://oblivion-blog-api.onrender.com
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';
