import { formatCPF, validarCPFReal } from "../../../utils/utils";
import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Link } from "@heroui/link";
import { useLocation } from "react-router-dom";
import {Select, SelectItem} from "@heroui/select";
import {DatePicker} from "@heroui/react";
import "./CadastroAluno.css";

export default function Cadastro() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erroCpf, setErroCpf] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const anoAtual = new Date().getFullYear();
  const location = useLocation();
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [semestreIngresso, setSemestreIngresso] = useState("");

  //Temporário
  const pronomes = [
    { valor: "ele", label: "Ele" },
    { valor: "ela", label: "Ela" },
    { valor: "elu", label: "Elu" },
  ];

  //Temporário
const cursos = [
    { valor: "computacao", label: "Ciência da Computação" },
    { valor: "engenharia", label: "Engenharia" },
    { valor: "medicina", label: "Medicina" },
];

//Temporário
const campus = [
    { valor: "salvador", label: "Salvador" },
    { valor: "camacari", label: "Camaçari" },
    { valor: "conquista", label: "Vitória da Conquista" },
];

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
    <div id="cadastro" className="cadastro-container">
      <div className="cadastro-content">
        <div className="cadastro-image-container">
            <img
                src="src/assets/logo-ufba-PROAE.png" 
                alt="Logo UFBA"
                className="cadastro-image"
            />
        </div>
        
        <div className="cadastro-form">
          <a
            href="/"
            className="voltar-link-cadastro"
            style={{ color: "var(--cor-creme)" }}
          >
            <span style={{ marginRight: "5px" }}>←</span>
            Página inicial
          </a>

          <div className="form-container">
            <div className="cadastro-header">
                <h2 className="cadastro-title">Cadastre-se!</h2>
            </div>

            <form className="cadastro-form-container" onSubmit={handleSubmit}>
                <div className="input-nomes">
                    <div className="input-container">
                        <Input
                        id="nome"
                        value={nome}
                        label="Nome"
                        variant="bordered"
                        radius="lg"
                        type="text"
                        placeholder="Digite o seu nome"
                        fullWidth
                        classNames={{
                            base: "custom-input",
                        }}
                        />
                    </div>
                    <div className="input-container">
                        <Input
                        id="sobrenome"
                        value={sobrenome}
                        label="Sobrenome"
                        variant="bordered"
                        radius="lg"
                        type="text"
                        placeholder="Digite o seu sobrenome"
                        onChange={handleCpfChange}
                        isInvalid={!!erroCpf}
                        errorMessage={erroCpf}
                        fullWidth
                        classNames={{
                            base: "custom-input",
                        }}
                        />
                    </div>
                </div>  
                
                <div className="select-container">
                    <Select className="select-pronomes" label="Pronomes" variant="bordered" radius="lg" fullWidth>
                        {pronomes.map((pronome) => (
                            <SelectItem key={pronome.valor}>
                                {pronome.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div> 

                <div className="date-container">
                    <DatePicker
                        label="Data de Nascimento"
                        variant="bordered"
                        radius="lg"
                        fullWidth
                        classNames={{
                            base: "custom-input",
                        }}
                    />
                </div>

                <div className="select-container">
                    <Select className="select-cursos" label="Curso" variant="bordered" radius="lg" fullWidth>
                        {cursos.map((curso) => (
                            <SelectItem key={curso.valor}>
                                {curso.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div> 

                <div className="select-container">
                    <Select className="select-campus" label="Campus" variant="bordered" radius="lg" fullWidth>
                        {campus.map((campi) => (
                            <SelectItem key={campi.valor}>
                                {campi.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div> 
            
                <div className="input-div">
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

                <div className="input-div">
                    <Input
                        id="semestre-ingresso"
                        label="Semestre de Ingresso"
                        variant="bordered"
                        radius="lg"
                        type="text"
                        placeholder="Esse campo será atualizado automaticamente"
                        fullWidth
                    />
                </div>

                <div className="input-div">
                    <Input
                        id="matricula"
                        label="Matrícula"
                        variant="bordered"
                        radius="lg"
                        type="text"
                        placeholder="Digite a sua matrícula"
                        fullWidth
                    />
                </div>

                <div className="input-div">
                    <Input
                        id="celular"
                        label="Celular"
                        variant="bordered"
                        radius="lg"
                        type="text"
                        placeholder="Digite o seu celular"
                        fullWidth
                    />
                </div>

                <div className="input-div">
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

                <div className="input-div">
                    <Input
                    id="senha"
                    label="Repita sua senha"
                    variant="bordered"
                    radius="lg"
                    type="password"
                    placeholder="Digite sua senha novamente"
                    onChange={handleSenhaChange}
                    isInvalid={!!erroSenha}
                    errorMessage={erroSenha}
                    fullWidth
                    classNames={{
                        base: "custom-input",
                    }}
                    />
                </div>

                <div className="cadastro-options">
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
                    className="cadastro-button"
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
