import SystemTutorial, {
  TutorialStep,
} from "@/components/SystemTutorial/SystemTutorial";
import { AuthContext } from "@/context/AuthContext";
import { AdminPerfil } from "@/types/auth";
import {
  adminPerfilLabel,
  canAnalyzeInscricoes,
  canManageEditais,
  normalizeAdminPerfil,
} from "@/utils/authRoles";
import { useContext, useMemo } from "react";

const stepsGerencial: TutorialStep[] = [
  {
    title: "Configure o processo",
    description: "Monte a estrutura do edital antes de abrir inscricoes.",
    emoji: "🛠️",
    mockup: "cadastro",
    targetPath: "/portal-proae/processos?tour=novo",
    targetLabel: "Abrir Processos",
    checklist: [
      "Defina edital, etapas e perguntas.",
      "Revise obrigatoriedade e textos de orientacao.",
      "Confirme regras por nivel academico.",
    ],
    tip: "Revise textos e obrigatoriedades para evitar retrabalho com ajustes.",
  },
  {
    title: "Organize equipe e responsabilidades",
    description: "Distribua acessos e mantenha o fluxo de trabalho alinhado.",
    emoji: "👥",
    mockup: "inscricao",
    targetPath: "/portal-proae/equipe",
    targetLabel: "Abrir Equipe",
    checklist: [
      "Aprove admins pendentes com perfil correto.",
      "Mantenha ao menos um usuario gerencial ativo.",
      "Revise permissoes quando houver mudanca de funcao.",
    ],
    tip: "Permissoes bem definidas evitam bloqueios no meio do processo seletivo.",
  },
  {
    title: "Publique e acompanhe inscricoes",
    description: "Com edital aberto, monitore o volume e a qualidade das inscricoes.",
    emoji: "📊",
    mockup: "edital",
    targetPath: "/portal-proae/inscricoes?tour=seletor",
    targetLabel: "Abrir Inscricoes",
    checklist: [
      "Use filtros por edital e nivel academico.",
      "Observe gargalos por status.",
      "Priorize casos com pendencias urgentes.",
    ],
    tip: "Use filtros por nivel, edital e situacao para ganhar velocidade.",
  },
  {
    title: "Analise pendencias com clareza",
    description: "Pendencias bem descritas aceleram a regularizacao.",
    emoji: "🧠",
    mockup: "pendencias",
    targetPath: "/portal-proae/inscricoes?tour=filtros",
    targetLabel: "Analisar Pendencias",
    checklist: [
      "Aponte exatamente o que precisa ser corrigido.",
      "Use linguagem direta e objetiva.",
      "Indique prazo quando aplicavel.",
    ],
    tip: "Mensagens claras reduzem retrabalho e aceleram a regularizacao.",
  },
  {
    title: "Decida status da analise da inscricao",
    description: "Padronize decisoes para manter transparencia e rastreabilidade.",
    emoji: "⚖️",
    mockup: "inscricao",
    targetPath: "/portal-proae/inscricoes?tour=lista",
    targetLabel: "Atualizar Status",
    checklist: [
      "Registre aprovacao, negacao ou ajuste.",
      "Inclua justificativa no historico da inscricao.",
      "Valide consistencia com os criterios da equipe.",
    ],
    tip: "Sempre que possivel, inclua justificativa para historico da equipe.",
  },
  {
    title: "Finalize homologacao de beneficio no edital",
    description: "Feche o ciclo com homologacao e comunicacao correta ao estudante.",
    emoji: "🏁",
    mockup: "homologacao",
    targetPath: "/portal-proae/inscricoes?tour=lista",
    targetLabel: "Ir para Homologacao",
    checklist: [
      "Conclua homologacao no edital.",
      "Revise resultados finais antes de publicar.",
      "Confirme notificacoes enviadas ao aluno.",
    ],
    tip: "Revise consistencia dos resultados antes do fechamento do processo.",
  },
];

const stepsTecnico: TutorialStep[] = [
  {
    title: "Inicie a triagem de inscricoes",
    description: "Comece pelo painel de inscricoes para organizar a fila de analise.",
    emoji: "📥",
    mockup: "edital",
    targetPath: "/portal-proae/inscricoes?tour=seletor",
    targetLabel: "Abrir Inscricoes",
    checklist: [
      "Filtre por edital e nivel academico.",
      "Identifique casos urgentes primeiro.",
      "Use status para separar o que esta em analise e pendente.",
    ],
    tip: "Uma triagem inicial reduz retrabalho durante validacao de respostas.",
  },
  {
    title: "Trate pendencias com orientacao objetiva",
    description: "Solicite ajustes de forma clara para acelerar resposta do estudante.",
    emoji: "🧩",
    mockup: "pendencias",
    targetPath: "/portal-proae/inscricoes?tour=filtros",
    targetLabel: "Analisar Pendencias",
    checklist: [
      "Descreva exatamente o que precisa ser corrigido.",
      "Informe prazo de reenvio quando necessario.",
      "Evite mensagens genericas para nao gerar duvidas.",
    ],
    tip: "Mensagens objetivas aumentam taxa de regularizacao no primeiro retorno.",
  },
  {
    title: "Valide respostas e documentos",
    description: "Consolide a analise com consistencia entre criterios da equipe.",
    emoji: "🛡️",
    mockup: "inscricao",
    targetPath: "/portal-proae/inscricoes?tour=lista",
    targetLabel: "Validar Inscricoes",
    checklist: [
      "Confirme se os documentos atendem ao edital.",
      "Registre observacoes relevantes para historico interno.",
      "Atualize status conforme resultado da verificacao.",
    ],
    tip: "Padronize criterios com a equipe para reduzir divergencias nas decisoes.",
  },
  {
    title: "Apoie decisoes com visao do estudante",
    description: "Use a central de estudantes para dar contexto aos casos mais sensiveis.",
    emoji: "🔎",
    mockup: "homologacao",
    targetPath: "/portal-proae/alunos",
    targetLabel: "Abrir Central de Estudantes",
    checklist: [
      "Consulte historico de inscricoes quando necessario.",
      "Priorize casos com impacto social relevante.",
      "Escalone duvidas de criterio para perfil gerencial.",
    ],
    tip: "A central ajuda a contextualizar situacoes antes da decisao final.",
  },
];

const stepsCoordenacao: TutorialStep[] = [
  {
    title: "Acompanhe o panorama das inscricoes",
    description: "Use o painel para leitura geral do andamento dos editais.",
    emoji: "📈",
    mockup: "edital",
    targetPath: "/portal-proae/inscricoes?tour=seletor",
    targetLabel: "Ver Painel de Inscricoes",
    checklist: [
      "Observe volume por edital e nivel academico.",
      "Monitore distribuicao por status.",
      "Identifique gargalos para alinhamento com a equipe.",
    ],
    tip: "Perfil de coordenacao tem acesso de consulta para acompanhamento estrategico.",
  },
  {
    title: "Revise casos na central de estudantes",
    description: "Faça leitura contextual para apoiar direcionamento institucional.",
    emoji: "📚",
    mockup: "inscricao",
    targetPath: "/portal-proae/alunos",
    targetLabel: "Abrir Central de Estudantes",
    checklist: [
      "Consulte historico e situacao geral dos estudantes.",
      "Anote pontos de atencao para reunioes de equipe.",
      "Direcione ajustes operacionais para perfis tecnico/gerencial.",
    ],
    tip: "A consulta centralizada melhora o acompanhamento de politicas de assistencia.",
  },
  {
    title: "Garanta governanca e transparencia",
    description: "Acompanhe consistencia das decisoes e comunicacao institucional.",
    emoji: "🧭",
    mockup: "homologacao",
    targetPath: "/portal-proae/inscricoes?tour=lista",
    targetLabel: "Revisar Fluxo de Status",
    checklist: [
      "Valide se o fluxo segue as regras do edital.",
      "Acompanhe padrao de comunicacao com estudantes.",
      "Escalone melhorias de processo para o perfil gerencial.",
    ],
    tip: "Mesmo sem edicao direta, o acompanhamento fortalece qualidade e rastreabilidade.",
  },
];

function getTutorialByPerfil(
  perfil: AdminPerfil,
): { intro: string; steps: TutorialStep[] } {
  if (canManageEditais(perfil)) {
    return {
      intro:
        "Fluxo completo para perfil gerencial: configuracao, equipe, analise e fechamento do processo.",
      steps: stepsGerencial,
    };
  }

  if (canAnalyzeInscricoes(perfil)) {
    return {
      intro:
        "Fluxo operacional para perfil tecnico: triagem, pendencias, validacao e apoio na analise.",
      steps: stepsTecnico,
    };
  }

  return {
    intro:
      "Fluxo de acompanhamento para coordenacao: consulta estrategica, governanca e visao institucional.",
    steps: stepsCoordenacao,
  };
}

export default function TutorialProae() {
  const { userInfo } = useContext(AuthContext);
  const perfil = normalizeAdminPerfil(userInfo?.adminPerfil ?? null);

  const tutorialData = useMemo(() => getTutorialByPerfil(perfil), [perfil]);
  const audienceLabel = useMemo(
    () => `Equipe PROAE (${adminPerfilLabel(perfil)})`,
    [perfil],
  );

  return (
    <SystemTutorial
      audienceLabel={audienceLabel}
      intro={tutorialData.intro}
      steps={tutorialData.steps}
    />
  );
}
