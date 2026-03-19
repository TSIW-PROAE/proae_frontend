import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { RespostaStep } from "../../types/inscricao";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;

export interface ValidateRespostaDto {
  validada?: boolean;
  dataValidade?: string;
}

export interface ValidateRespostaResponse {
  sucesso: boolean;
  dados: {
    resposta: {
      id: string;
      validada: boolean;
      dataValidacao: string;
      dataValidade?: string;
    };
  };
  mensagem?: string;
}

export interface CreateRespostaDto {
  perguntaId: string;
  inscricaoId: string;
  valorTexto?: string;
  valorOpcoes?: string[];
  urlArquivo?: string;
}

export interface UpdateRespostaDto {
  valorTexto?: string;
  valorOpcoes?: string[];
  urlArquivo?: string;
  validada?: boolean;
}

export interface Resposta {
  id: string;
  pergunta_id: string;
  inscricao_id: string;
  valor_texto?: string | null;
  valor_opcoes?: string[] | null;
  url_arquivo?: string | null;
  validada: boolean;
  data_validacao?: string;
  data_resposta: string;
  created_at?: string;
  updated_at?: string;
}

export interface PerguntaComResposta {
  pergunta_id: string;
  pergunta_texto: string;
  tipo_pergunta: string;
  obrigatoria: boolean;
  aguardandoRespostaNovaPergunta?: boolean;
  prazoRespostaNovaPergunta?: string | null;
  resposta?: {
    resposta_id: string;
    valor_texto?: string | null;
    valor_opcoes?: string[] | null;
    url_arquivo?: string | null;
    validada: boolean;
    data_validacao?: string;
    data_resposta: string;
    aguardandoRespostaNovaPergunta?: boolean;
    prazoRespostaNovaPergunta?: string | null;
  } | null;
}

interface ListaRespostasResponse {
  sucesso: boolean;
  dados: Resposta[];
}

interface RespostaUnicaResponse {
  sucesso: boolean;
  dados: Resposta;
}

interface PerguntasComRespostasResponse {
  sucesso: boolean;
  dados: {
    perguntas: PerguntaComResposta[];
  };
}

class RespostaService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  // POST /respostas - Criar resposta (pergunta + inscrição)
  async criarResposta(dto: CreateRespostaDto): Promise<Resposta> {
    try {
      const response = await this.httpClient.post<RespostaUnicaResponse>(`${BASE_URL}/respostas`, dto);
      return response.data.dados;
    } catch (error: any) {
      console.error("Erro ao criar resposta:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // GET /respostas - Listar todas as respostas
  async listarRespostas(): Promise<Resposta[]> {
    try {
      const response = await this.httpClient.get<ListaRespostasResponse>(`${BASE_URL}/respostas`);
      if (response.sucesso && Array.isArray(response.dados)) {
        return response.dados;
      }
      return [];
    } catch (error: any) {
      console.error("Erro ao listar respostas:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // GET /respostas/:id - Resposta por ID
  async buscarRespostaPorId(id: string): Promise<Resposta | null> {
    try {
      const response = await this.httpClient.get<RespostaUnicaResponse>(`${BASE_URL}/respostas/${id}`);
      if (response.sucesso && response.dados) {
        return response.dados;
      }
      return null;
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        return null;
      }
      console.error("Erro ao buscar resposta:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // PATCH /respostas/:id - Atualizar resposta
  async atualizarResposta(id: string, dto: UpdateRespostaDto): Promise<Resposta> {
    try {
      const response = await this.httpClient.patch<RespostaUnicaResponse>(`${BASE_URL}/respostas/${id}`, dto);
      return response.dados;
    } catch (error: any) {
      console.error("Erro ao atualizar resposta:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // DELETE /respostas/:id - Remover resposta
  async deletarResposta(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`${BASE_URL}/respostas/${id}`);
    } catch (error: any) {
      console.error("Erro ao deletar resposta:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // GET /respostas/aluno/:alunoId/edital/:editalId - Respostas do aluno em um edital
  async buscarRespostasDoAlunoNoEdital(alunoId: string, editalId: string): Promise<Resposta[]> {
    try {
      const response = await this.httpClient.get<ListaRespostasResponse>(`${BASE_URL}/respostas/aluno/${alunoId}/edital/${editalId}`);
      if (response.sucesso && Array.isArray(response.dados)) {
        return response.dados;
      }
      return [];
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        return [];
      }
      console.error("Erro ao buscar respostas do aluno no edital:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // GET /respostas/aluno/:alunoId/edital/:editalId/step/:stepId - Respostas do aluno em um step do edital
  async buscarRespostasDoAlunoNoStep(alunoId: string, editalId: string, stepId: string): Promise<RespostaStep[]> {
    try {
      const response = await this.httpClient.get<{ sucesso: boolean; dados: { respostas: RespostaStep[] } }>(
        `${BASE_URL}/respostas/aluno/${alunoId}/edital/${editalId}/step/${stepId}`,
      );
      if (response.sucesso && response.dados?.respostas) {
        return response.dados.respostas;
      }
      return [];
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        return [];
      }
      console.error("Erro ao buscar respostas do aluno no step:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // GET /respostas/aluno/:alunoId/edital/:editalId/step/:stepId/perguntas-com-respostas
  // Perguntas do step com respostas do aluno
  async buscarPerguntasComRespostas(alunoId: string, editalId: string, stepId: string): Promise<PerguntaComResposta[]> {
    try {
      const response = await this.httpClient.get<PerguntasComRespostasResponse>(
        `${BASE_URL}/respostas/aluno/${alunoId}/edital/${editalId}/step/${stepId}/perguntas-com-respostas`,
      );
      if (response.sucesso && response.dados?.perguntas) {
        return response.dados.perguntas;
      }
      return [];
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        return [];
      }
      console.error("Erro ao buscar perguntas com respostas:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // GET /respostas/pergunta/:perguntaId/edital/:editalId - Respostas de uma pergunta em um edital
  async buscarRespostasDaPerguntaNoEdital(perguntaId: string, editalId: string): Promise<Resposta[]> {
    try {
      const response = await this.httpClient.get<ListaRespostasResponse>(`${BASE_URL}/respostas/pergunta/${perguntaId}/edital/${editalId}`);
      if (response.sucesso && Array.isArray(response.dados)) {
        return response.dados;
      }
      return [];
    } catch (error: any) {
      if (error?.status === 404 || error?.response?.status === 404) {
        return [];
      }
      console.error("Erro ao buscar respostas da pergunta no edital:", error);
      throw new Error(this.extrairMensagemErro(error));
    }
  }

  // PATCH /respostas/:id/validate - Validar uma resposta
  async validarResposta(respostaId: string, dto: ValidateRespostaDto): Promise<ValidateRespostaResponse> {
    const respostaIdStr = String(respostaId);
    const pluralUrl = `${BASE_URL}/respostas/${respostaIdStr}/validate`;
    const singularUrl = `${BASE_URL}/resposta/${respostaIdStr}/validate`;

    try {
      return await this.httpClient.patch<ValidateRespostaResponse>(pluralUrl, dto);
    } catch (erroPlural: any) {
      const shouldRetrySingular = this.deveTentarSingular(erroPlural);

      if (shouldRetrySingular) {
        try {
          return await this.httpClient.patch<ValidateRespostaResponse>(singularUrl, dto);
        } catch (erroSingular: any) {
          console.error("Erro ao validar resposta (rota singular):", erroSingular);
          throw new Error(this.extrairMensagemErro(erroSingular));
        }
      }

      console.error("Erro ao validar resposta (rota plural):", erroPlural);
      throw new Error(this.extrairMensagemErro(erroPlural));
    }
  }

  private deveTentarSingular(erro: unknown): boolean {
    if (!erro) return false;

    const mensagem = this.extrairMensagemGenerica(erro);
    if (!mensagem) return false;

    return mensagem.includes("/resposta/") && !mensagem.includes("/respostas/");
  }

  private extrairMensagemErro(erro: unknown): string {
    return (
      (typeof erro === "object" && erro !== null && "message" in erro && typeof (erro as any).message === "string"
        ? (erro as any).message
        : undefined) ||
      (typeof erro === "object" && erro !== null && "mensagem" in erro && typeof (erro as any).mensagem === "string"
        ? (erro as any).mensagem
        : undefined) ||
      this.extrairMensagemGenerica(erro) ||
      "Erro ao processar resposta"
    );
  }

  private extrairMensagemGenerica(erro: unknown): string | undefined {
    if (typeof erro === "string") {
      return erro;
    }

    if (typeof erro === "object" && erro !== null) {
      if ("message" in erro && typeof (erro as any).message === "string") {
        return (erro as any).message;
      }

      if ("mensagem" in erro && typeof (erro as any).mensagem === "string") {
        return (erro as any).mensagem;
      }
    }

    return undefined;
  }
}

export const respostaService = new RespostaService();
