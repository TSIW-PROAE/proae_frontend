import Steps, { StepsConfig } from "@/components/Steps/Steps.tsx";
import logoUfba from "../../../assets/logo-ufba.png";
import InputGroup from "@/components/InputGroup/InputGroup.tsx";
import { FormProvider, useForm } from "react-hook-form";
import CustomInput, { InputProps } from "@/components/CustomInput/CustomInput.tsx";
import { TypeInput } from "@/utils/enumInput.tsx";
import arrowDownIcon from "../../../assets/icons/arrow-down-item.svg";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { editalService } from "@/services/EditalService/editalService";
import { mapCadastroEditalFormToPayload } from "@/utils/cadastroEditalMapper";
import "./CadastroEdital.css";

const CadastroEdital = () => {

    const methods = useForm({
        mode: 'onChange',
        reValidateMode: "onBlur"
    });

    const navigate = useNavigate();

    const inputsOfDetailsStep: InputProps[] = [
        { name: "nome_edital", type: TypeInput.Text, title: "Nome do edital", placeholder: "Seleção para benefícios PROAE", required: true },
        { name: "descricao", type: TypeInput.Text, title: "Descrição do edital", placeholder: "Descreva o edital", required: true },
        { name: "tipo_do_beneficio", type: TypeInput.Text, title: "Tipo do benefício do edital", placeholder: "Alimentação", required: true },
        { name: "quantidade_bolsas", type: TypeInput.Text, title: "Quantidade de bolsas", placeholder: "15", required: true },
        { name: "data_fim_vigencia", type: TypeInput.Text, title: "Fim da vigência no portal (opcional)", placeholder: "AAAA-MM-DD", required: false },
    ];

    const inputDetailsProps = { inputsConfig: inputsOfDetailsStep }

    const inputDocProps: InputProps = { name: "edital_url", type: TypeInput.TextWithPlusButton, title: "Link para o documento do edital", placeholder: "Link", required: true };

    const inputOfEtapasEditalStep: InputProps[] = [
        { name: "primeiraEtapa", type: TypeInput.TextWithCalendar, title: "Primeira etapa", placeholder: "Nome primeira etapa", required: true },
        { name: "meioEtapas", type: TypeInput.TextWithCalendarRange, title: "Etapa", placeholder: "Nome etapa", required: true },
        { name: "ultimaEtapa", type: TypeInput.TextWithCalendar, title: "Ultima etapa", placeholder: "Nome ultima etapa", required: true }
    ];

    const inputEtapasEdital = { inputsConfig: inputOfEtapasEditalStep }

    const handleFinishSteps = async (getValues: () => Record<string, unknown>) => {
        const v = getValues();
        const payload = mapCadastroEditalFormToPayload(v);
        if (!payload.titulo_edital.trim()) {
            throw new Error("Nome do edital é obrigatório.");
        }
        if (!payload.descricao.trim()) {
            throw new Error("Descrição é obrigatória.");
        }
        if (!payload.edital_url.length) {
            throw new Error("Informe ao menos um link de documento do edital.");
        }
        if (!payload.etapa_edital.length) {
            throw new Error("Preencha todas as etapas (nome e datas).");
        }
        try {
            const created = await editalService.criarEdital({ titulo_edital: payload.titulo_edital.trim() });
            if (!created?.id) {
                throw new Error("Não foi possível criar o edital.");
            }
            await editalService.atualizarEdital(created.id, {
                descricao: payload.descricao,
                edital_url: payload.edital_url,
                etapa_edital: payload.etapa_edital,
                data_fim_vigencia: payload.data_fim_vigencia,
            });
        } catch (e: unknown) {
            const any = e as { message?: string | string[] };
            const msg = Array.isArray(any?.message) ? any.message.join(", ") : any?.message;
            throw new Error(msg || "Erro ao salvar o edital. Verifique os dados e tente novamente.");
        }
    };

    const steps: StepsConfig[] = [
        { stepTitle: "Olá Caio! Vamos cadastrar o processo seletivo?", stepSubtitle: "Você está começando as etapas para cadastrar um novo edital.", nextButtonName: "Continuar", isFirstPage: true, logoSrc: logoUfba },
        { stepTitle: "Detalhes", stepSubtitle: "Cadastre os detalhes do edital.", backButtonName: "Voltar", nextButtonName: "Continuar", isNextButtonEnabled: methods.formState.isValid, StepDynamicComponent: InputGroup, stepDynamicProps: inputDetailsProps },
        { stepTitle: "Documentos", stepSubtitle: "Cadastre os links dos documentos do edital", backButtonName: "Voltar", nextButtonName: "Continuar", isNextButtonEnabled: methods.formState.isValid, StepDynamicComponent: CustomInput, stepDynamicProps: inputDocProps },
        { stepTitle: "Etapas do edital", stepSubtitle: "Cadastre as etapas do edital para a fácil consulta dos alunos na tela de inscrições.", backButtonName: "Voltar", nextButtonName: "Salvar Edital", isNextButtonEnabled: methods.formState.isValid, StepDynamicComponent: InputGroup, stepDynamicProps: inputEtapasEdital, isLastPage: true }];

    return (
        <div className="cadastro-page">
            <div className="header">
                <div className="logo" onClick={() => navigate("/portal-proae/inscricoes")} style={{ cursor: "pointer" }}>
                    <h1>PROAE</h1>
                </div>
                <p className="details">Cadastro de Edital PROAE</p>
            </div>
            <Toaster position="top-right" />
            <div className="steps-container">
                <FormProvider {...methods}>
                    <Steps
                        stepsConfig={steps}
                        whereToRedirectWhenFinishSteps={"/portal-proae/processos"}
                        onFinishSteps={handleFinishSteps}
                    />
                </FormProvider>
            </div>
            <div className="footer">
                <div className="footer-back" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <img src={arrowDownIcon} className="arrow-down" alt="Cancelar" />
                    <span className="voltar-texto">Cancelar</span>
                </div>
            </div>
        </div>
    )
}
export default CadastroEdital