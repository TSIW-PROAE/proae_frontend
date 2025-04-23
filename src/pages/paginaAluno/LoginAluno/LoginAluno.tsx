import { formatCPF, validarCPFReal } from "../../../utils/utils";
import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Link } from "@heroui/link";
import { useLocation } from "react-router-dom";
import "./LoginAluno.css";

export default function LoginAluno() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erroCpf, setErroCpf] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const anoAtual = new Date().getFullYear();
  const location = useLocation();

  useEffect(() => {
    // Capturar o parâmetro CPF da URL quando a página carrega
    const params = new URLSearchParams(location.search);
    const cpfParam = params.get("cpf");

    if (cpfParam) {
      setCpf(formatCPF(cpfParam));
    }
  }, [location]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    setErroCpf("");
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
    setErroSenha("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let temErro = false;

    const cpfNumeros = cpf.replace(/\D/g, "");

    if (cpfNumeros.length !== 11) {
      setErroCpf("CPF deve conter 11 números.");
      temErro = true;
    } else if (!validarCPFReal(cpfNumeros)) {
      setErroCpf("CPF inválido.");
      temErro = true;
    }

    if (!senha) {
      setErroSenha("Digite sua senha.");
      temErro = true;
    }

    if (!temErro) {
      // Continuar com o envio do formulário
      console.log("Formulário válido, enviando...");
    }
  };

  return (
    <div id="login" className="login-container">
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
                  id="cpf"
                  value={cpf}
                  label="CPF"
                  variant="bordered"
                  radius="lg"
                  type="text"
                  placeholder="Digite seu CPF"
                  onChange={handleCpfChange}
                  isInvalid={!!erroCpf}
                  errorMessage={erroCpf}
                  fullWidth
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
              >
                Entrar
              </Button>

              <div className="register-link-container">
                <Link href="#" className="register-link" color="primary">
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
