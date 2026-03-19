import { PaginaConfig, TipoInput, FormatacaoInput } from "@/types/dynamicForm";
import { StepResponseDto, PerguntaResponseDto } from "@/types/step";
import type { FormularioGeralStep, FormularioGeralPergunta } from "@/services/FormularioGeralService/formularioGeral.service";

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

/**
 * Adapta os steps retornados por GET /formulario-geral para o formato de páginas/inputs.
 * Permite que o Formulário Geral use as mesmas perguntas e respostas que os outros editais.
 * Defensivo: ignora perguntas sem id (necessário para o envio das respostas).
 */
export const mapFormularioGeralStepsToPaginas = (
  steps: FormularioGeralStep[]
): PaginaConfig[] => {
  if (!steps?.length) return [];
  return steps.map((step: FormularioGeralStep, stepIndex: number) => {
    const texto = step.texto ?? (step.id != null ? `Etapa ${step.id}` : `Etapa ${stepIndex + 1}`);
    const perguntas = (step.perguntas ?? []).filter(
      (p: FormularioGeralPergunta) => p.id != null && p.id !== undefined
    );
    return {
      titulo: texto,
      inputs: perguntas.map((pergunta: FormularioGeralPergunta) => ({
        nome: `pergunta_${pergunta.id}`,
        titulo: pergunta.pergunta ?? "",
        tipo: (pergunta.tipo_Pergunta || "texto") as TipoInput,
        obrigatorio: Boolean(pergunta.obrigatoriedade),
        formatacao: (pergunta.tipo_formatacao as FormatacaoInput) ?? undefined,
        options: Array.isArray(pergunta.opcoes)
          ? pergunta.opcoes.map((opcao: string) => ({ value: opcao, label: opcao }))
          : [],
        placeholder: pergunta.placeholder ?? undefined
      }))
    };
  }).filter((p) => p.inputs.length > 0);
};
