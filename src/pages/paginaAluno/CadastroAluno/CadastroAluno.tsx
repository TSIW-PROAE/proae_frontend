import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { DateValue } from "@internationalized/date";
import { toast, Toaster } from "react-hot-toast";
import "./CadastroAluno.css";
import CadastroAlunoService from "../../../services/CadastroAluno.service/cadastroAluno.service";
import { FetchAdapter } from "../../../services/BaseRequestService/HttpClient";
import useFormValidation, { FormData } from "@/hooks/useFormValidation";
import { formatarData, formatarCelular, formatCPF } from "../../../utils/validations";
import {campus} from "../../../utils/cadastroop";

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    dataNascimento: null,
    curso: "",
    campus: "",
    cpf: "",
    dataIngresso: null,
    matricula: "",
    celular: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const anoAtual = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();
  const { validateForm, errors, setFieldError, isValid } = useFormValidation(formData);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cpfParam = params.get("cpf");
    if (cpfParam) {
      setFormData((prev) => ({ ...prev, cpf: formatCPF(cpfParam) }));
    }
  }, [location]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | DateValue | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setFieldError(field, "");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    validateForm();

    if (isValid) {
      setIsSubmitting(true);

      const dadosFormatados = {
        matricula: formData.matricula,
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        data_nascimento: formatarData(formData.dataNascimento),
        curso: formData.curso,
        campus: formData.campus,
        cpf: formData.cpf.replace(/\D/g, ""),
        data_ingresso: formatarData(formData.dataIngresso),
        celular: formatarCelular(formData.celular),
      };

      const client = new FetchAdapter();
      const cadastroAlunoService = new CadastroAlunoService(client);

      try {
        const response =
          await cadastroAlunoService.createAlunoUser(dadosFormatados);
        console.log(response);
        toast.success("Cadastro realizado com sucesso!");
        navigate("/login-aluno");
      } catch (error: any) {
        console.log(error);

        let mensagemErro = error.message || "Erro ao realizar cadastro";

        if (mensagemErro == "Erro ao inserir aluno no clerk") {
          error.error.errors.forEach((element: { message: string }) => {
            if (
              element.message == "That username is taken. Please try another."
            ) {
              toast.error("Matrícula já cadastrada no sistema");
            } else if (
              element.message ==
              "That email address is taken. Please try another."
            ) {
              toast.error("Email já cadastrado no sistema");
            } else if (
              element.message ==
              "Password has been found in an online data breach. For account safety, please use a different password."
            ) {
              toast.error(
                "Sua senha foi encontrada em um vazamento de dados, por favor digite uma senha diferente"
              );
            } else if (
              element.message ==
              "Username must be between 11 and 11 characters long."
            ) {
              toast.error("A matrícula deve conter até 11 caracteres");
            } else {
              toast.error(element.message);
            }
          });
        } else {
          toast.error(mensagemErro);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Por favor, corrija os erros no formulário antes de continuar.");
    }
  };

  return (
    <div id="cadastro" className="cadastro-container">
      <Toaster position="top-right" />
      <div className="cadastro-content">
        {/* <div className="cadastro-image-container">
            <img
                src="src/assets/logo-ufba-PROAE.png"
                alt="Logo UFBA"
                className="cadastro-image"
            />
        </div> */}

        <div className="cadastro-form">
          <a
            href="/"
            className="voltar-link-cadastro"
            style={{ color: "var(--cor-creme)" }}
          >
            <span style={{ marginRight: "5px" }}>←</span>
            Página inicial
          </a>

          <div className="form-container">
            <div className="cadastro-header">
              <h2 className="cadastro-title">Cadastre-se!</h2>
            </div>

            <form className="cadastro-form-container" onSubmit={handleSubmit}>
              <div className="input-nomes">
                <div className="input-container">
                  <Input
                    id="nome"
                    value={formData.nome}
                    label="Nome"
                    variant="bordered"
                    radius="lg"
                    type="text"
                    placeholder="Digite o seu nome"
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    isInvalid={!!errors.nome}
                    errorMessage={errors.nome}
                    fullWidth
                    classNames={{ base: "custom-input" }}
                  />
                </div>
              </div>

              <div className="date-container">
                <DatePicker
                  label="Data de Nascimento"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  value={formData.dataNascimento}
                  onChange={(date) => handleInputChange("dataNascimento", date)}
                  isInvalid={!!errors.dataNascimento}
                  errorMessage={errors.dataNascimento}
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="select-container">
                <Input
                  type="text"
                  className="select-cursos"
                  label="Curso"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  onChange={(e) => handleInputChange("curso", e.target.value)}
                  isInvalid={!!errors.curso}
                  errorMessage={errors.curso}
                >
                </Input>
              </div>

              <div className="select-container">
                <Select
                  className="select-campus"
                  label="Campus"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  selectedKeys={[formData.campus]}
                  onChange={(e) => handleInputChange("campus", e.target.value)}
                  isInvalid={!!errors.campus}
                  errorMessage={errors.campus}
                >
                  {campus.map((campi) => (
                    <SelectItem key={campi.valor}>{campi.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="input-div">
                <Input
                  id="cpf"
                  value={formData.cpf}
                  label="CPF"
                  variant="bordered"
                  radius="lg"
                  type="text"
                  placeholder="Digite seu CPF"
                  onChange={(e) =>
                    handleInputChange("cpf", formatCPF(e.target.value))
                  }
                  isInvalid={!!errors.cpf}
                  errorMessage={errors.cpf}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="date-container">
                <DatePicker
                  label="Data de Ingresso"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  value={formData.dataIngresso}
                  onChange={(date) => handleInputChange("dataIngresso", date)}
                  isInvalid={!!errors.dataIngresso}
                  errorMessage={errors.dataIngresso}
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="input-div">
                <Input
                  id="matricula"
                  value={formData.matricula}
                  label="Matrícula"
                  variant="bordered"
                  radius="lg"
                  type="text"
                  placeholder="Digite a sua matrícula"
                  onChange={(e) =>
                    handleInputChange("matricula", e.target.value)
                  }
                  isInvalid={!!errors.matricula}
                  errorMessage={errors.matricula}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="input-div">
                <Input
                  id="email"
                  value={formData.email}
                  label="Email"
                  variant="bordered"
                  radius="lg"
                  type="email"
                  placeholder="Digite seu email @ufba.br"
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="input-div">
                <Input
                  id="celular"
                  value={formData.celular}
                  label="Celular"
                  variant="bordered"
                  radius="lg"
                  type="text"
                  placeholder="Digite o seu celular"
                  onChange={(e) => handleInputChange("celular", e.target.value)}
                  isInvalid={!!errors.celular}
                  errorMessage={errors.celular}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="input-div">
                <Input
                  id="senha"
                  label="Senha"
                  variant="bordered"
                  radius="lg"
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  isInvalid={!!errors.senha}
                  errorMessage={errors.senha}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                  endContent={
                    <button
                      className="focus:outline-none flex items-center justify-center h-full px-2"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  }
                />
              </div>

              <div className="input-div">
                <Input
                  id="confirmarSenha"
                  label="Repita sua senha"
                  variant="bordered"
                  radius="lg"
                  type="password"
                  placeholder="Digite sua senha novamente"
                  value={formData.confirmarSenha}
                  onChange={(e) =>
                    handleInputChange("confirmarSenha", e.target.value)
                  }
                  isInvalid={!!errors.confirmarSenha}
                  errorMessage={errors.confirmarSenha}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                  endContent={
                    <button
                      className="focus:outline-none flex items-center justify-center h-full px-2"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                radius="lg"
                fullWidth
                className="cadastro-button"
                color="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "Avançar"}
              </Button>

              <div className="copyright-text">
                © {anoAtual} UFBA PROAE. Todos os direitos reservados.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
