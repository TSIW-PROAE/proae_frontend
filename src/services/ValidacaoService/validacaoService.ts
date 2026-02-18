import { FetchAdapter } from "../api";

export interface Validacao {
  id?: string;
  parecer: string;
  status: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel_id: string;
  questionario_id?: string;
  documento_id?: string;
  resposta_id?: string;
  responsavel?: {
    usuario_id: number;
    nome: string;
    email: string;
  };
  questionario?: {
    id: string;
    texto: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateValidacaoRequest {
  parecer: string;
  status?: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel_id: string;
  questionario_id?: string;
  documento_id?: string;
  resposta_id?: string;
}

export interface UpdateValidacaoRequest {
  parecer?: string;
  status?: "pendente" | "aprovado" | "reprovado";
  data_validacao?: string;
  responsavel_id?: string;
  questionario_id?: string;
  documento_id?: string;
  resposta_id?: string;
}

interface ValidacaoResponse {
  sucesso?: boolean;
  dados?: Validacao;
  data?: Validacao;
}

interface ValidacoesListResponse {
  sucesso?: boolean;
  dados?: Validacao[];
}

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/validacao";

export class ValidacaoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  // POST /validacao - Criar validação
  async criarValidacao(data: CreateValidacaoRequest): Promise<Validacao> {
    try {
      const response = await this.httpClient.post<ValidacaoResponse>(BASE_URL, data);
      // Suporte a diferentes formatos de resposta
      if (response.data?.dados) {
        return response.data.dados;
      }
      if (response.data) {
        return response.data as Validacao;
      }
      return response as unknown as Validacao;
    } catch (error: any) {
      console.error("Erro ao criar validação:", error);
      throw new Error(error?.message || error?.mensagem || "Erro ao criar validação");
    }
  }

  // GET /validacao - Listar validações
  async listarValidacoes(): Promise<Validacao[]> {
    try {
      const response = await this.httpClient.get<ValidacoesListResponse | Validacao[]>(BASE_URL);
      // Suporte a diferentes formatos de resposta
      if (Array.isArray(response)) {
        return response;
      }
      if (response?.dados && Array.isArray(response.dados)) {
        return response.dados;
      }
      return [];
    } catch (error: any) {
      console.error("Erro ao listar validações:", error);
      throw new Error(error?.message || error?.mensagem || "Erro ao listar validações");
    }
  }

  // GET /validacao/:id - Validação por ID
  async buscarValidacaoPorId(id: string): Promise<Validacao | null> {
    try {
      const response = await this.httpClient.get<ValidacaoResponse | Validacao>(`${BASE_URL}/${id}`);
      if ((response as ValidacaoResponse)?.dados) {
        return (response as ValidacaoResponse).dados!;
      }
      return response as Validacao;
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        return null;
      }
      console.error("Erro ao buscar validação:", error);
      throw new Error(error?.message || error?.mensagem || "Erro ao buscar validação");
    }
  }

  // PATCH /validacao/:id - Atualizar validação
  async atualizarValidacao(id: string, data: UpdateValidacaoRequest): Promise<Validacao> {
    try {
      const response = await this.httpClient.patch<ValidacaoResponse | Validacao>(`${BASE_URL}/${id}`, data);
      if ((response as ValidacaoResponse)?.dados) {
        return (response as ValidacaoResponse).dados!;
      }
      return response as Validacao;
    } catch (error: any) {
      console.error("Erro ao atualizar validação:", error);
      throw new Error(error?.message || error?.mensagem || "Erro ao atualizar validação");
    }
  }

  // DELETE /validacao/:id - Remover validação
  async deletarValidacao(id: string): Promise<{ message: string }> {
    try {
      const response = await this.httpClient.delete<{ message: string }>(`${BASE_URL}/${id}`);
      return response;
    } catch (error: any) {
      console.error("Erro ao deletar validação:", error);
      throw new Error(error?.message || error?.mensagem || "Erro ao deletar validação");
    }
  }

  // Métodos de conveniência
  async aprovarValidacao(id: string, parecer?: string): Promise<Validacao> {
    return this.atualizarValidacao(id, {
      status: "aprovado",
      parecer: parecer,
      data_validacao: new Date().toISOString().split("T")[0],
    });
  }

  async reprovarValidacao(id: string, parecer?: string): Promise<Validacao> {
    return this.atualizarValidacao(id, {
      status: "reprovado",
      parecer: parecer,
      data_validacao: new Date().toISOString().split("T")[0],
    });
  }

  async buscarValidacoesPorStatus(status: "pendente" | "aprovado" | "reprovado"): Promise<Validacao[]> {
    try {
      const validacoes = await this.listarValidacoes();
      return validacoes.filter((v) => v.status === status);
    } catch (error) {
      console.error(`Erro ao buscar validações por status ${status}:`, error);
      return [];
    }
  }

  // Métodos específicos para questionários
  async criarValidacaoQuestionario(questionarioId: string, parecer: string, responsavelId: string): Promise<Validacao> {
    return this.criarValidacao({
      parecer,
      responsavel_id: responsavelId,
      questionario_id: questionarioId,
      status: "pendente",
      data_validacao: new Date().toISOString().split("T")[0],
    });
  }

  // Métodos específicos para documentos
  async criarValidacaoDocumento(
    documentoId: string,
    parecer: string,
    responsavelId: string,
    status: "pendente" | "aprovado" | "reprovado" = "pendente"
  ): Promise<Validacao> {
    return this.criarValidacao({
      parecer,
      responsavel_id: responsavelId,
      documento_id: documentoId,
      status,
      data_validacao: new Date().toISOString().split("T")[0],
    });
  }

  // Métodos específicos para respostas
  async criarValidacaoResposta(
    respostaId: string,
    parecer: string,
    responsavelId: string,
    status: "pendente" | "aprovado" | "reprovado" = "pendente"
  ): Promise<Validacao> {
    return this.criarValidacao({
      parecer,
      responsavel_id: responsavelId,
      resposta_id: respostaId,
      status,
      data_validacao: new Date().toISOString().split("T")[0],
    });
  }

  async buscarValidacoesPorQuestionario(questionarioId: string): Promise<Validacao[]> {
    try {
      const validacoes = await this.listarValidacoes();
      return validacoes.filter((v) => v.questionario_id === questionarioId);
    } catch (error) {
      console.warn(`Nenhuma validação encontrada para questionário ${questionarioId}`);
      return [];
    }
  }

  async buscarValidacoesPorDocumento(documentoId: string): Promise<Validacao[]> {
    try {
      const validacoes = await this.listarValidacoes();
      return validacoes.filter((v) => v.documento_id === documentoId);
    } catch (error) {
      console.warn(`Nenhuma validação encontrada para documento ${documentoId}`);
      return [];
    }
  }
}

export const validacaoService = new ValidacaoService();
