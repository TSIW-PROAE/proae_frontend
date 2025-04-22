import React from "react";
import FormularioDinamico, {
  TipoInput,
  TipoFormatacao,
} from "../../components/FormularioDinamico/FormularioDinamico";
import logoUfba from "../../assets/logo-ufba.png";
import "./inscricao.css";

export default function Inscricao() {
  // Configuração do formulário dinâmico para inscrição PROAE
  const configFormulario = {
    titulo: "Processo de Seleção PROAE",
    subtitulo:
      "Você está se inscrevendo para o processo de Seleção para benefícios PROAE - Campus Camaçari na UFBA.",
    paginas: [
      {
        titulo: "Dados adicionais",
        subtitulo: "Selecione as modalidades de benefício que deseja solicitar",
        inputs: [
          {
            tipo: "radio" as TipoInput,
            titulo: "Para qual modalidade deseja se inscrever?",
            nome: "modalidade",
            obrigatorio: true,
            opcoes: [
              { valor: "alimentacao", label: "Alimentação" },
              { valor: "transporte", label: "Transporte" },
            ],
          },
        ],
      },
      {
        titulo: "Dados pessoais",
        inputs: [
          {
            tipo: "input" as TipoInput,
            titulo: "Data de nascimento",
            nome: "dataNascimento",
            obrigatorio: true,
            placeholder: "DD/MM/AAAA",
            formatacao: "dataCompleta" as TipoFormatacao,
          },
          {
            tipo: "input" as TipoInput,
            titulo: "CPF",
            nome: "cpf",
            obrigatorio: true,
            placeholder: "000.000.000-00",
            formatacao: "cpf" as TipoFormatacao,
          },
          {
            tipo: "select" as TipoInput,
            titulo: "Curso",
            nome: "curso",
            obrigatorio: true,
            placeholder: "Selecione seu curso",
            opcoes: [
              { valor: "computacao", label: "Ciência da Computação" },
              { valor: "engenharia", label: "Engenharia" },
              { valor: "medicina", label: "Medicina" },
              { valor: "direito", label: "Direito" },
            ],
          },
          {
            tipo: "select" as TipoInput,
            titulo: "Campus",
            nome: "campus",
            obrigatorio: true,
            placeholder: "Selecione a sua unidade",
            opcoes: [
              { valor: "ondina", label: "Ondina" },
              { valor: "federacao", label: "Federação" },
              { valor: "vitoria", label: "Vitória" },
              { valor: "camacari", label: "Camaçari" },
            ],
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Telefone",
            nome: "telefone",
            obrigatorio: true,
            placeholder: "(00) 00000-0000",
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Data de Ingresso",
            nome: "dataIngresso",
            obrigatorio: true,
            placeholder: "MM/AAAA",
            formatacao: "dataMes" as TipoFormatacao,
          },
          {
            tipo: "input" as TipoInput,
            titulo: "Matrícula",
            nome: "matricula",
            obrigatorio: true,
            placeholder: "000000000",
          },
        ],
      },
      {
        titulo: "Documentos",
        subtitulo: "Faça upload dos documentos necessários para sua inscrição",
        inputs: [
          {
            tipo: "file" as TipoInput,
            titulo: "CAD ÚNICO (CadÚnico)",
            nome: "cadunico",
            obrigatorio: false,
            subtitulo: "Arquivo em formato PDF",
          },
          {
            tipo: "file" as TipoInput,
            titulo: "CPF",
            nome: "cpfDoc",
            obrigatorio: false,
            subtitulo: "Arquivo em formato PDF",
          },
          {
            tipo: "file" as TipoInput,
            titulo: "RG",
            nome: "rgDoc",
            obrigatorio: false,
            subtitulo: "Arquivo em formato PDF",
          },
          {
            tipo: "file" as TipoInput,
            titulo: "CNH",
            nome: "cnhDoc",
            obrigatorio: false,
            subtitulo: "Arquivo em formato PDF (opcional)",
          },
        ],
      },
      {
        titulo: "Informações adicionais",
        inputs: [
          {
            tipo: "textarea" as TipoInput,
            titulo: "Justificativa",
            nome: "justificativa",
            obrigatorio: true,
            placeholder:
              "Descreva aqui sua justificativa para solicitar o benefício...",
            subtitulo:
              "Explique brevemente por que você precisa deste benefício",
          },
        ],
        botaoContinuar: "Revisar e Finalizar",
      },
    ],
    botaoFinal: "Enviar Inscrição",
    rotaRedirecionamento: "/",
    rotaCancelamento: "/",
    logoSrc: logoUfba,
  };

  return (
    <div className="body">
      <FormularioDinamico {...configFormulario} />
    </div>
  );
}
