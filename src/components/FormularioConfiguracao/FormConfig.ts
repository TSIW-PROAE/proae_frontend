// formConfig.ts

export const formSections = [
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
        nome: "sobrenome",
        titulo: "Sobrenome",
        placeholder: "Digite seu sobrenome",
        obrigatorio: true,
      },
      {
        tipo: "select",
        nome: "pronome",
        titulo: "Pronomes",
        placeholder: "Adicione seus pronomes",
        opcoes: [
          { valor: "ele/dele", label: "Ele/Dele" },
          { valor: "ela/dela", label: "Ela/Dela" },
          { valor: "elu/delu", label: "Elu/Delu" },
        ],
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
        tipo: "select",
        nome: "curso",
        titulo: "Curso",
        placeholder: "Selecione seu curso",
        opcoes: [
          { valor: "ads", label: "Análise e Desenvolvimento de Sistemas" },
          { valor: "direito", label: "Direito" },
        ],
      },
      {
        tipo: "select",
        nome: "campus",
        titulo: "Campus",
        placeholder: "Selecione a sua unidade",
        opcoes: [
          { valor: "1", label: "Campus 1" },
          { valor: "2", label: "Campus 2" },
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
        type: "month",
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
