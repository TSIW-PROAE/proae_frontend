import { Spinner } from "@heroui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@heroui/button";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";

export default function TelaDeEspera() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userInfo, checkAuth } = useContext(AuthContext);
    const [_, setLastCheck] = useState<Date | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const sucesso = searchParams.get("sucesso") === "true";

    // Verifica autenticação ao montar o componente
    useEffect(() => {
        async function handleCheckAuth(){
            await checkAuth();
        }
        handleCheckAuth();       
    }, [checkAuth]);

    // Se houver parâmetro sucesso=true, força verificação imediata e mais frequente
    useEffect(() => {
        if (sucesso) {
            // Verificação imediata quando há sucesso
            const immediateCheck = async () => {
                setIsChecking(true);
                try {
                    await checkAuth();
                    setLastCheck(new Date());
                } finally {
                    setIsChecking(false);
                }
            };
            immediateCheck();

            // Verificações periódicas mais frequentes
            const checkInterval = setInterval(async () => {
                if (!isChecking) {
                    setIsChecking(true);
                    try {
                        await checkAuth();
                        setLastCheck(new Date());
                    } finally {
                        setIsChecking(false);
                    }
                }
            }, 2000); // Verifica a cada 2 segundos quando há sucesso

            return () => clearInterval(checkInterval);
        }
    }, [sucesso, checkAuth]);

    // Verificação periódica normal (quando não há sucesso)
    useEffect(() => {
        if (!sucesso) {
            const intervalId = setInterval(async () => {
                if (!isChecking) {
                    setIsChecking(true);
                    try{
                        await checkAuth();
                        setLastCheck(new Date());
                    } finally{
                        setIsChecking(false);
                    }
                }
            }, 10000);

            return () => clearInterval(intervalId);
        }
    }, [sucesso, isChecking, checkAuth]);

    // Redireciona quando aprovado
    useEffect(() => {
        if(userInfo?.aprovado){
            // Se veio de um link de aprovação, redireciona para home primeiro
            if (sucesso) {
                navigate("/", { replace: true });
            } else {
                navigate("/portal-proae/inscricoes", { replace: true });
            }
        }
    }, [userInfo, navigate, sucesso]);

    // Redirecionamento de segurança quando há sucesso=true (após 10 segundos)
    useEffect(() => {
        if (sucesso) {
            const timeoutId = setTimeout(() => {
                // Força redirecionamento para home após 10 segundos mesmo se o estado não atualizar
                navigate("/", { replace: true });
            }, 10000);

            return () => clearTimeout(timeoutId);
        }
    }, [sucesso, navigate]);


    const handleVoltar = () => {
        navigate("/login");
    };

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-[#183b4e] px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-6 text-center">
                <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <Spinner size="lg" className="text-[#183b4e]" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800">
                        {sucesso ? "Verificando Aprovação..." : "Aguardando Aprovação"}
                    </h1>
                    
                    <div className="space-y-4 text-gray-600">
                        {sucesso ? (
                            <>
                                <p className="text-lg">
                                    Sua aprovação está sendo processada.
                                </p>
                                <p className="text-base">
                                    Aguarde enquanto verificamos seu status de aprovação...
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-lg">
                                    Seu cadastro está em análise pela equipe PROAE.
                                </p>
                                <p className="text-base">
                                    Assim que seu acesso for aprovado, você receberá um e-mail de confirmação
                                    e poderá acessar o sistema normalmente.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">
                        Se precisar de assistência, entre em contato com a equipe PROAE
                    </p>
                    
                    <Button
                        variant="light"
                        color="primary"
                        onPress={handleVoltar}
                        className="mx-auto"
                    >
                        Voltar para Login
                    </Button>
                </div>
            </div>
        </section>
    );
}