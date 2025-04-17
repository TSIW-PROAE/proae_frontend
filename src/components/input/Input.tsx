import styles from "./Input.module.css";

type FormInputProps = {
  id: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showUserIcon?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
};

const FormInput = ({
  id,
  name = '',
  value,
  onChange,
  type = 'text',
  placeholder = '',
  label = '',
  required = false,
  onBlur = () => {},
  className = '',
}: FormInputProps) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className="text-red-600 ml-2">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={type}
          placeholder={placeholder}
          className={`${styles.inputText} ${className}`}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default FormInput;
