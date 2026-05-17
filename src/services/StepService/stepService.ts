import { FetchAdapter } from "../api";
import { StepResponseDto } from "@/types/step";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL + "/steps";

export class StepService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async criarStep(editalId: string, texto: string): Promise<StepResponseDto> {
    // Cria um Step para um edital
    const payload = { texto, edital_id: editalId } as const;
    const resp = await this.httpClient.post<StepResponseDto>(`${BASE_URL}`, payload);
    return resp.data;
  }
  
  async listarStepsPorEdital(editalId: string): Promise<StepResponseDto[]> {
    return this.httpClient.get<StepResponseDto[]>(`${BASE_URL}/edital/${editalId}/with-perguntas`);
  }

  async deletarStep(stepId: string): Promise<{ message?: string }> {
     return this.httpClient.delete<{ message?: string }>(`${BASE_URL}/${stepId}`);
  }

  async atualizarStep(stepId: string, texto: string): Promise<StepResponseDto> {
    return this.httpClient.patch<StepResponseDto>(`${BASE_URL}/${stepId}`, { texto });
  }

  /**
   * Reordena steps do edital sem excluir/recriar registros (atualiza só o campo ordem).
   */
  async reordenarSteps(
    editalId: string | number,
    itens: { id: number | string; ordem: number }[],
  ): Promise<{ message: string }> {
    return this.httpClient.patch<{ message: string }>(
      `${BASE_URL}/edital/${editalId}/reordenar`,
      {
        itens: itens.map((it) => ({
          id: typeof it.id === "string" ? Number(it.id) : it.id,
          ordem: it.ordem,
        })),
      },
    );
  }

  /**
   * Clona o formulário (steps + perguntas) de outro edital para o edital alvo.
   * Em transação no backend; mantém ordem, opções, condições e tipos.
   */
  async clonarFormulario(
    editalAlvoId: string | number,
    editalOrigemId: string | number,
    substituirExistente = false,
  ): Promise<{ stepsCriados: number; perguntasCriadas: number }> {
    const payload = {
      edital_origem_id:
        typeof editalOrigemId === "string"
          ? Number(editalOrigemId)
          : editalOrigemId,
      substituir_existente: substituirExistente,
    };
    const resp = await this.httpClient.post<{
      stepsCriados: number;
      perguntasCriadas: number;
    }>(`${BASE_URL}/edital/${editalAlvoId}/clonar-formulario`, payload);
    return resp.data;
  }
}

export const stepService = new StepService();
