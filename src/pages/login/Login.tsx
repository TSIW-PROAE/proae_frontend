import React, {  useState } from "react";
import "./Login.css";

const Login: React.FC = () => {
    const [cpf, setCpf] = useState('')
    
      const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const somenteNumeros = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
        setCpf(somenteNumeros);
      };
    
  return (
    <div id="login">
     
        <div className="login-content container">
          <div className="img-container">
            <img src="./src/assets/motto.png" id="img-cultura"/>
          </div>
          <div className="login-form">
            <h1>Faça Login</h1>
            <p>Tenha acesso ao informações do sus cadastro PROAE</p>
            <form className="flex flex-col gap-10">
              <div className="flex flex-col gap-5 items-start">
                <label htmlFor="" className="label">
                  CPF
                </label>
                <input
                  value={cpf}
                  className="input"
                  type="text"
                  placeholder="Digite seu CPF"
                  onChange={handleCpfChange}
                />
              </div>
              <div className="flex flex-col gap-5 items-start">
                <label htmlFor="" className="label">
                  Senha
                </label>
                <input
                  className="input"
                  type="password"
                  placeholder="Digite sua senha"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex">
                  <input type="checkbox" />
                  <label htmlFor="">Lembrar-me</label>
                </div>
                <a href="">Esqueci minha senha</a>
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
