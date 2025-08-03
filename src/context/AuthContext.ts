import { AuthContextType } from "@/types/auth";
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  authToken: null,
  userInfo: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  loading: true,
})
