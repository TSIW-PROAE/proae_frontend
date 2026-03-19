/**
 * URL base da API (sem prefixo /api).
 * O backend expõe as rotas na raiz, ex.: POST http://localhost:3000/inscricoes
 */
function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL_SERVICES ?? "";
  const url = raw.toString().trim();
  if (!url) return "http://localhost:3000";
  return url.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
}

export const API_BASE_URL = getApiBaseUrl();
