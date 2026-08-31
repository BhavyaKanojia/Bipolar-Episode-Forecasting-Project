// API Configuration
// When deployed on Netlify, set the environment variable VITE_API_BASE_URL in Netlify's Site settings
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
