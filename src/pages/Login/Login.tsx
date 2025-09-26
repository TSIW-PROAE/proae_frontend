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
import "./Login.css";
import { Spinner } from "@heroui/react";

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
    formState: { errors, isSubmitting } 
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
    <div id="login" className="w-full min-h-screen flex items-center justify-center bg-login-background bg-cover bg-center bg-[#183b4e] p-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-screen-md flex flex-col items-center">
        
        <div className="w-full bg-[#ffff] rounded-[24px] shadow-lg flex flex-col md:flex-row overflow-hidden justify-center">
          <div className="logo-container flex items-end justify-end">
            <a href="/" className="z-10 text-white font-medium text-sm">
            <span style={{ marginRight: "5px" }}>←</span>
            Página inicial
            </a>
          </div>
         

          

          <div className="h-full md:p-12 p-6 w-full">
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
                isLoading={isLoading || isSubmitting}
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? <Spinner size="md" className="text-white" /> : "Entrar"}
              </Button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 mb-4">
                  Novo no sistema? Cadastre-se como:
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="./cadastro-aluno"
                    className="flex items-center justify-center py-2 px-4 border border-[#183b4e] text-[#183b4e] hover:bg-[#183b4e10] rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Aluno
                  </Link>
                  
                  <Link
                    href="./cadastro-proae"
                    className="flex items-center justify-center py-2 px-4 border border-[#183b4e] text-[#183b4e] hover:bg-[#183b4e10] rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Administrador PROAE
                  </Link>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
