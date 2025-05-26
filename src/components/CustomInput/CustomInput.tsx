import React, {useState} from "react";
import plusIcon from "../../assets/plus-icon.svg";
import minusIcon from "../../assets/minus-icon.svg";
import {DatePicker, Input, RadioGroup, Select, SelectItem, Textarea} from "@heroui/react";
import {Controller, useFormContext} from "react-hook-form";
import {TypeFormat, TypeInput} from "@/utils/enumInput.tsx";

interface Option {
    value: string;
    label: string;
}

export interface InputProps {
    type: TypeInput;
    title: string;
    name: string;
    required: boolean;
    defaultValue?: any;
    options?: Option[];
    placeholder?: string;
    format?: TypeFormat;
    errorMsg?: string;
}

const CustomInput: React.FC<InputProps> = ( props : InputProps) => {

    const { register, formState: { errors }, unregister, control } = useFormContext();

    const errorMessage: string = "Este campo é obrigatório";

    const [textInputWithPlus, setTextInputWithPlus] = useState<InputProps[]>([]);
    const [textAndDateInputWithPlus, setTextAndDateInputWithPlus] = useState<InputProps[]>([]);

    const [, setInputCounterToTextInputWithPlus] = useState(0);
    const [, setInputCounterToTextAndDateInputWithPlus] = useState(0);

    const addNewTextInputWithPlus = (inputName: string) => {
        setInputCounterToTextInputWithPlus((prev) => {
            const id = prev + 1;
            const newInput = {...props, name: `${inputName}-${id}`, defaultValue: ""};
            setTextInputWithPlus((prevInputs) => [...prevInputs, newInput]);
            return id;
        });
    };

    const removeTextInputWithPlus = (inputName: string) => {
        let withoutRemovedInput = textInputWithPlus.filter((i) => i.name !== inputName);
        setTextInputWithPlus(withoutRemovedInput);
        unregister(inputName);
    };

    const addTextAndDateInputWithPlus = (inputName: string) => {
        setInputCounterToTextAndDateInputWithPlus((prev) => {
            const id = prev + 1;
            const newInput = {...props, name: `${inputName}-${id}`, defaultValue: ""};
            setTextAndDateInputWithPlus((prevInputs) => [...prevInputs, newInput]);
            return id;
        });
    };

    const removeTextAndDateInputWithPlus = (inputName: string) => {
        let withoutRemovedInput = textAndDateInputWithPlus.filter((i) =>
            i.name !== inputName &&
            i.name !== inputName + "DateInitial" &&
            i.name !== inputName + "DateFinal"
        );
        setTextAndDateInputWithPlus(withoutRemovedInput);

        unregister(inputName);
        unregister(inputName + "DateInitial");
        unregister(inputName + "DateFinal");
    };

    switch (props.type) {
        case TypeInput.Text:
        case TypeInput.Number:
        case TypeInput.Email:
            return (
                <Input {...register(props.name, { required: props.required})} defaultValue={props.defaultValue}
                label={props.title} type={props.type} placeholder={props.placeholder}
                isRequired={props.required} isInvalid={!!errors[props.name]} errorMessage={errorMessage}
                radius="lg" variant="bordered" fullWidth className="custom-input"/>
            );
        case TypeInput.TextWithPlusButton:
            return (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <Input {...register(props.name, { required: props.required})} defaultValue={props.defaultValue}
                                   label={props.title} type={props.type} placeholder={props.placeholder}
                                   isRequired={props.required} isInvalid={!!errors[props.name]} errorMessage={errorMessage}
                                   radius="lg" variant="bordered" fullWidth className="custom-input"/>
                            {textInputWithPlus.length <= 2 && (<img src={plusIcon} alt="plus icon" width={25} className="cursor-pointer" onClick={() => addNewTextInputWithPlus(props.name)}/>)}
                        </div>
                        {textInputWithPlus.map((input) => (
                            <div className="flex items-center gap-3" key={input.name}>
                                <Input {...register(input.name, { required: input.required, value: input.defaultValue})} defaultValue={input.defaultValue}
                                       label={input.title} type={input.type} placeholder={input.placeholder}
                                       isRequired={input.required} isInvalid={!!errors[input.name]} errorMessage={errorMessage}
                                       radius="lg" variant="bordered" fullWidth className="custom-input"/>
                                <img src={minusIcon} alt="minus icon" width={25} className="cursor-pointer" onClick={() => removeTextInputWithPlus(input.name)}/>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case TypeInput.TextWithCalendar:
            return (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <Input {...register(props.name, { required: props.required})} defaultValue={props.defaultValue}
                                   label={props.title} type={props.type} placeholder={props.placeholder} isRequired={props.required}
                                   isInvalid={!!errors[props.name]} errorMessage={errorMessage}
                                   radius="lg" variant="bordered" fullWidth className="custom-input"/>
                            <Controller
                                name={props.name + "1"}
                                control={control}
                                rules={{ required: props.required }}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Data"
                                        isRequired={props.required}
                                        variant="bordered"
                                        radius="lg"
                                        fullWidth
                                        errorMessage={errorMessage}
                                        classNames={{ base: "custom-input" }}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        isInvalid={!!errors[props.name]}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            );
        case TypeInput.TextWithCalendarRange:
            return (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <Input {...register(props.name, {required: props.required})}
                                   defaultValue={props.defaultValue}
                                   label={props.title} type={props.type} placeholder={props.placeholder}
                                   isRequired={props.required} isInvalid={!!errors[props.name]}
                                   errorMessage={errorMessage}
                                   radius="lg" variant="bordered" fullWidth className="custom-input"/>
                            <Controller
                                name={props.name + "DateInitial"}
                                control={control}
                                rules={{ required: props.required }}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Data de Inicio"
                                        isRequired={props.required}
                                        variant="bordered"
                                        radius="lg"
                                        fullWidth
                                        errorMessage={errorMessage}
                                        classNames={{ base: "custom-input" }}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        isInvalid={!!errors[props.name]}
                                    />
                                )}
                            />
                            <Controller
                                name={props.name + "DateFinal"}
                                control={control}
                                rules={{ required: props.required }}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Data Final"
                                        isRequired={props.required}
                                        variant="bordered"
                                        radius="lg"
                                        fullWidth
                                        errorMessage={errorMessage}
                                        classNames={{ base: "custom-input" }}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        isInvalid={!!errors[props.name]}
                                    />
                                )}
                            />
                            <img src={plusIcon} alt="plus icon" width={25} className="cursor-pointer" onClick={() => addTextAndDateInputWithPlus(props.name)}/>
                        </div>
                        {textAndDateInputWithPlus.map((input) => (
                            <div className="flex items-center gap-3" key={input.name}>
                                <Input {...register(input.name, {required: input.required})}
                                       defaultValue={input.defaultValue}
                                       label={input.title} type={input.type} placeholder={input.placeholder}
                                       isRequired={input.required} isInvalid={!!errors[input.name]}
                                       errorMessage={errorMessage}
                                       radius="lg" variant="bordered" fullWidth className="custom-input"/>
                                <Controller
                                    name={input.name + "DateInitial"}
                                    control={control}
                                    rules={{ required: input.required }}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Data de Inicio"
                                            isRequired={input.required}
                                            variant="bordered"
                                            radius="lg"
                                            errorMessage={errorMessage}
                                            fullWidth
                                            classNames={{ base: "custom-input" }}
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            isInvalid={!!errors[input.name]}
                                        />
                                    )}
                                />
                                <Controller
                                    name={input.name + "DateFinal"}
                                    control={control}
                                    rules={{ required: input.required }}
                                    render={({ field }) => (
                                        <DatePicker
                                            label="Data Final"
                                            isRequired={input.required}
                                            variant="bordered"
                                            radius="lg"
                                            errorMessage={errorMessage}
                                            fullWidth
                                            classNames={{ base: "custom-input" }}
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            isInvalid={!!errors[input.name]}
                                        />
                                    )}
                                />
                                <img src={minusIcon} alt="minus icon" width={25} className="cursor-pointer" onClick={() => removeTextAndDateInputWithPlus(input.name)}/>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case "textarea":
            return (
                <Textarea {...register(props.name, {required: props.required})}
                    label={props.title} isRequired={props.required} isInvalid={!!errors[props.name]} errorMessage={errorMessage}
                    placeholder={props.placeholder} defaultValue={props.defaultValue}
                    minRows={4} radius="lg" variant="bordered" fullWidth className="custom-input"
                />
            );

        case "radio":
            //Make it works when needed
            return (
                <RadioGroup
                    {...register(props.name, {required: props.required})}
                    label={props.title} isRequired={props.required} isInvalid={!!errors[props.name]} errorMessage={errorMessage}
                    orientation="vertical"
                    color="primary"
                    className="radio-group-custom">
                    {/*{options?.map((option) => (*/}
                    {/*    <Radio key={option.value} value={option.value}>*/}
                    {/*        {option.label}*/}
                    {/*    </Radio>*/}
                    {/*))}*/}
                </RadioGroup>
            );

        case "select":
            return (
                //Make it works when needed
                <Select
                    label={props.title} isRequired={props.required} isInvalid={!!errors[props.name]} errorMessage={errorMessage}
                    // selectedKeys={value ? [value] : []}
                    radius="lg"
                    variant="bordered"
                    fullWidth
                    className="custom-input"
                >
                    {([]).map(() => (
                        <SelectItem key={""}>
                            {""}
                        </SelectItem>
                    ))}
                </Select>
            );
        // need a little bit more of refactoring to make it work
        // case "file":
        //     return (
        //         <div className="arquivo-container">
        //             <div className="arquivo-item">
        //                 <div className="arquivo-esquerda">
        //                     <div className="arquivo-icone">
        //                         <img src={arquivoPdfIcon} alt="PDF" />
        //                     </div>
        //                     <div className="arquivo-tamanho-max">Max: 5MB</div>
        //                 </div>
        //
        //                 <div className="arquivo-centro">
        //                     <div className="arquivo-titulo">
        //                         {value instanceof File ? value.name : title}
        //                     </div>
        //                     <div className="arquivo-status">
        //                         <Chip
        //                             color={value instanceof File ? "success" : "warning"}
        //                             size="sm"
        //                             variant="flat"
        //                         >
        //                             {value instanceof File ? "ANEXADO" : "PENDENTE"}
        //                         </Chip>
        //                     </div>
        //                 </div>
        //
        //                 <div className="arquivo-direita">
        //                     {value instanceof File ? (
        //                         <button
        //                             type="button"
        //                             className="arquivo-remover"
        //                             onClick={() => onChange(name, "")}
        //                         >
        //                             Remover
        //                         </button>
        //                     ) : (
        //                         <label
        //                             htmlFor={`file-${name}`}
        //                             className="arquivo-upload"
        //                             style={{ cursor: "pointer" }}
        //                         >
        //                             Upload
        //                         </label>
        //                     )}
        //                 </div>
        //
        //                 <input
        //                     type="file"
        //                     id={`file-${name}`}
        //                     accept=".pdf"
        //                     style={{ display: "none" }}
        //                     onChange={handleFileChange}
        //                 />
        //             </div>
        //
        //             {errorMsg && <p className="mensagem-erro">{errorMsg}</p>}
        //         </div>
        //     );

        default:
            return null;
    }
};

export default CustomInput;
