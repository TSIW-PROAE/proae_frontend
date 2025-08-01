export interface AuthContextType{
  isAuthenticated: boolean;
  user: object | null;
  role: "aluno" | "proae";
  loading: boolean;
}


