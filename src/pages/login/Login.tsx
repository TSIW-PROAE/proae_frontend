import React, { useState } from "react";
import "./Login.css";
import { formatCPF, validarCPFReal } from "../../utils/utils";

const Login: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cpfNumeros = cpf.replace(/\D/g, '');

    if (cpfNumeros.length !== 11) {
      setErro("CPF deve conter 11 números.");
      return;
    }

    if (!validarCPFReal(cpfNumeros)) {
      setErro("CPF inválido.");
      return;
    }

    if (!senha) {
      setErro("Digite sua senha.");
      return;
    }

    setErro('');
  };

  return (
    <div id="login">
      <div className="login-content container">
        <div className="img-container">
          <img src="./src/assets/motto.png" id="img-cultura" />
        </div>
        <div className="login-form">
          <h1>Faça Login</h1>
          <p>Tenha acesso ao informações do seu cadastro PROAE</p>
          <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 items-start">
              <label htmlFor="cpf" className="label">CPF</label>
              <input
                id="cpf"
                value={cpf}
                className="input"
                type="text"
                placeholder="Digite seu CPF"
                onChange={handleCpfChange}
              />
            </div>
            <div className="flex flex-col gap-5 items-start">
              <label htmlFor="senha" className="label">Senha</label>
              <input
                id="senha"
                className="input"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && <p className="text-red-500 text-sm error">{erro}</p>}

            <div className="flex justify-between items-center w-full text-sm">
              <div className="flex items-center gap-5 remember">
                <input type="checkbox" id="lembrar" />
                <label htmlFor="lembrar">Lembrar-me</label>
              </div>
              <a href="#">Esqueci minha senha</a>
            </div>

            <button type="submit" className="button">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
