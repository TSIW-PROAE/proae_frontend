import { CondicaoLogica, FormData } from '@/types/dynamicForm';

export const avaliarCondicao = (condicao: CondicaoLogica | undefined, formData: FormData): boolean => {
  if (!condicao) return true;

  const { campo, valor, operador = 'equals' } = condicao;
  const valorCampo = formData[campo];

  switch (operador) {
    case 'equals':
      return valorCampo === valor;
    case 'notEquals':
      return valorCampo !== valor;
    case 'includes':
      return Array.isArray(valor) ? valor.includes(valorCampo as string) : valorCampo === valor;
    case 'notIncludes':
      return Array.isArray(valor) ? !valor.includes(valorCampo as string) : valorCampo !== valor;
    default:
      return true;
  }
};

export const filtrarPaginasCondicionais = (paginas: any[], formData: FormData) => {
  return paginas.filter(pagina => avaliarCondicao(pagina.condicao, formData));
};


export const filtrarInputsCondicionais = (inputs: any[], formData: FormData) => {
  return inputs.filter(input => avaliarCondicao(input.condicao, formData));
};
