import { redirect, useSearchParams } from "react-router-dom"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import CadastroAlunoService from "@/services/CadastroAluno.service/cadastroAluno.service";
import { toast, Toaster } from "react-hot-toast";
import {Input} from "@heroui/input"
import "./ResetPassword.css"
import { useState } from "react";

interface IResetPassword {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, control } = useForm<IResetPassword>({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")

  const handleOnSubmit: SubmitHandler<IResetPassword> = async (data) => {
    setIsLoading(true);

    const client = new FetchAdapter();
    const cadastroAlunoService = new CadastroAlunoService(client);

    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error("As senhas não coincidem.");
        return;
      }

      if(!token) {
        toast.error("Token inválido ou ausente.");
        return;
      }

      if(data.newPassword.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      await cadastroAlunoService.resetPassword(token, data.newPassword);
      setIsLoading(false);
      toast.success("Senha alterada com sucesso!");
      redirect("/login-aluno");
    } catch (error) {
      setIsLoading(false);
      toast.error("Erro ao alterar a senha. Por favor, tente novamente.");
    } finally{
      setIsLoading(false);
    }
  }


  return (
    <div className="reset-password-container">
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit(handleOnSubmit)} className="reset-form">
        <div className="reset-header">
          <h1 className="reset-title">Recuperar Senha</h1>
          <p className="reset-description text-slate-600">Para concluir a recuperação da sua senha, preencha os campos com sua nova senha de acesso</p>
        </div>
        <div className="reset-inputs">
          <Controller
            name="newPassword"
            control={control}
            render={({field}) => (
              <Input
                {...field}
                id="newPassword"
                label="Nova Senha"
                variant="bordered"
                radius="lg"
                type="password"
                placeholder="Digite sua nova senha"
                fullWidth
                disabled={isLoading}
                classNames={{
                  base: "custom-input",
                }}
                required
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({field}) => (
              <Input
                {...field}
                id="confirmPassword"
                label="Confirmar Senha"
                variant="bordered"
                radius="lg"
                type="password"
                placeholder="Confirme sua nova senha"
                fullWidth
                disabled={isLoading}
                classNames={{
                  base: "custom-input",
                }}
                required
              />
            )}
          />
          <button type="submit" className="reset-btn">
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              "Enviar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
