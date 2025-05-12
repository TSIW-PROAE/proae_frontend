// AlunoForm.tsx
import { useState } from "react";
import { formSections } from "./FormConfig";
import FormField from "./FormField";
import { FormFieldProps } from "./FormField";
import "./Form.css";
import { TipoFormatacao } from "../FormularioDinamico/FormularioDinamico";

const AlunoForm = () => {
    const [formData, setFormData] = useState({});
    const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

    const formatarTexto = (
        texto: string,
        tipo?: TipoFormatacao,
        padrao?: string
    ): string => {
        if (!texto || !tipo) return texto;

        let formatted = texto.replace(/\D/g, ""); // Remove caracteres não numéricos

        switch (tipo) {
            case "phone":
                // (00) 00000-0000
                if (formatted.length <= 11) {
                    if (formatted.length > 2) {
                        formatted = `(${formatted.substring(0, 2)}) ${formatted.substring(2)}`;
                    }
                    if (formatted.length > 9) {
                        formatted = `${formatted.substring(0, 9)}-${formatted.substring(9, 14)}`;
                    }
                }
                return formatted;

            case "dataMes":
                // 00/0000
                if (formatted.length > 2) {
                    formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 6)}`;
                }
                return formatted;

            case "dataCompleta":
                // 00/00/0000
                if (formatted.length > 2) {
                    formatted = `${formatted.substring(0, 2)}/${formatted.substring(2)}`;
                }
                if (formatted.length > 5) {
                    formatted = `${formatted.substring(0, 5)}/${formatted.substring(5, 9)}`;
                }
                return formatted;

            case "cpf":
                // 000.000.000-00
                if (formatted.length > 3) {
                    formatted = `${formatted.substring(0, 3)}.${formatted.substring(3)}`;
                }
                if (formatted.length > 7) {
                    formatted = `${formatted.substring(0, 7)}.${formatted.substring(7)}`;
                }
                if (formatted.length > 11) {
                    formatted = `${formatted.substring(0, 11)}-${formatted.substring(11, 13)}`;
                }
                return formatted;

            case "cep":
                // 00000-000
                if (formatted.length > 5) {
                    formatted = `${formatted.substring(0, 5)}-${formatted.substring(5, 8)}`;
                }
                return formatted;

            case "cnpj":
                // 00.000.000/0000-00
                if (formatted.length > 2) {
                    formatted = `${formatted.substring(0, 2)}.${formatted.substring(2)}`;
                }
                if (formatted.length > 6) {
                    formatted = `${formatted.substring(0, 6)}.${formatted.substring(6)}`;
                }
                if (formatted.length > 10) {
                    formatted = `${formatted.substring(0, 10)}/${formatted.substring(10)}`;
                }
                if (formatted.length > 15) {
                    formatted = `${formatted.substring(0, 15)}-${formatted.substring(15, 17)}`;
                }
                return formatted;

            case "rg":
                // 00.000.000-0
                if (formatted.length > 2) {
                    formatted = `${formatted.substring(0, 2)}.${formatted.substring(2)}`;
                }
                if (formatted.length > 6) {
                    formatted = `${formatted.substring(0, 6)}.${formatted.substring(6)}`;
                }
                if (formatted.length > 10) {
                    formatted = `${formatted.substring(0, 10)}-${formatted.substring(10, 11)}`;
                }
                return formatted;

            case "moeda":
                // R$ 0.000,00
                if (formatted.length === 0) return "";

                const value = parseInt(formatted) / 100;
                return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

            case "personalizado":
                // Usar expressão regular personalizada
                if (!padrao) return texto;
                try {
                    return texto.replace(new RegExp(padrao), "$&");
                } catch (e) {
                    console.error("Erro ao aplicar padrão personalizado:", e);
                    return texto;
                }

            default:
                return texto;
        }
    };

    const validarFormatacao = (
        valor: string,
        formatacao?: TipoFormatacao
    ): boolean => {
        if (!valor || !formatacao) return true;

        switch (formatacao) {
            case "cpf":
                // Verifica se o CPF tem o formato correto: 000.000.000-00
                return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor);
            case "phone":
                // Verifica se o telefone tem o formato correto: (00) 00000-0000
                return /^\(\d{2}\) \d{5}-\d{4}$/.test(valor);
            case "cep":
                // Verifica se o CEP tem o formato correto: 00000-000
                return /^\d{5}-\d{3}$/.test(valor);
            case "dataCompleta":
                // Verifica se a data tem o formato correto: 00/00/0000
                return /^\d{2}\/\d{2}\/\d{4}$/.test(valor);
            case "dataMes":
                // Verifica se a data tem o formato correto: 00/0000
                return /^\d{2}\/\d{4}$/.test(valor);
            case "cnpj":
                // Verifica se o CNPJ tem o formato correto: 00.000.000/0000-00
                return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(valor);
            case "rg":
                // Verifica se o RG tem o formato correto: 00.000.000-0
                return /^\d{2}\.\d{3}\.\d{3}-\d{1}$/.test(valor);
            case "moeda":
                // Verifica se o valor monetário tem o formato correto
                return /^R\$ \d{1,3}(\.\d{3})*,\d{2}$/.test(valor);
            default:
                return true;
        }
    };

    const obterMensagemErro = (formatacao: TipoFormatacao): string => {
        switch (formatacao) {
            case "cpf":
                return "CPF deve estar no formato 000.000.000-00";
            case "phone":
                return "Telefone deve estar no formato (00) 00000-0000";
            case "cep":
                return "CEP deve estar no formato 00000-000";
            case "dataCompleta":
                return "Data deve estar no formato DD/MM/AAAA";
            case "dataMes":
                return "Data deve estar no formato MM/AAAA";
            case "cnpj":
                return "CNPJ deve estar no formato 00.000.000/0000-00";
            case "rg":
                return "RG deve estar no formato 00.000.000-0";
            case "moeda":
                return "Valor deve estar no formato R$ 0,00";
            default:
                return "Formato inválido";
        }
    };

    const handleInputChange = (
        nome: string,
        valor: string | File,
        formatacao?: TipoFormatacao,
        padrao?: string
    ) => {
        let valorFormatado = valor;

        if (typeof valor === "string" && formatacao) {
            valorFormatado = formatarTexto(valor, formatacao, padrao);
        }

        setFormData((prev) => ({
            ...prev,
            [nome]: valorFormatado,
        }));

        // Limpar erro de validação ao editar o campo
        if (errosValidacao[nome]) {
            setErrosValidacao((prev) => {
                const novosErros = { ...prev };
                delete novosErros[nome];
                return novosErros;
            });
        }
    };

    const handleInputBlur = (
        nome: string,
        valor: string | File,
        formatacao?: TipoFormatacao
    ) => {
        // Apenas validar se for string e tiver formatação
        if (typeof valor === "string" && formatacao && valor) {
            const eValido = validarFormatacao(valor, formatacao);

            if (!eValido) {
                const mensagem = obterMensagemErro(formatacao);

                // Armazenar erro de validação
                setErrosValidacao((prev) => ({
                    ...prev,
                    [nome]: mensagem,
                }));
            } else {
                // Limpar erro de validação se estiver válido
                setErrosValidacao((prev) => {
                    const novosErros = { ...prev };
                    delete novosErros[nome];
                    return novosErros;
                });
            }
        }
    };

    return (
        <form className="aluno-form-wrapper">
            {formSections.map((section) => (
                <div className="form-section" key={section.title}>
                    <h2>{section.title}</h2>
                    <div className={`form-layout ${section.layout}`}>
                        {section.fields.map((campo) => (
                            <FormField
                                key={campo.nome}
                                {...(campo as FormFieldProps)}
                                formData={formData}
                                handleInputChange={handleInputChange}
                                handleInputBlur={handleInputBlur}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Actions */}
            <div className="action-buttons">
                <button className="cancel-button" type="button">Cancelar</button>
                <button className="save-button" type="submit">Salvar</button>
            </div>
        </form>
    );
};

export default AlunoForm;
