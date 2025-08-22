import {  useSearchParams } from "react-router-dom"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import CadastroAlunoService from "@/services/CadastroAluno.service/cadastroAluno.service";
import { toast, Toaster } from "react-hot-toast";
import {Input} from "@heroui/input"
import "./ResetPassword.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IResetPassword } from "@/types/auth";


export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, control, formState: { errors }, setError, watch } = useForm<IResetPassword>({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")
  const navigate = useNavigate();
  const newPassword = watch("newPassword");

  const handleOnSubmit: SubmitHandler<IResetPassword> = async (data) => {
    setIsLoading(true);
    let hasErrors = false;

    const client = new FetchAdapter();
    const cadastroAlunoService = new CadastroAlunoService(client);

    try {
      if(data.newPassword.length < 8) {
        setError("newPassword", {
          type: "minLength",
          message: "A nova senha deve ter pelo menos 8 caracteres."
        });
        hasErrors = true;
      }

      if (data.newPassword !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "mismatch",
          message: "As senhas não coincidem."
        });
        hasErrors = true;
      }

      if (hasErrors) {
        setIsLoading(false);
        return;
      }

      if(!token) {
        toast.error("Token inválido ou ausente.");
        setIsLoading(false);
        return;
      }

      await cadastroAlunoService.resetPassword({...data, token});
      toast.success("Senha alterada com sucesso!");
      navigate("/login-aluno")
    } catch (error) {
      if((error as any)?.statusCode == 401){
        toast.error("Erro ao alterar a senha. Por favor, tente novamente mais tarde.");
         navigate("/")
      } else {
        toast.error("Erro ao alterar a senha. Tente novamente.");
      }
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
            rules={{
              required: "Nova senha é obrigatória",
              minLength: {
                value: 8,
                message: "A nova senha deve ter pelo menos 8 caracteres"
              }
            }}
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
                isInvalid={!!errors.newPassword}
                errorMessage={errors.newPassword?.message}
                classNames={{
                  base: "custom-input",
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Confirmação de senha é obrigatória",
              validate: (value) => {
                if (value !== newPassword) {
                  return "As senhas não coincidem";
                }
                return true;
              }
            }}
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
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                classNames={{
                  base: "custom-input",
                }}
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
