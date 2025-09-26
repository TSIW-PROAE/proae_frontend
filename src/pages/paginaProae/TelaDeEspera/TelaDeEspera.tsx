import { Spinner } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";

export default function TelaDeEspera() {
    const navigate = useNavigate();
    const { userInfo, checkAuth } = useContext(AuthContext);
    const [_, setLastCheck] = useState<Date | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        async function handleCheckAuth(){
            await checkAuth();
        }
        handleCheckAuth();       
    }, []);

    useEffect(() => {
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
        }, 10000)

        return () => clearInterval(intervalId);
    }, [isChecking])

    useEffect(() => {
        if(userInfo?.aprovado){
            navigate("/portal-proae/inscricoes");
        }
    }, [userInfo])


    const handleVoltar = () => {
        navigate("/login-proae");
    };

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-[#183b4e] px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-6 text-center">
                <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <Spinner size="lg" className="text-[#183b4e]" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800">
                        Aguardando Aprovação
                    </h1>
                    
                    <div className="space-y-4 text-gray-600">
                        <p className="text-lg">
                            Seu cadastro está em análise pela equipe PROAE.
                        </p>
                        <p className="text-base">
                            Assim que seu acesso for aprovado, você receberá um e-mail de confirmação
                            e poderá acessar o sistema normalmente.
                        </p>
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