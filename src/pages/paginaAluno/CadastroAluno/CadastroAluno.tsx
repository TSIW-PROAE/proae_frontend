import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { DateValue } from "@internationalized/date";
import { toast, Toaster } from "react-hot-toast";
import AuthService from "../../../services/AuthService/auth.service";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { validateForm, errors, setFieldError } = useFormValidation(formData);

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



    if (validateForm()) {
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

      const authService = new AuthService();

      try {
        const response = await authService.signupAluno(dadosFormatados);
        console.log(response);
        toast.success("Cadastro realizado com sucesso!");
        navigate("/login");
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
    <section className="w-full min-h-screen flex items-center justify-center bg-[#183b4e] py-6 px-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Cadastre-se!
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="nome"
            value={formData.nome}
            label="Nome"
            variant="bordered"
            type="text"
            placeholder="Digite o seu nome"
            onChange={(e) => handleInputChange("nome", e.target.value)}
            isInvalid={!!errors.nome}
            errorMessage={errors.nome}
            fullWidth
          />

          
          <DatePicker
            label="Data de Nascimento"
            variant="bordered"
            fullWidth
            value={formData.dataNascimento}
            onChange={(date) => handleInputChange("dataNascimento", date)}
            isInvalid={!!errors.dataNascimento}
            errorMessage={errors.dataNascimento}
          />

          <Input
            type="text"
            label="Curso"
            variant="bordered"
            fullWidth
            placeholder="Digite seu curso"
            onChange={(e) => handleInputChange("curso", e.target.value)}
            isInvalid={!!errors.curso}
            errorMessage={errors.curso}
          />

          <Select
            label="Campus"
            variant="bordered"
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

          <Input
            id="cpf"
            value={formData.cpf}
            label="CPF"
            variant="bordered"
            type="text"
            placeholder="Digite seu CPF"
            onChange={(e) =>
              handleInputChange("cpf", formatCPF(e.target.value))
            }
            isInvalid={!!errors.cpf}
            errorMessage={errors.cpf}
            fullWidth
          />

          <DatePicker
            label="Data de Ingresso"
            variant="bordered"
            fullWidth
            value={formData.dataIngresso}
            onChange={(date) => handleInputChange("dataIngresso", date)}
            isInvalid={!!errors.dataIngresso}
            errorMessage={errors.dataIngresso}
          />

          <Input
            id="matricula"
            value={formData.matricula}
            label="Matrícula"
            variant="bordered"
            type="text"
            placeholder="Digite a sua matrícula"
            onChange={(e) =>
              handleInputChange("matricula", e.target.value)
            }
            isInvalid={!!errors.matricula}
            errorMessage={errors.matricula}
            fullWidth
          />

          <Input
            id="email"
            value={formData.email}
            label="Email"
            variant="bordered"
            type="email"
            placeholder="Digite seu email @ufba.br"
            onChange={(e) => handleInputChange("email", e.target.value)}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
            fullWidth
          />

          <Input
            id="celular"
            value={formData.celular}
            label="Celular"
            variant="bordered"
            type="text"
            placeholder="Digite o seu celular"
            onChange={(e) => handleInputChange("celular", e.target.value)}
            isInvalid={!!errors.celular}
            errorMessage={errors.celular}
            fullWidth
          />

          <Input
            id="senha"
            label="Senha"
            variant="bordered"
            type="password"
            placeholder="Digite sua senha"
            value={formData.senha}
            onChange={(e) => handleInputChange("senha", e.target.value)}
            isInvalid={!!errors.senha}
            errorMessage={errors.senha}
            fullWidth
          />

          <Input
            id="confirmarSenha"
            label="Repita sua senha"
            variant="bordered"
            type="password"
            placeholder="Digite sua senha novamente"
            value={formData.confirmarSenha}
            onChange={(e) =>
              handleInputChange("confirmarSenha", e.target.value)
            }
            isInvalid={!!errors.confirmarSenha}
            errorMessage={errors.confirmarSenha}
            fullWidth
          />

          <Button
            type="submit"
            fullWidth
            className="bg-[#183b4e] hover:bg-[#14526d] text-white p-6 rounded-xl font-semibold text-base mt-2"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>

          <a 
            href="/login" 
            className="text-[#183b4e] underline text-center text-sm md:text-base"
          >
            Já possui uma conta? Faça login
          </a>

        </form>
      </div>
    </section>
  );
}
