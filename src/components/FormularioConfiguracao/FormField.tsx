// FormField.tsx
import {
  Input,
  Select,
  SelectItem,
} from "@heroui/react";

interface Opcao {
  valor: string;
  label: string;
}

interface FormFieldProps {
  tipo: "input" | "select";
  nome: string;
  titulo: string;
  placeholder?: string;
  opcoes?: Opcao[];
  obrigatorio?: boolean;
  erro?: string;
  subtitulo?: string;
  type?: string;
  formData: Record<string, any>;
  handleInputChange: (nome: string, valor: string) => void;
  handleInputBlur: (nome: string, valor: string) => void;
}

const FormField = ({
  tipo,
  nome,
  titulo,
  placeholder,
  opcoes,
  obrigatorio,
  erro,
  subtitulo,
  type = "text",
  formData,
  handleInputChange,
  handleInputBlur,
}: FormFieldProps) => {
  if (tipo === "input") {
    return (
      <div className="input-container" key={nome}>
        <Input
          label={titulo}
          placeholder={placeholder || ""}
          value={formData[nome] || ""}
          type={type}
          onChange={(e) => handleInputChange(nome, e.target.value)}
          onBlur={() => handleInputBlur(nome, formData[nome] || "")}
          variant="bordered"
          radius="lg"
          isRequired={obrigatorio}
          isInvalid={!!erro}
          errorMessage={erro}
          fullWidth
          classNames={{ base: "custom-input" }}
          description={subtitulo}
        />
      </div>
    );
  }

  if (tipo === "select") {
    return (
      <div className="input-container" key={nome}>
        <Select
          label={titulo}
          placeholder={placeholder || "Selecione"}
          selectedKeys={formData[nome] ? [formData[nome]] : []}
          onChange={(e) => handleInputChange(nome, e.target.value)}
          onBlur={() => handleInputBlur(nome, formData[nome] || "")}
          variant="bordered"
          radius="lg"
          isRequired={obrigatorio}
          isInvalid={!!erro}
          errorMessage={erro}
          fullWidth
          classNames={{ base: "custom-input" }}
          description={subtitulo}
        >
          {(opcoes || []).map((opcao) => (
            <SelectItem key={opcao.valor}>{opcao.label}</SelectItem>
          ))}
        </Select>
      </div>
    );
  }

  return null;
};

export default FormField;
export type { FormFieldProps };
