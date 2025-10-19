import { Input } from "@heroui/input";
import { useState } from "react";
import {useForm, Controller, SubmitHandler} from "react-hook-form"
import AuthService from "@/services/AuthService/auth.service"
import {toast, Toaster} from "react-hot-toast";
import "./ForgotPassword.css"

interface IForgotPassword{
  email: string;
}

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const {handleSubmit, control} = useForm({
    defaultValues: {
      email: ""
    }
  });

  const authService = new AuthService();

  const handleOnSubmit: SubmitHandler<IForgotPassword> = async (data) => {
    if(!data.email.includes("@ufba.br")) {
      toast.error("Por favor, insira um email válido da UFBA.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email)
        setIsLoading(false);
        toast.success("Instruções de recuperação de senha enviadas para " + data.email);
    } catch (error) {
        setIsLoading(false);
        toast.error("Erro ao enviar instruções de recuperação de senha.");
    } finally{
        setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(handleOnSubmit)} className="forgot-form">
      <div className="forgot-header">
        <h1 className="forgot-title">Recuperar Senha</h1>
      <p className="forgot-description text-slate-600">Insira seu e-mail para receber instruções de recuperação.</p>
      </div>
        <div className="forgot-inputs">
          <Controller
          name="email"
          control={control}
          render={({field}) => (
            <Input
              {...field}
              id="email"
              label="Email"
              variant="bordered"
              radius="lg"
              type="email"
              placeholder="Digite seu email @ufba.br"
              fullWidth
              disabled={isLoading}
              classNames={{
                base: "custom-input",
              }}
              required
            />
          )}
        />
        <button type="submit" className="forgot-btn">
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            "Enviar"
          )}
        </button>
        </div>
          <div className="forgot-links">
            <a href="/login" className="forgot-link">Voltar para Login</a>
            <a href="/cadastro-aluno" className="forgot-link">Cadastrar-se no sistema</a>
          </div>
      </form>
    </div>
  );
}
