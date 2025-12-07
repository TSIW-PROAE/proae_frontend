
export enum TipoDocumento{
  CPF = 'Comprovante de situação cadastral do cpf',
  HISTORICO_ESCOLAR = 'Cert. de conclusão ou Hist. escolar do ensino médio',
  RG = 'Documento de Identidade',
  COMPROVANTE_MATRICULA = 'Comprovante de matrícula',
}

export type StatusDocumento = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export type RDocumento = {
    success: boolean;
    documento: {
        documento_id: number;
        tipo_documento: TipoDocumento;
        status: StatusDocumento;
        documento_url: string;
    }
}



