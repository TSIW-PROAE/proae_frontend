import {ComponentType, useState} from "react";
import {Button} from "@heroui/react";
import './Steps.css'
import {useNavigate} from "react-router-dom";

export interface StepsConfig {
    stepTitle: string,
    stepSubtitle: string,
    backButtonName?: string,
    nextButtonName: string,
    isFirstPage?: boolean,
    isLastPage?: boolean,
    stepDynamicComponent?: ComponentType<any>,
    logoSrc?: string
}

export interface StepsProps {
    stepsConfig: StepsConfig[],
    whereToRedirectWhenFinishSteps: string
}

const Steps = ({ stepsProps }: {stepsProps: StepsProps}) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const progressInitialValue = 100 / stepsProps.stepsConfig.length;
    const [barProgress, setBarProgress] = useState(progressInitialValue);

    return (
        <>
            {stepsProps.stepsConfig.map((stepConfig, index) =>
                step === index &&
                (
                    <div key={index} id="step-container">
                        <div id="step-header">
                            {stepConfig.logoSrc && (<img src={stepConfig.logoSrc} alt="Logo" className="formulario-logo"/>)}
                        </div>
                        <div id="progresso-container">
                            <div id="barra-progresso">
                                <div id="progresso-preenchido" style={{width: `${barProgress}%`}}></div>
                            </div>
                        </div>
                        <div id="data-container">
                            <h1 id="formulario-titulo">{stepConfig.stepTitle}</h1>
                            <p id="formulario-subtitulo">{stepConfig.stepSubtitle}</p>
                            <div id='data'>
                                {stepConfig.stepDynamicComponent && <stepConfig.stepDynamicComponent/>}
                            </div>
                            <div id="buttons-container">
                                {!stepConfig.isFirstPage && (<Button color="secondary" className="button"
                                                               onPress={() => {
                                                                   setStep((step) => step - 1)
                                                                   setBarProgress((barProgress) => barProgress - progressInitialValue)
                                                               }}>{stepConfig.backButtonName}</Button>)}
                                <Button color="primary" className="button" onPress={() => {
                                    setStep((step) => step + 1)
                                    setBarProgress((barProgress) => barProgress + progressInitialValue)
                                    stepConfig.isLastPage && navigate(stepsProps.whereToRedirectWhenFinishSteps)
                                }}>{stepConfig.nextButtonName}</Button>
                            </div>
                        </div>
                    </div>
                )
            )}
        </>
    )
}
export default Steps