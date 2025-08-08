export interface UserInfo{
  access_token?: string;
  id: number;
  nome: string;
  email: string;
  [key: string]: any;
}

export interface AuthContextType{
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (data: UserLogin) => void;
  logout: () => void;
  register: (data: UserSignup) => void;
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
  sobrenome: string;
  pronome: string;
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
  acess_token: string;
  user: {
    id: number;
    nome: string;
    email: string;
  };
}

// ideia de criar um interface para validar o signup do usuário
//interface ValidateUserSignup{}
