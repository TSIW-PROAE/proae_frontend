export interface UserInfo{
  username: string;
  email: string;
  role: "aluno" | "proae";
  // Campos dos keycloak, podem mudar dependendo da configuração do Keycloak
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  preferred_username?: string;
  [key: string]: any;
}

export interface AuthContextType{
  isAuthenticated: boolean;
  authToken: string | null;
  userInfo: UserInfo | null;
  login: () => void;
  logout: () => void;
  register: () => void;
  loading: boolean;
}
