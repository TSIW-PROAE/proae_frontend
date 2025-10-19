import { FetchAdapter } from "../BaseRequestService/HttpClient";

export interface Validacao {
  id?: number;
  parecer: string;
  status: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel_id: number;
  questionario_id?: number;
  documento_id?: number;
  responsavel?: {
    usuario_id: number;
    nome: string;
    email: string;
  };
  questionario?: {
    id: number;
    texto: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateValidacaoRequest {
  parecer: string;
  status?: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel_id: number;
  questionario_id?: number;
  documento_id?: number;
}

export interface UpdateValidacaoRequest {
  parecer?: string;
  status?: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel_id?: number;
  questionario_id?: number;
  documento_id?: number;
}

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/validacao";

export class ValidacaoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async criarValidacao(data: CreateValidacaoRequest): Promise<Validacao> {
    const response = await this.httpClient.post<Validacao>(BASE_URL, data);
    return response.data;
  }

  async listarValidacoes(): Promise<Validacao[]> {
    return this.httpClient.get<Validacao[]>(BASE_URL);
  }

  async buscarValidacaoPorId(id: number): Promise<Validacao> {
    return this.httpClient.get<Validacao>(`${BASE_URL}/${id}`);
  }

  async atualizarValidacao(id: number, data: UpdateValidacaoRequest): Promise<Validacao> {
    return this.httpClient.patch<Validacao>(`${BASE_URL}/${id}`, data);
  }

  async aprovarValidacao(id: number): Promise<Validacao> {
    return this.httpClient.post<Validacao>(`${BASE_URL}/${id}/aprovar`, {});
  }

  async reprovarValidacao(id: number): Promise<Validacao> {
    return this.httpClient.post<Validacao>(`${BASE_URL}/${id}/reprovar`, {});
  }

  async buscarValidacoesPorStatus(status: "pendente" | "aprovado" | "reprovado"): Promise<Validacao[]> {
    return this.httpClient.get<Validacao[]>(`${BASE_URL}/status/${status}`);
  }

  async deletarValidacao(id: number): Promise<{ message: string }> {
    return this.httpClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
  }

  // Métodos específicos para questionários
  async criarValidacaoQuestionario(questionarioId: number, parecer: string, responsavelId: number): Promise<Validacao> {
    return this.criarValidacao({
      parecer,
      responsavel_id: responsavelId,
      questionario_id: questionarioId,
      status: "pendente"
    });
  }

  async buscarValidacoesPorQuestionario(questionarioId: number): Promise<Validacao[]> {
    try {
      return this.httpClient.get<Validacao[]>(`${BASE_URL}/questionario/${questionarioId}`);
    } catch (error) {
      // Se não encontrar validações para o questionário, retorna array vazio
      console.warn(`Nenhuma validação encontrada para questionário ${questionarioId}`);
      return [];
    }
  }
}

export const validacaoService = new ValidacaoService();
