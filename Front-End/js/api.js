// Ponto único de configuração da URL da API.
// Troque aqui se o back-end rodar em outro endereço/porta.
export const API_BASE_URL = "/api";

/**
 * Wrapper de fetch com:
 * - envio automático do cookie de sessão (credentials: "include")
 * - Content-Type JSON
 * - tratamento padronizado de erros da API
 */
async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const options = {
    method,
    credentials: "include",
  };

  if (body !== undefined) {
    if (isFormData) {
      options.body = body; // FormData define seu próprio Content-Type
    } else {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);

  // 204 No Content não tem corpo pra ler
  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // resposta sem corpo JSON (ex: erro de rede tratado abaixo)
  }

  if (!response.ok) {
    const message = data?.error || `Erro ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // ===== Autenticação =====
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  // ===== Conversas =====
  listConversations: () => request("/conversations"),
  createConversation: (title) => request("/conversations", { method: "POST", body: { title } }),
  getConversation: (id) => request(`/conversations/${id}`),
  renameConversation: (id, title) => request(`/conversations/${id}`, { method: "PATCH", body: { title } }),
  deleteConversation: (id) => request(`/conversations/${id}`, { method: "DELETE" }),
  sendMessage: (id, payload) => request(`/conversations/${id}/messages`, { method: "POST", body: payload }),

  // ===== Upload =====
  uploadFile: (formData) => request("/upload", { method: "POST", body: formData, isFormData: true }),
};
