import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Injecter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("siarf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rediriger vers login si 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("siarf_token");
      localStorage.removeItem("siarf_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: object) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// Dashboard
export const dashboardAPI = {
  stats: () => api.get("/dashboard/stats"),
};

// Transactions
export const transactionsAPI = {
  liste: (params?: object) => api.get("/transactions/", { params }),
  detail: (id: string) => api.get(`/transactions/${id}`),
  soumettre: (data: object) => api.post("/transactions/", data),
};

// Alertes
export const alertesAPI = {
  liste: (params?: object) => api.get("/alertes/", { params }),
  detail: (id: string) => api.get(`/alertes/${id}`),
  updateStatut: (id: string, statut: string, commentaire?: string) =>
    api.put(`/alertes/${id}/statut`, null, { params: { statut, commentaire } }),
};

// Déclarations
export const declarationsAPI = {
  liste: (params?: object) => api.get("/declarations/", { params }),
  generer: (alerteId: string) =>
    api.post(`/declarations/generer/${alerteId}`),
  valider: (id: string, commentaire?: string) =>
    api.put(`/declarations/${id}/valider`, null, { params: { commentaire } }),
  transmettre: (id: string) =>
    api.put(`/declarations/${id}/transmettre`),
};

export default api;