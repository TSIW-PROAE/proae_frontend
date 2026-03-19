import axios from "axios";
import { FetchAdapter } from "../api";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/documents";

export interface UploadResponse {
  mensagem?: string;
  arquivos?: Array<{ nome_do_arquivo?: string; tipo?: string; url: string }>;
  objectKey?: string;
  urlArquivo?: string;
}

export interface DocumentUrlResponse {
  nome_do_arquivo?: string;
  url: string;
}

export class MinioService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async uploadDocument(file: File, vagaId?: number | string): Promise<string> {
    const url = `${BASE_URL}/upload`;
    const formData = new FormData();
    formData.append("files", file);

    if (vagaId !== undefined && vagaId !== null && String(vagaId).trim() !== "") {
      formData.append("vagaId", String(vagaId));
    }

    const response = await axios.post<UploadResponse>(url, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status !== 201 && response.status !== 200) {
      const msg = response.data?.mensagem ?? "Erro ao fazer upload do arquivo";
      throw new Error(msg);
    }

    const data = response.data ?? {};
    const first = Array.isArray(data.arquivos) ? data.arquivos[0] : undefined;
    const urlFromArquivos = first?.url;
    const reference = data.objectKey ?? data.urlArquivo ?? urlFromArquivos;

    if (!reference || typeof reference !== "string") {
      throw new Error(data.mensagem ?? "Upload retornou sem referência do arquivo.");
    }

    return reference;
  }

  async downloadDocument(fileName: string): Promise<DocumentUrlResponse> {
    const url = `${BASE_URL}/${fileName}`;
    const response = await this.httpClient.get<DocumentUrlResponse>(url);
    return response as unknown as DocumentUrlResponse;
  }

  static getViewUrl(objectKeyOrFilename: string): string {
    if (!objectKeyOrFilename) return "";
    if (
      objectKeyOrFilename.startsWith("http://") ||
      objectKeyOrFilename.startsWith("https://")
    ) {
      return objectKeyOrFilename;
    }
    // backend proxy
    return `${BASE_URL}/view?key=${encodeURIComponent(objectKeyOrFilename)}`;
  }

  static isFileReference(value?: string | null): boolean {
    if (!value) return false;
    if (value === "https://example.com/fake-url") return false;
    return value.includes("/") || value.includes(".");
  }

  static isObjectKey(value?: string | null): boolean {
    return MinioService.isFileReference(value);
  }
}

