import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/react";

import {  useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import "./CadastroAluno.css";

import CadastroAlunoService from "@/services/CadastroAluno.service/cadastroAluno.service";
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";

import { useCadastroForm } from "@/hooks/useCadastroForm";
import { useFormValidation } from "@/hooks/useFormValidation";

import { formatarCelular, formatarData, formatCPF,  } from "@/utils/utils";
import { pronomes, cursos, campus } from "@/utils/cadastroop";



export default function Cadastro() {
  const {formData, handleInputChange} = useCadastroForm();
  const {validateForm, clearError, errors } =  useFormValidation()
  const navigate = useNavigate();
  const anoAtual = new Date().getFullYear();

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    handleInputChange(field, value);
    clearError(field);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm(formData)) {
      const dadosFormatados = {
        matricula: formData.matricula,
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        pronome: formData.pronome,
        data_nascimento: formatarData(formData.dataNascimento),
        curso: formData.curso,
        campus: formData.campus,
        cpf: formData.cpf.replace(/\D/g, ""),
        data_ingresso: formatarData(formData.dataIngresso),
        celular: formatarCelular(formData.celular),
      };
      console.log(dadosFormatados);


      try {
        const client = new FetchAdapter();
        const cadastroAlunoService = new CadastroAlunoService(client);

        const response =await cadastroAlunoService.createAlunoUser(dadosFormatados);

        console.log(response);

        toast.success("Cadastro realizado com sucesso!");
        navigate("/login-aluno");
      } catch (error: any) {
        console.log(error);
        handleRegistrationError(error);
      }
    }
  };

  const handleRegistrationError = (error: any) => {
    const mensagemErro = error.message || "Erro ao realizar o cadastro.";

    if(mensagemErro === "Erro ao inserir aluno no clerk") {
      error.error.errors.forEach((element: { message: string }) => {
        if (
          element.message == "That username is taken. Please try another."
        ) {
          toast.error("Matrícula já cadastrada no sistema");
        } else if (
          element.message ==
          "That email address is taken. Please try another."
        ) {
          toast.error("Email já cadastrada no sistema");
        } else if (
          element.message ==
          "Password has been found in an online data breach. For account safety, please use a different password."
        ) {
          toast.error(
            "Sua senha foi encontada em um vazamento de dados, por favor digite uma senha diferente"
          );
        } else if (
          element.message ==
          "Username must be between 11 and 11 characters long."
        ) {
        } else {
          toast.error(element.message);
        }
      });
    } else {
      toast.error(mensagemErro);
    }
  }

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
                    onChange={(e) => handleFieldChange("nome", e.target.value)}
                    isInvalid={!!errors.nome}
                    errorMessage={errors.nome}
                    fullWidth
                    classNames={{ base: "custom-input" }}
                  />
                </div>
                <div className="input-container">
                  <Input
                    id="sobrenome"
                    value={formData.sobrenome}
                    label="Sobrenome"
                    variant="bordered"
                    radius="lg"
                    type="text"
                    placeholder="Digite o seu sobrenome"
                    onChange={(e) =>
                      handleFieldChange("sobrenome", e.target.value)
                    }
                    isInvalid={!!errors.sobrenome}
                    errorMessage={errors.sobrenome}
                    fullWidth
                    classNames={{ base: "custom-input" }}
                  />
                </div>
              </div>

              <div className="select-container">
                <Select
                  className="select-pronomes"
                  label="Pronomes"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  selectedKeys={[formData.pronome]}
                  onChange={(e) => handleFieldChange("pronome", e.target.value)}
                  isInvalid={!!errors.pronome}
                  errorMessage={errors.pronome}
                >
                  {pronomes.map((pronome) => (
                    <SelectItem key={pronome.valor}>{pronome.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="date-container">
                <DatePicker
                  label="Data de Nascimento"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  value={formData.dataNascimento}
                  onChange={(date) => handleFieldChange("dataNascimento", date)}
                  isInvalid={!!errors.dataNascimento}
                  errorMessage={errors.dataNascimento}
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="select-container">
                <Select
                  className="select-cursos"
                  label="Curso"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  selectedKeys={[formData.curso]}
                  onChange={(e) => handleFieldChange("curso", e.target.value)}
                  isInvalid={!!errors.curso}
                  errorMessage={errors.curso}
                >
                  {cursos.map((curso) => (
                    <SelectItem key={curso.valor}>{curso.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="select-container">
                <Select
                  className="select-campus"
                  label="Campus"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  selectedKeys={[formData.campus]}
                  onChange={(e) => handleFieldChange("campus", e.target.value)}
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
                    handleFieldChange("cpf", formatCPF(e.target.value))
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
                  onChange={(date) => handleFieldChange("dataIngresso", date)}
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
                    handleFieldChange("matricula", e.target.value)
                  }
                  fullWidth
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
                  onChange={(e) => handleFieldChange("email", e.target.value)}
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
                  fullWidth
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
                />
              </div>

              <Button
                type="submit"
                radius="lg"
                fullWidth
                className="cadastro-button"
                color="primary"
              >
                Avançar
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
