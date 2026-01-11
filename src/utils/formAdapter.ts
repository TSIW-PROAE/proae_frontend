import { PaginaConfig, TipoInput, FormatacaoInput } from "@/types/dynamicForm";
import { StepResponseDto, PerguntaResponseDto } from "@/types/step";

/**
 * Adapta a resposta de Steps do backend para o formato de páginas/inputs
 */
export const mapStepsToPaginas = (steps: StepResponseDto[]): PaginaConfig[] => {
  return steps.map((step: StepResponseDto) => ({
    titulo: step.texto,
    inputs: step.perguntas.map((pergunta: PerguntaResponseDto) => ({
      nome: `pergunta_${pergunta.id}`,
      titulo: pergunta.pergunta,
      tipo: pergunta.tipo_Pergunta as TipoInput,
      obrigatorio: pergunta.obrigatoriedade,
      formatacao: pergunta.tipo_formatacao as FormatacaoInput,
      options: (pergunta.opcoes || []).map((opcao: string) => ({
        value: opcao,
        label: opcao
      })),
      placeholder: pergunta.placeholder
    }))
  }));
};
