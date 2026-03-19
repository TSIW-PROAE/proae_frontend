import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Spinner } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";

export default function AdminAprovado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useContext(AuthContext);
  const sucesso = searchParams.get("sucesso") === "true";

  useEffect(() => {
    const handleApproval = async () => {
      try {
        // Atualiza o estado de autenticação para refletir a aprovação
        await checkAuth();
        
        // Aguarda um momento para garantir que o estado foi atualizado
        setTimeout(() => {
          // Redireciona para a página inicial
          navigate("/", { replace: true });
        }, 2000);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Mesmo em caso de erro, redireciona após um tempo
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      }
    };

    if (sucesso) {
      handleApproval();
    } else {
      // Se não houver parâmetro de sucesso, redireciona imediatamente
      navigate("/", { replace: true });
    }
  }, [sucesso, checkAuth, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6 text-center">
        {sucesso ? (
          <>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800">
              Aprovação Confirmada!
            </h1>
            
            <div className="space-y-4 text-gray-600">
              <p className="text-lg">
                Seu cadastro foi aprovado com sucesso.
              </p>
              <p className="text-base">
                Você será redirecionado para a página inicial em instantes...
              </p>
            </div>

            <div className="pt-4">
              <Spinner size="lg" className="text-[#183b4e]" />
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Spinner size="lg" className="text-[#183b4e]" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800">
              Processando...
            </h1>
            
            <p className="text-gray-600">
              Redirecionando para a página inicial...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
