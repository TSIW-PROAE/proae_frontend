import CustomInput, {InputProps} from "../CustomInput/CustomInput.tsx";
import "./InputGroup.css"

const InputGroup = ({ inputsConfig }: { inputsConfig: InputProps[] }) => {
    return (
        <div id="input-group">
            {inputsConfig.map((input) => (
                <CustomInput key={input.name} {...input}/>
            ))}
        </div>
    );
};

export default InputGroup;