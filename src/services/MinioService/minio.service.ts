import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;
const DOCUMENTS_URL = `${BASE_URL}/documents`;

export class MinioService {
  /**
   * Faz upload de um arquivo para o MinIO via backend.
   * Retorna o objectKey completo para armazenar no banco.
   */
  async uploadDocument(file: File, vagaId?: string): Promise<string> {
    const url = `${DOCUMENTS_URL}/upload`;

    const formData = new FormData();
    formData.append("files", file);

    if (vagaId) {
      formData.append("vagaId", vagaId);
    }

    const response = await axios.post(url, formData, { withCredentials: true });

    if (response.status !== 201) {
      throw new Error("Erro ao fazer upload do arquivo");
    }

    // O backend retorna { mensagem, arquivos, objectKey, urlArquivo }
    const objectKey = response.data.objectKey || response.data.urlArquivo;

    if (!objectKey) {
      throw new Error("Upload retornou sem objectKey - arquivo pode não ter sido salvo corretamente");
    }

    return objectKey;
  }

  /**
   * Retorna a URL completa para visualização de um arquivo via proxy do backend.
   * Funciona tanto com objectKeys completos (userId/documentos/...)
   * quanto com filenames legados (apenas "arquivo.pdf").
   * O backend reconstrói o path quando necessário usando o JWT do cookie.
   */
  static getViewUrl(objectKeyOrFilename: string): string {
    if (!objectKeyOrFilename) return "";
    // Se já é uma URL completa (legado), retorna como está
    if (objectKeyOrFilename.startsWith("http://") || objectKeyOrFilename.startsWith("https://")) {
      return objectKeyOrFilename;
    }
    return `${BASE_URL}/documents/view?key=${encodeURIComponent(objectKeyOrFilename)}`;
  }

  /**
   * Verifica se um valor parece ser uma referência válida a um arquivo no MinIO.
   * Aceita tanto objectKeys completos (com "/") quanto filenames legados (com extensão ".").
   */
  static isFileReference(value?: string | null): boolean {
    if (!value) return false;
    if (value === "https://example.com/fake-url") return false;
    // Qualquer string que contenha "/" (objectKey) ou "." (filename com extensão)
    return value.includes("/") || value.includes(".");
  }

  /**
   * Alias para isFileReference, mantendo compatibilidade com código existente.
   */
  static isObjectKey(value?: string | null): boolean {
    return MinioService.isFileReference(value);
  }
}
