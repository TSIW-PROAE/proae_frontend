import Steps, { StepsConfig, StepsProps } from "@/components/Steps/Steps.tsx";
import logoUfba from "../../../assets/logo-ufba.png";
import { useNavigate } from "react-router-dom";
import "./CadastroEdital.css"


const CadastroEdital = () => {

    const irParaHome = () => {
        navigate("/");
    };

    const navigate = useNavigate();

    const steps: StepsConfig[] = [
        { stepTitle: "Olá Caio, vamos cadastrar o processo seletivo?", stepSubtitle: "Você está começando as etapas para cadastrar um novo edital.", nextButtonName: "Continuar", isFirstPage: true, logoSrc: logoUfba },
        { stepTitle: "Detalhes", stepSubtitle: "Cadastre os detalhes do edital.", backButtonName: "Voltar", nextButtonName: "Continuar" },
        { stepTitle: "Documentos", stepSubtitle: "Cadastre os links dos documentos do edital", backButtonName: "Voltar", nextButtonName: "Continuar" },
        { stepTitle: "Etapas do edital", stepSubtitle: "Cadastre as etapas do edital para a fácil consulta dos alunos na tela de inscrições.", backButtonName: "Voltar", nextButtonName: "Continuar", isLastPage: true }];

    const stepsProps: StepsProps = { stepsConfig: steps, whereToRedirectWhenFinishSteps: "/portal-proae/processos" };

    return (
        <div>
            <div className="header">
                <div
                    className="logo"
                    onClick={irParaHome}
                    style={{ cursor: "pointer" }}
                >
                    <h1>PROAE</h1>
                </div>
                <p className="details">Edital nº 27/2023</p>
            </div>

            {/*<div>CadastroEdital</div>*/}
            <Steps stepsProps={stepsProps} />
        </div>
    )
}
export default CadastroEdital
