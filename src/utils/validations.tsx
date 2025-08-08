import { DateValue } from "@internationalized/date";
import { TipoFormatacao } from "../components/FormularioDinamico/FormularioDinamico";

export function formatPhone(value:string){
    if (!value) return ""
    value = value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/\D/g,'')
    value = value.replace(/(\d{2})(\d)/,"($1) $2")
    value = value.replace(/(\d)(\d{4})$/,"$1-$2")
    return value
}

 export const formatarData = (date: DateValue | null): string => {
    if (!date) return "";
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  };

 export  const formatarCelular = (celular: string): string => {
    const numeros = celular.replace(/\D/g, "");
    if (numeros.length === 11) {
      return `+55${numeros}`;
    }
    return celular;
  };


export function formatCPF(fiscalDocument: string) {
    fiscalDocument = fiscalDocument.replace(/\D/g, "").slice(0, 11); // Limita a 11 dígitos
    fiscalDocument = fiscalDocument.replace(/(\d{3})(\d)/, "$1.$2");
    fiscalDocument = fiscalDocument.replace(/(\d{3})(\d)/, "$1.$2");
    fiscalDocument = fiscalDocument.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return fiscalDocument;
  }

  export function formatCNPJ(cnpj: string) {
    cnpj = cnpj.replace(/\D/g, "").slice(0, 14); // Limita a 14 dígitos
    cnpj = cnpj.replace(/(\d{2})(\d)/, "$1.$2");
    cnpj = cnpj.replace(/(\d{3})(\d)/, "$1.$2");
    cnpj = cnpj.replace(/(\d{3})(\d)/, "$1/$2");
    cnpj = cnpj.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    return cnpj;
  }

  export function formatFiscalDocument(value: string | null) {
     if (!value) return ""

    const cleanedValue = value.replace(/\D/g, "");

    if (cleanedValue.length <= 11) {
      return formatCPF(cleanedValue);
    } else {
      return formatCNPJ(cleanedValue);
    }
  }


export function  validarCPFReal (cpf: string){
      cpf = cpf.replace(/\D/g, '');
      if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

      let soma = 0;
      for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
      let resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;
      if (resto !== parseInt(cpf.charAt(9))) return false;

      soma = 0;
      for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
      resto = (soma * 10) % 11;
      if (resto === 10 || resto === 11) resto = 0;

      return resto === parseInt(cpf.charAt(10));
}

export function formatarTexto(
    texto: string,
    tipo?: TipoFormatacao,
    padrao?: string
): string {
    if (!texto || !tipo) return texto;

    let formatted = texto.replace(/\D/g, "");

    switch (tipo) {
        case "phone":
            if (formatted.length <= 11) {
                if (formatted.length > 2) {
                    formatted = `(${formatted.substring(0, 2)}) ${formatted.substring(2)}`;
                }
                if (formatted.length > 9) {
                    formatted = `${formatted.substring(0, 9)}-${formatted.substring(9, 14)}`;
                }
            }
            return formatted;

        case "dataMes":
            if (formatted.length > 2) {
                formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 6)}`;
            }
            return formatted;

        case "dataCompleta":
            if (formatted.length > 2) {
                formatted = `${formatted.substring(0, 2)}/${formatted.substring(2)}`;
            }
            if (formatted.length > 5) {
                formatted = `${formatted.substring(0, 5)}/${formatted.substring(5, 9)}`;
            }
            return formatted;

        case "cpf":
            if (formatted.length > 3) {
                formatted = `${formatted.substring(0, 3)}.${formatted.substring(3)}`;
            }
            if (formatted.length > 7) {
                formatted = `${formatted.substring(0, 7)}.${formatted.substring(7)}`;
            }
            if (formatted.length > 11) {
                formatted = `${formatted.substring(0, 11)}-${formatted.substring(11, 13)}`;
            }
            return formatted;

        case "cep":
            if (formatted.length > 5) {
                formatted = `${formatted.substring(0, 5)}-${formatted.substring(5, 8)}`;
            }
            return formatted;

        case "cnpj":
            if (formatted.length > 2) {
                formatted = `${formatted.substring(0, 2)}.${formatted.substring(2)}`;
            }
            if (formatted.length > 6) {
                formatted = `${formatted.substring(0, 6)}.${formatted.substring(6)}`;
            }
            if (formatted.length > 10) {
                formatted = `${formatted.substring(0, 10)}/${formatted.substring(10)}`;
            }
            if (formatted.length > 15) {
                formatted = `${formatted.substring(0, 15)}-${formatted.substring(15, 17)}`;
            }
            return formatted;

        case "rg":
            if (formatted.length > 2) {
                formatted = `${formatted.substring(0, 2)}.${formatted.substring(2)}`;
            }
            if (formatted.length > 6) {
                formatted = `${formatted.substring(0, 6)}.${formatted.substring(6)}`;
            }
            if (formatted.length > 10) {
                formatted = `${formatted.substring(0, 10)}-${formatted.substring(10, 11)}`;
            }
            return formatted;

        case "moeda":
            if (formatted.length === 0) return "";
            const value = parseInt(formatted) / 100;
            return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

        case "personalizado":
            if (!padrao) return texto;
            try {
                return texto.replace(new RegExp(padrao), "$&");
            } catch (e) {
                console.error("Erro ao aplicar padrão personalizado:", e);
                return texto;
            }

        default:
            return texto;
    }
}

export function validarFormatacao(valor: string, formatacao?: TipoFormatacao): boolean {
    if (!valor || !formatacao) return true;

    switch (formatacao) {
        case "cpf":
            return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor);
        case "phone":
            return /^\(\d{2}\) \d{5}-\d{4}$/.test(valor);
        case "cep":
            return /^\d{5}-\d{3}$/.test(valor);
        case "dataCompleta":
            return /^\d{2}\/\d{2}\/\d{4}$/.test(valor);
        case "dataMes":
            return /^\d{2}\/\d{4}$/.test(valor);
        case "cnpj":
            return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(valor);
        case "rg":
            return /^\d{2}\.\d{3}\.\d{3}-\d{1}$/.test(valor);
        case "moeda":
            return /^R\$ \d{1,3}(\.\d{3})*,\d{2}$/.test(valor);
        default:
            return true;
    }
}

export function obterMensagemErro(formatacao: TipoFormatacao): string {
    switch (formatacao) {
        case "cpf":
            return "CPF deve estar no formato 000.000.000-00";
        case "phone":
            return "Telefone deve estar no formato (00) 00000-0000";
        case "cep":
            return "CEP deve estar no formato 00000-000";
        case "dataCompleta":
            return "Data deve estar no formato DD/MM/AAAA";
        case "dataMes":
            return "Data deve estar no formato MM/AAAA";
        case "cnpj":
            return "CNPJ deve estar no formato 00.000.000/0000-00";
        case "rg":
            return "RG deve estar no formato 00.000.000-0";
        case "moeda":
            return "Valor deve estar no formato R$ 0,00";
        default:
            return "Formato inválido";
    }
};


