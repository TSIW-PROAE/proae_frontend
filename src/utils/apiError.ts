/**
 * Extrai mensagem legível de erros do Axios/Nest (`response.data`).
 */
export function getApiErrorMessage(err: unknown): string {
  if (err == null) return "Erro desconhecido.";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const o = err as Record<string, unknown>;
    const m = o.message;
    if (Array.isArray(m)) return m.filter(Boolean).join(" ");
    if (typeof m === "string" && m.trim()) return m;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Não foi possível completar a operação. Tente novamente.";
}
