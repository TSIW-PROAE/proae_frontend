export interface UserInfo{
  username: string;
  email:string;
  role: "aluno" | "proae";
  [key: string] : any;
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
