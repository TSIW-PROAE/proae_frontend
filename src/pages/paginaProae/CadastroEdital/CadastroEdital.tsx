import Steps, {StepsConfig} from "@/components/Steps/Steps.tsx";
import logoUfba from "../../../assets/logo-ufba.png";
import InputGroup from "@/components/InputGroup/InputGroup.tsx";
import {FormProvider, useForm} from "react-hook-form";
import CustomInput, {InputProps} from "@/components/CustomInput/CustomInput.tsx";
import { TypeInput } from "@/utils/enumInput.tsx";
import arrowDownIcon from "../../../assets/icons/arrow-down-item.svg";
import { useNavigate } from "react-router-dom";
import "./CadastroEdital.css";

const CadastroEdital = () => {

    const methods = useForm({
        mode: 'onChange',
        reValidateMode: "onBlur"
    });

    const inputsOfDetailsStep: InputProps[] = [
            { name: "nome_edital", type: TypeInput.Text, title: "Nome do edital", placeholder: "Seleção para benefícios PROAE", required: true},
            { name: "descricao", type: TypeInput.Text, title: "Descrição do edital", placeholder: "Descreva o edital", required: true },
            { name: "tipo_do_beneficio", type: TypeInput.Text, title: "Tipo do benefício do edital", placeholder: "Alimentação", required: true },
            { name: "quantidade_bolsas", type: TypeInput.Text, title: "Quantidade de bolsas", placeholder: "15", required: true}];

    const inputDetailsProps = {inputsConfig: inputsOfDetailsStep}

    const inputDocProps: InputProps = { name: "edital_url", type: TypeInput.TextWithPlusButton, title: "Link para o documento do edital", placeholder: "Link", required: true};

    const inputOfEtapasEditalStep: InputProps[] = [
        { name: "primeiraEtapa", type: TypeInput.TextWithCalendar, title: "Primeira etapa", placeholder: "Nome primeira etapa", required: true},
        { name: "meioEtapas", type: TypeInput.TextWithCalendarRange, title: "Etapa", placeholder: "Nome etapa", required: true},
        { name: "ultimaEtapa", type: TypeInput.TextWithCalendar, title: "Ultima etapa", placeholder: "Nome ultima etapa", required: true}
    ];

    const inputEtapasEdital = {inputsConfig: inputOfEtapasEditalStep}
    const irParaHome = () => {
        navigate("/");
    };

    const navigate = useNavigate();

    const steps: StepsConfig[] = [
        {stepTitle: "Olá Caio! Vamos cadastrar o processo seletivo?", stepSubtitle: "Você está começando as etapas para cadastrar um novo edital.",nextButtonName: "Continuar", isFirstPage: true, logoSrc: logoUfba},
        {stepTitle: "Detalhes", stepSubtitle: "Cadastre os detalhes do edital.", backButtonName: "Voltar", nextButtonName: "Continuar", isNextButtonEnabled: methods.formState.isValid, StepDynamicComponent: InputGroup, stepDynamicProps: inputDetailsProps},
        {stepTitle: "Documentos", stepSubtitle: "Cadastre os links dos documentos do edital", backButtonName: "Voltar", nextButtonName: "Continuar", isNextButtonEnabled: methods.formState.isValid, StepDynamicComponent: CustomInput, stepDynamicProps: inputDocProps},
        {stepTitle: "Etapas do edital", stepSubtitle: "Cadastre as etapas do edital para a fácil consulta dos alunos na tela de inscrições.", backButtonName: "Voltar", nextButtonName: "Salvar Edital", isNextButtonEnabled: methods.formState.isValid, StepDynamicComponent: InputGroup, stepDynamicProps: inputEtapasEdital, isLastPage: true}];

    return (
        <div className="cadastro-page">
            <div className="header">
                <div
                    className="logo"
                    onClick={irParaHome}
                    style={{ cursor: "pointer" }}
                >
                    <h1>PROAE</h1>
                </div>
                <p className="details">Cadastro de Edital PROAE</p>
            </div>

            <div className="steps-container">
                <FormProvider {...methods}>
                    <Steps stepsConfig={steps} whereToRedirectWhenFinishSteps={"/portal-proae/processos"}/>
                </FormProvider>
            </div>

            <div className="footer">
                <div className="footer-back" onClick={irParaHome}>
                    <img src={arrowDownIcon} className="arrow-down" alt="Cancelar" />
                    <span className="voltar-texto">Cancelar</span>
                </div>
            </div>
        </div>
    )
}
export default CadastroEdital