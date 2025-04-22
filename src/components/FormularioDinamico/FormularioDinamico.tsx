import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Radio,
  RadioGroup,
  Textarea,
  Chip,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./FormularioDinamico.css";
import arrowDownIcon from "../../assets/icons/arrow-down-item.svg";
import arrowDownBegeIcon from "../../assets/icons/arrow-down-item-bege.svg";
import uploadIcon from "../../assets/icons/upload.svg";
import arquivoPdfIcon from "../../assets/icons/arquivo-azul-bege-pdf.svg";

// Tipos de input suportados
export type TipoInput =
  | "radio"
  | "select"
  | "input"
  | "textarea"
  | "file"
  | "documentos";

// Tipos de formatação para inputs de texto
export type TipoFormatacao =
  | "phone" // (00) 00000-0000
  | "dataMes" // 00/0000
  | "dataCompleta" // 00/00/0000
  | "cpf" // 000.000.000-00
  | "cep" // 00000-000
  | "cnpj" // 00.000.000/0000-00
  | "rg" // 00.000.000-0
  | "moeda" // R$ 0.000,00
  | "personalizado";

// Interface para cada input individual
export interface InputConfig {
  tipo: TipoInput;
  titulo: string;
  subtitulo?: string;
  nome: string;
  obrigatorio?: boolean;
  opcoes?: Array<{ valor: string; label: string }>;
  placeholder?: string;
  formatacao?: TipoFormatacao;
  formatacaoPersonalizada?: string; // Expressão regular para formatação personalizada
  mensagemErro?: string; // Mensagem de erro personalizada
}

// Interface para documento
export interface Documento {
  id: string;
  titulo: string;
  tipo: string;
  status?: "pendente" | "aprovado" | "rejeitado";
}

// Interface para entrada de documentos
export interface DocumentosConfig extends InputConfig {
  documentos: Documento[];
}

// Interface para cada página do formulário
export interface PaginaFormulario {
  titulo: string;
  subtitulo?: string;
  botaoContinuar?: string;
  inputs: InputConfig[];
}

// Interface principal para as props do componente
export interface FormularioDinamicoProps {
  titulo: string;
  subtitulo?: string;
  paginas: PaginaFormulario[];
  botaoFinal: string;
  rotaRedirecionamento: string;
  rotaCancelamento?: string;
  logoSrc?: string;
}

// Funções de formatação
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

const FormularioDinamico: React.FC<FormularioDinamicoProps> = ({
  titulo,
  subtitulo,
  paginas,
  botaoFinal,
  rotaRedirecionamento,
  rotaCancelamento,
  logoSrc,
}) => {
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>(
    {}
  );
  const navigate = useNavigate();

  const progresso = ((paginaAtual + 1) / (paginas.length + 1)) * 100;

  // Função para validar campos formatados
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

  // Função para obter mensagem de erro com base no tipo de formatação
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

  // Função para validar campo quando o usuário sai do input
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

  // Função para validar página com useCallback
  const validarPagina = useCallback(
    (paginaIndex: number): string[] => {
      const camposFaltantes: string[] = [];

      if (paginaIndex === 0) return camposFaltantes; // Página inicial não tem validação

      const inputs = paginas[paginaIndex - 1].inputs;

      inputs.forEach((input) => {
        if (input.obrigatorio) {
          const valor = formData[input.nome];
          const estaVazio =
            valor === undefined || valor === null || valor === "";

          if (estaVazio) {
            camposFaltantes.push(input.titulo);
          }
        }
      });

      return camposFaltantes;
    },
    [paginas, formData]
  );

  // Usando useCallback para memorizar a função proximaPagina
  const proximaPagina = useCallback(() => {
    if (paginaAtual < paginas.length) {
      const camposFaltantes = validarPagina(paginaAtual);

      if (camposFaltantes.length > 0) {
        const mensagem = `Por favor, preencha os seguintes campos obrigatórios: ${camposFaltantes.join(", ")}`;
        toast.error(mensagem);
        return;
      }

      // Verificar se há erros de formatação na página atual
      if (paginaAtual > 0) {
        // Ignorar a página inicial
        const inputsAtuais = paginas[paginaAtual - 1].inputs;
        const errosNaPagina = inputsAtuais.some(
          (input) => errosValidacao[input.nome] !== undefined
        );

        if (errosNaPagina) {
          toast.error(
            "Por favor, corrija os erros de formatação antes de continuar."
          );
          return;
        }
      }

      setPaginaAtual(paginaAtual + 1);
      window.scrollTo(0, 0);
    }
  }, [paginaAtual, paginas, errosValidacao, validarPagina]);

  const paginaAnterior = () => {
    if (paginaAtual > 0) {
      setPaginaAtual(paginaAtual - 1);
      window.scrollTo(0, 0);
    }
  };

  const cancelarFormulario = () => {
    if (rotaCancelamento) {
      navigate(rotaCancelamento);
    } else {
      // Se não tiver rota de cancelamento, voltar no histórico do navegador
      window.history.back();
    }
  };

  // Usando useCallback para memorizar a função finalizar
  const finalizar = useCallback(async () => {
    const camposFaltantes = validarPagina(paginaAtual);

    if (camposFaltantes.length > 0) {
      const mensagem = `Por favor, preencha os seguintes campos obrigatórios: ${camposFaltantes.join(", ")}`;
      toast.error(mensagem);
      return;
    }

    // Verificar se há erros de formatação na página atual
    const inputsAtuais = paginas[paginaAtual - 1].inputs;
    const errosNaPagina = inputsAtuais.some(
      (input) => errosValidacao[input.nome] !== undefined
    );

    if (errosNaPagina) {
      toast.error(
        "Por favor, corrija os erros de formatação antes de finalizar."
      );
      return;
    }

    setEnviando(true);

    try {
      // Aqui você pode adicionar a lógica para enviar os dados do formulário
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulação de envio
      setConcluido(true);

      // Redirecionamento após conclusão
      setTimeout(() => {
        navigate(rotaRedirecionamento);
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setEnviando(false);
      toast.error("Erro ao enviar formulário. Por favor, tente novamente.");
    }
  }, [
    paginaAtual,
    paginas,
    errosValidacao,
    validarPagina,
    rotaRedirecionamento,
  ]);

  // Handler para tecla Enter usando useCallback
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        // Evita que o Enter dispare em campos textarea
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === "TEXTAREA") {
          return;
        }

        // Impede o comportamento padrão do Enter
        event.preventDefault();

        // Se estiver na última página, finaliza o formulário
        if (paginaAtual === paginas.length) {
          finalizar();
        } else {
          // Caso contrário, avança para a próxima página
          proximaPagina();
        }
      }
    },
    [paginaAtual, paginas.length, proximaPagina, finalizar]
  );

  // Adiciona e remove o event listener quando o componente monta/desmonta
  useEffect(() => {
    // Adiciona o event listener
    document.addEventListener("keydown", handleKeyDown);

    // Remove o event listener quando o componente desmonta
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const irParaHome = () => {
    navigate("/");
  };

  // Renderiza um input específico baseado no seu tipo
  const renderizarInput = (input: InputConfig) => {
    const {
      tipo,
      titulo,
      subtitulo,
      nome,
      obrigatorio,
      opcoes,
      placeholder,
      formatacao,
      formatacaoPersonalizada,
    } = input;

    // Verificar se existe erro de validação para este campo
    const erro = errosValidacao[nome];

    switch (tipo) {
      case "input":
        return (
          <div className="input-container" key={nome}>
            <Input
              value={formData[nome] || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(
                  nome,
                  e.target.value,
                  formatacao,
                  formatacaoPersonalizada
                )
              }
              onBlur={() =>
                handleInputBlur(nome, formData[nome] || "", formatacao)
              }
              label={titulo}
              placeholder={placeholder || ""}
              size="lg"
              variant="bordered"
              radius="lg"
              isRequired={obrigatorio}
              isInvalid={!!erro}
              errorMessage={erro}
              fullWidth
              classNames={{
                base: "custom-input",
              }}
              description={subtitulo}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="input-container" key={nome}>
            <Textarea
              value={formData[nome] || ""}
              onChange={(e) =>
                handleInputChange(nome, e.target.value, formatacao)
              }
              onBlur={() =>
                handleInputBlur(nome, formData[nome] || "", formatacao)
              }
              label={titulo}
              placeholder={placeholder || ""}
              variant="bordered"
              radius="lg"
              isRequired={obrigatorio}
              isInvalid={!!erro}
              errorMessage={erro}
              fullWidth
              classNames={{
                base: "custom-input",
              }}
              description={subtitulo}
              minRows={4}
            />
          </div>
        );

      case "radio":
        return (
          <div className="input-container" key={nome}>
            <RadioGroup
              label={titulo}
              value={formData[nome] || ""}
              onValueChange={(value: string) => handleInputChange(nome, value)}
              isRequired={obrigatorio}
              isInvalid={!!erro}
              errorMessage={erro}
              description={subtitulo}
              orientation="vertical"
              color="primary"
              className="radio-group-custom"
            >
              {opcoes?.map((opcao) => (
                <Radio key={opcao.valor} value={opcao.valor}>
                  {opcao.label}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        );

      case "select":
        return (
          <div className="input-container" key={nome}>
            <Select
              label={titulo}
              placeholder={placeholder || "Selecione uma opção"}
              selectedKeys={formData[nome] ? [formData[nome]] : []}
              onChange={(e) => handleInputChange(nome, e.target.value)}
              onBlur={() =>
                handleInputBlur(nome, formData[nome] || "", formatacao)
              }
              variant="bordered"
              radius="lg"
              isRequired={obrigatorio}
              isInvalid={!!erro}
              errorMessage={erro}
              fullWidth
              description={subtitulo}
              classNames={{
                base: "custom-input",
              }}
            >
              {(opcoes || []).map((opcao) => (
                <SelectItem key={opcao.valor}>{opcao.label}</SelectItem>
              ))}
            </Select>
          </div>
        );

      case "file":
        return (
          <div className="input-container arquivo-container" key={nome}>
            <div className="arquivo-item">
              <div className="arquivo-esquerda">
                <div className="arquivo-icone">
                  {formData[nome] instanceof File ? (
                    <div className="arquivo-miniatura">
                      <img src={arquivoPdfIcon} alt="PDF" />
                    </div>
                  ) : (
                    <img src={arquivoPdfIcon} alt="PDF" />
                  )}
                </div>
                <div className="arquivo-tamanho-max">Max: 5MB</div>
              </div>

              <div className="arquivo-centro">
                <div className="arquivo-titulo">
                  {formData[nome] instanceof File
                    ? formData[nome].name
                    : titulo}
                </div>
                <div className="arquivo-status">
                  <Chip
                    color={
                      formData[nome] instanceof File ? "success" : "warning"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {formData[nome] instanceof File ? "ANEXADO" : "PENDENTE"}
                  </Chip>
                </div>
              </div>

              <div className="arquivo-direita">
                {formData[nome] instanceof File ? (
                  <button
                    type="button"
                    className="arquivo-remover"
                    aria-label="Remover arquivo"
                    onClick={() => handleInputChange(nome, "")}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 6H5H21"
                        stroke="#16353E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                        stroke="#16353E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <label htmlFor={`file-${nome}`} className="arquivo-upload">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                        stroke="#16353E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 8L12 3L7 8"
                        stroke="#16353E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 3V15"
                        stroke="#16353E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </label>
                )}
              </div>

              <input
                type="file"
                id={`file-${nome}`}
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    handleInputChange(nome, e.target.files[0]);
                  }
                }}
                aria-label={`Upload ${titulo}`}
              />
            </div>

            <div className="arquivo-divisor"></div>

            {erro && <p className="mensagem-erro">{erro}</p>}
          </div>
        );

      case "documentos":
        const documentosConfig = input as DocumentosConfig;
        return (
          <div className="input-container documentos-container" key={nome}>
            <label className="documentos-label">
              {titulo} {obrigatorio && <span className="obrigatorio">*</span>}
            </label>
            {subtitulo && <p className="documentos-subtitulo">{subtitulo}</p>}

            <div className="documentos-lista">
              {documentosConfig.documentos.map((documento, index) => {
                const documentoKey = `${nome}_${documento.id}`;
                const temArquivo = formData[documentoKey] instanceof File;

                return (
                  <React.Fragment key={documento.id}>
                    <div className="arquivo-item">
                      <div className="arquivo-esquerda">
                        <div className="arquivo-icone">
                          {temArquivo ? (
                            <div className="arquivo-miniatura">
                              <img src={arquivoPdfIcon} alt="PDF" />
                            </div>
                          ) : (
                            <img src={arquivoPdfIcon} alt="PDF" />
                          )}
                        </div>
                        <div className="arquivo-tamanho-max">Max: 5MB</div>
                      </div>

                      <div className="arquivo-centro">
                        <div className="arquivo-titulo">
                          {temArquivo
                            ? (formData[documentoKey] as File).name
                            : documento.titulo}
                        </div>
                        <div className="arquivo-status">
                          <Chip
                            color={temArquivo ? "success" : "warning"}
                            size="sm"
                            variant="flat"
                          >
                            {temArquivo ? "ANEXADO" : "PENDENTE"}
                          </Chip>
                        </div>
                      </div>

                      <div className="arquivo-direita">
                        {temArquivo ? (
                          <button
                            type="button"
                            className="arquivo-remover"
                            aria-label={`Remover ${documento.titulo}`}
                            onClick={() => handleInputChange(documentoKey, "")}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 6H5H21"
                                stroke="#16353E"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                stroke="#16353E"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        ) : (
                          <label
                            htmlFor={`file-${documentoKey}`}
                            className="arquivo-upload"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                                stroke="#16353E"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M17 8L12 3L7 8"
                                stroke="#16353E"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 3V15"
                                stroke="#16353E"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </label>
                        )}
                      </div>

                      <input
                        type="file"
                        id={`file-${documentoKey}`}
                        accept=".pdf"
                        style={{ display: "none" }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files && e.target.files[0]) {
                            handleInputChange(documentoKey, e.target.files[0]);
                          }
                        }}
                        aria-label={`Upload ${documento.titulo}`}
                      />
                    </div>

                    {index < documentosConfig.documentos.length - 1 && (
                      <div className="arquivo-divisor"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {erro && <p className="mensagem-erro">{erro}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  // Página inicial com o título do formulário
  if (paginaAtual === 0) {
    return (
      <div className="formulario-dinamico">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#fff",
              color: "#14374c",
              border: "1px solid #14374c20",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
            error: {
              style: {
                background: "#fff",
                color: "#e53e3e",
                borderLeft: "4px solid #e53e3e",
              },
            },
            success: {
              style: {
                background: "#fff",
                color: "#38a169",
                borderLeft: "4px solid #38a169",
              },
            },
          }}
        />
        <div className="header">
          <div
            className="logo"
            onClick={irParaHome}
            style={{ cursor: "pointer" }}
          >
            <h1>PROAE</h1>
          </div>
          <p className="details">Edital nº 27/2023</p>
        </div>
        <div className="formulario-header">
          {logoSrc && (
            <img src={logoSrc} alt="Logo" className="formulario-logo" />
          )}
        </div>

        <div className="progresso-container">
          <div className="barra-progresso">
            <div
              className="progresso-preenchido"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>

        <div className="formulario-conteudo">
          <h1 className="formulario-titulo">{titulo}</h1>
          {subtitulo && <p className="formulario-subtitulo">{subtitulo}</p>}
        </div>

        <div className="footer">
          <div className="footer-back" onClick={cancelarFormulario}>
            <img src={arrowDownIcon} className="arrow-down" alt="Cancelar" />
            <span className="voltar-texto">Cancelar</span>
          </div>
          <div className="footer-next">
            <Button
              color="primary"
              className="botao-continuar"
              onClick={proximaPagina}
            >
              {paginas[0]?.botaoContinuar || "Continuar"}
              <img
                src={arrowDownBegeIcon}
                className="arrow-next"
                alt="Continuar"
              />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Páginas com inputs
  if (paginaAtual <= paginas.length) {
    const paginaAtualConfig = paginas[paginaAtual - 1];

    return (
      <div className="formulario-dinamico">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#fff",
              color: "#14374c",
              border: "1px solid #14374c20",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
            error: {
              style: {
                background: "#fff",
                color: "#e53e3e",
                borderLeft: "4px solid #e53e3e",
              },
            },
            success: {
              style: {
                background: "#fff",
                color: "#38a169",
                borderLeft: "4px solid #38a169",
              },
            },
          }}
        />
        <div className="header">
          <div
            className="logo"
            onClick={irParaHome}
            style={{ cursor: "pointer" }}
          >
            <h1>PROAE</h1>
          </div>
          <p className="details">Edital nº 27/2023</p>
        </div>
        <div className="formulario-header">
          {logoSrc && (
            <img src={logoSrc} alt="Logo" className="formulario-logo" />
          )}
        </div>

        <div className="progresso-container">
          <div className="barra-progresso">
            <div
              className="progresso-preenchido"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>

        <div className="formulario-conteudo">
          <h2 className="pagina-titulo">{paginaAtualConfig.titulo}</h2>
          {paginaAtualConfig.subtitulo && (
            <p className="pagina-subtitulo">{paginaAtualConfig.subtitulo}</p>
          )}

          <div className="inputs-container">
            {paginaAtualConfig.inputs.map((input) => renderizarInput(input))}
          </div>
        </div>

        <div className="footer">
          <div className="footer-back" onClick={paginaAnterior}>
            <img src={arrowDownIcon} className="arrow-down" alt="Voltar" />
            <span className="voltar-texto">Voltar</span>
          </div>
          <div className="footer-next">
            {paginaAtual === paginas.length ? (
              <Button
                color="success"
                disabled={enviando}
                className="botao-finalizar"
                onClick={finalizar}
              >
                {enviando ? "Enviando..." : botaoFinal}
                <img
                  src={arrowDownBegeIcon}
                  className="arrow-next"
                  alt="Finalizar"
                />
              </Button>
            ) : (
              <Button
                color="primary"
                className="botao-continuar"
                onClick={proximaPagina}
              >
                {paginaAtualConfig.botaoContinuar || "Continuar"}
                <img
                  src={arrowDownBegeIcon}
                  className="arrow-next"
                  alt="Continuar"
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tela de conclusão
  return (
    <div className="formulario-dinamico">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#fff",
            color: "#14374c",
            border: "1px solid #14374c20",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          error: {
            style: {
              background: "#fff",
              color: "#e53e3e",
              borderLeft: "4px solid #e53e3e",
            },
          },
          success: {
            style: {
              background: "#fff",
              color: "#38a169",
              borderLeft: "4px solid #38a169",
            },
          },
        }}
      />
      <div className="header">
        <div
          className="logo"
          onClick={irParaHome}
          style={{ cursor: "pointer" }}
        >
          <h1>PROAE</h1>
        </div>
        <p className="details">Edital nº 27/2023</p>
      </div>
      <div className="formulario-header">
        {logoSrc && (
          <img src={logoSrc} alt="Logo" className="formulario-logo" />
        )}
      </div>

      <div className="formulario-conteudo conclusao">
        <div className="icone-conclusao">✓</div>
        <h2 className="titulo-conclusao">Formulário enviado com sucesso!</h2>
        <p className="mensagem-conclusao">
          Você será redirecionado em instantes...
        </p>
      </div>
      <div className="footer">
        <div className="footer-back">
          <img src={arrowDownIcon} className="arrow-down" alt="Voltar" />
          <span className="voltar-texto">Voltar</span>
        </div>
        <div className="footer-next">
          <Button color="primary" className="botao-continuar" disabled>
            Concluído
            <img
              src={arrowDownBegeIcon}
              className="arrow-next"
              alt="Continuar"
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormularioDinamico;
