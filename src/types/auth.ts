
import { CadastroFormData } from "@/pages/paginaProae/CadastroProae/CadastroProae";
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
  registerAdmin: (data: CadastroFormData) => Promise<DefaultResponse>;
  checkAuth: () => Promise<void>;
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
