import {  validarCPFReal } from "@/utils/validations";
import { DateValue } from "@internationalized/date";
import { useCallback, useState } from "react";

export interface FormData {
  nome: string;
  dataNascimento: DateValue | null;
  curso: string;
  campus: string;
  cpf: string;
  dataIngresso: DateValue | null;
  matricula: string;
  celular: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}


interface UseFormValidationResult {
  errors: Record<string, string>;
  validateForm: () => void;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
  isValid: boolean;
}

export default function useFormValidation(formData: FormData): UseFormValidationResult {
  const [errors, setErrors] = useState<any>({});
  const [isValid, setIsValid] = useState<boolean>(true);

  const validateForm = useCallback(() => {
    const newErrors: any = {};
    const cpfNumeros = formData.cpf.replace(/\D/g, "");

    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    if (!formData.dataNascimento)
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    if (!formData.campus) newErrors.campus = "Campus é obrigatório";
    if (!formData.curso) newErrors.curso = "Curso é obrigatório";
    if (!formData.matricula) newErrors.matricula = "Matrícula é obrigatória";
    if (!formData.celular) newErrors.celular = "Celular é obrigatório";
    if (!formData.dataIngresso) newErrors.dataIngresso = "Data de ingresso é obrigatória";

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!formData.email.includes("@ufba.br")) {
      newErrors.email = "Email deve ser do domínio @ufba.br";
    }

    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (cpfNumeros.length !== 11) {
      newErrors.cpf = "CPF deve conter 11 números";
    } else if (!validarCPFReal(cpfNumeros)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 8) {
      newErrors.senha = "Senha deve ter pelo menos 8 caracteres";
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }

    if (formData.celular && formData.celular.replace(/\D/g, "").length < 10) {
      newErrors.celular = "Celular deve ter pelo menos 10 dígitos";
    }

    if (formData.matricula && formData.matricula.length < 5) {
      newErrors.matricula = "Matrícula deve ter pelo menos 5 caracteres";
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);

  }, [formData])

  return {
    errors,
    validateForm,
    isValid,
    clearErrors: () => setErrors({}),
    setFieldError: (field: string, error: string) =>
      setErrors((prev: any) => ({ ...prev, [field]: error }))
  }

}
