import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormularioDinamico from "../../../components/FormularioDinamico/FormularioDinamico";
import {
  TipoInput,
  TipoFormatacao,
} from "../../../components/FormularioDinamico/FormularioDinamico";
import logoUfba from "../../../assets/logo-ufba.png";

export default function Cadastro() {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Array<{ valor: string; label: string }>>(
    []
  );

  // Buscar lista de cursos quando o componente montar
  useEffect(() => {
    // Lista completa de cursos disponíveis
    setCursos([
      { valor: "ARQUITETURA_E_URBANISMO", label: "Arquitetura e Urbanismo" },
      {
        valor: "ARQUITETURA_E_URBANISMO_NOTURNO",
        label: "Arquitetura e Urbanismo – Noturno",
      },
      { valor: "ENGENHARIA_DA_COMPUTACAO", label: "Engenharia da Computação" },
      {
        valor: "ENGENHARIA_DE_AGRIMENSURA_E_CARTOGRAFICA",
        label: "Engenharia de Agrimensura e Cartográfica",
      },
      {
        valor: "ENGENHARIA_DE_CONTROLE_E_AUTOMACAO",
        label: "Engenharia de Controle e Automação",
      },
      { valor: "ENGENHARIA_DE_MINAS", label: "Engenharia de Minas" },
      { valor: "ENGENHARIA_DE_PRODUCAO", label: "Engenharia de Produção" },
      { valor: "ENGENHARIA_ELETRICA", label: "Engenharia Elétrica" },
      { valor: "ENGENHARIA_MECANICA", label: "Engenharia Mecânica" },
      { valor: "ENGENHARIA_QUIMICA", label: "Engenharia Química" },
      { valor: "CIENCIAS_SOCIAIS", label: "Ciências Sociais (Lic. e Bach.)" },
      { valor: "FILOSOFIA", label: "Filosofia" },
      { valor: "HISTORIA", label: "História (Lic. e Bach.)" },
      { valor: "HISTORIA_NOTURNO", label: "História (Lic.) – Noturno" },
      { valor: "MUSEOLOGIA", label: "Museologia" },
      { valor: "PSICOLOGIA", label: "Psicologia – Formação de Psicólogo" },
      { valor: "SERVICO_SOCIAL", label: "Serviço social" },
      {
        valor: "TECNOLOGIA_EM_TRANSPORTE_TERRESTRE",
        label: "Tecnologia em Transporte Terrestre",
      },
      { valor: "CIENCIA_DA_COMPUTACAO", label: "Ciência da Computação" },
      { valor: "ESTATISTICA", label: "Estatística" },
      { valor: "FISICA_NOTURNO", label: "Física (Lic) – Noturno" },
      { valor: "FISICA", label: "Física (Lic. e Bach.)" },
      { valor: "GEOFISICA", label: "Geofísica" },
      { valor: "GEOGRAFIA_NOTURNO", label: "Geografia (Lic.) – Noturno" },
      {
        valor: "LICENCIATURA_EM_COMPUTACAO_NOTURNO",
        label: "Licenciatura em Computação – Noturno",
      },
      { valor: "MATEMATICA_NOTURNO", label: "Matemática (Lic.) – Noturno" },
      { valor: "OCEANOGRAFIA", label: "Oceanografia" },
      { valor: "QUIMICA", label: "Química (Lic. Bach. e Química Industrial)" },
      { valor: "QUIMICA_LIC", label: "Química (Lic.)" },
      {
        valor: "SISTEMAS_DE_INFORMACAO",
        label: "Sistemas de Informação – Bacharelado",
      },
      {
        valor: "CIENCIAS_BIOLOGICAS",
        label: "Ciências Biológicas (Lic. e Bach.)",
      },
      {
        valor: "CIENCIAS_BIOLOGICAS_NOTURNO",
        label: "Ciências Biológicas (Lic.) – Noturno",
      },
      { valor: "FARMACIA", label: "Farmácia" },
      { valor: "FARMACIA_NOTURNO", label: "Farmácia – Noturno" },
      { valor: "GASTRONOMIA", label: "Gastronomia" },
      {
        valor: "LICENCIATURA_EM_CIENCIAS_NATURAIS",
        label: "Licenciatura em Ciências Naturais",
      },
      { valor: "MEDICINA_VETERINARIA", label: "Medicina Veterinária" },
      { valor: "ZOOTECNIA", label: "Zootecnia" },
      { valor: "COMUNICACAO_JORNALISMO", label: "Comunicação – Jornalismo" },
      {
        valor: "COMUNICACAO_PRODUCAO",
        label: "Comunicação – Produção em Comunicação e Cultura",
      },
      {
        valor: "ESTUDOS_DE_GENERO_E_DIVERSIDADE",
        label: "Estudos de Gênero e Diversidade (Bach.)",
      },
      { valor: "LETRAS_VERNACULAS", label: "Letras Vernáculas (Lic. e Bach.)" },
      { valor: "LETRAS_VERNACULAS_LIC", label: "Letras Vernáculas (Lic.)" },
      {
        valor: "LETRAS_VERNACULAS_E_LINGUA_ESTRANGEIRA",
        label: "Letras Vernáculas e Língua Estrangeira Moderna (Lic.)",
      },
      {
        valor: "LINGUA_ESTRANGEIRA_INGLES_ESPANHOL",
        label: "Língua Estrangeira – Inglês/Espanhol (Lic.)",
      },
      {
        valor: "LINGUA_ESTRANGEIRA_MODERNA",
        label: "Língua Estrangeira Moderna ou Clássica (Lic. e Bach.)",
      },
      { valor: "DANCA", label: "Dança" },
      { valor: "ARTES", label: "Artes" },
      { valor: "ARTES_NOTURNO", label: "Artes – Noturno" },
      {
        valor: "CIENCIA_E_TECNOLOGIA_NOTURNO",
        label: "Ciência e Tecnologia – Noturno",
      },
      { valor: "HUMANIDADES_NOTURNO", label: "Humanidades – Noturno" },
      { valor: "SAUDE", label: "Saúde" },
      { valor: "SAUDE_NOTURNO", label: "Saúde – Noturno" },
      { valor: "ENFERMAGEM", label: "Enfermagem" },
      { valor: "FISIOTERAPIA", label: "Fisioterapia" },
      { valor: "FONOAUDIOLOGIA", label: "Fonoaudiologia" },
      { valor: "MEDICINA", label: "Medicina" },
      { valor: "NUTRICAO", label: "Nutrição" },
      { valor: "ODONTOLOGIA", label: "Odontologia" },
      { valor: "SAUDE_COLETIVA", label: "Saúde Coletiva" },
      { valor: "TERAPIA_OCUPACIONAL", label: "Terapia Ocupacional" },
      { valor: "ARQUIVOLOGIA", label: "Arquivologia" },
      { valor: "ARQUIVOLOGIA_NOTURNO", label: "Arquivologia – Noturno" },
      {
        valor: "BIBLIOTECONOMIA_E_DOCUMENTACAO",
        label: "Biblioteconomia e Documentação",
      },
      { valor: "DIREITO", label: "Direito" },
      { valor: "DIREITO_NOTURNO", label: "Direito – Noturno" },
      {
        valor: "LICENCIATURA_EM_EDUCACAO_FISICA",
        label: "Licenciatura em Educação Física",
      },
      { valor: "PEDAGOGIA", label: "Pedagogia" },
      { valor: "SECRETARIADO_EXECUTIVO", label: "Secretariado Executivo" },
      { valor: "ADMINISTRACAO", label: "Administração" },
      { valor: "ECONOMIA", label: "Economia" },
    ]);
  }, []);

  // Configuração do formulário de cadastro
  const configFormulario = {
    titulo: "Cadastro de Usuário",
    subtitulo: "Crie sua conta para acessar o sistema PROAE",
    paginas: [
      {
        titulo: "Dados de Acesso",
        subtitulo: "Informações para acesso ao sistema",
        inputs: [
          {
            tipo: "input" as TipoInput,
            titulo: "Matrícula",
            nome: "matricula",
            obrigatorio: true,
            placeholder: "Digite sua matrícula",
            campoTitulo: "Identificação Acadêmica",
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Email",
            nome: "email",
            obrigatorio: true,
            placeholder: "Digite seu email",
            campoTitulo: "Contato Principal",
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Senha",
            nome: "senha",
            obrigatorio: true,
            placeholder: "Digite sua senha",
            campoTitulo: "Segurança da Conta",
            campoDescricao:
              "ATENÇÃO: A senha DEVE conter pelo menos uma letra, um número e um caractere especial (como @, #, $, %, etc). Mínimo de 8 caracteres.",
          },
        ],
      },
      {
        titulo: "Dados Pessoais",
        subtitulo: "Informações básicas sobre você",
        inputs: [
          {
            tipo: "input" as TipoInput,
            titulo: "Nome",
            nome: "nome",
            obrigatorio: true,
            placeholder: "Digite seu nome",
            campoTitulo: "Nome e Sobrenome",
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Sobrenome",
            nome: "sobrenome",
            obrigatorio: true,
            placeholder: "Digite seu sobrenome",
          },
          {
            tipo: "select" as TipoInput,
            titulo: "Pronome",
            nome: "pronome",
            obrigatorio: true,
            placeholder: "Selecione seu pronome",
            campoTitulo: "Pronome de Tratamento",
            campoDescricao: "Como você prefere ser tratado(a/e)",
            opcoes: [
              { valor: "ela/dela", label: "Ela/Dela" },
              { valor: "ele/dele", label: "Ele/Dele" },
              { valor: "elu/delu", label: "Elu/Delu" },
              { valor: "Prefiro não informar", label: "Prefiro não informar" },
            ],
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Data de Nascimento",
            nome: "data_nascimento",
            obrigatorio: true,
            placeholder: "AAAA-MM-DD",
            campoTitulo: "Data de Nascimento",
            campoDescricao: "Formato: AAAA-MM-DD (exemplo: 2000-01-31)",
          },
          {
            tipo: "input" as TipoInput,
            titulo: "CPF",
            nome: "cpf",
            obrigatorio: true,
            placeholder: "Digite seu CPF (somente números)",
            campoTitulo: "Documento de Identidade",
            formatacao: "cpf" as TipoFormatacao,
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Celular",
            nome: "celular",
            obrigatorio: true,
            placeholder: "Ex: 71999999999",
            campoTitulo: "Telefone para Contato",
            // formatacao: "phone" as TipoFormatacao,
          },
        ],
      },
      {
        titulo: "Informações Acadêmicas",
        subtitulo: "Dados sobre seu vínculo com a universidade",
        inputs: [
          {
            tipo: "select" as TipoInput,
            titulo: "Curso",
            nome: "curso",
            obrigatorio: true,
            placeholder: "Selecione seu curso",
            campoTitulo: "Curso de Graduação",
            opcoes: cursos,
          },
          {
            tipo: "select" as TipoInput,
            titulo: "Campus",
            nome: "campus",
            obrigatorio: true,
            placeholder: "Selecione seu campus",
            campoTitulo: "Campus Universitário",
            opcoes: [
              { valor: "SALVADOR", label: "Salvador" },
              { valor: "VITORIA_CONQUISTA", label: "Vitória da Conquista" },
            ],
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Data de Ingresso",
            nome: "data_ingresso",
            obrigatorio: true,
            placeholder: "AAAA-MM-DD",
            campoTitulo: "Data de Ingresso na UFBA",
            campoDescricao: "Formato: AAAA-MM-DD (exemplo: 2022-01-01)",
          },
        ],
      },
    ],
    botaoFinal: "Cadastrar",
    rotaRedirecionamento: "/login-aluno",
    rotaCancelamento: "/login-aluno",
    logoSrc: logoUfba,
  };

  const handleSubmit = async (dados: any) => {
    try {
      console.log("Dados originais recebidos do formulário:", dados);

      // Encontrar o label do curso baseado no valor selecionado
      const cursoSelecionado = cursos.find((c) => c.valor === dados.curso);
      const cursoLabel = cursoSelecionado
        ? cursoSelecionado.label
        : dados.curso;

      // Mapear o valor do campus para o formato esperado pelo backend
      const campusMap = {
        SALVADOR: "Salvador",
        VITORIA_CONQUISTA: "Vitória da Conquista",
      };

      // O backend espera os valores exatos do enum UnidadeEnum
      const campusLabel =
        campusMap[dados.campus as keyof typeof campusMap] || dados.campus;

      // Formatando os dados para corresponder ao formato esperado pelo backend
      const dadosFormatados = {
        matricula: dados.matricula,
        email: dados.email,
        senha: dados.senha,
        nome: dados.nome,
        sobrenome: dados.sobrenome,
        pronome: dados.pronome,
        data_nascimento: dados.data_nascimento,
        curso: cursoLabel,
        campus: campusLabel,
        cpf: dados.cpf.replace(/\D/g, ""),
        data_ingresso: dados.data_ingresso,
        celular: dados.celular.replace(/\D/g, ""),
      };

      console.log("Dados formatados para envio:", dadosFormatados);

      // Chamada para a API de cadastro
      const response = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosFormatados),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        // Redirecionar para a página de login com o email preenchido
        navigate(`/login-aluno?email=${dados.email}`);
        return responseData;
      } else {
        // Tratamento de erros
        console.error("Erro na resposta:", responseData);

        // Função para tratar e exibir mensagens de erro específicas
        const handleError = () => {
          if (responseData.message) {
            if (responseData.message.includes("curso must be one of")) {
              alert(
                "Erro no campo de curso. Por favor, selecione um curso válido."
              );
            } else if (
              responseData.message.includes("pronome must be one of")
            ) {
              alert(
                "Erro no campo de pronome. Os valores válidos são: ela/dela, ele/dele, elu/delu, Prefiro não informar"
              );
            } else if (responseData.message.includes("campus must be one of")) {
              alert(
                "Erro no campo de campus. Os valores válidos são: Salvador, Vitória da Conquista"
              );
            } else {
              alert(responseData.message);
            }
          } else if (responseData.error && responseData.error.errors) {
            const errors = responseData.error.errors;
            errors.forEach((error: any) => {
              alert(error.message);
            });
          } else {
            alert("Erro ao realizar o cadastro");
          }
        };

        handleError();
        return false;
      }
    } catch (error) {
      console.error("Erro ao enviar cadastro:", error);
      alert("Erro ao realizar o cadastro. Tente novamente mais tarde.");
      return false;
    }
  };

  return (
    <FormularioDinamico {...configFormulario} hendlerSubmit={handleSubmit} />
  );
}
