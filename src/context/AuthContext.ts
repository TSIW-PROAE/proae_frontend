import { AuthContextType } from "@/types/auth";
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userInfo: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  Oauth_login: () => {},
  Oauth_logout: () => {},
  Oauth_register: () => {},
  loading: true,
})
