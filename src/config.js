// ─── API Configuration ────────────────────────────────────────────────────────
// Ensure VITE_API_URL includes the /api suffix if not already present
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
if (baseUrl && !baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api'
}
export const API = baseUrl
