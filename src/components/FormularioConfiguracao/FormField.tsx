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
  formatacao?: "cpf" | "phone" | "cep" | "dataCompleta" | "dataMes" | "cnpj" | "rg" | "moeda" | "personalizado";
  padrao?: string;
  formData: Record<string, any>;
  handleInputChange: (nome: string, valor: string | File, formatacao?: any, padrao?: string) => void;
  handleInputBlur: (nome: string, valor: string | File, formatacao?: any) => void;
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
  formatacao,
  padrao,
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
          onChange={(e) => handleInputChange(nome, e.target.value, formatacao, padrao)}
          onBlur={() => handleInputBlur(nome, formData[nome] || "", formatacao)}
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
          selectedKeys={formData[nome] ? [String(formData[nome])] : []}
          onSelectionChange={(keys) => {
            const selectedValue = Array.from(keys)[0] as string;
            handleInputChange(nome, selectedValue || "");
          }}
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
