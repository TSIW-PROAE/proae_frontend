import { useEffect, useContext, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Link } from "@heroui/link";
import { useLocation, useNavigate } from "react-router-dom"; 
import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from 'react-hook-form';
import { verificarEmailInstitucional } from "@/utils/validations";
import "./LoginProae.css";

const loginProaeSchema = z.object({
  email: z
    .email({error: "Email inválido"})
    .min(1, "Email é obrigatório")
    .refine((email) => verificarEmailInstitucional(email, "@ufba.br"), {
      message: "Email deve ser do domínio @ufba.br"
    }),
  senha: z
    .string()
    .min(1, "Digite sua senha")
    .min(5, "A senha deve ter no mínimo 5 caracteres"),
  lembrar: z.boolean()
});

type LoginProaeFormData = z.infer<typeof loginProaeSchema>;


export default function LoginProae() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useContext(AuthContext);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    control, 
    handleSubmit, 
    setValue, 
    formState: { errors } 
  } = useForm<LoginProaeFormData>({
    resolver: zodResolver(loginProaeSchema),
    defaultValues: {
      email: "",
      senha: "",
      lembrar: false
    },
    mode: "onBlur"
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");

    if (emailParam) {
      setValue("email", emailParam);
    }
    if (isAuthenticated) {
      navigate("/portal-proae/inscricoes");
    }
  }, [location, navigate, isAuthenticated, setValue]);

  const onSubmit = async (data: LoginProaeFormData) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await login({ email: data.email, senha: data.senha });
      toast.success("Login realizado com sucesso!");
      navigate("/portal-proae/inscricoes");
    } catch (err: any) {
      console.error("Erro no login:", err);
      if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao realizar login. Verifique suas credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login" className="w-full min-h-screen flex items-center justify-center bg-login-background bg-cover bg-center bg-[#183b4e]">
      <Toaster position="top-right" />
      <div className="w-[90%] max-w-screen-md flex flex-col items-center">
        <div className="w-full bg-[#ffff] rounded-[24px] shadow-lg flex flex-col md:flex-row overflow-hidden justify-center">
          <a
            href="/"
            className="voltar-link-login"
            style={{ color: "var(--cor-creme)" }}
          >
            <span style={{ marginRight: "5px" }}>←</span>
            Página inicial
          </a>

          

          <div className="md:w-8/12 h-full md:p-10 p-4 w-full">
            <div className="mb-6 text-center">
              <h2 className="login-title">Faça Login</h2>
              <p className="login-subtitle">
                Tenha acesso às informações do seu cadastro PROAE
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      label="Email"
                      variant="bordered"
                      radius="lg"
                      type="email"
                      placeholder="Digite seu email @ufba.br"
                      isInvalid={!!errors.email}
                      errorMessage={errors.email?.message}
                      fullWidth
                      disabled={isLoading}
                      classNames={{
                        base: "custom-input",
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name="senha"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="senha"
                      label="Senha"
                      variant="bordered"
                      radius="lg"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      isInvalid={!!errors.senha}
                      errorMessage={errors.senha?.message}
                      fullWidth
                      disabled={isLoading}
                      classNames={{
                        base: "custom-input",
                        innerWrapper: "items-center",
                        input: "pr-12",
                      }}
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
                  )}
                />
              </div>
              <div className="flex justify-between items-center mt-1 mb-2">
                <div className="remember-option">
                  <Controller
                    name="lembrar"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        size="sm"
                        isSelected={field.value}
                        onValueChange={field.onChange}
                        aria-label="Lembrar-me"
                        color="primary"
                        isDisabled={isLoading}
                      >
                        Lembrar-me
                      </Switch>
                    )}
                  />
                </div>
                <a href="/forgot-password" className="forgot-password">
                  Esqueci minha senha
                </a>
              </div>

              <Button
                type="submit"
                radius="lg"
                fullWidth
                className="login-button"
                color="primary"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="register-link-container">
                <Link
                  href="./cadastro-proae"
                  className="register-link"
                  color="primary"
                >
                  Cadastrar-se no sistema
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
