import axios from "axios";
import { FetchAdapter } from "../api";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/documents";

/** Resposta do POST /documents/upload (R2) */
export interface UploadResponse {
  mensagem?: string;
  arquivos: Array<{ nome_do_arquivo?: string; tipo?: string; url: string }>;
}

/** Resposta do GET /documents/:filename (URL assinada) */
export interface DocumentUrlResponse {
  nome_do_arquivo?: string;
  url: string;
}

export class MinioService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  /**
   * Upload de arquivo via POST /documents/upload.
   * Body: multipart/form-data com campo `files` (array) ou `file` (um arquivo).
   * Resposta: { mensagem, arquivos: [{ nome_do_arquivo, tipo, url }] }.
   * Retorna arquivos[0].url para usar em urlArquivo nas respostas do formulário.
   */
  async uploadDocument(file: File, vagaId?: number): Promise<string> {
    const url = `${BASE_URL}/upload`;
    const formData = new FormData();
    formData.append("files", file);
    if (vagaId) {
      formData.append("vagaId", vagaId.toString());
    }

    try {
      const response = await axios.post<UploadResponse>(url, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status !== 201 && response.status !== 200) {
        const msg =
          response.data?.mensagem ?? "Erro ao fazer upload do arquivo";
        throw new Error(msg);
      }

      const { arquivos } = response.data ?? {};
      const primeiro = Array.isArray(arquivos) ? arquivos[0] : null;
      const urlArquivo = primeiro?.url;

      if (!urlArquivo || typeof urlArquivo !== "string") {
        throw new Error(
          response.data?.mensagem ?? "Resposta do servidor não contém URL do arquivo. Tente novamente."
        );
      }
      return urlArquivo;
    } catch (err: any) {
      const msg =
        err?.response?.data?.mensagem ??
        err?.response?.data?.message ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        err?.message ??
        "Erro ao fazer upload do arquivo";
      throw new Error(msg);
    }
  }

  /**
   * GET /documents/:filename — retorna URL assinada do arquivo.
   * Resposta: { nome_do_arquivo, url }.
   */
  async downloadDocument(fileName: string): Promise<DocumentUrlResponse> {
    const url = `${BASE_URL}/${fileName}`;
    const response = await this.httpClient.get<DocumentUrlResponse>(url);
    return response;
  }
}