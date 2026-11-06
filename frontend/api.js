// Détection automatique de l'environnement (Local vs Production)
const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000" // En local sur ton port 3000
    : "https://oriente-ci.onrender.com"; // Remplace plus tard par l'URL de ton backend Render
