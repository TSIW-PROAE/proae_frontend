import { InputConfig, ValidationRule, SchemaObject } from "@/types/dynamicForm";
import { z } from "zod";

function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

const cpfSchema = z.string()
  .min(1, "CPF é obrigatório")
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00")
  .refine(validarCPF, "CPF inválido");

const emailSchema = z.string()
  .min(1, "Email é obrigatório")
  .email("Email inválido");

const telefoneSchema = z.string()
  .min(1, "Telefone é obrigatório")
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone deve estar no formato (00) 0000-0000 ou (00) 00000-0000");

const cepSchema = z.string()
  .min(1, "CEP é obrigatório")
  .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000");

const dataCompletaSchema = z.string()
  .min(1, "Data é obrigatória")
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/AAAA");

const dataMesSchema = z.string()
  .min(1, "Data é obrigatória")
  .regex(/^\d{2}\/\d{4}$/, "Data deve estar no formato MM/AAAA");

const idadeSchema = z.number()
  .min(15, { message: "Idade deve ser pelo menos 15 anos" });

export const createDynamicSchema = (fields: InputConfig[]) => {
  const schemaObject: SchemaObject = {};

  fields.forEach((field: InputConfig) => {
    let fieldSchema: ValidationRule = z.string();

    switch(field.formatacao) {
      case "cpf":
        fieldSchema = cpfSchema;
        break;
      case "email":
        fieldSchema = emailSchema;
        break;
      case "telefone":
        fieldSchema = telefoneSchema;
        break;
      case "cep":
        fieldSchema = cepSchema;
        break;
      case "dataCompleta":
        fieldSchema = dataCompletaSchema;
        break;
      case "dataMes":
        fieldSchema = dataMesSchema;
        break;
      case "none":
      default:
        fieldSchema = z.string();
        break;
    }

    if (typeof field.validacao === "function") {
      fieldSchema = field.validacao();
    } else if (field.validacao === "idade") {
      fieldSchema = idadeSchema;
    }

    if (field.nome.toLowerCase().includes('email') && !field.formatacao) {
      fieldSchema = emailSchema;
    }

    if (!field.obrigatorio) {
      fieldSchema = fieldSchema.optional().or(z.literal(''));
    } else if (fieldSchema instanceof z.ZodString) {
      fieldSchema = fieldSchema.min(1, `${field.titulo} é obrigatório`);
    }

    if (field.tipo === 'file') {
      if (field.mimeType && field.mimeType.length > 0) {
        fieldSchema = field.obrigatorio
          ? z.instanceof(File).refine(file => file.size > 0, { message: "Arquivo é obrigatório" })
          : z.instanceof(File).optional();
      } else {
        fieldSchema = field.obrigatorio
          ? z.instanceof(File).refine(file => file.size > 0, { message: "Arquivo é obrigatório" })
          : z.instanceof(File).optional();
      }
    }

    if (field.tipo === 'select' || field.tipo === 'radio') {
      const optionValues = field.options?.map(opt => opt.value) || [];
      if (optionValues.length > 0) {
        fieldSchema = field.obrigatorio
          ? z.enum(optionValues as [string, ...string[]])
            .refine(val => val !== '', { message: `${field.titulo} é obrigatório` })
          : z.enum(optionValues as [string, ...string[]]).optional();
      } else {
        fieldSchema = field.obrigatorio
          ? z.string().min(1, `${field.titulo} é obrigatório`)
          : z.string().optional();
      }
    }

    schemaObject[field.nome] = fieldSchema;
  });

  return z.object(schemaObject);
};

export type DynamicFormData = z.infer<ReturnType<typeof createDynamicSchema>>;


