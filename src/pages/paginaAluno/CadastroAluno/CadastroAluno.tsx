import { formatCPF, validarCPFReal } from "../../../utils/utils";
import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { DateValue, parseDate } from "@internationalized/date";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import "./CadastroAluno.css";

interface FormData {
  nome: string;
  sobrenome: string;
  pronome: string;
  dataNascimento: DateValue | null;
  curso: string;
  campus: string;
  cpf: string;
  dataIngresso: DateValue | null;
  matricula: string;
  celular: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    sobrenome: "",
    pronome: "",
    dataNascimento: null,
    curso: "",
    campus: "",
    cpf: "",
    dataIngresso: null,
    matricula: "",
    celular: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const anoAtual = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const pronomes = [
    { valor: "ele/dele", label: "Ele/Dele" },
    { valor: "ela/dela", label: "Ela/Dela" },
    { valor: "elu/delu", label: "Elu/Delu" },
    { valor: "Prefiro não informar", label: "Prefiro não informar" },
  ];

  const cursos = [
    { valor: "Arquitetura e Urbanismo", label: "Arquitetura e Urbanismo" },
    {
      valor: "Arquitetura e Urbanismo – Noturno",
      label: "Arquitetura e Urbanismo – Noturno",
    },
    { valor: "Engenharia da Computação", label: "Engenharia da Computação" },
    {
      valor: "Engenharia de Agrimensura e Cartográfica",
      label: "Engenharia de Agrimensura e Cartográfica",
    },
    {
      valor: "Engenharia de Controle e Automação",
      label: "Engenharia de Controle e Automação",
    },
    { valor: "Engenharia de Minas", label: "Engenharia de Minas" },
    { valor: "Engenharia de Produção", label: "Engenharia de Produção" },
    { valor: "Engenharia Elétrica", label: "Engenharia Elétrica" },
    { valor: "Engenharia Mecânica", label: "Engenharia Mecânica" },
    { valor: "Engenharia Química", label: "Engenharia Química" },
    {
      valor: "Ciências Sociais (Lic. e Bach.)",
      label: "Ciências Sociais (Lic. e Bach.)",
    },
    { valor: "Filosofia", label: "Filosofia" },
    { valor: "História (Lic. e Bach.)", label: "História (Lic. e Bach.)" },
    { valor: "História (Lic.) – Noturno", label: "História (Lic.) – Noturno" },
    { valor: "Museologia", label: "Museologia" },
    {
      valor: "Psicologia – Formação de Psicólogo",
      label: "Psicologia – Formação de Psicólogo",
    },
    { valor: "Serviço social", label: "Serviço social" },
    {
      valor: "Tecnologia em Transporte Terrestre",
      label: "Tecnologia em Transporte Terrestre",
    },
    { valor: "Ciência da Computação", label: "Ciência da Computação" },
    { valor: "Estatística", label: "Estatística" },
    { valor: "Física (Lic) – Noturno", label: "Física (Lic) – Noturno" },
    { valor: "Física (Lic. e Bach.)", label: "Física (Lic. e Bach.)" },
    { valor: "Geofísica", label: "Geofísica" },
    {
      valor: "Geografia (Lic.) – Noturno",
      label: "Geografia (Lic.) – Noturno",
    },
    {
      valor: "Licenciatura em Computação – Noturno",
      label: "Licenciatura em Computação – Noturno",
    },
    {
      valor: "Matemática (Lic.) – Noturno",
      label: "Matemática (Lic.) – Noturno",
    },
    { valor: "Oceanografia", label: "Oceanografia" },
    {
      valor: "Química (Lic. Bach. e Química Industrial)",
      label: "Química (Lic. Bach. e Química Industrial)",
    },
    { valor: "Química (Lic.)", label: "Química (Lic.)" },
    {
      valor: "Sistemas de Informação – Bacharelado",
      label: "Sistemas de Informação – Bacharelado",
    },
    {
      valor: "Ciências Biológicas (Lic. e Bach.)",
      label: "Ciências Biológicas (Lic. e Bach.)",
    },
    {
      valor: "Ciências Biológicas (Lic.) – Noturno",
      label: "Ciências Biológicas (Lic.) – Noturno",
    },
    { valor: "Farmácia", label: "Farmácia" },
    { valor: "Farmácia – Noturno", label: "Farmácia – Noturno" },
    { valor: "Gastronomia", label: "Gastronomia" },
    {
      valor: "Licenciatura em Ciências Naturais",
      label: "Licenciatura em Ciências Naturais",
    },
    { valor: "Medicina Veterinária", label: "Medicina Veterinária" },
    { valor: "Zootecnia", label: "Zootecnia" },
    { valor: "Comunicação – Jornalismo", label: "Comunicação – Jornalismo" },
    {
      valor: "Comunicação – Produção em Comunicação e Cultura",
      label: "Comunicação – Produção em Comunicação e Cultura",
    },
    {
      valor: "Estudos de Gênero e Diversidade (Bach.)",
      label: "Estudos de Gênero e Diversidade (Bach.)",
    },
    {
      valor: "Letras Vernáculas (Lic. e Bach.)",
      label: "Letras Vernáculas (Lic. e Bach.)",
    },
    { valor: "Letras Vernáculas (Lic.)", label: "Letras Vernáculas (Lic.)" },
    {
      valor: "Letras Vernáculas e Língua Estrangeira Moderna (Lic.)",
      label: "Letras Vernáculas e Língua Estrangeira Moderna (Lic.)",
    },
    {
      valor: "Língua Estrangeira – Inglês/Espanhol (Lic.)",
      label: "Língua Estrangeira – Inglês/Espanhol (Lic.)",
    },
    {
      valor: "Língua Estrangeira Moderna ou Clássica (Lic. e Bach.)",
      label: "Língua Estrangeira Moderna ou Clássica (Lic. e Bach.)",
    },
    { valor: "Dança", label: "Dança" },
    { valor: "Artes", label: "Artes" },
    { valor: "Artes – Noturno", label: "Artes – Noturno" },
    {
      valor: "Ciência e Tecnologia – Noturno",
      label: "Ciência e Tecnologia – Noturno",
    },
    { valor: "Humanidades – Noturno", label: "Humanidades – Noturno" },
    { valor: "Saúde", label: "Saúde" },
    { valor: "Saúde – Noturno", label: "Saúde – Noturno" },
    { valor: "Enfermagem", label: "Enfermagem" },
    { valor: "Fisioterapia", label: "Fisioterapia" },
    { valor: "Fonoaudiologia", label: "Fonoaudiologia" },
    { valor: "Medicina", label: "Medicina" },
    { valor: "Nutrição", label: "Nutrição" },
    { valor: "Odontologia", label: "Odontologia" },
    { valor: "Saúde Coletiva", label: "Saúde Coletiva" },
    { valor: "Terapia Ocupacional", label: "Terapia Ocupacional" },
    { valor: "Arquivologia", label: "Arquivologia" },
    { valor: "Arquivologia – Noturno", label: "Arquivologia – Noturno" },
    {
      valor: "Biblioteconomia e Documentação",
      label: "Biblioteconomia e Documentação",
    },
    { valor: "Direito", label: "Direito" },
    { valor: "Direito – Noturno", label: "Direito – Noturno" },
    {
      valor: "Licenciatura em Educação Física",
      label: "Licenciatura em Educação Física",
    },
    { valor: "Pedagogia", label: "Pedagogia" },
    { valor: "Secretariado Executivo", label: "Secretariado Executivo" },
    {
      valor: "Artes Cênicas – Direção Teatral",
      label: "Artes Cênicas – Direção Teatral",
    },
    {
      valor: "Artes Cênicas – Interpretação Teatral",
      label: "Artes Cênicas – Interpretação Teatral",
    },
    { valor: "Artes Plásticas", label: "Artes Plásticas" },
    { valor: "Canto", label: "Canto" },
    { valor: "Composição e Regência", label: "Composição e Regência" },
    {
      valor: "Curso Superior de Decoração",
      label: "Curso Superior de Decoração",
    },
    { valor: "Design", label: "Design" },
    { valor: "Instrumento", label: "Instrumento" },
    {
      valor: "Licenciatura em Desenho e Plástica",
      label: "Licenciatura em Desenho e Plástica",
    },
    { valor: "Licenciatura em Música", label: "Licenciatura em Música" },
    { valor: "Licenciatura em Teatro", label: "Licenciatura em Teatro" },
    { valor: "Música Popular", label: "Música Popular" },
    {
      valor: "Gestão Pública e Gestão Social",
      label: "Gestão Pública e Gestão Social",
    },
    { valor: "Ciências Contábeis", label: "Ciências Contábeis" },
    {
      valor: "Ciências Contábeis – Noturno",
      label: "Ciências Contábeis – Noturno",
    },
    { valor: "Ciências Econômicas", label: "Ciências Econômicas" },
    { valor: "Engenharia Civil", label: "Engenharia Civil" },
    {
      valor: "Engenharia Sanitária e Ambiental",
      label: "Engenharia Sanitária e Ambiental",
    },
    { valor: "Geografia (Lic. e Bach.)", label: "Geografia (Lic. e Bach.)" },
    { valor: "Geologia", label: "Geologia" },
    { valor: "Matemática (Lic. e Bach.)", label: "Matemática (Lic. e Bach.)" },
    { valor: "Química (Lic. e Bach.)", label: "Química (Lic. e Bach.)" },
    {
      valor: "Ciências Biológicas (Lic. e Bach.) – Barreiras",
      label: "Ciências Biológicas (Lic. e Bach.) – Barreiras",
    },
    { valor: "Administração", label: "Administração" },
    { valor: "Ciência e Tecnologia", label: "Ciência e Tecnologia" },
    { valor: "Humanidades", label: "Humanidades" },
    { valor: "Biotecnologia", label: "Biotecnologia" },
    {
      valor: "Ciências Biológicas (Bach.)",
      label: "Ciências Biológicas (Bach.)",
    },
    {
      valor: "Enfermagem – Vitória da Conquista",
      label: "Enfermagem – Vitória da Conquista",
    },
    {
      valor: "Farmácia – Vitória da Conquista",
      label: "Farmácia – Vitória da Conquista",
    },
    {
      valor: "Nutrição – Vitória da Conquista",
      label: "Nutrição – Vitória da Conquista",
    },
    { valor: "B.I. – C.T.I", label: "B.I. – C.T.I" },
  ];

  const campus = [
    { valor: "Salvador", label: "Salvador" },
    { valor: "Vitória da Conquista", label: "Vitória da Conquista" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cpfParam = params.get("cpf");
    if (cpfParam) {
      setFormData((prev) => ({ ...prev, cpf: formatCPF(cpfParam) }));
    }
  }, [location]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | DateValue | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatarData = (date: DateValue | null): string => {
    if (!date) return "";
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  };

  const formatarCelular = (celular: string): string => {
    const numeros = celular.replace(/\D/g, "");
    if (numeros.length === 11) {
      return `+55${numeros}`;
    }
    return celular;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const cpfNumeros = formData.cpf.replace(/\D/g, "");

    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    if (!formData.sobrenome) newErrors.sobrenome = "Sobrenome é obrigatório";
    if (!formData.pronome) newErrors.pronome = "Pronome é obrigatório";
    if (!formData.dataNascimento)
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    if (!formData.curso) newErrors.curso = "Curso é obrigatório";
    if (!formData.campus) newErrors.campus = "Campus é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    if (!formData.email.includes("@ufba.br"))
      newErrors.email = "Email deve ser do domínio @ufba.br";

    if (cpfNumeros.length !== 11) {
      newErrors.cpf = "CPF deve conter 11 números";
    } else if (!validarCPFReal(cpfNumeros)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 8) {
      newErrors.senha = "Senha deve ter pelo menos 8 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      const dadosFormatados = {
        matricula: formData.matricula,
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        pronome: formData.pronome,
        data_nascimento: formatarData(formData.dataNascimento),
        curso: formData.curso,
        campus: formData.campus,
        cpf: formData.cpf.replace(/\D/g, ""),
        data_ingresso: formatarData(formData.dataIngresso),
        celular: formatarCelular(formData.celular),
      };
      console.log(dadosFormatados);

      try {
        const response = await axios.post(
          "http://b8ckk40k0ook00gckgk44s84.201.54.12.165.sslip.io/auth/signup",
          dadosFormatados
        );

        if (response.status === 201) {
          toast.success("Cadastro realizado com sucesso!");
          navigate("/login-aluno"); // Redireciona para a página de login após o cadastro
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const mensagemErro =
            error.response?.data?.message || "Erro ao realizar cadastro";
          toast.error(mensagemErro);
        } else {
          toast.error("Erro ao realizar cadastro");
        }
      }
    }
  };

  return (
    <div id="cadastro" className="cadastro-container">
      <Toaster position="top-right" />
      <div className="cadastro-content">
        {/* <div className="cadastro-image-container">
            <img
                src="src/assets/logo-ufba-PROAE.png" 
                alt="Logo UFBA"
                className="cadastro-image"
            />
        </div> */}

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
                    value={formData.nome}
                    label="Nome"
                    variant="bordered"
                    radius="lg"
                    type="text"
                    placeholder="Digite o seu nome"
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    isInvalid={!!errors.nome}
                    errorMessage={errors.nome}
                    fullWidth
                    classNames={{ base: "custom-input" }}
                  />
                </div>
                <div className="input-container">
                  <Input
                    id="sobrenome"
                    value={formData.sobrenome}
                    label="Sobrenome"
                    variant="bordered"
                    radius="lg"
                    type="text"
                    placeholder="Digite o seu sobrenome"
                    onChange={(e) =>
                      handleInputChange("sobrenome", e.target.value)
                    }
                    isInvalid={!!errors.sobrenome}
                    errorMessage={errors.sobrenome}
                    fullWidth
                    classNames={{ base: "custom-input" }}
                  />
                </div>
              </div>

              <div className="select-container">
                <Select
                  className="select-pronomes"
                  label="Pronomes"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  selectedKeys={[formData.pronome]}
                  onChange={(e) => handleInputChange("pronome", e.target.value)}
                  isInvalid={!!errors.pronome}
                  errorMessage={errors.pronome}
                >
                  {pronomes.map((pronome) => (
                    <SelectItem key={pronome.valor}>{pronome.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="date-container">
                <DatePicker
                  label="Data de Nascimento"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  value={formData.dataNascimento}
                  onChange={(date) => handleInputChange("dataNascimento", date)}
                  isInvalid={!!errors.dataNascimento}
                  errorMessage={errors.dataNascimento}
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="select-container">
                <Select
                  className="select-cursos"
                  label="Curso"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  selectedKeys={[formData.curso]}
                  onChange={(e) => handleInputChange("curso", e.target.value)}
                  isInvalid={!!errors.curso}
                  errorMessage={errors.curso}
                >
                  {cursos.map((curso) => (
                    <SelectItem key={curso.valor}>{curso.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="select-container">
                <Select
                  className="select-campus"
                  label="Campus"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  selectedKeys={[formData.campus]}
                  onChange={(e) => handleInputChange("campus", e.target.value)}
                  isInvalid={!!errors.campus}
                  errorMessage={errors.campus}
                >
                  {campus.map((campi) => (
                    <SelectItem key={campi.valor}>{campi.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="input-div">
                <Input
                  id="cpf"
                  value={formData.cpf}
                  label="CPF"
                  variant="bordered"
                  radius="lg"
                  type="text"
                  placeholder="Digite seu CPF"
                  onChange={(e) =>
                    handleInputChange("cpf", formatCPF(e.target.value))
                  }
                  isInvalid={!!errors.cpf}
                  errorMessage={errors.cpf}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="date-container">
                <DatePicker
                  label="Data de Ingresso"
                  variant="bordered"
                  radius="lg"
                  fullWidth
                  value={formData.dataIngresso}
                  onChange={(date) => handleInputChange("dataIngresso", date)}
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="input-div">
                <Input
                  id="matricula"
                  value={formData.matricula}
                  label="Matrícula"
                  variant="bordered"
                  radius="lg"
                  type="text"
                  placeholder="Digite a sua matrícula"
                  onChange={(e) =>
                    handleInputChange("matricula", e.target.value)
                  }
                  fullWidth
                />
              </div>

              <div className="input-div">
                <Input
                  id="email"
                  value={formData.email}
                  label="Email"
                  variant="bordered"
                  radius="lg"
                  type="email"
                  placeholder="Digite seu email @ufba.br"
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="input-div">
                <Input
                  id="celular"
                  value={formData.celular}
                  label="Celular"
                  variant="bordered"
                  radius="lg"
                  type="text"
                  placeholder="Digite o seu celular"
                  onChange={(e) => handleInputChange("celular", e.target.value)}
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
                  value={formData.senha}
                  onChange={(e) => handleInputChange("senha", e.target.value)}
                  isInvalid={!!errors.senha}
                  errorMessage={errors.senha}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <div className="input-div">
                <Input
                  id="confirmarSenha"
                  label="Repita sua senha"
                  variant="bordered"
                  radius="lg"
                  type="password"
                  placeholder="Digite sua senha novamente"
                  value={formData.confirmarSenha}
                  onChange={(e) =>
                    handleInputChange("confirmarSenha", e.target.value)
                  }
                  isInvalid={!!errors.confirmarSenha}
                  errorMessage={errors.confirmarSenha}
                  fullWidth
                  classNames={{ base: "custom-input" }}
                />
              </div>

              <Button
                type="submit"
                radius="lg"
                fullWidth
                className="cadastro-button"
                color="primary"
              >
                Avançar
              </Button>

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
