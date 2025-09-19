import { DocumentoEdital, EtapaEdital, Vaga } from "../../types/edital";

export interface EditableDocumento {
  value: DocumentoEdital;
  isEditing: boolean;
}

export interface EditableEtapa {
  value: EtapaEdital;
  isEditing: boolean;
}

export interface EditableVaga {
  value: Vaga;
  isEditing: boolean;
}

export type StatusEdital = "RASCUNHO" | "ABERTO" | "EM_ANDAMENTO" | "ENCERRADO";

export interface QuestionarioItem {
  id?: number;
  titulo: string;
  nome: string;
  previewPerguntas: string[];
}

export interface EditableQuestionario {
  value: QuestionarioItem;
  isEditing: boolean;
}

export interface PerguntaEditorItem {
  texto: string;
  tipo:
    | "texto"
    | "texto_curto"
    | "numero"
    | "data"
    | "multipla_escolha"
    | "multipla_selecao"
    | "arquivo"
    | "email";
  obrigatoria: boolean;
  opcoes: string[];
  isEditing?: boolean;
}

export const statusLabelMap: Record<StatusEdital, string> = {
  RASCUNHO: "Rascunho",
  ABERTO: "Edital em aberto",
  EM_ANDAMENTO: "Edital em andamento",
  ENCERRADO: "Edital encerrado",
};
