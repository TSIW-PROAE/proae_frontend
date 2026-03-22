import { FetchAdapter } from "@/services/api";
import { API_BASE_URL } from "@/config/api";
import type {
  FormularioGeralCreateBody,
  FormularioGeralPerguntaCreate,
  FormularioGeralResponse,
  FormularioGeralStepCreate,
  FormularioGeralUpdateBody,
  FGInscricaoDetalhe,
} from "@/services/FormularioGeralService/formularioGeral.service";

const BASE_URL = API_BASE_URL + "/formulario-renovacao";

/** Resposta do GET /formulario-renovacao (estende FG com campos de renovação) */
export interface FormularioRenovacaoResponse extends FormularioGeralResponse {
  is_formulario_renovacao?: boolean;
  elegivel_renovacao?: boolean;
  renovacao_aprovada?: boolean;
  data_fim_vigencia?: string | null;
}

export class FormularioRenovacaoService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async getFormularioRenovacao(): Promise<FormularioRenovacaoResponse> {
    return this.httpClient.get<FormularioRenovacaoResponse>(BASE_URL);
  }

  async getFormularioRenovacaoOrNull(): Promise<FormularioRenovacaoResponse | null> {
    try {
      return await this.getFormularioRenovacao();
    } catch {
      return null;
    }
  }

  async criarFormularioRenovacao(
    body: FormularioGeralCreateBody
  ): Promise<FormularioRenovacaoResponse> {
    const response = await this.httpClient.post<FormularioRenovacaoResponse>(
      BASE_URL,
      body
    );
    return (response as any).data ?? response;
  }

  async atualizarFormularioRenovacao(
    id: number,
    body: FormularioGeralUpdateBody
  ): Promise<FormularioRenovacaoResponse> {
    return await this.httpClient.patch<FormularioRenovacaoResponse>(
      `${BASE_URL}/${id}`,
      body
    );
  }

  async desativarFormularioRenovacao(id: number): Promise<void> {
    await this.httpClient.delete(`${BASE_URL}/${id}`);
  }

  async listarInscricoesFR() {
    return this.httpClient.get(`${BASE_URL}/inscricoes`);
  }

  async detalheInscricaoFR(inscricaoId: number): Promise<FGInscricaoDetalhe> {
    return this.httpClient.get<FGInscricaoDetalhe>(
      `${BASE_URL}/inscricoes/${inscricaoId}`
    );
  }

  async alterarStatusInscricaoFR(
    inscricaoId: number,
    status: string,
    observacao?: string
  ) {
    return this.httpClient.patch(`${BASE_URL}/inscricoes/${inscricaoId}/status`, {
      status,
      observacao,
    });
  }
}

export const formularioRenovacaoService = new FormularioRenovacaoService();

export type {
  FormularioGeralStepCreate,
  FormularioGeralPerguntaCreate,
  FormularioGeralCreateBody,
  FormularioGeralUpdateBody,
};
