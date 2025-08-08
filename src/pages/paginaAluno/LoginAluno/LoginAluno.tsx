import React, { useState, useEffect, useContext } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Link } from "@heroui/link";
import { useLocation, useNavigate } from "react-router-dom";import { toast, Toaster } from "react-hot-toast";
import "./LoginAluno.css";
import { AuthContext } from "@/context/AuthContext";

export default function LoginAluno() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const anoAtual = new Date().getFullYear();
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
    <div id="login" className="login-container">
      <Toaster position="top-right" />
      <div className="login-content">
        <div className="login-form">
          <a
            href="/"
            className="voltar-link-login"
            style={{ color: "var(--cor-creme)" }}
          >
            <span style={{ marginRight: "5px" }}>←</span>
            Página inicial
          </a>

          <div className="logo-container">
            {/* A imagem agora está como background no CSS */}
          </div>

          <div className="form-container">
            <div className="login-header">
              <h2 className="login-title">Faça Login</h2>
              <p className="login-subtitle">
                Tenha acesso às informações do seu cadastro PROAE
              </p>
            </div>

            <form className="login-form-container" onSubmit={handleSubmit}>
              <div className="input-container">
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

              <div className="input-container">
                <Input
                  id="senha"
                  label="Senha"
                  variant="bordered"
                  radius="lg"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={handleSenhaChange}
                  isInvalid={!!erroSenha}
                  errorMessage={erroSenha}
                  fullWidth
                  disabled={isLoading}
                  classNames={{
                    base: "custom-input",
                  }}
                />
              </div>

              <div className="login-options">
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
                <a href="#" className="forgot-password">
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
