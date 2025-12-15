import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { DocumentoInscricao, DocumentoStatus } from "../../types/documento";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;

interface ListaDocumentosResponse {
  sucess?: boolean;
  success?: boolean;
  documentos?: DocumentoInscricao[];
}

class DocumentoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarPorInscricao(inscricaoId: number): Promise<DocumentoInscricao[]> {
    try {
      const response = await this.httpClient.get<ListaDocumentosResponse>(`${BASE_URL}/documentos/inscricao/${inscricaoId}`);

      if (Array.isArray(response?.documentos)) {
        return response.documentos;
      }

      // Alguns endpoints retornam { sucess: true, documentos: [...] }
      if ((response as any)?.sucess && Array.isArray((response as any).documentos)) {
        return (response as any).documentos as DocumentoInscricao[];
      }

      return [];
    } catch (error: any) {
      // 404 significa que não há documentos vinculados
      if (error?.status === 404 || error?.response?.status === 404) {
        return [];
      }

      console.error("Erro ao listar documentos da inscrição:", error);
      throw new Error(error?.response?.data?.message || error?.message || "Erro ao listar documentos");
    }
  }

  async atualizarStatus(documentoId: number, status: DocumentoStatus): Promise<void> {
    try {
      await this.httpClient.put(`${BASE_URL}/documentos/${documentoId}`, {
        status_documento: status,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status do documento:", error);
      throw new Error(error?.response?.data?.message || error?.message || "Erro ao atualizar status do documento");
    }
  }
}

export const documentoService = new DocumentoService();
