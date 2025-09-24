import { AuthContextType, UserLogin, UserSignup } from "@/types/auth";
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userInfo: null,
  login: async (data: UserLogin) => {
    return Promise.reject(new Error("Not implemented " + data));
  },
  logout: () => {},
  registerAluno: (data: UserSignup) => {return Promise.reject(new Error("Not implemented " + data));},
  registerAdmin: (data: UserSignup) => {return Promise.reject(new Error("Not implemented " + data));},
  loading: true,
})
