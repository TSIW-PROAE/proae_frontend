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
  Oauth_login: () => void;
  Oauth_logout: () => void;
  Oauth_register: () => void;
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

// ideia de criar um interface para validar o signup do usuário
//interface ValidateUserSignup{}
