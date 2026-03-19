import { FetchAdapter } from "../BaseRequestService/HttpClient";
import { AlunoInscrito, RespostaStep } from "../../types/inscricao";
import { Validacao } from "../ValidacaoService/validacaoService";

const BASE_URL = import.meta.env.VITE_API_URL_SERVICES;

export interface NotaCalculada {
  aluno_id: string;
  inscricao_id: string;
  nome: string;
  matricula: string;
  email: string;
  nota_documentos: number;
  nota_respostas: number;
  nota_pareceres: number;
  nota_final: number;
  ranking: number;
  detalhes: {
    documentos_aprovados: number;
    documentos_total: number;
    respostas_completas: number;
    respostas_total: number;
    pareceres_aprovados: number;
    pareceres_total: number;
  };
}

export interface CalculoNotasRequest {
  edital_id: string;
  step_id?: string;
}

export class CalculoNotasService {
  private httpClient: FetchAdapter;

  constructor() {
    this.httpClient = new FetchAdapter();
  }

  /**
   * Calcula as notas de todos os alunos de um edital
   * Baseado em:
   * - Documentos aprovados (40% da nota)
   * - Respostas completas (30% da nota)
   * - Pareceres aprovados (30% da nota)
   */
  async calcularNotasEdital(
    editalId: string,
    stepId?: string
  ): Promise<NotaCalculada[]> {
    try {
      // Buscar todas as inscrições do edital
      const alunos = await this.buscarAlunosInscritos(editalId, stepId);

      // Calcular notas para cada aluno
      const notasCalculadas = await Promise.all(
        alunos.map(async (aluno) => {
          return await this.calcularNotaAluno(aluno, editalId);
        })
      );

      // Ordenar por nota final (maior para menor) e adicionar ranking
      notasCalculadas.sort((a, b) => b.nota_final - a.nota_final);
      notasCalculadas.forEach((nota, index) => {
        nota.ranking = index + 1;
      });

      return notasCalculadas;
    } catch (error: any) {
      console.error("Erro ao calcular notas:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Erro ao calcular notas do edital"
      );
    }
  }

  /**
   * Calcula a nota de um aluno específico
   */
  private async calcularNotaAluno(
    aluno: AlunoInscrito,
    editalId: string
  ): Promise<NotaCalculada> {
    // Buscar documentos do aluno
    const documentos = await this.buscarDocumentosAluno(
      aluno.inscricao_id,
      editalId
    );

    // Buscar pareceres/validações do aluno
    const pareceres = await this.buscarPareceresAluno(
      aluno.inscricao_id,
      editalId
    );

    // Calcular nota de documentos (40% do total)
    const documentosAprovados = documentos.filter((doc) => doc.validado).length;
    const notaDocumentos =
      documentos.length > 0
        ? (documentosAprovados / documentos.length) * 40
        : 0;

    // Calcular nota de respostas (30% do total)
    // Considera respostas completas (não vazias e válidas)
    const respostas = aluno.respostas_step || [];
    const respostasCompletas = respostas.filter(
      (r) => r.valor_texto || r.valor_opcoes?.length || r.url_arquivo
    ).length;
    const notaRespostas =
      respostas.length > 0 ? (respostasCompletas / respostas.length) * 30 : 0;

    // Calcular nota de pareceres (30% do total)
    const pareceresAprovados = pareceres.filter(
      (p) => p.status === "aprovado"
    ).length;
    const notaPareceres =
      pareceres.length > 0
        ? (pareceresAprovados / pareceres.length) * 30
        : 0;

    // Nota final é a soma das três componentes
    const notaFinal = notaDocumentos + notaRespostas + notaPareceres;

    return {
      aluno_id: aluno.aluno_id,
      inscricao_id: aluno.inscricao_id,
      nome: aluno.nome,
      matricula: aluno.matricula,
      email: aluno.email,
      nota_documentos: Math.round(notaDocumentos * 100) / 100,
      nota_respostas: Math.round(notaRespostas * 100) / 100,
      nota_pareceres: Math.round(notaPareceres * 100) / 100,
      nota_final: Math.round(notaFinal * 100) / 100,
      ranking: 0, // Será preenchido após ordenação
      detalhes: {
        documentos_aprovados: documentosAprovados,
        documentos_total: documentos.length,
        respostas_completas: respostasCompletas,
        respostas_total: respostas.length,
        pareceres_aprovados: pareceresAprovados,
        pareceres_total: pareceres.length,
      },
    };
  }

  /**
   * Busca alunos inscritos em um edital
   */
  private async buscarAlunosInscritos(
    editalId: string,
    stepId?: string
  ): Promise<AlunoInscrito[]> {
    try {
      if (stepId) {
        const { inscricaoServiceManager } = await import(
          "../InscricaoService/inscricaoService"
        );
        return await inscricaoServiceManager.listarAlunosPorQuestionario(
          editalId,
          stepId
        );
      }

      // Se não tiver stepId, buscar do primeiro step
      const { stepService } = await import("../StepService/stepService");
      const steps = await stepService.listarStepsPorEdital(
        editalId.toString()
      );
      if (steps && steps.length > 0) {
        const { inscricaoServiceManager } = await import(
          "../InscricaoService/inscricaoService"
        );
        return await inscricaoServiceManager.listarAlunosPorQuestionario(
          editalId,
          steps[0].id
        );
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar alunos inscritos:", error);
      return [];
    }
  }

  /**
   * Busca documentos de uma inscrição
   */
  private async buscarDocumentosAluno(
    inscricaoId: string,
    editalId: string
  ): Promise<Array<{ id: string; validado: boolean }>> {
    try {
      // Em uma implementação real, você teria um endpoint específico para isso
      // Por enquanto, vamos simular ou buscar de uma API
      const response = await this.httpClient.get<{
        sucesso: boolean;
        dados: Array<{ id: string; validado: boolean }>;
      }>(`${BASE_URL}/inscricoes/${inscricaoId}/documentos`);

      if (response.sucesso && response.dados) {
        return response.dados;
      }

      return [];
    } catch (error) {
      // Se não houver endpoint, retorna array vazio
      console.warn("Documentos não encontrados para inscrição:", inscricaoId);
      return [];
    }
  }

  /**
   * Busca pareceres/validações de uma inscrição
   */
  private async buscarPareceresAluno(
    inscricaoId: string,
    editalId: string
  ): Promise<Validacao[]> {
    try {
      const { validacaoService } = await import(
        "../ValidacaoService/validacaoService"
      );
      // Buscar validações relacionadas à inscrição
      // Em uma implementação real, você teria um endpoint específico
      const allValidacoes = await validacaoService.listarValidacoes();
      return allValidacoes.filter(
        (v) => v.questionario_id !== undefined // Filtrar por questionário relacionado
      );
    } catch (error) {
      console.warn("Pareceres não encontrados para inscrição:", inscricaoId);
      return [];
    }
  }
}

export const calculoNotasService = new CalculoNotasService();

