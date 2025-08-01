import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DateValue } from "@internationalized/date";
import { formatCPF } from '../utils/utils';
import { FormData } from '../types/cadastro';

const initialFormData: FormData = {
  nome: "",
  sobrenome: "",
  pronome: "",
  dataNascimento: null,
  curso: "",
  campus: "",
  cpf: "",
  dataIngresso: null,
  matricula: "",
  celular: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

export const useCadastroForm = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cpfParam = params.get("cpf");
    if (cpfParam) {
      setFormData((prev) => ({ ...prev, cpf: formatCPF(cpfParam) }));
    }
  }, [location]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | DateValue | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return { formData, handleInputChange };
};
