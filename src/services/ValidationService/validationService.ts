import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { ValidacaoCreateDto, Validacao } from "../../types/validacao";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;

export class ValidationService {
  private http: FetchAdapter;

  constructor() {
    this.http = new FetchAdapter();
  }

  async criarValidacao(dados: ValidacaoCreateDto): Promise<Validacao> {
    const response = await this.http.post<Validacao>(`${BASE_URL}/validacao`, dados);
    // FetchAdapter.post retorna HttpResponse<T>
    return response.data as Validacao;
  }

  async atualizarValidacao(id: string, dados: Partial<ValidacaoCreateDto>): Promise<Validacao> {
    const response = await this.http.patch<Validacao>(`${BASE_URL}/validacao/${id}`, dados);
    return response as Validacao;
  }
}

export const validationService = new ValidationService();
