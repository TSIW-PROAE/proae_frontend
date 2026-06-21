/** Espelha o backend: mensagens de validação legíveis em português. */
const REPLACEMENTS: [RegExp, string][] = [
  [/must be a valid ISO 8601 date string/gi, 'informe uma data válida (dia, mês e ano)'],
  [/ISO 8601/gi, 'data válida'],
  [/ISO string/gi, 'data válida'],
  [/must be a valid phone number/gi, 'informe um celular com DDD, por exemplo (71) 99999-9999'],
  [/Invalid email/gi, 'e-mail inválido'],
  [/must be an email/gi, 'informe um e-mail válido'],
  [/Invalid input/gi, 'valor inválido'],
  [/expected string/gi, 'preencha este campo'],
  [/Required/gi, 'campo obrigatório'],
  [/should not be empty/gi, 'é obrigatório'],
];

const FIELD_LABELS: Record<string, string> = {
  // edital
  titulo_edital: 'título do edital',
  descricao: 'descrição',
  status_edital: 'status do edital',
  nivel_academico: 'nível acadêmico',
  aplicar_template_cadastro: 'aplicar template de cadastro',
  data_fim_vigencia: 'data de fim da vigência',
  edital_id: 'edital',
  edital_origem_id: 'edital de origem',
  edital_url: 'documentos do edital',
  titulo_documento: 'título do documento',
  url_documento: 'URL do documento',
  etapa_edital: 'etapas do edital',
  etapa: 'etapa',
  ordem_elemento: 'ordem',
  data_inicio: 'data de início',
  data_fim: 'data de fim',

  // vaga/benefício
  descricao_beneficio: 'descrição do benefício',
  beneficio: 'benefício',
  numero_vagas: 'número de vagas',
  vaga_id: 'vaga',
  status_beneficio_edital: 'status do benefício',
  permitir_exceder_vagas: 'permissão para exceder vagas',
  justificativa_override: 'justificativa de override',

  // inscrição/recursos
  status_inscricao: 'status da inscrição',
  data_inscricao: 'data da inscrição',
  respostas: 'respostas',
  respostas_editadas: 'respostas editadas',
  observacao: 'observação',
  justificativa: 'justificativa',
  resultado_fase: 'resultado da fase',
  recurso_status: 'status do recurso',
  recurso_observacao: 'observação do recurso',

  // autenticação/aluno/admin
  email: 'e-mail',
  senha: 'senha',
  newPassword: 'nova senha',
  confirmPassword: 'confirmação de senha',
  nome: 'nome',
  sobrenome: 'sobrenome',
  matricula: 'matrícula',
  data_nascimento: 'data de nascimento',
  curso: 'curso',
  campus: 'campus',
  cpf: 'CPF',
  data_ingresso: 'data de ingresso',
  celular: 'celular',
  perfil: 'perfil',
  cargo: 'cargo',
  pronome: 'pronome',
  token: 'token',

  // formulário/perguntas/respostas/documentos
  step_id: 'etapa do formulário',
  pergunta: 'pergunta',
  perguntaId: 'pergunta',
  pergunta_id_origem: 'pergunta de origem',
  tipo_Pergunta: 'tipo da pergunta',
  obrigatoriedade: 'obrigatoriedade',
  opcoes: 'opções',
  tipo_formatacao: 'tipo de formatação',
  dadoId: 'dado',
  ordem: 'ordem',
  prazoResposta: 'prazo de resposta',
  condicao: 'condição',
  pontuacao_validacao: 'pontuação de validação',
  valorTexto: 'valor do texto',
  valorOpcoes: 'valores selecionados',
  urlArquivo: 'arquivo',
  tipo_documento: 'tipo de documento',
  documento_url: 'documento',
  status_documento: 'status do documento',
  inscricao: 'inscrição',
  inscricaoId: 'inscrição',
  inscricao_id: 'inscrição',
};

const CONSTRAINT_TRANSLATIONS: [RegExp, string][] = [
  [/^should not be empty$/i, 'é um campo obrigatório.'],
  [/^must not be empty$/i, 'é um campo obrigatório.'],
  [/^must be a string$/i, 'deve ser um texto válido.'],
  [/^must be a number$/i, 'deve ser um número válido.'],
  [/^must be a number conforming to the specified constraints$/i, 'deve ser um número válido.'],
  [/^must be a boolean value$/i, 'deve ser verdadeiro ou falso.'],
  [/^must be an email$/i, 'deve ser um e-mail válido.'],
  [/^must be a valid ISO 8601 date string$/i, 'deve ser uma data válida.'],
  [/^must be a valid phone number$/i, 'deve ser um telefone válido.'],
  [/^must be one of the following values$/i, 'deve ser um dos valores permitidos.'],
  [/^must be one of the following values:\s*(.+)$/i, 'deve ser um dos valores permitidos: $1.'],
  [/^must be an array$/i, 'deve ser uma lista válida.'],
  [/^must be an object$/i, 'deve ser um objeto válido.'],
  [/^must be a Date instance$/i, 'deve ser uma data válida.'],
  [/^must be an instance of (.+)$/i, 'deve seguir o formato esperado ($1).'],
  [/^must be longer than or equal to (\d+) characters$/i, 'deve ter no mínimo $1 caracteres.'],
  [/^must be shorter than or equal to (\d+) characters$/i, 'deve ter no máximo $1 caracteres.'],
  [/^must match (.+) regular expression$/i, 'está em formato inválido.'],
];

function toSentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeFieldKey(field: string): string {
  const lastPart = field.split('.').pop() ?? field;
  return lastPart.trim();
}

function fieldToLabel(field: string): string {
  const key = normalizeFieldKey(field);
  const mapped = FIELD_LABELS[key];
  if (mapped) return mapped;

  const snakeOrKebab = key.replace(/[_-]+/g, ' ');
  const spaced = snakeOrKebab.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.toLowerCase();
}

function translateConstraint(rawConstraint: string): string {
  const constraint = rawConstraint.trim();
  for (const [pattern, translated] of CONSTRAINT_TRANSLATIONS) {
    if (pattern.test(constraint)) return constraint.replace(pattern, translated);
  }
  return constraint;
}

function looksLikeTechnicalConstraint(text: string): boolean {
  const normalized = text.toLowerCase();
  return (
    normalized.includes(' must ') ||
    normalized.startsWith('must ') ||
    normalized.includes(' should ') ||
    normalized.startsWith('should ') ||
    normalized.includes('class-validator') ||
    normalized.includes('constraint')
  );
}

export function humanizeValidationMessage(raw: string): string {
  let msg = (raw ?? '').trim();
  if (!msg) return 'Revise os dados e tente novamente.';

  const fieldConstraintMatch = /^([a-zA-Z0-9_.-]+)\s+(must|should)\s+(.+)$/i.exec(msg);
  if (fieldConstraintMatch) {
    const [, field, verb, rest] = fieldConstraintMatch;
    const label = fieldToLabel(field);
    const translatedConstraint = translateConstraint(`${verb.toLowerCase()} ${rest}`);
    if (looksLikeTechnicalConstraint(translatedConstraint)) {
      return `Revise o campo "${toSentenceCase(label)}".`;
    }
    return `${toSentenceCase(label)} ${translatedConstraint}`;
  }

  for (const [pattern, replacement] of REPLACEMENTS) {
    msg = msg.replace(pattern, replacement);
  }

  // Zod / genérico: "Invalid ISO datetime" etc.
  if (/iso/i.test(msg) && /date|data|datetime/i.test(msg)) {
    return 'Selecione uma data válida no calendário (dia, mês e ano).';
  }

  if (looksLikeTechnicalConstraint(msg)) {
    return 'Revise os dados informados.';
  }

  return toSentenceCase(msg);
}
