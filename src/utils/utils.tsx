export function formatPhone(value:string){
    if (!value) return ""
    value = value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/\D/g,'')
    value = value.replace(/(\d{2})(\d)/,"($1) $2")
    value = value.replace(/(\d)(\d{4})$/,"$1-$2")
    return value
}


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
};