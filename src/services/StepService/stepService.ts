import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { StepResponseDto } from "@/types/step";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES + "/steps";

export class StepService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  async listarStepsPorEdital(editalId: number): Promise<StepResponseDto[]> {
    return this.httpClient.get<StepResponseDto[]>(`${BASE_URL}/edital/${editalId}/with-perguntas`);
  }

}

export const stepService = new StepService();
