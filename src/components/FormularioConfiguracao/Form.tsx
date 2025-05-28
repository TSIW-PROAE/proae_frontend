// AlunoForm.tsx
import { useState } from "react";
import { formSections } from "./FormConfig";
import FormField from "./FormField";
import { FormFieldProps } from "./FormField";
import "./Form.css";
import { TipoFormatacao } from "../FormularioDinamico/FormularioDinamico";
import {
    formatarTexto,
    validarFormatacao,
    obterMensagemErro,
} from "../../utils/utils";

const AlunoForm = () => {
    const [formData, setFormData] = useState({});
    const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

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
