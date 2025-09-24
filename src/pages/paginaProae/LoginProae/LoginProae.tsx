import React, { useState, useEffect, useContext } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Link } from "@heroui/link";
import { useLocation, useNavigate } from "react-router-dom"; import { toast, Toaster } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import "./LoginProae.css";


export default function LoginAluno() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }
    if (isAuthenticated) {
      navigate("/portal-aluno");
    }
  }, [location, navigate, isAuthenticated]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErroEmail("");
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
    setErroSenha("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let temErro = false;

    if (!email) {
      setErroEmail("Email é obrigatório");
      temErro = true;
    } else if (!email.includes("@ufba.br")) {
      setErroEmail("Email deve ser do domínio @ufba.br");
      temErro = true;
    }

    if (!senha) {
      setErroSenha("Digite sua senha");
      temErro = true;
    }

    if (!temErro && !isLoading) {
      setIsLoading(true);
      try {
        await login({ email, senha });
        toast.success("Login realizado com sucesso!");
        navigate("/portal-aluno");
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

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div>
                <Input
                  id="email"
                  value={email}
                  label="Email"
                  variant="bordered"
                  radius="lg"
                  type="email"
                  placeholder="Digite seu email @ufba.br"
                  onChange={handleEmailChange}
                  isInvalid={!!erroEmail}
                  errorMessage={erroEmail}
                  fullWidth
                  disabled={isLoading}
                  classNames={{
                    base: "custom-input",
                  }}
                />
              </div>

              <div>
                <Input
                  id="senha"
                  label="Senha"
                  variant="bordered"
                  radius="lg"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={handleSenhaChange}
                  isInvalid={!!erroSenha}
                  errorMessage={erroSenha}
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
              </div>
              <div className="flex justify-between items-center mt-1 mb-2">
                <div className="remember-option">
                  <Switch
                    size="sm"
                    isSelected={lembrar}
                    onValueChange={setLembrar}
                    aria-label="Lembrar-me"
                    color="primary"
                    isDisabled={isLoading}
                  >
                    Lembrar-me
                  </Switch>
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
                  href="../cadastro-aluno"
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
