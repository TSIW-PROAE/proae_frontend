import z from "zod";
import {
  verificarEmailInstitucional,
  validarCPFReal,
} from "@/utils/validations";
export interface UserInfo {
  id: number;
  nome: string;
  email: string;
  roles: UserRole[];
  [key: string]: any;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (data: UserLogin) => Promise<UserLoginResponse>;
  logout: () => void;
  registerAluno: (data: UserSignup) => Promise<DefaultResponse>;
  registerAdmin: (data: UserSignup) => Promise<DefaultResponse>;
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
};

export type UserLogin = {
  email: string;
  senha: string;
};

export interface UserLoginResponse {
  success: string;
  user: {
    usuario_id: number;
    email: string;
    nome: string;
    roles: UserRole[];
  };
  [key: string]: any;
}

// TODO: Remover declaração any ao finalizar a implementação
export interface DefaultResponse {
  success: string;
  mensagem: string;
  [key: string]: any;
}

export interface IResetPassword {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IValidateTokenResponse {
  valid: boolean;
  user: UserInfo;
  roles: UserRole[];
  payload: any;
  error?: undefined;
}

export type UserRole = "admin" | "aluno";

// Schemas com zod

export const SignUpAdmin = z.object({
  cargo: z.string(),
  email: z.email().refine(
    (value) => {
      return verificarEmailInstitucional(value, "@ufba.br");
    },
    { message: "Email deve ser institucional (@ufba.br)" }
  ),
  senha: z.string(),
  nome: z.string(),
  dataNascimento: z.string(),
  cpf: z.string().refine((value) => {
    return validarCPFReal(value);
  }),
  celular: z.string(),
});
