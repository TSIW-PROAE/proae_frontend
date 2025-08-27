import z from "zod"

const cpfSchema = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato 000.000.000-00")

const emailSchema = z.email("Email inválido")

const telefoneSchema = z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone deve estar no formato (00) 00000-0000")

const idade = z.number().min(15, { message: "Age must be at least 15" });

interface InputConfig{
  nome: string;
  tipo: string;
  validaco: string | (() => z.ZodType)
  obrigatorio?: boolean;
  mimeType?: string[];
  [key: string]: any;
}

export const createDiynamicSchema = (fields: InputConfig[]) => {
  const schemaObject: Record<string, z.ZodType>  = {};

  fields.forEach((field: InputConfig) => {
    let fieldSchema: z.ZodType = z.string();

    switch(field.validaco){
      case "cpf":
        fieldSchema = cpfSchema;
        break;
      case "email":
        fieldSchema = emailSchema;
        break;
      case "telefone":
        fieldSchema = telefoneSchema;
        break;
      case "idade":
        fieldSchema = idade;
        break;
      default:
        if (typeof field.validaco === "function") {
          fieldSchema = field.validaco();
        }
    }

    if(!field.obrigatorio){
      fieldSchema = fieldSchema.optional();
    }

    if(field.tipo === "file"){
      fieldSchema = z.file().mime(field.mimeType || [])
    }

    schemaObject[field.nome] = fieldSchema;
  })

  return z.object(schemaObject);
}


