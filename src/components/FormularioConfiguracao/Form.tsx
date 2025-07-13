// AlunoForm.tsx
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { FetchAdapter } from "../../services/BaseRequestService/HttpClient";
import EditarPerfilService from "../../services/EditarPerfil.service/editarPerfil.service";
import {
  formatarTexto,
  obterMensagemErro,
  validarFormatacao,
} from "../../utils/utils";
import { TipoFormatacao } from "../FormularioDinamico/FormularioDinamico";
import "./Form.css";
import { formSections } from "./FormConfig";
import FormField, { FormFieldProps } from "./FormField";

const AlunoForm = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>(
    {}
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const httpClient = new FetchAdapter();
        const service = new EditarPerfilService();
        const data = (await service.getAlunoPerfil(httpClient)) as Record<
          string,
          any
        >;
        const aluno = data.dados.aluno || {};
        const alunoFormatado = {
          ...aluno,
          matricula: aluno.matricula?.substring(2) || "",
        };
        setFormData(alunoFormatado);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const camposPermitidos = [
      "nome",
      "sobrenome",
      "email",
      "pronome",
      "data_nascimento",
      "curso",
      "campus",
      "data_ingresso",
      "celular",
    ];

    // Remove "matricula" if it's not valid

    if (formData.matricula && formData.matricula !== "m-undefined") {
      camposPermitidos.push("matricula");
    }

    let payload = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) =>
          camposPermitidos.includes(key) &&
          value !== undefined &&
          value !== null &&
          value !== "" &&
          value !== "m-undefined"
      )
    );

    try {
      const httpClient = new FetchAdapter();
      const service = new EditarPerfilService();
      console.log("Payload being sent:", payload);
      const response = await service.patchAlunoPerfil(httpClient, payload);
      console.log("Atualização bem-sucedida:", response);
      //alert("Perfil atualizado com sucesso");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao atualizar dados do aluno:", error);
      // Optional: show error feedback
    }
  };

  return (
    <>
      <form className="aluno-form-wrapper" onSubmit={handleSubmit}>
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
          <button className="cancel-button" type="button">
            Cancelar
          </button>
          <button className="save-button" type="submit">
            <span>Salvar</span>
            <Save className="w-4 h-4" />
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100 animate-in fade-in zoom-in">
            <h3 className="text-lg font-semibold text-center">
              Perfil atualizado com sucesso!
            </h3>
            <div className="mt-4 flex justify-center">
              <Button
                color="primary"
                variant="solid"
                onClick={() => setShowSuccessModal(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlunoForm;
