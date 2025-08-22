export const formSections = [
  {
    title: "Editar perfil",
    layout: "stack", 
    fields: [
      {
        tipo: "input",
        nome: "nomeCompleto",
        titulo: "Nome completo",
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
      {
        tipo: "input",
        nome: "senha",
        titulo: "Senha",
        placeholder: "••••••••",
        type: "password",
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
        nome: "curso",
        titulo: "Curso",
        placeholder: "Digite seu curso",
      },
      {
        tipo: "select",
        nome: "campus",
        titulo: "Campus",
        placeholder: "Selecione a sua unidade",
        opcoes: [
          { valor: "Salvador", label: "Salvador" },
          { valor: "Vitória da Conquista", label: "Vitória da Conquista" },
        ],
      },
      {
        tipo: "input",
        nome: "cpf",
        titulo: "CPF",
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
      },
    ],
  },
];
