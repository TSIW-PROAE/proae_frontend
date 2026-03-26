// Alinhado ao cadastro do estudante (CadastroAluno): nome único, curso livre, campus da mesma lista.
import { campus } from "../../utils/cadastroop";

export const formSections = [
  {
    title: "Editar perfil",
    layout: "grid-cols-2",
    fields: [
      {
        tipo: "input",
        nome: "nome",
        titulo: "Nome",
        placeholder: "Digite seu nome completo",
        obrigatorio: true,
      },
    ],
  },
  {
    title: "Sua conta",
    layout: "stack",
    fields: [
      {
        tipo: "input",
        nome: "email",
        titulo: "Email • Privado",
        placeholder: "Digite seu e-mail",
      },
    ],
  },
  {
    title: "Informações acadêmicas e pessoais",
    layout: "grid-cols-2",
    fields: [
      {
        tipo: "input",
        nome: "data_nascimento",
        titulo: "Data de nascimento",
        placeholder: "",
        type: "date",
      },
      {
        tipo: "input",
        nome: "curso",
        titulo: "Curso",
        placeholder: "Digite seu curso",
        obrigatorio: true,
      },
      {
        tipo: "select",
        nome: "campus",
        titulo: "Campus",
        placeholder: "Selecione a sua unidade",
        opcoes: campus.map((c) => ({ valor: c.valor, label: c.label })),
      },
      {
        tipo: "input",
        nome: "cpf",
        titulo: "CPF",
        placeholder: "000.000.000-00",
        formatacao: "cpf",
      },
      {
        tipo: "input",
        nome: "data_ingresso",
        titulo: "Data de ingresso",
        type: "date",
      },
      {
        tipo: "input",
        nome: "matricula",
        titulo: "Matrícula",
      },
      {
        tipo: "input",
        nome: "celular",
        titulo: "Celular",
        placeholder: "(00) 0 0000-0000",
        formatacao: "phone",
      },
    ],
  },
];
