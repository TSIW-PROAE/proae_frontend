import z from "zod"
import {verificarEmailInstitucional, validarCPFReal} from "@/utils/validations"
export interface UserInfo{
  id: number;
  nome: string;
  email: string;
  [key: string]: any;
}

export interface AuthContextType{
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (data: UserLogin) => Promise <UserLoginResponse>;
  logout: () => void;
  register: (data: UserSignup) => Promise<any>;
  loading: boolean;
}

export type UserSignup = {
  matricula: string;
  email: string;
  senha: string;
  nome: string;
  data_nascimento: string;
  curso: string;
  campus: string;
  cpf: string;
  data_ingresso: string;
  celular: string;
}

export type UserLogin = {
  email: string;
  senha: string;
}

export interface UserLoginResponse {
  success: string;
  user: {
    aluno_id: number
    nome: string;
    email: string;
    matricula: string;
  };
  [key: string]: any;
}

// TODO: Remover declaração any ao finalizar a implementação
export interface UserSignupResponse {
  success: string;
  mensagem: string;
  [key:string]: any;
}

export interface IResetPassword{
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export type UserRole = "admin" | "aluno";

// Schemas com zod

export const SignUpAdmin = z.object({
  cargo: z.string(),
  email: z.email().refine((value) => {
    return verificarEmailInstitucional(value, "@ufba.br")
  }, { message: "Email deve ser institucional (@ufba.br)"}),
  senha: z.string(),
  nome: z.string(),
  dataNascimento: z.string(),
  cpf: z.string().refine((value) => {
    return validarCPFReal(value)
  }),
  celular: z.string()
})