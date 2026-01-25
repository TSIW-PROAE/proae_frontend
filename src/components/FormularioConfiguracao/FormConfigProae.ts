// formConfigProae.ts

export const formSectionsProae = [
  {
    title: "Editar perfil",
    layout: "grid-cols-2",
    fields: [
      {
        tipo: "input",
        nome: "nome",
        titulo: "Nome",
        placeholder: "Digite seu nome",
        obrigatorio: true,
      },
      {
        tipo: "input",
        nome: "cargo",
        titulo: "Cargo",
        placeholder: "Digite seu cargo",
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
        obrigatorio: true,
      },
    ],
  },
  {
    title: "Informações pessoais",
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
        nome: "cpf",
        titulo: "CPF",
        placeholder: "000.000.000-00",
        formatacao: "cpf",
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

