import { CadastroGeralContext } from "@/context/CadastroGeralContext";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";


export default function CadastroGeralProvider({ children }:{children: React.ReactNode}) {
  const {userInfo} = useContext(AuthContext)
  const hasCg = userInfo?.hasCg || false;;
  const navigate = useNavigate();
  const location = useLocation();

  if(!hasCg){
    if(location.pathname.includes('questionario')){
      toast.error("Para Acessar o Este questionário você precisa ter o cadastro geral ativo");
      navigate('/cadastro');
    }
  }



  return (
    <CadastroGeralContext.Provider value={{ isValidCg: hasCg }}>
      {children}
    </CadastroGeralContext.Provider>
  );
}
