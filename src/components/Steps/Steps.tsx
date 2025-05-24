import React, {ComponentType, useState} from "react";
import {Button} from "@heroui/react";
import './Steps.css'
import {useNavigate} from "react-router-dom";
import {useFormContext} from "react-hook-form";

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
}

const Steps: React.FC<StepsProps> = ({stepsConfig, whereToRedirectWhenFinishSteps}) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const progressInitialValue = 100 / stepsConfig.length;
    const [barProgress, setBarProgress] = useState(progressInitialValue);
    const { getValues } = useFormContext();
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
                                <Button isDisabled={stepConfig.isNextButtonEnabled != undefined ? !stepConfig.isNextButtonEnabled : stepConfig.isNextButtonEnabled} color="primary" className="button" onPress={() => {
                                    setCurrentStep((step) => step + 1)
                                    setBarProgress((barProgress) => barProgress + progressInitialValue)
                                    stepConfig.isLastPage && navigate(whereToRedirectWhenFinishSteps)
                                    // logging the inputs results while we dont have the http base request done
                                    stepConfig.isLastPage && console.log(getValues())
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