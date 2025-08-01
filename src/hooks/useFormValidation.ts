import { useState } from 'react';
import { validarCPFReal } from '../utils/utils';
import { FormData,FormErrors } from '../types/cadastro';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormData) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: FormErrors = {};
    const cpfNumeros = formData.cpf.replace(/\D/g, "");

    // Validações obrigatórias
    const requiredFields = [
      { field: 'nome', message: 'Nome é obrigatório' },
      { field: 'sobrenome', message: 'Sobrenome é obrigatório' },
      { field: 'pronome', message: 'Pronome é obrigatório' },
      { field: 'dataNascimento', message: 'Data de nascimento é obrigatória' },
      { field: 'curso', message: 'Curso é obrigatório' },
      { field: 'campus', message: 'Campus é obrigatório' },
      { field: 'email', message: 'Email é obrigatório' },
    ] as const;

    requiredFields.forEach(({ field, message }) => {
      if (!formData[field]) {
        newErrors[field] = message;
      }
    });

    // Validação específica do email
    if (formData.email && !formData.email.includes("@ufba.br")) {
      newErrors.email = "Email deve ser do domínio @ufba.br";
    }

    // Validação do CPF
    if (cpfNumeros.length !== 11) {
      newErrors.cpf = "CPF deve conter 11 números";
    } else if (!validarCPFReal(cpfNumeros)) {
      newErrors.cpf = "CPF inválido";
    }

    // Validação da senha
    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 8) {
      newErrors.senha = "Senha deve ter pelo menos 8 caracteres";
    }

    // Confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, clearError, validateForm };
};
