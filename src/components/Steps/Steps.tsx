import React, {ComponentType, useState} from "react";
import {Button} from "@heroui/react";
import './Steps.css'
import {useNavigate} from "react-router-dom";
import {useFormContext} from "react-hook-form";
import toast from "react-hot-toast";

export interface StepsConfig {
    stepTitle: string,
    stepSubtitle: string,
    backButtonName?: string,
    nextButtonName: string,
    isNextButtonEnabled?: boolean,
    isFirstPage?: boolean,
    isLastPage?: boolean,
    StepDynamicComponent?: ComponentType<any>,
    stepDynamicProps?: any
    logoSrc?: string
}

export interface StepsProps {
    stepsConfig: StepsConfig[],
    whereToRedirectWhenFinishSteps: string
    /** Se definido, é chamado ao concluir o último passo (antes do redirect). Em caso de erro, não redireciona. */
    onFinishSteps?: (getValues: () => Record<string, unknown>) => Promise<void>
}

const Steps: React.FC<StepsProps> = ({stepsConfig, whereToRedirectWhenFinishSteps, onFinishSteps}) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const progressInitialValue = 100 / stepsConfig.length;
    const [barProgress, setBarProgress] = useState(progressInitialValue);
    const { getValues } = useFormContext();
    const [finishLoading, setFinishLoading] = useState(false);
    return (
        <>
            {stepsConfig.map((stepConfig, index) =>
                currentStep === index &&
                (
                    <div key={index} id="step-container">
                        {stepConfig.logoSrc && (
                            <div id="step-header">
                                <img src={stepConfig.logoSrc} alt="Logo" className="formulario-logo"/>
                            </div>
                        )}
                        <div id="data-container">
                            <div id="progresso-container">
                                <div id="barra-progresso">
                                    <div id="progresso-preenchido" style={{width: `${barProgress}%`}}></div>
                                </div>
                            </div>
                            <h1 id="formulario-titulo">{stepConfig.stepTitle}</h1>
                            <p id="formulario-subtitulo">{stepConfig.stepSubtitle}</p>
                            <div id='data'>
                                {stepConfig.StepDynamicComponent &&
                                    <stepConfig.StepDynamicComponent {...stepConfig.stepDynamicProps}/>}
                            </div>
                            <div id="buttons-container">
                                {!stepConfig.isFirstPage && (<Button color="secondary" className="button"
                                                                     onPress={() => {
                                                                         setCurrentStep((step) => step - 1)
                                                                         setBarProgress((barProgress) => barProgress - progressInitialValue)
                                                                     }}>{stepConfig.backButtonName}</Button>)}
                                <Button
                                    isDisabled={
                                        finishLoading ||
                                        (stepConfig.isNextButtonEnabled != undefined ? !stepConfig.isNextButtonEnabled : !!stepConfig.isNextButtonEnabled)
                                    }
                                    color="primary"
                                    className="button"
                                    onPress={() => {
                                        void (async () => {
                                            if (stepConfig.isLastPage) {
                                                if (onFinishSteps) {
                                                    setFinishLoading(true);
                                                    try {
                                                        await onFinishSteps(() => getValues() as Record<string, unknown>);
                                                        navigate(whereToRedirectWhenFinishSteps);
                                                    } catch (e: unknown) {
                                                        const msg = e instanceof Error ? e.message : "Não foi possível salvar o edital.";
                                                        toast.error(msg);
                                                    } finally {
                                                        setFinishLoading(false);
                                                    }
                                                } else {
                                                    navigate(whereToRedirectWhenFinishSteps);
                                                    console.log(getValues());
                                                }
                                                return;
                                            }
                                            setCurrentStep((step) => step + 1);
                                            setBarProgress((barProgress) => barProgress + progressInitialValue);
                                        })();
                                    }}
                                >{finishLoading && stepConfig.isLastPage ? "Salvando…" : stepConfig.nextButtonName}</Button>
                            </div>
                        </div>
                    </div>
                )
            )}
        </>
    )
}
export default Steps