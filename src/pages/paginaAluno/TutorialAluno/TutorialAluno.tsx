import SystemTutorial, {
  TutorialStep,
} from "@/components/SystemTutorial/SystemTutorial";

const steps: TutorialStep[] = [
  {
    title: "Acompanhe pendencias primeiro",
    description: "Comece sempre pelo que exige acao imediata.",
    emoji: "🚨",
    mockup: "pendencias",
    targetPath: "/portal-aluno/pendencias",
    targetLabel: "Abrir Pendencias",
    checklist: [
      "Abra Pendencias e veja os itens urgentes.",
      "Resolva ajustes, complementos e documentos faltantes.",
      "Confirme se o status mudou apos enviar.",
    ],
    tip: "Itens pendentes podem bloquear analise e homologacao do beneficio.",
  },
  {
    title: "Conclua suas inscrições pendentes",
    description: "Use a central de pendências para ajustes e complementos antes de novos envios.",
    emoji: "🧾",
    mockup: "cadastro",
    targetPath: "/portal-aluno/pendencias",
    targetLabel: "Abrir Pendencias",
    checklist: [
      "Abra os editais com ajuste pendente.",
      "Revise observacoes e prazo antes de enviar.",
      "Acompanhe o retorno da equipe no portal.",
    ],
    tip: "Veja observacoes da equipe e prazos antes de enviar.",
  },
  {
    title: "Inscreva-se nos editais abertos",
    description: "Com cadastro liberado, escolha os processos que fazem sentido para voce.",
    emoji: "📌",
    mockup: "edital",
    targetPath: "/portal-aluno?tour=editais",
    targetLabel: "Abrir Portal do Aluno",
    checklist: [
      "Acesse Editais e filtre os que estao abertos.",
      "Clique em Inscrever-se e preencha o questionario.",
      "Guarde o comprovante e monitore o status.",
    ],
    tip: "Voce pode ter mais de uma inscricao conforme as regras do processo.",
  },
  {
    title: "Monitore a analise da inscricao",
    description: "Acompanhe cada mudanca para nao perder prazos.",
    emoji: "🔎",
    mockup: "inscricao",
    targetPath: "/portal-aluno?tour=inscricoes",
    targetLabel: "Ver Minhas Inscricoes",
    checklist: [
      "Abra Minhas Inscricoes com frequencia.",
      "Se houver ajuste, responda no mesmo dia se possivel.",
      "Use Pendencias para ver tudo em um lugar.",
    ],
    tip: "Quando houver ajuste, responda o quanto antes para nao perder prazo.",
  },
  {
    title: "Acompanhe homologacao de beneficio no edital",
    description:
      "Analise da inscricao e homologacao de beneficio no edital sao etapas diferentes.",
    emoji: "✅",
    mockup: "homologacao",
    targetPath: "/portal-aluno?tour=status",
    targetLabel: "Ver Status no Portal",
    checklist: [
      "Verifique status da inscricao.",
      "Verifique homologacao de beneficio no edital.",
      "Leia notificacoes para confirmar o resultado final.",
    ],
    tip: "As notificacoes no sino ajudam a nao perder atualizacoes importantes.",
  },
];

export default function TutorialAluno() {
  return (
    <SystemTutorial
      audienceLabel="Estudante"
      intro="Este guia rapido mostra o fluxo ideal para usar o sistema sem perder prazos."
      steps={steps}
    />
  );
}
