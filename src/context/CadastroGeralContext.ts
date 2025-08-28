import { createContext } from "react";

export interface CadastroGeralContextType {
  isValidCg: boolean;
}

export const CadastroGeralContext = createContext<CadastroGeralContextType>({
  isValidCg: false
})


