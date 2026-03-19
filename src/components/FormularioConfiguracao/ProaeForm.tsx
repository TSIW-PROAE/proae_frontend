// ProaeForm.tsx
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { FetchAdapter } from "../../services/BaseRequestService/HttpClient";
import EditarPerfilService from "../../services/EditarPerfil.service/editarPerfil.service";
import {
  formatarTexto,
  obterMensagemErro,
  validarFormatacao,
} from "../../utils/validations";
import { TipoFormatacao } from "../../utils/validations";
import "./Form.css";
import { formSectionsProae } from "./FormConfigProae";
import FormField, { FormFieldProps } from "./FormField";

const ProaeForm = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [originalFormData, setOriginalFormData] = useState<Record<string, any>>({});
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>(
    {}
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [perfilNaoEncontrado, setPerfilNaoEncontrado] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      setCarregandoPerfil(true);
      setPerfilNaoEncontrado(false);
      try {
        const httpClient = new FetchAdapter();
        const service = new EditarPerfilService();
        const data = (await service.getAdminPerfil(httpClient)) as Record<
          string,
          any
        >;
        const admin = data?.dados?.admin ?? data?.dados ?? data ?? {};
        setFormData(admin);
        setOriginalFormData(admin);
      } catch {
        setPerfilNaoEncontrado(true);
      } finally {
        setCarregandoPerfil(false);
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
      "email",
      "cargo",
      "data_nascimento",
      "cpf",
      "celular",
    ];

    let payload = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) =>
          camposPermitidos.includes(key) &&
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    );

    try {
      const httpClient = new FetchAdapter();
      const service = new EditarPerfilService();
      console.log("Payload being sent:", payload);
      const response = await service.patchAdminPerfil(httpClient, payload);
      console.log("Atualização bem-sucedida:", response);
      setShowSuccessModal(true);
      // Limpar erros de validação após sucesso
      setErrosValidacao({});
      // Atualizar dados originais após sucesso
      setOriginalFormData(formData);
    } catch (error: any) {
      console.error("Erro ao atualizar dados do admin:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Erro ao atualizar dados. Tente novamente.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  if (carregandoPerfil) {
    return (
      <div className="aluno-form-wrapper flex items-center justify-center p-8 text-gray-500">
        Carregando perfil...
      </div>
    );
  }

  if (perfilNaoEncontrado) {
    return (
      <div className="aluno-form-wrapper rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-amber-800 font-medium">Perfil não encontrado</p>
        <p className="mt-2 text-sm text-amber-700">
          O cadastro de servidor PROAE pode não existir para este usuário. Entre em contato com o suporte se acredita que deveria ter acesso.
        </p>
      </div>
    );
  }

  return (
    <>
      <form className="aluno-form-wrapper" onSubmit={handleSubmit}>
        {formSectionsProae.map((section) => (
          <div className="form-section" key={section.title}>
            <h2>{section.title}</h2>
            <div className={`form-layout ${section.layout}`}>
              {section.fields.map((campo) => (
                <FormField
                  key={campo.nome}
                  {...(campo as FormFieldProps)}
                  formData={formData}
                  erro={errosValidacao[campo.nome]}
                  handleInputChange={handleInputChange}
                  handleInputBlur={handleInputBlur}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="action-buttons">
          <button 
            className="cancel-button" 
            type="button"
            onClick={() => {
              setFormData(originalFormData);
              setErrosValidacao({});
            }}
          >
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
            <h3 className="text-lg font-semibold text-center text-green-600">
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

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100 animate-in fade-in zoom-in">
            <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
              Erro ao atualizar perfil
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              {errorMessage}
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                color="danger"
                variant="solid"
                onClick={() => setShowErrorModal(false)}
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

export default ProaeForm;

