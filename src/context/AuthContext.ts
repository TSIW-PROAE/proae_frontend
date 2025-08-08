import { AuthContextType, UserLogin, UserSignup } from "@/types/auth";
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userInfo: null,
  login: async (data: UserLogin) => {
    return Promise.reject(new Error("Not implemented " + data));
  },
  logout: () => {},
  register: (data: UserSignup) => {return Promise.reject(new Error("Not implemented " + data));},
  Oauth_login: () => {},
  Oauth_logout: () => {},
  Oauth_register: () => {},
  loading: true,
})
