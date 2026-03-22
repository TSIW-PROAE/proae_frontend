import { FetchAdapter } from "@/services/api";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/formulario-geral";

export interface FormularioGeralVaga {
  id: number;
  beneficio: string;
  descricao_beneficio?: string;
}

export interface FormularioGeralPergunta {
  id: number;
  pergunta: string;
  tipo_Pergunta: string;
  obrigatoriedade: boolean;
  opcoes: string[] | null;
  tipo_formatacao: any;
  placeholder?: string;
}

export interface FormularioGeralStep {
  id: number;
  texto: string;
  perguntas: FormularioGeralPergunta[];
}

export interface MinhaInscricaoFG {
  id: number;
  status_inscricao: string;
  vaga_id: number;
  observacao_admin?: string;
}

export interface FormularioGeralResponse {
  id: number;
  titulo_edital: string;
  descricao?: string;
  status_edital: string;
  is_formulario_geral: boolean;
  /** Fim da vigência do edital (avisos no portal) */
  data_fim_vigencia?: string | null;
  steps: FormularioGeralStep[];
  vagas: FormularioGeralVaga[];
  minha_inscricao: MinhaInscricaoFG | null;
  /** Ausente em alguns endpoints (ex.: renovação) */
  pode_se_inscrever_em_outros?: boolean;
  /** Precisa concluir formulário de renovação antes de novas inscrições */
  renovacao_pendente?: boolean;
}

/** Pergunta para criar no body do POST /formulario-geral (sem id) */
export interface FormularioGeralPerguntaCreate {
  pergunta: string;
  tipo_Pergunta: string;
  obrigatoriedade: boolean;
  opcoes?: string[] | null;
  tipo_formatacao?: any;
}

/** Step para criar no body do POST /formulario-geral (sem id) */
export interface FormularioGeralStepCreate {
  texto: string;
  perguntas: FormularioGeralPerguntaCreate[];
}

export interface FormularioGeralCreateBody {
  titulo_edital: string;
  descricao?: string;
  /** Opcional: criar FG já com etapas e perguntas em uma única requisição */
  steps?: FormularioGeralStepCreate[];
}

export interface FormularioGeralUpdateBody {
  titulo_edital?: string;
  descricao?: string;
  status_edital?: string;
}

export class FormularioGeralService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async getFormularioGeral(): Promise<FormularioGeralResponse> {
    const response = await this.httpClient.get<FormularioGeralResponse>(BASE_URL);
    return response;
  }

  /**
   * Retorna o formulário geral ou null se não existir (ex.: 404) ou falha na requisição.
   * Útil para checar apenas pode_se_inscrever_em_outros sem tratar erro.
   */
  async getFormularioGeralOrNull(): Promise<FormularioGeralResponse | null> {
    try {
      return await this.getFormularioGeral();
    } catch {
      return null;
    }
  }

  async criarFormularioGeral(body: FormularioGeralCreateBody): Promise<FormularioGeralResponse> {
    const response = await this.httpClient.post<FormularioGeralResponse>(BASE_URL, body);
    return (response as any).data ?? response;
  }

  async atualizarFormularioGeral(
    id: number,
    body: FormularioGeralUpdateBody
  ): Promise<FormularioGeralResponse> {
    return await this.httpClient.patch<FormularioGeralResponse>(
      `${BASE_URL}/${id}`,
      body
    );
  }

  async desativarFormularioGeral(id: number): Promise<void> {
    await this.httpClient.delete(`${BASE_URL}/${id}`);
  }

  /* ── Gestão de inscrições do FG ── */

  async listarInscricoesFG(): Promise<FGInscricoesListResponse> {
    return this.httpClient.get<FGInscricoesListResponse>(`${BASE_URL}/inscricoes`);
  }

  async detalheInscricaoFG(inscricaoId: number): Promise<FGInscricaoDetalhe> {
    return this.httpClient.get<FGInscricaoDetalhe>(`${BASE_URL}/inscricoes/${inscricaoId}`);
  }

  async alterarStatusInscricaoFG(
    inscricaoId: number,
    status: string,
    observacao?: string,
  ): Promise<{ id: number; status_inscricao: string; observacao_admin: string | null }> {
    return this.httpClient.patch(
      `${BASE_URL}/inscricoes/${inscricaoId}/status`,
      { status, observacao },
    );
  }
}

/* ── Tipos de inscrição FG ── */

export interface FGInscricaoAluno {
  aluno_id: number;
  matricula: string;
  curso?: string;
  campus?: string;
  nome?: string;
  email?: string;
  cpf?: string;
}

export interface FGInscricaoResumo {
  id: number;
  data_inscricao: string;
  status_inscricao: string;
  observacao_admin?: string;
  aluno: FGInscricaoAluno;
}

export interface FGInscricoesListResponse {
  edital_id: number;
  titulo_edital: string;
  total: number;
  inscricoes: FGInscricaoResumo[];
}

export interface FGRespostaDetalhe {
  pergunta_id: number;
  pergunta_texto: string;
  tipo_Pergunta: string;
  valorTexto?: string;
  valorOpcoes?: string[];
  urlArquivo?: string;
  dataResposta?: string;
}

export interface FGStepDetalhe {
  id: number;
  texto: string;
  respostas: FGRespostaDetalhe[];
}

export interface FGDocumentoDetalhe {
  documento_id: number;
  tipo_documento: string;
  documento_url: string;
  status_documento: string;
}

export interface FGInscricaoDetalhe {
  id: number;
  data_inscricao: string;
  status_inscricao: string;
  observacao_admin?: string;
  aluno: FGInscricaoAluno & { celular?: string };
  steps: FGStepDetalhe[];
  documentos: FGDocumentoDetalhe[];
}

export const formularioGeralService = new FormularioGeralService();
