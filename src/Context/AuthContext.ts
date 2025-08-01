import { AuthContextType } from "@/types/auth";
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  role: "aluno",
  loading: true,
})
