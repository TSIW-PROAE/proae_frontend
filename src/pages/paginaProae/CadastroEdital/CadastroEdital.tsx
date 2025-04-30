import Steps, {StepsConfig, StepsProps} from "@/components/Steps/Steps.tsx";
import logoUfba from "../../../assets/logo-ufba.png";

const CadastroEdital = () => {

    const steps: StepsConfig[] = [
        {stepTitle: "Olá Caio, vamos cadastrar o processo seletivo?", stepSubtitle: "Você está começando as etapas para cadastrar um novo edital.",nextButtonName: "Continuar", isFirstPage: true, logoSrc: logoUfba},
        {stepTitle: "Detalhes", stepSubtitle: "Cadastre os detalhes do edital.", backButtonName: "Voltar", nextButtonName: "Continuar"},
        {stepTitle: "Documentos", stepSubtitle: "Cadastre os links dos documentos do edital", backButtonName: "Voltar", nextButtonName: "Continuar"},
        {stepTitle: "Etapas do edital", stepSubtitle: "Cadastre as etapas do edital para a fácil consulta dos alunos na tela de inscrições.", backButtonName: "Voltar", nextButtonName: "Continuar", isLastPage: true}];

    const stepsProps: StepsProps = {stepsConfig: steps, whereToRedirectWhenFinishSteps: "/portal-proae/processos"};

    return (
        <div>
            <div>CadastroEdital</div>
            <Steps stepsProps={stepsProps}/>
        </div>
    )
}
export default CadastroEdital
