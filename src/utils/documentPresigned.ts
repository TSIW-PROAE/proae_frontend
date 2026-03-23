import { API_BASE_URL } from "@/config/api";

/** Chave completa para a API (ex.: userId/documentos/arquivo.pdf) a partir do valor salvo na resposta. */
export function resolveStorageKeyForApi(urlArquivo: string): string {
  const t = (urlArquivo ?? "").trim();
  if (!t) return "";
  if (!/^https?:\/\//i.test(t)) return t;
  try {
    const u = new URL(t);
    return u.pathname.replace(/^\/+/, "");
  } catch {
    return t;
  }
}

/** Nome amigável (último segmento da chave). */
export function extrairNomeArquivo(urlArquivo: string): string {
  const key = resolveStorageKeyForApi(urlArquivo);
  const parts = key.split("/").filter(Boolean);
  return parts[parts.length - 1] || key;
}

export function getExtensaoArquivo(nome: string): string {
  return nome.split(".").pop()?.toLowerCase() || "";
}

export function isPdfExtensao(extensao: string): boolean {
  return extensao === "pdf";
}

export function isImagemExtensao(extensao: string): boolean {
  return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(extensao);
}

/** URL assinada (GET /documents/presigned) — requer cookie JWT. */
export async function fetchPresignedDocumentUrl(
  objectKey: string,
): Promise<{ nome_do_arquivo?: string; url: string; objectKey?: string } | null> {
  try {
    const url = `${API_BASE_URL}/documents/presigned?key=${encodeURIComponent(objectKey)}`;
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error("Erro ao buscar documento");
    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar presigned URL:", err);
    return null;
  }
}
