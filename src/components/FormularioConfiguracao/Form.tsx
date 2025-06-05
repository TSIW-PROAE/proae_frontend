// AlunoForm.tsx
import { useState, useEffect } from "react";
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

import { FetchAdapter } from "../../services/BaseRequestService/HttpClient";
import EditarPerfilService from "../../services/EditarPerfil.service/editarPerfil.service";

const AlunoForm = () => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const httpClient = new FetchAdapter();
                const service = new EditarPerfilService();
                const data = await service.getAlunoPerfil(httpClient) as Record<string, any>;
                setFormData(data.dados.aluno || {});
            } catch (error) {
                console.error("Erro ao buscar perfil do aluno:", error);
            }
        };

        fetchPerfil();
    }, []);

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
        if (typeof valor === "string" && formatacao && valor) {
            const eValido = validarFormatacao(valor, formatacao);

            if (!eValido) {
                const mensagem = obterMensagemErro(formatacao);
                setErrosValidacao((prev) => ({
                    ...prev,
                    [nome]: mensagem,
                }));
            } else {
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

            <div className="action-buttons">
                <button className="cancel-button" type="button">Cancelar</button>
                <button className="save-button" type="submit">Salvar</button>
            </div>
        </form>
    );
};

export default AlunoForm;

