import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { StepResponseDto } from "@/types/step";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/steps";

export class StepService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async criarStep(editalId: number, texto: string): Promise<StepResponseDto> {
    // Cria um Step para um edital
    const payload = { texto, edital_id: editalId } as const;
    const resp = await this.httpClient.post<StepResponseDto>(`${BASE_URL}`, payload);
    return resp.data;
  }
  
  async listarStepsPorEdital(editalId: string): Promise<StepResponseDto[]> {
    return this.httpClient.get<StepResponseDto[]>(`${BASE_URL}/edital/${editalId}/with-perguntas`);
  }

  async deletarStep(stepId: number): Promise<{ message?: string }> {
     return this.httpClient.delete<{ message?: string }>(`${BASE_URL}/${stepId}`);
  }

  async atualizarStep(stepId: number, texto: string): Promise<StepResponseDto> {
    return this.httpClient.patch<StepResponseDto>(`${BASE_URL}/${stepId}`, { texto });
  }

}

export const stepService = new StepService();
