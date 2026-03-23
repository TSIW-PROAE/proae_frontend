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
import {
  hasAdminRole,
  hasAlunoRole,
  isAdminAprovado,
  normalizeRoles,
} from "@/utils/authRoles";
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

export type LoginAs = "aluno" | "admin";

const LOGIN_AS_KEY = "proae_login_as";

function readStoredLoginAs(): LoginAs {
  try {
    const s = sessionStorage.getItem(LOGIN_AS_KEY);
    if (s === "admin" || s === "aluno") return s;
  } catch {
    /* private mode etc. */
  }
  return "aluno";
}

export default function LoginProae() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, login } = useContext(AuthContext);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  /** Persistido: sobrevive a remount (ex.: React Strict Mode) após o login */
  const [loginAs, setLoginAs] = useState<LoginAs>(readStoredLoginAs);
  /** Impede o useEffect de competir com o navigate do onSubmit */
  const [loginInProgress, setLoginInProgress] = useState(false);

  const setLoginAsTab = (as: LoginAs) => {
    try {
      sessionStorage.setItem(LOGIN_AS_KEY, as);
    } catch {
      /* ignore */
    }
    setLoginAs(as);
  };

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

    /**
     * Já logado ao abrir /login: respeita a aba escolhida (persistida em sessionStorage).
     * Assim, após remount do React, "Servidor PROAE" não volta ao default "aluno" e não
     * manda o servidor para o portal do estudante por engano.
     */
    if (isAuthenticated && userInfo && !loginInProgress) {
      const roles = normalizeRoles(userInfo.roles);
      const isAdmin = hasAdminRole(roles);
      const aprovado = isAdminAprovado(
        userInfo.aprovado,
        userInfo.adminAprovado,
      );
      const isAluno = hasAlunoRole(roles);

      if (loginAs === "admin") {
        if (isAdmin && aprovado) {
          navigate("/portal-proae/inscricoes", { replace: true });
        } else if (isAdmin && !aprovado) {
          navigate("/tela-de-espera", { replace: true });
        } else if (isAluno) {
          navigate("/portal-aluno", { replace: true });
        }
      } else {
        navigate("/portal-aluno", { replace: true });
      }
    }
  }, [
    location.search,
    navigate,
    isAuthenticated,
    userInfo,
    setValue,
    loginAs,
    loginInProgress,
  ]);

  const onSubmit = async (data: LoginProaeFormData) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setLoginInProgress(true);
    try {
      setLoginAsTab(loginAs);
      const response = await login({ email: data.email, senha: data.senha });
      toast.success("Login realizado com sucesso!");
      const roles = normalizeRoles(response?.user?.roles);
      const isAdmin = hasAdminRole(roles);
      const aprovado = isAdminAprovado(
        response?.user?.aprovado,
        response?.user?.adminAprovado ?? response?.adminAprovado,
      );
      const isAluno = hasAlunoRole(roles);

      if (loginAs === "admin") {
        if (isAdmin && aprovado) {
          navigate("/portal-proae/inscricoes", { replace: true });
        } else if (isAdmin && !aprovado) {
          navigate("/tela-de-espera", { replace: true });
        } else if (isAluno) {
          toast("Você não tem cadastro de Servidor PROAE nesta conta. Redirecionando ao portal do estudante.", { icon: "ℹ️" });
          navigate("/portal-aluno", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        // Aba aluno: sempre portal do estudante (completar cadastro se necessário).
        navigate("/portal-aluno", { replace: true });
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      setLoginInProgress(false);
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
            <div className="mb-4 text-center">
              <h2 className="login-title">Faça Login</h2>
              <p className="login-subtitle">
                {loginAs === "aluno"
                  ? "Acesse seu portal de benefícios e inscrições"
                  : "Acesse o painel de gerenciamento de editais PROAE"}
              </p>
            </div>

            <div className="login-as-toggle" role="tablist" aria-label="Tipo de acesso">
              <button
                type="button"
                role="tab"
                aria-selected={loginAs === "aluno"}
                className={`login-as-tab ${loginAs === "aluno" ? "login-as-tab-active" : ""}`}
                onClick={() => setLoginAsTab("aluno")}
              >
                Sou Aluno
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={loginAs === "admin"}
                className={`login-as-tab ${loginAs === "admin" ? "login-as-tab-active" : ""}`}
                onClick={() => setLoginAsTab("admin")}
              >
                Sou Servidor PROAE
              </button>
            </div>

            <form className="flex flex-col gap-5 mt-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="h-20">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      label={loginAs === "aluno" ? "Email (acesso aluno)" : "Email (acesso servidor @ufba.br)"}
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

              <div className="h-20">
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
                {isLoading || isSubmitting ? (
                  <Spinner size="md" className="text-white" />
                ) : loginAs === "aluno" ? (
                  "Entrar como Aluno"
                ) : (
                  "Entrar como Servidor PROAE"
                )}
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
                    Servidor PROAE
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
