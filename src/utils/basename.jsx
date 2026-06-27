// Vite supplies `/` in development and `/OFMIScoreboard/` in production.
// React Router expects the same value without a trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

export default basename;
