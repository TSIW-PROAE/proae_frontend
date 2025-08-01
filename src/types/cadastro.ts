import { DateValue } from "@internationalized/date";

export interface FormData {
  nome: string;
  sobrenome: string;
  pronome: string;
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

export interface FormErrors {
  [key: string]: string;
}
