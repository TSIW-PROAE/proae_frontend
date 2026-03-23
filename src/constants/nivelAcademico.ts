/** Valores exatamente como no backend (`enumNivelAcademico`). */
export const NIVEL_GRADUACAO = "Graduação" as const;
export const NIVEL_POS_GRADUACAO = "Pós-graduação" as const;

export type NivelAcademicoValue =
  | typeof NIVEL_GRADUACAO
  | typeof NIVEL_POS_GRADUACAO;

export const OPCOES_NIVEL_ACADEMICO: { value: NivelAcademicoValue; label: string }[] = [
  { value: NIVEL_GRADUACAO, label: "Graduação" },
  { value: NIVEL_POS_GRADUACAO, label: "Pós-graduação" },
];

export function nivelAcademicoQuery(nivel: string): string {
  return `nivel_academico=${encodeURIComponent(nivel)}`;
}
