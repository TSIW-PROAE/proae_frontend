export interface Etapa {
  id?: number;
  nome: string;
  ordem: number;
  data_inicio: string;
  data_fim: string;
}

export interface Edital {
  id?: number;
  tipo_edital:
    | "Auxilio Transporte"
    | "Auxilio Alimentação"
    | "Auxilio Moradia"
    | "Apoio à Inclusão Digital";
  descricao: string;
  edital_url: string[];
  titulo_edital: string;
  quantidade_bolsas: number;
  status_edital:
    | "Edital em aberto"
    | "Edital encerrado"
    | "Edital em andamento";
  created_at?: string;
  updated_at?: string;
  etapas: Etapa[];
}

export interface CreateEditalRequest {
  tipo_edital:
    | "Auxilio Transporte"
    | "Auxilio Alimentação"
    | "Auxilio Moradia"
    | "Apoio à Inclusão Digital";
  descricao: string;
  edital_url: string[];
  titulo_edital: string;
  quantidade_bolsas: number;
  etapas: Etapa[];
}

export interface UpdateEditalRequest {
  status_edital?:
    | "Edital em aberto"
    | "Edital encerrado"
    | "Edital em andamento";
  titulo_edital?: string;
  quantidade_bolsas?: number;
  etapas?: Etapa[];
}
