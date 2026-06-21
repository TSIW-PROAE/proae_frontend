import { useState, useEffect, useRef, useContext, type CSSProperties, type RefObject } from "react";
import { useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FileText, Search, Filter, Calendar, User, Mail, BookOpen, MapPin, ChevronRight, Download, Pencil, Eye, X, History, Loader2, Save, Lock } from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { Edital } from "@/types/edital";
import { inscricaoServiceManager } from "@/services/InscricaoService/inscricaoService";
import { AlunoInscrito } from "@/types/inscricao";
import type { InscricaoStatusAuditEntry } from "@/types/inscricaoStatusAudit";
import { respostaService } from "@/services/RespostaService/respostaService";
import { getApiErrorMessage } from "@/utils/apiError";
import { AuthContext } from "@/context/AuthContext";
import {
  canAnalyzeInscricoes,
  canManageEditais,
  inscricoesSomenteConsulta,
  normalizeAdminPerfil,
} from "@/utils/authRoles";
import "./InscricoesProae.css";

/** Valores aceitos pelo PATCH admin de status (alinhado à Central / backend). */
const ADMIN_STATUS_OPCOES = [
  "Inscrição Pendente",
  "Inscrição Aprovada",
  "Inscrição Negada",
  "Ajuste Necessário",
] as const;

const ADMIN_BENEFICIO_OPCOES = ["Pendente seleção", "Beneficiário no edital", "Não beneficiário"] as const;
const ADMIN_RESULTADO_FASE_OPCOES = ["Nao publicado", "Resultado preliminar", "Resultado final"] as const;
const ADMIN_RECURSO_STATUS_OPCOES = ["Sem recurso", "Recurso solicitado", "Recurso deferido", "Recurso indeferido"] as const;
const DESISTENTE_MARKER = "[DESISTENTE]";
type AdminStatusOpcao = (typeof ADMIN_STATUS_OPCOES)[number];
type AdminBeneficioOpcao = (typeof ADMIN_BENEFICIO_OPCOES)[number];
type AdminResultadoFaseOpcao = (typeof ADMIN_RESULTADO_FASE_OPCOES)[number];
type AdminRecursoStatusOpcao = (typeof ADMIN_RECURSO_STATUS_OPCOES)[number];
type SituacaoSolicitacaoOpcao = "SELECIONADA" | "CLASSIFICADA" | "INDEFERIDA" | "DESISTENTE";

const ALLOWED_STATUS_TRANSITIONS: Record<AdminStatusOpcao, readonly AdminStatusOpcao[]> = {
  "Inscrição Pendente": ADMIN_STATUS_OPCOES,
  "Ajuste Necessário": ADMIN_STATUS_OPCOES,
  "Inscrição Aprovada": ["Inscrição Aprovada", "Ajuste Necessário", "Inscrição Pendente"],
  "Inscrição Negada": ["Inscrição Negada", "Ajuste Necessário", "Inscrição Pendente"],
};

const ALLOWED_BENEFICIO_TRANSITIONS: Record<AdminBeneficioOpcao, readonly AdminBeneficioOpcao[]> = {
  "Pendente seleção": ADMIN_BENEFICIO_OPCOES,
  "Beneficiário no edital": ["Beneficiário no edital", "Pendente seleção"],
  "Não beneficiário": ["Não beneficiário", "Pendente seleção"],
};

const ALLOWED_RESULTADO_FASE_TRANSITIONS: Record<AdminResultadoFaseOpcao, readonly AdminResultadoFaseOpcao[]> = {
  "Nao publicado": ["Nao publicado", "Resultado preliminar"],
  "Resultado preliminar": ["Resultado preliminar", "Resultado final", "Nao publicado"],
  "Resultado final": ["Resultado final", "Resultado preliminar"],
};

const ALLOWED_RECURSO_STATUS_TRANSITIONS: Record<AdminRecursoStatusOpcao, readonly AdminRecursoStatusOpcao[]> = {
  "Sem recurso": ["Sem recurso", "Recurso solicitado"],
  "Recurso solicitado": ["Recurso solicitado", "Recurso deferido", "Recurso indeferido"],
  "Recurso deferido": ["Recurso deferido", "Sem recurso"],
  "Recurso indeferido": ["Recurso indeferido", "Sem recurso"],
};

function hasDesistenteMarker(text: string | null | undefined): boolean {
  return String(text ?? "").toUpperCase().includes(DESISTENTE_MARKER);
}

function addDesistenteMarker(text: string | null | undefined): string {
  const base = String(text ?? "").trim();
  if (hasDesistenteMarker(base)) return base;
  return base ? `${DESISTENTE_MARKER} ${base}` : `${DESISTENTE_MARKER} Solicitação desistente.`;
}

function removeDesistenteMarker(text: string | null | undefined): string {
  return String(text ?? "")
    .replace(/\[DESISTENTE\]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function resolveSituacaoSolicitacao(inscricao: AlunoInscrito): SituacaoSolicitacaoOpcao {
  const situacao = String(inscricao.situacao_solicitacao ?? "").toUpperCase();
  if (
    situacao === "SELECIONADA" ||
    situacao === "CLASSIFICADA" ||
    situacao === "INDEFERIDA" ||
    situacao === "DESISTENTE"
  ) {
    return situacao as SituacaoSolicitacaoOpcao;
  }

  if (hasDesistenteMarker(inscricao.observacao_admin)) return "DESISTENTE";
  const status = String(inscricao.status_inscricao ?? "").toUpperCase();
  if (status.includes("NEGADA") || status.includes("REJEITADA")) return "INDEFERIDA";
  if (
    status.includes("APROVADA") &&
    String(inscricao.status_beneficio_edital ?? "").includes("Beneficiário")
  ) {
    return "SELECIONADA";
  }
  return "CLASSIFICADA";
}

function normalizeAdminStatusValue(statusRaw: string | null | undefined): AdminStatusOpcao {
  const s = (statusRaw ?? "").trim().toUpperCase();
  if (s === "INSCRIÇÃO APROVADA" || s === "APROVADA") return "Inscrição Aprovada";
  if (s === "INSCRIÇÃO NEGADA" || s === "NEGADA" || s === "REJEITADA") return "Inscrição Negada";
  if (
    s === "AJUSTE NECESSÁRIO" ||
    s === "AJUSTE NECESSARIO" ||
    s === "PENDENTE DE REGULARIZAÇÃO" ||
    s === "PENDENTE_REGULARIZACAO" ||
    s === "AGUARDANDO COMPLEMENTO" ||
    s === "AGUARDANDO_COMPLEMENTO" ||
    s === "REJEITADA POR PRAZO DE COMPLEMENTO" ||
    s === "REJEITADA_POR_PRAZO_COMPLEMENTO"
  ) {
    return "Ajuste Necessário";
  }
  return "Inscrição Pendente";
}

function getAllowedAdminStatusOptions(current: string): readonly AdminStatusOpcao[] {
  const normalized = normalizeAdminStatusValue(current);
  return ALLOWED_STATUS_TRANSITIONS[normalized] ?? ADMIN_STATUS_OPCOES;
}

function getAllowedAdminBeneficioOptions(current: string): readonly AdminBeneficioOpcao[] {
  if (!ADMIN_BENEFICIO_OPCOES.includes(current as AdminBeneficioOpcao)) {
    return ADMIN_BENEFICIO_OPCOES;
  }
  return ALLOWED_BENEFICIO_TRANSITIONS[current as AdminBeneficioOpcao] ?? ADMIN_BENEFICIO_OPCOES;
}

function normalizeResultadoFaseValue(value: string | null | undefined): AdminResultadoFaseOpcao {
  if (ADMIN_RESULTADO_FASE_OPCOES.includes((value ?? "") as AdminResultadoFaseOpcao)) {
    return (value ?? "Nao publicado") as AdminResultadoFaseOpcao;
  }
  return "Nao publicado";
}

function normalizeRecursoStatusValue(value: string | null | undefined): AdminRecursoStatusOpcao {
  if (ADMIN_RECURSO_STATUS_OPCOES.includes((value ?? "") as AdminRecursoStatusOpcao)) {
    return (value ?? "Sem recurso") as AdminRecursoStatusOpcao;
  }
  return "Sem recurso";
}

function getAllowedResultadoFaseOptions(current: string): readonly AdminResultadoFaseOpcao[] {
  const normalized = normalizeResultadoFaseValue(current);
  return ALLOWED_RESULTADO_FASE_TRANSITIONS[normalized] ?? ADMIN_RESULTADO_FASE_OPCOES;
}

function getAllowedRecursoStatusOptions(current: string): readonly AdminRecursoStatusOpcao[] {
  const normalized = normalizeRecursoStatusValue(current);
  return ALLOWED_RECURSO_STATUS_TRANSITIONS[normalized] ?? ADMIN_RECURSO_STATUS_OPCOES;
}

function buildBeneficioTransitionHint(current: string): string {
  const from = (current || "Pendente seleção") as AdminBeneficioOpcao;
  const allowed = getAllowedAdminBeneficioOptions(from).join(", ");
  return `Transição inválida de benefício. Situação atual: "${from}". Opções permitidas: ${allowed}.`;
}

const PAGE_SIZE = 20;

interface PerguntaPayload {
  id: string;
  pergunta: string;
  tipo_Pergunta: string;
  obrigatoriedade: boolean;
  opcoes?: string[] | null;
  tipo_formatacao?: string | null;
  placeholder?: string | null;
  dado?: {
    id: string;
    nome: string;
  } | null;
  pontuacao_validacao?: number | null;
}

interface RespostaPayload {
  id: string;
  texto: string | null;
  valorTexto: string | null;
  valorOpcoes: string[] | null;
  urlArquivo: string | null;
  dataResposta: string | null;
  validada?: boolean | null;
  invalidada?: boolean | null;
  dataValidacao?: string | null;
  dataValidade?: string | null;
  requerReenvio?: boolean | null;
  parecer?: string | null;
  prazoReenvio?: string | null;
  aguardandoRespostaNovaPergunta?: boolean | null;
  prazoRespostaNovaPergunta?: string | null;
}

interface PerguntaComResposta {
  pergunta: PerguntaPayload;
  resposta: RespostaPayload | null;
}

interface StepComStatus {
  step: {
    id: string;
    texto: string;
  };
  status: string;
  pendencias?: {
    totalPerguntas: number;
    totalRespondidas: number;
    totalPendentes: number;
    totalValidadas: number;
    totalCorrecoesSolicitadas: number;
    totalAguardandoComplemento: number;
    totalPrazoVencido: number;
    totalInvalidadas: number;
  };
  perguntas: PerguntaComResposta[];
}

interface StepsCompletos {
  edital: {
    id: string;
    titulo?: string;
    titulo_edital?: string;
    descricao?: string;
    status?: string;
  };
  aluno: {
    aluno_id: string;
    nome: string;
    email: string;
    matricula: string;
  };
  steps: StepComStatus[];
}

function formatActorAuditDisplay(entry: { actor_nome?: string | null; actor_usuario_id: string | null }): string {
  const nome = entry.actor_nome?.trim();
  if (nome) return nome;
  const id = entry.actor_usuario_id;
  if (!id) return "—";
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

/** Evita deslocamento de fuso em strings só data (YYYY-MM-DD). */
function formatDataHoraOuDataBr(iso: string | undefined | null): string {
  if (iso == null || String(iso).trim() === "") return "—";
  const s = String(iso).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (m) {
    const [, y, mo, d] = m;
    if (!s.includes("T") && !/\d{2}:\d{2}/.test(s)) {
      return `${d}/${mo}/${y}`;
    }
  }
  const t = new Date(s);
  if (Number.isNaN(t.getTime())) return s || "—";
  const hasTime = /\d{2}:\d{2}/.test(s) || s.includes("T");
  return hasTime
    ? t.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : t.toLocaleDateString("pt-BR");
}

function mergeAlunoInformacoesGerais(ins: AlunoInscrito, sc?: StepsCompletos["aluno"] | null) {
  return {
    nome: ins.nome?.trim() || sc?.nome?.trim() || "",
    email: ins.email?.trim() || sc?.email?.trim() || "",
    matricula: ins.matricula?.trim() || sc?.matricula?.trim() || "",
    cpf: ins.cpf?.trim() || "",
    celular: ins.celular?.trim() || "",
    curso: ins.curso?.trim() || "",
    campus: ins.campus?.trim() || "",
    data_nascimento: ins.data_nascimento?.trim() || "",
    data_ingresso: ins.data_ingresso?.trim() || "",
  };
}

function calcularPontuacaoPergunta(
  pergunta?: PerguntaPayload | null,
  resposta?: RespostaPayload | null,
): { peso: number; ganho: number } {
  const peso = Number(pergunta?.pontuacao_validacao ?? 0);
  if (!Number.isFinite(peso) || peso <= 0) return { peso: 0, ganho: 0 };
  return { peso, ganho: resposta?.validada === true ? peso : 0 };
}

export default function InscricoesProae() {
  const { userInfo } = useContext(AuthContext);
  const adminPerfil = normalizeAdminPerfil(userInfo?.adminPerfil ?? null);
  const podeAnalisarInscricoes = canAnalyzeInscricoes(adminPerfil);
  const somenteConsulta = inscricoesSomenteConsulta(adminPerfil);
  const podeAlterarBeneficio = canManageEditais(adminPerfil);

  const [searchParams] = useSearchParams();
  const editalIdFromUrl = searchParams.get("editalId");
  const expandInscricaoFromUrl = searchParams.get("expandInscricao");
  const tourFromUrl = searchParams.get("tour");
  const deepLinkExpandHandled = useRef(false);
  const deepLinkExpandAttempted = useRef(false);
  const tourHandledRef = useRef<string | null>(null);
  const selectorSectionRef = useRef<HTMLElement>(null);
  const filtersSectionRef = useRef<HTMLElement>(null);
  const listaSectionRef = useRef<HTMLElement>(null);

  const [editais, setEditais] = useState<Edital[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState<Edital | null>(null);
  const [inscricoes, setInscricoes] = useState<AlunoInscrito[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEditais, setIsLoadingEditais] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroSituacaoSolicitacao, setFiltroSituacaoSolicitacao] = useState<
    "todos" | SituacaoSolicitacaoOpcao
  >("todos");
  const [filtroOrdenacao, setFiltroOrdenacao] = useState<
    "data_desc" | "data_asc" | "pontuacao_desc" | "pontuacao_asc"
  >("pontuacao_desc");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inscricaoSelecionada, setInscricaoSelecionada] = useState<AlunoInscrito | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<"questionarios" | "informacoes">("questionarios");
  const [stepsCompletos, setStepsCompletos] = useState<StepsCompletos | null>(null);
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState<string | null>(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [validandoRespostas, setValidandoRespostas] = useState<Record<string, boolean>>({});
  const [downloadingPdfAnalise, setDownloadingPdfAnalise] = useState(false);
  const [downloadingPdfBeneficio, setDownloadingPdfBeneficio] = useState(false);

  /** Aba Informações Gerais — auditoria de status */
  const [auditEntries, setAuditEntries] = useState<InscricaoStatusAuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditErro, setAuditErro] = useState(false);
  const [auditRefreshTick, setAuditRefreshTick] = useState(0);

  /** Rascunhos PROAE — aba Informações (decisões de análise / benefício no edital). */
  const [adminStatusDraft, setAdminStatusDraft] = useState("");
  const [adminObsDraft, setAdminObsDraft] = useState("");
  const [adminBeneficioDraft, setAdminBeneficioDraft] = useState("");
  const [adminOverrideVagasDraft, setAdminOverrideVagasDraft] = useState(false);
  const [adminOverrideJustificativaDraft, setAdminOverrideJustificativaDraft] = useState("");
  const [adminResultadoFaseDraft, setAdminResultadoFaseDraft] = useState<AdminResultadoFaseOpcao>("Nao publicado");
  const [adminRecursoStatusDraft, setAdminRecursoStatusDraft] = useState<AdminRecursoStatusOpcao>("Sem recurso");
  const [adminRecursoObsDraft, setAdminRecursoObsDraft] = useState("");
  const [adminDesistenteDraft, setAdminDesistenteDraft] = useState(false);
  const [salvandoAdminStatus, setSalvandoAdminStatus] = useState(false);
  const [salvandoAdminBeneficio, setSalvandoAdminBeneficio] = useState(false);
  const [salvandoAdminResultadoRecurso, setSalvandoAdminResultadoRecurso] = useState(false);

  // Estado do modal de confirmação de validação
  const [modalValidarOpen, setModalValidarOpen] = useState(false);
  const [validarRespostaId, setValidarRespostaId] = useState<string | null>(null);
  const [validarPerguntaTitulo, setValidarPerguntaTitulo] = useState<string>("");

  // Estado do modal de invalidação
  const [modalInvalidarOpen, setModalInvalidarOpen] = useState(false);
  const [invalidarRespostaId, setInvalidarRespostaId] = useState<string | null>(null);
  const [invalidarPerguntaTitulo, setInvalidarPerguntaTitulo] = useState<string>("");
  const [invalidarParecer, setInvalidarParecer] = useState("");
  const [invalidarPrazo, setInvalidarPrazo] = useState("");
  const [apenasInvalidar, setApenasInvalidar] = useState(false);
  const [enviandoInvalidacao, setEnviandoInvalidacao] = useState(false);

  // Estado para edição de resposta pela PROAE
  const [confirmarEdicaoOpen, setConfirmarEdicaoOpen] = useState(false);
  const [editarRespostaId, setEditarRespostaId] = useState<string | null>(null);
  const [editarPerguntaInfo, setEditarPerguntaInfo] = useState<PerguntaPayload | null>(null);
  const [editarRespostaAtual, setEditarRespostaAtual] = useState<string>("");
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editarValorTexto, setEditarValorTexto] = useState("");
  const [editarValorOpcoes, setEditarValorOpcoes] = useState<string[]>([]);
  const [enviandoEdicao, setEnviandoEdicao] = useState(false);

  // Estado do modal de reabrir prazo de complemento
  const [modalReabrirComplementoOpen, setModalReabrirComplementoOpen] = useState(false);
  const [reabrirRespostaId, setReabrirRespostaId] = useState<string | null>(null);
  const [reabrirPerguntaTitulo, setReabrirPerguntaTitulo] = useState("");
  const [reabrirNovoPrazo, setReabrirNovoPrazo] = useState("");
  const [enviandoReabertura, setEnviandoReabertura] = useState(false);

  // Estado do visualizador de documentos
  const [documentoViewerOpen, setDocumentoViewerOpen] = useState(false);
  const [documentoUrl, setDocumentoUrl] = useState<string | null>(null);
  const [documentoNome, setDocumentoNome] = useState("");
  const [documentoLoading, setDocumentoLoading] = useState(false);
  const [documentoErro, setDocumentoErro] = useState<string | null>(null);

  useEffect(() => {
    carregarEditais();
  }, []);

  useEffect(() => {
    if (!editalSelecionado?.id) return;
    carregarInscricoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editalSelecionado?.id, paginaAtual, termoBusca, filtroStatus, filtroSituacaoSolicitacao, filtroOrdenacao]);

  useEffect(() => {
    if (!editais.length || !editalIdFromUrl) return;
    const ed = editais.find((e) => String(e.id) === String(editalIdFromUrl));
    if (ed) {
      setPaginaAtual(1);
      setEditalSelecionado(ed);
    }
  }, [editais, editalIdFromUrl]);

  useEffect(() => {
    if (!tourFromUrl) return;
    if (tourHandledRef.current === tourFromUrl) return;

    if (!editalSelecionado && editais.length > 0) {
      setPaginaAtual(1);
      setEditalSelecionado(editais[0]);
      return;
    }

    const map: Record<string, { ref: RefObject<HTMLElement>; label: string }> = {
      seletor: { ref: selectorSectionRef, label: "seletor de edital" },
      filtros: { ref: filtersSectionRef, label: "filtros e exportação" },
      lista: { ref: listaSectionRef, label: "lista de inscrições" },
    };
    const target = map[tourFromUrl];
    if (!target?.ref.current) return;
    target.ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    toast(`Tutorial: foco em "${target.label}".`);
    tourHandledRef.current = tourFromUrl;
  }, [tourFromUrl, editalSelecionado, editais, isLoading, isLoadingEditais]);

  const carregarEditais = async () => {
    try {
      setIsLoadingEditais(true);
      const dados = await editalService.listarEditais();
      setEditais(dados);
    } catch (err: any) {
      console.error("Erro ao carregar editais:", err);
    } finally {
      setIsLoadingEditais(false);
    }
  };

  const carregarInscricoes = async (): Promise<AlunoInscrito[] | undefined> => {
    if (!editalSelecionado?.id) return undefined;

    try {
      setIsLoading(true);
      const resposta = await inscricaoServiceManager.listarInscritosPorEditalPaginado(editalSelecionado.id, {
        page: paginaAtual,
        limit: PAGE_SIZE,
        busca: termoBusca.trim() || undefined,
        status: filtroStatus !== "todos" ? filtroStatus : undefined,
        situacao_solicitacao:
          filtroSituacaoSolicitacao !== "todos"
            ? filtroSituacaoSolicitacao
            : undefined,
        ordenacao: filtroOrdenacao,
      });
      const totalPaginasApi = Math.max(1, resposta.paginacao?.total_paginas ?? 1);
      if (paginaAtual > totalPaginasApi) {
        setPaginaAtual(totalPaginasApi);
        return undefined;
      }
      setInscricoes(resposta.dados ?? []);
      setTotalPaginas(totalPaginasApi);
      setTotalItens(resposta.paginacao?.total_itens ?? (resposta.dados ?? []).length);
      return resposta.dados;
    } catch (err: any) {
      console.error("Erro ao carregar inscrições:", err);
      setInscricoes([]);
      setTotalPaginas(1);
      setTotalItens(0);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const inscricoesFiltradas = [...inscricoes].sort((a, b) => {
    const pa = Number(a.pontuacao_validada ?? 0);
    const pb = Number(b.pontuacao_validada ?? 0);
    const da = new Date(a.data_inscricao || 0).getTime();
    const db = new Date(b.data_inscricao || 0).getTime();

    if (filtroOrdenacao === "pontuacao_desc") {
      if (pb !== pa) return pb - pa;
      return db - da;
    }
    if (filtroOrdenacao === "pontuacao_asc") {
      if (pa !== pb) return pa - pb;
      return db - da;
    }
    if (filtroOrdenacao === "data_asc") {
      return da - db;
    }
    return db - da;
  });

  const getStatusBadgeClass = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "APROVADA":
      case "INSCRIÇÃO APROVADA":
        return "status-badge status-aprovada";
      case "REJEITADA":
      case "INSCRIÇÃO NEGADA":
        return "status-badge status-rejeitada";
      case "EM ANÁLISE":
      case "EM_ANALISE":
        return "status-badge status-analise";
      case "SELECIONADA":
        return "status-badge status-selecionada";
      case "CLASSIFICADA":
        return "status-badge status-analise";
      case "INDEFERIDA":
        return "status-badge status-rejeitada";
      case "NÃO SELECIONADA":
      case "NAO_SELECIONADA":
        return "status-badge status-nao-selecionada";
      case "DESISTENTE":
        return "status-badge status-desistente";
      case "PENDENTE DE REGULARIZAÇÃO":
      case "PENDENTE_REGULARIZACAO":
        return "status-badge status-pendente-regularizacao";
      case "AGUARDANDO COMPLEMENTO":
      case "AGUARDANDO_COMPLEMENTO":
        return "status-badge status-aguardando-complemento";
      case "REJEITADA POR PRAZO DE COMPLEMENTO":
      case "REJEITADA_POR_PRAZO_COMPLEMENTO":
        return "status-badge status-rejeitada-prazo-complemento";
      case "PENDENTE":
      case "INSCRIÇÃO PENDENTE":
      case "AJUSTE NECESSÁRIO":
        return "status-badge status-pendente";
      default:
        return "status-badge status-pendente";
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "APROVADA":
      case "INSCRIÇÃO APROVADA":
        return "Aprovada";
      case "SELECIONADA":
        return "Selecionada";
      case "CLASSIFICADA":
        return "Classificada";
      case "INDEFERIDA":
        return "Indeferida";
      case "REJEITADA":
      case "NEGADA":
      case "INSCRIÇÃO NEGADA":
        return "Negada";
      case "DESISTENTE":
        return "Desistente";
      case "EM ANÁLISE":
      case "EM_ANALISE":
      case "PENDENTE":
      case "INSCRIÇÃO PENDENTE":
        return "Em Análise";
      case "PENDENTE DE REGULARIZAÇÃO":
      case "PENDENTE_REGULARIZACAO":
      case "AGUARDANDO COMPLEMENTO":
      case "AGUARDANDO_COMPLEMENTO":
      case "AJUSTE NECESSÁRIO":
      case "REJEITADA POR PRAZO DE COMPLEMENTO":
      case "REJEITADA_POR_PRAZO_COMPLEMENTO":
        return "Ajuste necessário";
      default:
        return status?.trim() ? status : "Pendente";
    }
  };

  const handleVerDetalhes = async (inscricao: AlunoInscrito) => {
    setInscricaoSelecionada(inscricao);
    setIsModalOpen(true);
    await carregarStepsCompletos(inscricao.aluno_id);
  };

  useEffect(() => {
    if (!expandInscricaoFromUrl || deepLinkExpandHandled.current) return;
    const ins = inscricoes.find((i) => String(i.inscricao_id) === String(expandInscricaoFromUrl));
    if (ins) {
      deepLinkExpandHandled.current = true;
      void handleVerDetalhes(ins);
      return;
    }
    if (deepLinkExpandAttempted.current) return;
    deepLinkExpandAttempted.current = true;
    void inscricaoServiceManager
      .buscarInscricaoPorId(String(expandInscricaoFromUrl))
      .then((inscricao) => {
        if (!inscricao) return;
        deepLinkExpandHandled.current = true;
        void handleVerDetalhes(inscricao);
      })
      .catch(() => {
        /* deep link opcional: mantém silencioso se não encontrado */
      });
  }, [inscricoes, expandInscricaoFromUrl]);

  useEffect(() => {
    deepLinkExpandAttempted.current = false;
    deepLinkExpandHandled.current = false;
  }, [editalSelecionado?.id]);

  useEffect(() => {
    if (expandInscricaoFromUrl) {
      deepLinkExpandAttempted.current = false;
      deepLinkExpandHandled.current = false;
    }
  }, [expandInscricaoFromUrl]);

  useEffect(() => {
    if (!isModalOpen || abaAtiva !== "informacoes" || !inscricaoSelecionada?.inscricao_id) {
      return;
    }
    let cancelled = false;
    setAuditLoading(true);
    setAuditErro(false);
    inscricaoServiceManager
      .listarStatusAuditAdmin(String(inscricaoSelecionada.inscricao_id))
      .then((data) => {
        if (!cancelled) {
          const asc = [...(data || [])].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          );
          setAuditEntries(asc);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuditErro(true);
          setAuditEntries([]);
        }
      })
      .finally(() => {
        if (!cancelled) setAuditLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isModalOpen, abaAtiva, inscricaoSelecionada?.inscricao_id, auditRefreshTick]);

  useEffect(() => {
    if (!inscricaoSelecionada) return;
    setAdminStatusDraft(normalizeAdminStatusValue(inscricaoSelecionada.status_inscricao));
    const obs = inscricaoSelecionada.observacao_admin?.trim() ?? "";
    setAdminObsDraft(obs);
    setAdminDesistenteDraft(hasDesistenteMarker(obs));
    const b =
      inscricaoSelecionada.status_beneficio_edital &&
      ADMIN_BENEFICIO_OPCOES.includes(
        inscricaoSelecionada.status_beneficio_edital as AdminBeneficioOpcao,
      )
        ? inscricaoSelecionada.status_beneficio_edital
        : "Pendente seleção";
    setAdminBeneficioDraft(b);
    setAdminOverrideVagasDraft(false);
    setAdminOverrideJustificativaDraft("");
    setAdminResultadoFaseDraft(normalizeResultadoFaseValue(inscricaoSelecionada.resultado_fase));
    setAdminRecursoStatusDraft(normalizeRecursoStatusValue(inscricaoSelecionada.recurso_status));
    setAdminRecursoObsDraft(inscricaoSelecionada.recurso_observacao?.trim() ?? "");
  }, [
    inscricaoSelecionada?.inscricao_id,
    inscricaoSelecionada?.status_inscricao,
    inscricaoSelecionada?.observacao_admin,
    inscricaoSelecionada?.status_beneficio_edital,
    inscricaoSelecionada?.resultado_fase,
    inscricaoSelecionada?.recurso_status,
    inscricaoSelecionada?.recurso_observacao,
  ]);

  const podeEditarBeneficioEdital =
    !!editalSelecionado &&
    podeAlterarBeneficio;
  const adminStatusOpcoesDisponiveis = getAllowedAdminStatusOptions(adminStatusDraft);
  const adminBeneficioOpcoesDisponiveis = getAllowedAdminBeneficioOptions(adminBeneficioDraft);
  const adminResultadoFaseOpcoesDisponiveis = getAllowedResultadoFaseOptions(adminResultadoFaseDraft);
  const adminRecursoStatusOpcoesDisponiveis = getAllowedRecursoStatusOptions(adminRecursoStatusDraft);

  const salvarStatusInscricaoAdmin = async () => {
    if (!podeAnalisarInscricoes) {
      toast.error("Seu perfil não permite alterar o status da inscrição.");
      return;
    }
    if (!inscricaoSelecionada?.inscricao_id) return;
    const id = String(inscricaoSelecionada.inscricao_id);
    setSalvandoAdminStatus(true);
    try {
      const observacaoFinal = adminDesistenteDraft
        ? addDesistenteMarker(adminObsDraft)
        : removeDesistenteMarker(adminObsDraft);
      await inscricaoServiceManager.adminAlterarStatusInscricao(id, {
        status: adminStatusDraft,
        observacao: observacaoFinal || undefined,
      });
      toast.success("Status da inscrição (análise) atualizado.");
      const lista = await carregarInscricoes();
      const fresh = lista?.find((i) => String(i.inscricao_id) === id);
      if (fresh) setInscricaoSelecionada(fresh);
      setAuditRefreshTick((t) => t + 1);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoAdminStatus(false);
    }
  };

  const toggleDesistenciaAdmin = async (marcar: boolean) => {
    if (!inscricaoSelecionada?.inscricao_id) return;
    const id = String(inscricaoSelecionada.inscricao_id);
    setSalvandoAdminStatus(true);
    try {
      const observacaoFinal = marcar
        ? addDesistenteMarker(adminObsDraft)
        : removeDesistenteMarker(adminObsDraft);
      await inscricaoServiceManager.adminAlterarStatusInscricao(id, {
        status: adminStatusDraft,
        observacao: observacaoFinal || undefined,
      });
      setAdminObsDraft(observacaoFinal);
      setAdminDesistenteDraft(marcar);
      toast.success(
        marcar
          ? "Solicitação marcada como desistente."
          : "Marcador de desistência removido.",
      );
      const lista = await carregarInscricoes();
      const fresh = lista?.find((i) => String(i.inscricao_id) === id);
      if (fresh) setInscricaoSelecionada(fresh);
      setAuditRefreshTick((t) => t + 1);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoAdminStatus(false);
    }
  };

  const salvarBeneficioEditalAdmin = async () => {
    if (!inscricaoSelecionada?.inscricao_id) return;
    const id = String(inscricaoSelecionada.inscricao_id);
    const beneficioAtual = inscricaoSelecionada.status_beneficio_edital || "Pendente seleção";
    const opcoesPermitidas = getAllowedAdminBeneficioOptions(beneficioAtual);
    if (!opcoesPermitidas.includes(adminBeneficioDraft as AdminBeneficioOpcao)) {
      toast.error(buildBeneficioTransitionHint(beneficioAtual));
      return;
    }
    if (adminOverrideVagasDraft) {
      if (adminBeneficioDraft !== "Beneficiário no edital") {
        toast.error(
          'Só é possível autorizar acima do limite de vagas quando a situação for "Beneficiário no edital".',
        );
        return;
      }
      if (adminOverrideJustificativaDraft.trim().length < 10) {
        toast.error("Informe uma justificativa (mínimo 10 caracteres) para exceder vagas.");
        return;
      }
    }
    setSalvandoAdminBeneficio(true);
    try {
      await inscricaoServiceManager.adminAlterarBeneficioEdital(id, {
        status_beneficio_edital: adminBeneficioDraft,
        permitir_exceder_vagas: adminOverrideVagasDraft || undefined,
        justificativa_override: adminOverrideVagasDraft
          ? adminOverrideJustificativaDraft.trim()
          : undefined,
      });
      toast.success("Situação de benefício no edital atualizada.");
      const lista = await carregarInscricoes();
      const fresh = lista?.find((i) => String(i.inscricao_id) === id);
      if (fresh) setInscricaoSelecionada(fresh);
      setAuditRefreshTick((t) => t + 1);
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e);
      if (msg.includes("Limite de vagas atingido")) {
        toast.error(
          `${msg} Se houver autorização gerencial, marque "Autorizar homologação acima do limite de vagas" e informe a justificativa.`,
          { duration: 8000 },
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setSalvandoAdminBeneficio(false);
    }
  };

  const salvarResultadoRecursoAdmin = async () => {
    if (!inscricaoSelecionada?.inscricao_id) return;
    const id = String(inscricaoSelecionada.inscricao_id);
    const faseAtual = inscricaoSelecionada.resultado_fase || "Nao publicado";
    const recursoAtual = inscricaoSelecionada.recurso_status || "Sem recurso";
    const fasesPermitidas = getAllowedResultadoFaseOptions(faseAtual);
    const recursosPermitidos = getAllowedRecursoStatusOptions(recursoAtual);
    if (!fasesPermitidas.includes(adminResultadoFaseDraft)) {
      toast.error(
        `Transição de resultado inválida. Atual: "${faseAtual}". Permitidas: ${fasesPermitidas.join(", ")}.`,
      );
      return;
    }
    if (!recursosPermitidos.includes(adminRecursoStatusDraft)) {
      toast.error(
        `Transição de recurso inválida. Atual: "${recursoAtual}". Permitidas: ${recursosPermitidos.join(", ")}.`,
      );
      return;
    }
    if (
      adminRecursoStatusDraft === "Recurso solicitado" &&
      adminResultadoFaseDraft !== "Resultado preliminar"
    ) {
      toast.error(
        'Para usar "Recurso solicitado", a fase de resultado precisa estar em "Resultado preliminar".',
      );
      return;
    }
    setSalvandoAdminResultadoRecurso(true);
    try {
      await inscricaoServiceManager.adminAlterarResultadoRecurso(id, {
        resultado_fase: adminResultadoFaseDraft,
        recurso_status: adminRecursoStatusDraft,
        recurso_observacao: adminRecursoObsDraft.trim() || undefined,
      });
      toast.success("Resultado/recurso atualizados.");
      const lista = await carregarInscricoes();
      const fresh = lista?.find((i) => String(i.inscricao_id) === id);
      if (fresh) setInscricaoSelecionada(fresh);
      setAuditRefreshTick((t) => t + 1);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoAdminResultadoRecurso(false);
    }
  };

  const carregarStepsCompletos = async (alunoId: string) => {
    if (!editalSelecionado?.id || !alunoId) return;

    try {
      setIsLoadingModal(true);
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/aluno/${alunoId}/edital/${editalSelecionado.id}/steps-completos`;
      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) {
        if (response.status === 404) {
          setStepsCompletos(null);
          return;
        }
        throw new Error(`Erro ao carregar dados: ${response.statusText}`);
      }

      const payload = await response.json();
      const dados = (payload?.dados || payload) as StepsCompletos | null;

      if (payload?.sucesso === false || !dados) {
        setStepsCompletos(null);
        return;
      }

      setStepsCompletos(dados);
      // Seleciona o primeiro step automaticamente
      if (dados.steps && dados.steps.length > 0) {
        setQuestionarioSelecionado(dados.steps[0].step.id);
      }
    } catch (err: any) {
      console.error("Erro ao carregar steps completos:", err);
      setStepsCompletos(null);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const abrirModalValidar = (respostaId: string, perguntaTitulo?: string) => {
    if (!podeAnalisarInscricoes) {
      toast.error("Seu perfil não permite validar respostas.");
      return;
    }
    setValidarRespostaId(respostaId);
    setValidarPerguntaTitulo(perguntaTitulo || "");
    setModalValidarOpen(true);
  };

  const fecharModalValidar = () => {
    setModalValidarOpen(false);
    setValidarRespostaId(null);
    setValidarPerguntaTitulo("");
  };

  const confirmarValidacao = async () => {
    if (!validarRespostaId) return;

    fecharModalValidar();
    setValidandoRespostas((prev) => ({ ...prev, [validarRespostaId]: true }));
    try {
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/${validarRespostaId}/validate`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ validada: true }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao validar resposta: ${response.statusText}`);
      }

      if (inscricaoSelecionada?.aluno_id) {
        await carregarStepsCompletos(inscricaoSelecionada.aluno_id);
      }
    } catch (err: any) {
      console.error("Erro ao validar resposta:", err);
      toast.error("Não foi possível validar a resposta. Tente novamente.");
    } finally {
      setValidandoRespostas((prev) => {
        const clone = { ...prev };
        if (validarRespostaId) delete clone[validarRespostaId];
        return clone;
      });
    }
  };

  const abrirModalInvalidar = (respostaId: string, perguntaTitulo?: string) => {
    if (!podeAnalisarInscricoes) {
      toast.error("Seu perfil não permite alterar respostas.");
      return;
    }
    setInvalidarRespostaId(respostaId);
    setInvalidarPerguntaTitulo(perguntaTitulo || "");
    setInvalidarParecer("");
    setInvalidarPrazo("");
    setApenasInvalidar(false);
    setModalInvalidarOpen(true);
  };

  const fecharModalInvalidar = () => {
    setModalInvalidarOpen(false);
    setInvalidarRespostaId(null);
    setInvalidarPerguntaTitulo("");
    setInvalidarParecer("");
    setInvalidarPrazo("");
    setApenasInvalidar(false);
  };

  // ── Edição de resposta pela PROAE ──
  const abrirConfirmacaoEdicao = (respostaId: string, pergunta: PerguntaPayload, respostaAtual: string) => {
    if (!podeAnalisarInscricoes) {
      toast.error("Seu perfil não permite editar respostas.");
      return;
    }
    setEditarRespostaId(respostaId);
    setEditarPerguntaInfo(pergunta);
    setEditarRespostaAtual(respostaAtual);
    setConfirmarEdicaoOpen(true);
  };

  const fecharConfirmacaoEdicao = () => {
    setConfirmarEdicaoOpen(false);
    setEditarRespostaId(null);
    setEditarPerguntaInfo(null);
    setEditarRespostaAtual("");
  };

  const abrirModalEditar = () => {
    if (!podeAnalisarInscricoes) {
      toast.error("Seu perfil não permite editar respostas.");
      return;
    }
    setConfirmarEdicaoOpen(false);
    // Inicializar campo de edição com o valor atual
    if (
      editarPerguntaInfo?.tipo_Pergunta?.toLowerCase().includes("selecao") ||
      editarPerguntaInfo?.tipo_Pergunta?.toLowerCase().includes("checkbox") ||
      editarPerguntaInfo?.tipo_Pergunta?.toLowerCase().includes("radio") ||
      editarPerguntaInfo?.tipo_Pergunta?.toLowerCase().includes("select")
    ) {
      setEditarValorOpcoes(editarRespostaAtual ? editarRespostaAtual.split(", ") : []);
      setEditarValorTexto("");
    } else {
      setEditarValorTexto(editarRespostaAtual || "");
      setEditarValorOpcoes([]);
    }
    setModalEditarOpen(true);
  };

  const fecharModalEditar = () => {
    setModalEditarOpen(false);
    setEditarRespostaId(null);
    setEditarPerguntaInfo(null);
    setEditarRespostaAtual("");
    setEditarValorTexto("");
    setEditarValorOpcoes([]);
  };

  const isTipoOpcoes = (tipo?: string) => {
    if (!tipo) return false;
    const t = tipo.toLowerCase();
    return t.includes("selecao") || t.includes("checkbox") || t.includes("radio") || t.includes("select");
  };

  const toggleOpcao = (opcao: string) => {
    setEditarValorOpcoes((prev) => (prev.includes(opcao) ? prev.filter((o) => o !== opcao) : [...prev, opcao]));
  };

  const confirmarEdicaoResposta = async () => {
    if (!editarRespostaId) return;

    setEnviandoEdicao(true);
    try {
      const dto: Record<string, unknown> = {};
      if (isTipoOpcoes(editarPerguntaInfo?.tipo_Pergunta)) {
        dto.valorOpcoes = editarValorOpcoes;
      } else {
        dto.valorTexto = editarValorTexto;
      }
      await respostaService.atualizarResposta(editarRespostaId, dto as any);
      // Recarregar dados do modal
      if (inscricaoSelecionada?.aluno_id) {
        await carregarStepsCompletos(inscricaoSelecionada.aluno_id);
      }
      fecharModalEditar();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao editar resposta.");
    } finally {
      setEnviandoEdicao(false);
    }
  };

  const confirmarInvalidacao = async () => {
    if (!invalidarRespostaId) return;

    // Validações
    if (!apenasInvalidar) {
      if (!invalidarParecer.trim()) {
        toast.error("Informe o motivo/instrução de correção.");
        return;
      }
      if (!invalidarPrazo) {
        toast.error("Informe o prazo para reenvio.");
        return;
      }
    }

    setEnviandoInvalidacao(true);
    setValidandoRespostas((prev) => ({ ...prev, [invalidarRespostaId]: true }));

    try {
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/${invalidarRespostaId}/validate`;

      let body: Record<string, unknown>;
      if (apenasInvalidar) {
        body = { invalidada: true };
      } else {
        const prazoDate = new Date(invalidarPrazo + "T23:59:59.000Z");
        body = {
          invalidada: true,
          requerReenvio: true,
          parecer: invalidarParecer.trim(),
          prazoReenvio: prazoDate.toISOString(),
        };
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Erro ao invalidar resposta: ${response.statusText}`);
      }

      fecharModalInvalidar();

      if (inscricaoSelecionada?.aluno_id) {
        await carregarStepsCompletos(inscricaoSelecionada.aluno_id);
      }
    } catch (err: any) {
      console.error("Erro ao invalidar resposta:", err);
      toast.error("Não foi possível invalidar a resposta. Tente novamente.");
    } finally {
      setEnviandoInvalidacao(false);
      setValidandoRespostas((prev) => {
        const clone = { ...prev };
        if (invalidarRespostaId) delete clone[invalidarRespostaId];
        return clone;
      });
    }
  };

  const alterarPrazoReenvio = async (respostaId: string, novoPrazo: string, parecerExistente?: string) => {
    if (!podeAnalisarInscricoes) {
      toast.error("Seu perfil não permite alterar prazos de reenvio.");
      return;
    }
    setValidandoRespostas((prev) => ({ ...prev, [respostaId]: true }));
    try {
      const prazoDate = new Date(novoPrazo + "T23:59:59.000Z");
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/${respostaId}/validate`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          invalidada: true,
          requerReenvio: true,
          prazoReenvio: prazoDate.toISOString(),
          parecer: parecerExistente || "Prazo de reenvio alterado",
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao alterar prazo: ${response.statusText}`);
      }

      if (inscricaoSelecionada?.aluno_id) {
        await carregarStepsCompletos(inscricaoSelecionada.aluno_id);
      }
    } catch (err: any) {
      console.error("Erro ao alterar prazo de reenvio:", err);
      toast.error("Não foi possível alterar o prazo. Tente novamente.");
    } finally {
      setValidandoRespostas((prev) => {
        const clone = { ...prev };
        delete clone[respostaId];
        return clone;
      });
    }
  };

  // ── Reabrir prazo de complemento ──
  const abrirModalReabrirComplemento = (respostaId: string, perguntaTitulo: string) => {
    if (!podeAnalisarInscricoes) {
      toast.error("Seu perfil não permite reabrir prazos.");
      return;
    }
    setReabrirRespostaId(respostaId);
    setReabrirPerguntaTitulo(perguntaTitulo);
    setReabrirNovoPrazo("");
    setModalReabrirComplementoOpen(true);
  };

  // ── Documento: chave no R2 (object key) ou URL antiga ──
  /** Chave completa para a API (ex.: userId/documentos/arquivo.pdf) */
  const resolveStorageKeyForApi = (urlArquivo: string): string => {
    const t = urlArquivo.trim();
    if (!t) return "";
    if (!/^https?:\/\//i.test(t)) return t;
    try {
      const u = new URL(t);
      return u.pathname.replace(/^\/+/, "");
    } catch {
      return t;
    }
  };

  /** Nome amigável para exibir (último segmento da chave) */
  const extrairNomeArquivo = (urlArquivo: string): string => {
    const key = resolveStorageKeyForApi(urlArquivo);
    const parts = key.split("/").filter(Boolean);
    return parts[parts.length - 1] || key;
  };

  const getExtensaoArquivo = (nome: string): string => {
    return nome.split(".").pop()?.toLowerCase() || "";
  };

  const isImagemExtensao = (extensao: string): boolean => {
    return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(extensao);
  };

  const isPdfExtensao = (extensao: string): boolean => {
    return extensao === "pdf";
  };

  const buscarDocumentoPresignedUrl = async (
    objectKey: string,
  ): Promise<{ nome_do_arquivo?: string; url: string; objectKey?: string } | null> => {
    try {
      const base = import.meta.env.VITE_API_URL_SERVICES;
      const url = `${base}/documents/presigned?key=${encodeURIComponent(objectKey)}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Erro ao buscar documento");
      return await response.json();
    } catch (err) {
      console.error("Erro ao buscar presigned URL:", err);
      return null;
    }
  };

  const abrirVisualizadorDocumento = async (urlArquivo: string) => {
    const storageKey = resolveStorageKeyForApi(urlArquivo);
    const nomeArquivo = extrairNomeArquivo(urlArquivo);
    setDocumentoNome(nomeArquivo);
    setDocumentoLoading(true);
    setDocumentoErro(null);
    setDocumentoViewerOpen(true);

    const result = await buscarDocumentoPresignedUrl(storageKey);
    if (result?.url) {
      setDocumentoUrl(result.url);
    } else {
      setDocumentoErro("Não foi possível carregar o documento. Tente novamente.");
    }
    setDocumentoLoading(false);
  };

  const fecharVisualizadorDocumento = () => {
    setDocumentoViewerOpen(false);
    setDocumentoUrl(null);
    setDocumentoNome("");
    setDocumentoErro(null);
  };

  const baixarDocumento = async (urlArquivo: string) => {
    const storageKey = resolveStorageKeyForApi(urlArquivo);
    const nomeArquivo = extrairNomeArquivo(urlArquivo);
    const result = await buscarDocumentoPresignedUrl(storageKey);
    if (result?.url) {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.nome_do_arquivo || nomeArquivo;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      toast.error("Não foi possível baixar o documento.");
    }
  };

  const fecharModalReabrirComplemento = () => {
    setModalReabrirComplementoOpen(false);
    setReabrirRespostaId(null);
    setReabrirPerguntaTitulo("");
    setReabrirNovoPrazo("");
  };

  const confirmarReabrirComplemento = async () => {
    if (!reabrirRespostaId || !reabrirNovoPrazo) return;

    const prazoDate = new Date(reabrirNovoPrazo);
    if (prazoDate.getTime() <= Date.now()) {
      toast.error("O novo prazo deve ser uma data futura.");
      return;
    }

    setEnviandoReabertura(true);
    try {
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/${reabrirRespostaId}/reabrir-complemento`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ novoPrazo: prazoDate.toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.mensagem || `Erro: ${response.statusText}`);
      }

      fecharModalReabrirComplemento();

      if (inscricaoSelecionada?.aluno_id) {
        await carregarStepsCompletos(inscricaoSelecionada.aluno_id);
      }
      // Recarrega a lista de inscrições para atualizar o status
      await carregarInscricoes();
    } catch (err: any) {
      console.error("Erro ao reabrir complemento:", err);
      toast.error(err.message || "Não foi possível reabrir o prazo. Tente novamente.");
    } finally {
      setEnviandoReabertura(false);
    }
  };

  const baixarPdfInscricoesAprovadasAnalise = async () => {
    if (!editalSelecionado?.id) {
      toast.error("Selecione um edital primeiro.");
      return;
    }

    setDownloadingPdfAnalise(true);
    try {
      await inscricaoServiceManager.downloadPdfAprovados(String(editalSelecionado.id));
    } catch (err: unknown) {
      console.error("Erro ao baixar PDF:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível baixar o PDF.";
      toast.error(msg);
    } finally {
      setDownloadingPdfAnalise(false);
    }
  };

  const baixarPdfBeneficiariosEdital = async () => {
    if (!editalSelecionado?.id) {
      toast.error("Selecione um edital primeiro.");
      return;
    }

    setDownloadingPdfBeneficio(true);
    try {
      await inscricaoServiceManager.downloadPdfBeneficiarios(String(editalSelecionado.id));
    } catch (err: unknown) {
      console.error("Erro ao baixar PDF de beneficiários:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível baixar o PDF.";
      toast.error(msg);
    } finally {
      setDownloadingPdfBeneficio(false);
    }
  };

  /**
   * Exporta a relação completa de inscrições do edital em CSV (UTF-8 com BOM).
   * O backend gera 1 linha por inscrição com colunas dinâmicas para cada
   * pergunta, ordenadas conforme `ordem` no formulário.
   */
  const baixarCsvInscricoesEdital = async () => {
    if (!editalSelecionado?.id) {
      toast.error("Selecione um edital primeiro.");
      return;
    }
    try {
      await inscricaoServiceManager.downloadCsvInscricoesEdital(
        String(editalSelecionado.id),
      );
    } catch (err: unknown) {
      console.error("Erro ao baixar CSV de inscrições:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível baixar o CSV.";
      toast.error(msg);
    }
  };

  /**
   * Gera o PDF detalhado de uma inscrição (perguntas e respostas), via endpoint
   * específico do backend.
   */
  const baixarPdfDaInscricao = async (inscricaoId: string | number) => {
    try {
      await inscricaoServiceManager.downloadPdfInscricao(inscricaoId);
    } catch (err: unknown) {
      console.error("Erro ao baixar PDF da inscrição:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível baixar o PDF.";
      toast.error(msg);
    }
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setInscricaoSelecionada(null);
    setAbaAtiva("questionarios");
    setStepsCompletos(null);
    setQuestionarioSelecionado(null);

    // Atualiza a tabela de inscrições ao fechar o modal
    await carregarInscricoes();
  };

  const getStatusStepLabel = (status: string) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "CONCLUIDO":
        return "Concluído";
      case "PENDENTE_CORRECAO":
      case "PENDENTE_REGULARIZACAO":
        return "Pendente de Regularização";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "NAO_INICIADO":
        return "Não Iniciado";
      case "REJEITADO":
        return "Rejeitado";
      case "AGUARDANDO_COMPLEMENTO":
        return "Aguardando Complemento";
      case "PRAZO_COMPLEMENTO_EXPIRADO":
        return "Prazo de Complemento Expirado";
      default:
        return status || "Pendente";
    }
  };

  const getStatusStepStyle = (status: string) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "CONCLUIDO":
        return { backgroundColor: "#dcfce7", color: "#166534" };
      case "PENDENTE_CORRECAO":
      case "PENDENTE_REGULARIZACAO":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "EM_ANDAMENTO":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "NAO_INICIADO":
        return { backgroundColor: "#f1f5f9", color: "#475569" };
      case "REJEITADO":
        return { backgroundColor: "#fef2f2", color: "#991b1b" };
      case "AGUARDANDO_COMPLEMENTO":
        return { backgroundColor: "#eff6ff", color: "#1d4ed8" };
      case "PRAZO_COMPLEMENTO_EXPIRADO":
        return { backgroundColor: "#fef2f2", color: "#be123c" };
      default:
        return { backgroundColor: "#e2e8f0", color: "#64748b" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
      <div className="inscricoes-proae-container">
        <header className="inscricoes-proae-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-container">
                <div className="avatar">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">Inscrições e análise</h1>
                <p className="welcome-subtitle">
                  {editalSelecionado
                    ? `Inscrições do edital: ${editalSelecionado.titulo_edital}`
                    : "Selecione um edital para analisar inscrições, respostas e benefícios"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {/* Seletor de Edital */}
          <section
            ref={selectorSectionRef}
            className="edital-selector-section"
            style={tourFromUrl === "seletor" ? { outline: "2px solid #60a5fa", borderRadius: "12px" } : undefined}
          >
            <div className="selector-card">
              <label className="selector-label">Selecione um Edital</label>
              <select
                className="edital-select"
                value={editalSelecionado ? String(editalSelecionado.id) : ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const edital = editais.find((ed) => String(ed.id) === selectedId);
                  setPaginaAtual(1);
                  setEditalSelecionado(edital || null);
                }}
                disabled={isLoadingEditais}
              >
                <option value="">Selecione um edital...</option>
                {editais.map((edital) => (
                  <option key={String(edital.id)} value={String(edital.id)}>
                    {edital.titulo_edital}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Filtros */}
          {editalSelecionado && (
            <section
              ref={filtersSectionRef}
              className="filters-section"
              style={tourFromUrl === "filtros" ? { outline: "2px solid #f59e0b", borderRadius: "12px" } : undefined}
            >
              <div className="filters-card">
                <div className="search-container">
                  <Search className="w-4 h-4 search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou matrícula..."
                    value={termoBusca}
                    onChange={(e) => {
                      setPaginaAtual(1);
                      setTermoBusca(e.target.value);
                    }}
                    className="search-input"
                  />
                </div>
                <div className="filter-container">
                  <Filter className="w-4 h-4 filter-icon" />
                  <select
                    className="status-filter"
                    value={filtroStatus}
                    onChange={(e) => {
                      setPaginaAtual(1);
                      setFiltroStatus(e.target.value);
                    }}
                  >
                    <option value="todos">Todos os status</option>
                    <option value="pendente">Em análise</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="negada">Negada</option>
                    <option value="ajuste_necessario">Ajuste necessário</option>
                  </select>
                </div>
                <div className="filter-container">
                  <Filter className="w-4 h-4 filter-icon" />
                  <select
                    className="status-filter"
                    value={filtroSituacaoSolicitacao}
                    onChange={(e) => {
                      setPaginaAtual(1);
                      setFiltroSituacaoSolicitacao(
                        (e.target.value as "todos" | SituacaoSolicitacaoOpcao) || "todos",
                      );
                    }}
                  >
                    <option value="todos">Todas as situações</option>
                    <option value="SELECIONADA">Selecionadas</option>
                    <option value="CLASSIFICADA">Classificadas</option>
                    <option value="INDEFERIDA">Indeferidas</option>
                    <option value="DESISTENTE">Desistentes</option>
                  </select>
                </div>
                <div className="filter-container">
                  <Filter className="w-4 h-4 filter-icon" />
                  <select
                    className="status-filter"
                    value={filtroOrdenacao}
                    onChange={(e) => {
                      setPaginaAtual(1);
                      setFiltroOrdenacao(
                        (e.target.value as
                          | "data_desc"
                          | "data_asc"
                          | "pontuacao_desc"
                          | "pontuacao_asc") ?? "pontuacao_desc",
                      );
                    }}
                  >
                    <option value="pontuacao_desc">Pontuação (maior → menor)</option>
                    <option value="pontuacao_asc">Pontuação (menor → maior)</option>
                    <option value="data_desc">Data (mais recente)</option>
                    <option value="data_asc">Data (mais antiga)</option>
                  </select>
                </div>
                <div className="download-pdf-button-group" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                  <button
                    onClick={() => void baixarPdfInscricoesAprovadasAnalise()}
                    disabled={downloadingPdfAnalise || downloadingPdfBeneficio}
                    className="download-pdf-button"
                    title="PDF: inscrições com status Inscrição Aprovada (análise documental / parecer)"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingPdfAnalise ? "Baixando..." : "PDF — Aprovados (análise)"}</span>
                  </button>
                  <button
                    onClick={() => void baixarPdfBeneficiariosEdital()}
                    disabled={downloadingPdfAnalise || downloadingPdfBeneficio}
                    className="download-pdf-button download-pdf-button--secondary"
                    title="PDF: estudantes homologados como Beneficiário no edital"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingPdfBeneficio ? "Baixando..." : "PDF — Beneficiários"}</span>
                  </button>
                  <button
                    onClick={() => void baixarCsvInscricoesEdital()}
                    className="download-pdf-button download-pdf-button--secondary"
                    title="Exporta uma planilha CSV com 1 linha por inscrição e 1 coluna por pergunta. Abre direto no Excel."
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV — Inscrições do edital</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Lista de Inscrições */}
          {editalSelecionado && (
            <section
              ref={listaSectionRef}
              className="inscricoes-list-section"
              style={tourFromUrl === "lista" ? { outline: "2px solid #34d399", borderRadius: "12px" } : undefined}
            >
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Carregando inscrições...</p>
                </div>
              ) : inscricoesFiltradas.length === 0 ? (
                <div className="empty-state">
                  <FileText className="w-12 h-12 text-gray-400" />
                  <h3>Nenhuma inscrição encontrada</h3>
                  <p>
                    {termoBusca || filtroStatus !== "todos" || filtroSituacaoSolicitacao !== "todos"
                      ? "Nenhuma inscrição corresponde aos filtros aplicados."
                      : "Não há inscrições para este edital no momento."}
                  </p>
                </div>
              ) : (
                <div className="inscricoes-table-container">
                  <table className="inscricoes-table">
                    <thead>
                      <tr>
                        <th>Matrícula</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Curso</th>
                        <th>Campus</th>
                        <th>Data Inscrição</th>
                        <th title="Análise da inscrição (documentos / parecer)">Análise</th>
                        <th title="Homologação do benefício no edital (vaga)">Benefício</th>
                        <th title="Pontuação da calculadora inteligente (respostas validadas)">Pontuação</th>
                        <th style={{ width: "20px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscricoesFiltradas.map((inscricao, index) => (
                        (() => {
                          const situacaoSolicitacao = resolveSituacaoSolicitacao(inscricao);
                          const statusVisual =
                            situacaoSolicitacao === "DESISTENTE"
                              ? "DESISTENTE"
                              : (inscricao.status_inscricao || "PENDENTE");
                          return (
                        <tr
                          key={inscricao.inscricao_id || index}
                          onClick={() => handleVerDetalhes(inscricao)}
                          style={{ cursor: "pointer" }}
                          className="table-row-clickable"
                        >
                          <td>
                            <span className="matricula-badge">{inscricao.matricula || "N/A"}</span>
                          </td>
                          <td>
                            <div className="nome-cell">
                              <User className="w-4 h-4" />
                              <span>{inscricao.nome || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="email-cell">
                              <Mail className="w-4 h-4" />
                              <span>{inscricao.email || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="curso-cell">
                              <BookOpen className="w-4 h-4" />
                              <span>{inscricao.curso || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="campus-cell">
                              <MapPin className="w-4 h-4" />
                              <span>{inscricao.campus || "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="data-cell">
                              <Calendar className="w-4 h-4" />
                              <span>{inscricao.data_inscricao ? new Date(inscricao.data_inscricao).toLocaleDateString("pt-BR") : "N/A"}</span>
                            </div>
                          </td>
                          <td>
                            <div className={getStatusBadgeClass(statusVisual)}>
                              {getStatusLabel(statusVisual)}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: inscricao.status_beneficio_edital?.includes("Beneficiário")
                                  ? "#047857"
                                  : inscricao.status_beneficio_edital?.includes("Não")
                                    ? "#b91c1c"
                                    : "#64748b",
                              }}
                              title={inscricao.beneficio_nome ? `Vaga: ${inscricao.beneficio_nome}` : undefined}
                            >
                              {inscricao.status_beneficio_edital?.replace(" no edital", "") || "Pendente seleção"}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#1e3a8a",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {Number(inscricao.pontuacao_validada ?? 0).toFixed(2)} /{" "}
                              {Number(inscricao.pontuacao_maxima ?? 0).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <ChevronRight className="w-5 h-5" style={{ color: "#64748b" }} />
                          </td>
                        </tr>
                          );
                        })()
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    <span>
                      Mostrando {inscricoesFiltradas.length} de {totalItens} inscrição
                      {totalItens !== 1 ? "ões" : ""}
                    </span>
                    <div className="table-footer-pagination">
                      <button
                        type="button"
                        className="inscricoes-pagination-btn"
                        onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                        disabled={paginaAtual <= 1 || isLoading}
                      >
                        Anterior
                      </button>
                      <span className="inscricoes-pagination-info">
                        Página {paginaAtual} de {Math.max(1, totalPaginas)}
                      </span>
                      <button
                        type="button"
                        className="inscricoes-pagination-btn"
                        onClick={() =>
                          setPaginaAtual((prev) =>
                            Math.min(Math.max(1, totalPaginas), prev + 1),
                          )
                        }
                        disabled={paginaAtual >= totalPaginas || isLoading}
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "1200px",
              height: "85vh",
              position: "relative",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#64748b",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ✕
            </button>

            {/* Conteúdo do Modal */}
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 0,
                  marginBottom: 16,
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <h2 style={{ margin: 0, color: "#1e293b" }}>Detalhes da Inscrição</h2>
                  {inscricaoSelecionada ? (
                    <span style={{ fontSize: 12, color: "#1e3a8a", fontWeight: 700 }}>
                      Pontuação: {Number(inscricaoSelecionada.pontuacao_validada ?? 0).toFixed(2)} /{" "}
                      {Number(inscricaoSelecionada.pontuacao_maxima ?? 0).toFixed(2)}
                    </span>
                  ) : null}
                </div>
                {inscricaoSelecionada?.inscricao_id && (
                  <button
                    type="button"
                    onClick={() =>
                      void baixarPdfDaInscricao(inscricaoSelecionada.inscricao_id)
                    }
                    title="Baixa um PDF com os dados da inscrição e todas as respostas."
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 6,
                      border: "1px solid #c7d2fe",
                      background: "#eef2ff",
                      color: "#1e3a8a",
                      cursor: "pointer",
                      fontSize: 13,
                      marginRight: 36,
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Gerar PDF da inscrição
                  </button>
                )}
              </div>

              {/* Abas */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0" }}>
                <button
                  onClick={() => setAbaAtiva("questionarios")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: abaAtiva === "questionarios" ? "3px solid #3b82f6" : "3px solid transparent",
                    color: abaAtiva === "questionarios" ? "#3b82f6" : "#64748b",
                    fontWeight: abaAtiva === "questionarios" ? "600" : "400",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.2s",
                  }}
                >
                  Questionários
                </button>
                <button
                  onClick={() => setAbaAtiva("informacoes")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: abaAtiva === "informacoes" ? "3px solid #3b82f6" : "3px solid transparent",
                    color: abaAtiva === "informacoes" ? "#3b82f6" : "#64748b",
                    fontWeight: abaAtiva === "informacoes" ? "600" : "400",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.2s",
                  }}
                >
                  Informações Gerais
                </button>
              </div>

              {/* Conteúdo das Abas */}
              <div style={{ flex: 1, overflow: "auto", paddingRight: "8px" }}>
                {abaAtiva === "questionarios" ? (
                  <div>
                    {/* Grid de Questionários */}
                    {isLoadingModal ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        <div className="loading-spinner" style={{ margin: "0 auto 16px" }}></div>
                        <p>Carregando dados...</p>
                      </div>
                    ) : !stepsCompletos?.steps?.length ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                        <FileText style={{ width: "48px", height: "48px", margin: "0 auto 16px", opacity: 0.5 }} />
                        <p>Nenhum questionário disponível.</p>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}
                        >
                          {stepsCompletos.steps.map((stepItem) => (
                            <div
                              key={stepItem.step.id}
                              onClick={() => setQuestionarioSelecionado(stepItem.step.id)}
                              style={{
                                backgroundColor: "white",
                                border: questionarioSelecionado === stepItem.step.id ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "16px",
                                cursor: "pointer",
                                boxShadow:
                                  questionarioSelecionado === stepItem.step.id ? "0 4px 6px rgba(59, 130, 246, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                if (questionarioSelecionado !== stepItem.step.id) {
                                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (questionarioSelecionado !== stepItem.step.id) {
                                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                                }
                              }}
                            >
                              {/* Chip de Status - Agora usando o status real da API */}
                              <div style={{ marginBottom: "12px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    ...getStatusStepStyle(stepItem.status),
                                  }}
                                >
                                  {getStatusStepLabel(stepItem.status)}
                                </span>
                              </div>

                              {/* Título do Questionário */}
                              <h4
                                style={{
                                  margin: "0 0 8px 0",
                                  color: "#1e293b",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  lineHeight: "1.4",
                                }}
                              >
                                {stepItem.step.texto || "Questionário"}
                              </h4>

                              {/* Info */}
                              <div style={{ fontSize: "12px", color: "#64748b", display: "flex", flexDirection: "column", gap: "4px" }}>
                                <span>
                                  {stepItem.perguntas?.length || 0} pergunta{stepItem.perguntas?.length !== 1 ? "s" : ""}
                                </span>
                                <span>
                                  Pendências: {Number(stepItem.pendencias?.totalPendentes ?? 0)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Lista de Perguntas do Questionário Selecionado */}
                        {questionarioSelecionado &&
                          (() => {
                            const stepAtual = stepsCompletos?.steps?.find((s) => s.step.id === questionarioSelecionado);
                            const totalConfiguradoStep = Number(
                              (stepAtual?.perguntas ?? []).reduce((acc, item) => {
                                return acc + Number(item?.pergunta?.pontuacao_validacao ?? 0);
                              }, 0),
                            );
                            const totalValidadoStep = Number(
                              (stepAtual?.perguntas ?? []).reduce((acc, item) => {
                                const pontos = calcularPontuacaoPergunta(
                                  item.pergunta,
                                  item.resposta,
                                );
                                return acc + pontos.ganho;
                              }, 0),
                            );
                            return (
                              <div style={{ marginBottom: "32px" }}>
                                <div
                                  style={{
                                    marginBottom: "12px",
                                    padding: "10px 12px",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "10px",
                                    background: "#eff6ff",
                                    color: "#1e3a8a",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "8px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                  }}
                                >
                                  <span>Calculadora inteligente (questionário selecionado)</span>
                                  <span>
                                    Pontos validados: {totalValidadoStep.toFixed(2)} /{" "}
                                    {totalConfiguradoStep.toFixed(2)}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "12px",
                                    marginBottom: "16px",
                                  }}
                                >
                                  <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "600" }}>Perguntas</h3>
                                </div>

                                {stepAtual?.perguntas?.length ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {stepAtual.perguntas.map((item) => {
                                      const perguntaInfo = item.pergunta;
                                      const respostaInfo = item.resposta;
                                      const obrigatoria = perguntaInfo?.obrigatoriedade ? "Sim" : "Não";
                                      const valorOpcoes = respostaInfo?.valorOpcoes?.length ? respostaInfo.valorOpcoes.join(", ") : null;
                                      const valorTexto =
                                        (respostaInfo?.valorTexto && respostaInfo.valorTexto.trim().length > 0 ? respostaInfo.valorTexto : null) ||
                                        (respostaInfo?.texto && respostaInfo.texto.trim().length > 0 ? respostaInfo.texto : null);
                                      const respostaConteudo = valorOpcoes || valorTexto;
                                      const isValidandoResposta = respostaInfo?.id ? validandoRespostas[respostaInfo.id] : false;
                                      const isDado = !!perguntaInfo?.dado;
                                      const dadoNome = perguntaInfo?.dado?.nome || null;
                                      const pontosPergunta = calcularPontuacaoPergunta(
                                        perguntaInfo,
                                        respostaInfo,
                                      );

                                      // Nova pergunta aguardando resposta do aluno
                                      const aguardandoNovaPergunta = respostaInfo?.aguardandoRespostaNovaPergunta === true;
                                      const prazoNovaPergunta = respostaInfo?.prazoRespostaNovaPergunta;

                                      // Determinar status detalhado da resposta
                                      const respostaValidada = respostaInfo?.validada === true;
                                      const respostaInvalidadaComReenvio = respostaInfo?.invalidada === true && respostaInfo?.requerReenvio === true;
                                      const respostaInvalidadaSemReenvio = respostaInfo?.invalidada === true && !respostaInfo?.requerReenvio;
                                      // Prazo vencido: invalidada sem requerReenvio, MAS com parecer e prazoReenvio preenchidos
                                      const respostaInvalidadaPrazoVencido =
                                        respostaInvalidadaSemReenvio && !!respostaInfo?.parecer && !!respostaInfo?.prazoReenvio;
                                      // Definitivamente invalidada: invalidada sem requerReenvio, sem parecer e sem prazo
                                      const respostaInvalidadaDefinitiva =
                                        respostaInvalidadaSemReenvio && !respostaInfo?.parecer && !respostaInfo?.prazoReenvio;
                                      const respostaInvalidada = respostaInvalidadaComReenvio || respostaInvalidadaSemReenvio;

                                      let chipLabel: string;
                                      let chipStyle: React.CSSProperties;

                                      if (aguardandoNovaPergunta) {
                                        chipLabel = "⏳ Aguardando Complemento";
                                        chipStyle = { backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" };
                                      } else if (!respostaInfo) {
                                        chipLabel = "Sem resposta";
                                        chipStyle = { backgroundColor: "#e2e8f0", border: "1px solid #cbd5e1", color: "#475569" };
                                      } else if (respostaValidada) {
                                        chipLabel = "✓ Validada";
                                        chipStyle = { backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", color: "#15803d" };
                                      } else if (respostaInvalidadaComReenvio) {
                                        chipLabel = "Correção solicitada";
                                        chipStyle = { backgroundColor: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c" };
                                      } else if (respostaInvalidadaPrazoVencido) {
                                        chipLabel = "⚠ Prazo vencido";
                                        chipStyle = { backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" };
                                      } else if (respostaInvalidadaDefinitiva) {
                                        chipLabel = "✗ Invalidada";
                                        chipStyle = { backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" };
                                      } else {
                                        chipLabel = "Pendente";
                                        chipStyle = { backgroundColor: "#fef3c7", border: "1px solid #fde68a", color: "#92400e" };
                                      }

                                      return (
                                        <div
                                          key={perguntaInfo?.id || `${perguntaInfo?.pergunta}-${perguntaInfo?.tipo_Pergunta}`}
                                          style={{
                                            backgroundColor: "white",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            padding: "16px",
                                          }}
                                        >
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                                            <h4
                                              style={{
                                                margin: "0",
                                                color: "#1e293b",
                                                fontSize: "15px",
                                                fontWeight: "600",
                                                lineHeight: "1.5",
                                                flex: 1,
                                              }}
                                            >
                                              {perguntaInfo?.pergunta || "Pergunta"}
                                            </h4>
                                            <span
                                              style={{
                                                ...chipStyle,
                                                padding: "6px 10px",
                                                borderRadius: "999px",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                lineHeight: 1.2,
                                              }}
                                            >
                                              {chipLabel}
                                            </span>
                                          </div>

                                          {/* Informações Adicionais */}
                                          <div style={{ fontSize: "13px", color: "#64748b", display: "flex", gap: "16px", marginBottom: "12px" }}>
                                            <span>Obrigatória: {obrigatoria}</span>
                                            {pontosPergunta.peso > 0 ? (
                                              <>
                                                <span>•</span>
                                                <span>
                                                  Pontos: {pontosPergunta.ganho.toFixed(2)} /{" "}
                                                  {pontosPergunta.peso.toFixed(2)}
                                                </span>
                                              </>
                                            ) : null}
                                          </div>

                                          {/* Card especial: nova pergunta aguardando resposta do aluno */}
                                          {aguardandoNovaPergunta ? (
                                            <div
                                              style={{
                                                marginTop: "8px",
                                                padding: "16px",
                                                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                                                border: "1px solid #93c5fd",
                                                borderRadius: "10px",
                                              }}
                                            >
                                              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                                <div
                                                  style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    borderRadius: "8px",
                                                    background: "#3b82f6",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "white",
                                                    fontSize: "16px",
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  🕐
                                                </div>
                                                <div>
                                                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>
                                                    Nova pergunta — Aguardando resposta do aluno
                                                  </div>
                                                  <div style={{ fontSize: "12px", color: "#3b82f6", marginTop: "2px" }}>
                                                    Esta pergunta foi adicionada ao questionário após a inscrição do aluno.
                                                  </div>
                                                </div>
                                              </div>

                                              {prazoNovaPergunta && (
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    padding: "10px 14px",
                                                    background: "white",
                                                    borderRadius: "8px",
                                                    border: "1px solid #bfdbfe",
                                                  }}
                                                >
                                                  <Calendar style={{ width: "15px", height: "15px", color: "#2563eb", flexShrink: 0 }} />
                                                  <div style={{ fontSize: "13px", color: "#1e3a5f" }}>
                                                    <span style={{ fontWeight: 600 }}>Prazo para resposta: </span>
                                                    {new Date(prazoNovaPergunta).toLocaleDateString("pt-BR", {
                                                      day: "2-digit",
                                                      month: "long",
                                                      year: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    })}
                                                    {(() => {
                                                      const agora = new Date();
                                                      const prazo = new Date(prazoNovaPergunta);
                                                      const diffMs = prazo.getTime() - agora.getTime();
                                                      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                                      if (diffDias < 0) {
                                                        return (
                                                          <span style={{ color: "#dc2626", fontWeight: 600, marginLeft: "8px" }}>
                                                            (vencido há {Math.abs(diffDias)} dia{Math.abs(diffDias) !== 1 ? "s" : ""})
                                                          </span>
                                                        );
                                                      } else if (diffDias === 0) {
                                                        return (
                                                          <span style={{ color: "#ea580c", fontWeight: 600, marginLeft: "8px" }}>
                                                            (vence hoje)
                                                          </span>
                                                        );
                                                      } else if (diffDias <= 3) {
                                                        return (
                                                          <span style={{ color: "#ea580c", fontWeight: 600, marginLeft: "8px" }}>
                                                            (falta{diffDias !== 1 ? "m" : ""} {diffDias} dia{diffDias !== 1 ? "s" : ""})
                                                          </span>
                                                        );
                                                      } else {
                                                        return (
                                                          <span style={{ color: "#64748b", marginLeft: "8px" }}>
                                                            ({diffDias} dias restantes)
                                                          </span>
                                                        );
                                                      }
                                                    })()}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Botão: Definir novo prazo (quando o prazo expirou) */}
                                              {podeAnalisarInscricoes &&
                                                prazoNovaPergunta &&
                                                new Date(prazoNovaPergunta).getTime() < Date.now() && (
                                                <div style={{ marginTop: "10px" }}>
                                                  <button
                                                    onClick={() =>
                                                      abrirModalReabrirComplemento(
                                                        respostaInfo?.id || "",
                                                        perguntaInfo?.pergunta || "Pergunta"
                                                      )
                                                    }
                                                    style={{
                                                      padding: "8px 16px",
                                                      backgroundColor: "#2563eb",
                                                      color: "white",
                                                      border: "none",
                                                      borderRadius: "8px",
                                                      cursor: "pointer",
                                                      fontWeight: 600,
                                                      fontSize: "13px",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: "6px",
                                                      transition: "background-color 0.2s",
                                                      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                                                  >
                                                    🔄 Definir novo prazo
                                                  </button>
                                                </div>
                                              )}

                                              {!respostaConteudo && (
                                                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "10px", fontStyle: "italic" }}>
                                                  O aluno ainda não enviou sua resposta para esta pergunta.
                                                </div>
                                              )}

                                              {respostaConteudo && (
                                                <div
                                                  style={{
                                                    marginTop: "10px",
                                                    padding: "10px 14px",
                                                    background: "#f0fdf4",
                                                    borderRadius: "8px",
                                                    border: "1px solid #bbf7d0",
                                                  }}
                                                >
                                                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#166534", marginBottom: "4px" }}>
                                                    Resposta enviada:
                                                  </div>
                                                  <div style={{ fontSize: "14px", color: "#15803d" }}>{respostaConteudo}</div>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <>
                                          {/* Resposta */}
                                          {respostaConteudo ? (
                                            <div
                                              style={{
                                                padding: "12px",
                                                backgroundColor: respostaInvalidada
                                                  ? "#fefce8"
                                                  : isDado
                                                    ? "#f5f3ff"
                                                    : "#f0fdf4",
                                                border: respostaInvalidada
                                                  ? "1px solid #fde68a"
                                                  : isDado
                                                    ? "1px solid #c4b5fd"
                                                    : "1px solid #bbf7d0",
                                                borderRadius: "6px",
                                                marginTop: "8px",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent: "space-between",
                                                  alignItems: "center",
                                                  marginBottom: "4px",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    color: respostaInvalidada ? "#854d0e" : isDado ? "#5b21b6" : "#166534",
                                                  }}
                                                >
                                                  Resposta:
                                                </div>
                                                {podeAnalisarInscricoes && respostaInfo?.id && (
                                                  <button
                                                    onClick={() => abrirConfirmacaoEdicao(respostaInfo.id!, perguntaInfo!, respostaConteudo || "")}
                                                    title="Editar resposta"
                                                    style={{
                                                      background: "none",
                                                      border: "none",
                                                      cursor: "pointer",
                                                      padding: "2px 4px",
                                                      borderRadius: "4px",
                                                      display: "flex",
                                                      alignItems: "center",
                                                      color: "#64748b",
                                                      transition: "color 0.2s, background-color 0.2s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.currentTarget.style.color = "#2563eb";
                                                      e.currentTarget.style.backgroundColor = "#eff6ff";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.currentTarget.style.color = "#64748b";
                                                      e.currentTarget.style.backgroundColor = "transparent";
                                                    }}
                                                  >
                                                    <Pencil style={{ width: "14px", height: "14px" }} />
                                                  </button>
                                                )}
                                              </div>
                                              <div style={{ fontSize: "14px", color: respostaInvalidada ? "#713f12" : isDado ? "#4c1d95" : "#15803d" }}>
                                                {respostaConteudo}
                                              </div>

                                              {isDado && dadoNome && (
                                                <div
                                                  style={{
                                                    marginTop: "8px",
                                                    padding: "8px 12px",
                                                    backgroundColor: "#ede9fe",
                                                    borderRadius: "6px",
                                                    border: "1px solid #c4b5fd",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                  }}
                                                >
                                                  <span style={{ fontSize: "14px", flexShrink: 0 }}>🔗</span>
                                                  <div style={{ fontSize: "12px", color: "#5b21b6", lineHeight: 1.4 }}>
                                                    <strong>Dado: {dadoNome}</strong> — Ao validar esta resposta, o valor será vinculado ao histórico de dados do aluno.
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ) : respostaInfo?.urlArquivo ? (
                                            /* Card de documento/arquivo */
                                            (() => {
                                              const nomeArq = extrairNomeArquivo(respostaInfo.urlArquivo!);
                                              const ext = getExtensaoArquivo(nomeArq);
                                              const isImagem = isImagemExtensao(ext);
                                              const isPdf = isPdfExtensao(ext);
                                              return (
                                                <div
                                                  style={{
                                                    padding: "14px",
                                                    backgroundColor: respostaInvalidada ? "#fefce8" : "#f0f9ff",
                                                    border: respostaInvalidada ? "1px solid #fde68a" : "1px solid #bae6fd",
                                                    borderRadius: "8px",
                                                    marginTop: "8px",
                                                  }}
                                                >
                                                  <div style={{ fontSize: "12px", fontWeight: 600, color: respostaInvalidada ? "#854d0e" : "#0369a1", marginBottom: "10px" }}>
                                                    Documento enviado:
                                                  </div>

                                                  {/* Preview do arquivo */}
                                                  <div
                                                    onClick={() => abrirVisualizadorDocumento(respostaInfo.urlArquivo!)}
                                                    style={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: "12px",
                                                      padding: "12px",
                                                      background: "white",
                                                      borderRadius: "8px",
                                                      border: "1px solid #e0f2fe",
                                                      cursor: "pointer",
                                                      transition: "all 0.2s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.currentTarget.style.borderColor = "#7dd3fc";
                                                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(14, 165, 233, 0.15)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.currentTarget.style.borderColor = "#e0f2fe";
                                                      e.currentTarget.style.boxShadow = "none";
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        width: "48px",
                                                        height: "48px",
                                                        borderRadius: "10px",
                                                        background: isPdf
                                                          ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                                                          : isImagem
                                                            ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                                                            : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontSize: "13px",
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                        textTransform: "uppercase",
                                                      }}
                                                    >
                                                      {ext || <FileText style={{ width: "20px", height: "20px" }} />}
                                                    </div>

                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                      <div
                                                        style={{
                                                          fontSize: "14px",
                                                          fontWeight: 600,
                                                          color: "#0c4a6e",
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                          whiteSpace: "nowrap",
                                                        }}
                                                      >
                                                        {nomeArq}
                                                      </div>
                                                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                                        {isPdf ? "Documento PDF" : isImagem ? "Imagem" : `Arquivo .${ext}`}
                                                        {" · Clique para visualizar"}
                                                      </div>
                                                    </div>

                                                    <Eye style={{ width: "18px", height: "18px", color: "#0ea5e9", flexShrink: 0 }} />
                                                  </div>

                                                  {/* Botões de ação */}
                                                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                                                    <button
                                                      onClick={() => abrirVisualizadorDocumento(respostaInfo.urlArquivo!)}
                                                      style={{
                                                        padding: "7px 14px",
                                                        backgroundColor: "#0ea5e9",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontWeight: 600,
                                                        fontSize: "12px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                        transition: "background-color 0.2s",
                                                      }}
                                                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
                                                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0ea5e9")}
                                                    >
                                                      <Eye style={{ width: "13px", height: "13px" }} /> Visualizar
                                                    </button>
                                                    <button
                                                      onClick={() => baixarDocumento(respostaInfo.urlArquivo!)}
                                                      style={{
                                                        padding: "7px 14px",
                                                        backgroundColor: "white",
                                                        color: "#0369a1",
                                                        border: "1px solid #bae6fd",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontWeight: 600,
                                                        fontSize: "12px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                        transition: "all 0.2s",
                                                      }}
                                                      onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f0f9ff";
                                                        e.currentTarget.style.borderColor = "#7dd3fc";
                                                      }}
                                                      onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "white";
                                                        e.currentTarget.style.borderColor = "#bae6fd";
                                                      }}
                                                    >
                                                      <Download style={{ width: "13px", height: "13px" }} /> Salvar
                                                    </button>
                                                  </div>

                                                  {isDado && dadoNome && (
                                                    <div
                                                      style={{
                                                        marginTop: "10px",
                                                        padding: "8px 12px",
                                                        backgroundColor: "#ede9fe",
                                                        borderRadius: "6px",
                                                        border: "1px solid #c4b5fd",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                      }}
                                                    >
                                                      <span style={{ fontSize: "14px", flexShrink: 0 }}>🔗</span>
                                                      <div style={{ fontSize: "12px", color: "#5b21b6", lineHeight: 1.4 }}>
                                                        <strong>Dado: {dadoNome}</strong> — Ao validar, o valor será vinculado ao histórico de dados do aluno.
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })()
                                          ) : (
                                            <div
                                              style={{
                                                padding: "12px",
                                                backgroundColor: "#fef2f2",
                                                border: "1px solid #fecaca",
                                                borderRadius: "6px",
                                                marginTop: "8px",
                                              }}
                                            >
                                              <div style={{ fontSize: "13px", color: "#991b1b", fontStyle: "italic" }}>Usuário não respondeu</div>
                                            </div>
                                          )}

                                          {/* Parecer e prazo (quando invalidado com solicitação de reenvio) */}
                                          {respostaInvalidadaComReenvio && respostaInfo?.parecer && (
                                            <div
                                              style={{
                                                padding: "12px",
                                                backgroundColor: "#fff7ed",
                                                border: "1px solid #fed7aa",
                                                borderRadius: "6px",
                                                marginTop: "8px",
                                              }}
                                            >
                                              <div style={{ fontSize: "12px", fontWeight: "600", color: "#c2410c", marginBottom: "4px" }}>
                                                Parecer da avaliação:
                                              </div>
                                              <div style={{ fontSize: "14px", color: "#9a3412", marginBottom: "8px" }}>{respostaInfo.parecer}</div>
                                              {respostaInfo.prazoReenvio && (
                                                <div
                                                  style={{ fontSize: "12px", color: "#c2410c", display: "flex", alignItems: "center", gap: "4px" }}
                                                >
                                                  <Calendar style={{ width: "14px", height: "14px" }} />
                                                  Prazo para reenvio: {new Date(respostaInfo.prazoReenvio).toLocaleDateString("pt-BR")}
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Info de invalidação por prazo vencido */}
                                          {respostaInvalidadaPrazoVencido && (
                                            <div
                                              style={{
                                                padding: "12px",
                                                backgroundColor: "#fef2f2",
                                                border: "1px solid #fca5a5",
                                                borderRadius: "8px",
                                                marginTop: "8px",
                                              }}
                                            >
                                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "14px" }}>⚠️</span>
                                                <div style={{ fontSize: "13px", color: "#991b1b", fontWeight: "600" }}>
                                                  Invalidada — prazo de correção vencido
                                                </div>
                                              </div>
                                              <div style={{ fontSize: "12px", color: "#b91c1c", marginBottom: "4px" }}>
                                                O aluno não reenviou a resposta dentro do prazo estipulado.
                                              </div>
                                              <div style={{ fontSize: "12px", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Calendar style={{ width: "13px", height: "13px" }} />
                                                Prazo vencido em: {new Date(respostaInfo.prazoReenvio!).toLocaleDateString("pt-BR")}
                                              </div>
                                              {respostaInfo.parecer && (
                                                <div style={{ fontSize: "12px", color: "#9a3412", marginTop: "6px", fontStyle: "italic" }}>
                                                  Parecer: {respostaInfo.parecer}
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Info de invalidação definitiva (sem parecer/prazo) */}
                                          {respostaInvalidadaDefinitiva && (
                                            <div
                                              style={{
                                                padding: "12px",
                                                backgroundColor: "#fef2f2",
                                                border: "1px solid #fecaca",
                                                borderRadius: "6px",
                                                marginTop: "8px",
                                              }}
                                            >
                                              <div style={{ fontSize: "13px", color: "#991b1b", fontWeight: "500" }}>
                                                Resposta invalidada definitivamente — reenvio não permitido.
                                              </div>
                                            </div>
                                          )}

                                          {/* Ações de validação */}
                                          <div
                                            style={{
                                              marginTop: "12px",
                                              display: "flex",
                                              justifyContent: "flex-end",
                                              alignItems: "center",
                                              gap: "8px",
                                            }}
                                          >
                                            {!podeAnalisarInscricoes ? (
                                              <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", marginRight: "auto" }}>
                                                Validação e correção de respostas: perfil técnico ou gerencial.
                                              </span>
                                            ) : null}
                                            {podeAnalisarInscricoes && respostaInfo?.id && (
                                              <>
                                                {respostaInvalidadaComReenvio ? (
                                                  /* Quando já está aguardando reenvio: campo para alterar prazo */
                                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "auto" }}>
                                                    <label style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", fontWeight: 500 }}>
                                                      Alterar prazo:
                                                    </label>
                                                    <input
                                                      type="date"
                                                      defaultValue={respostaInfo.prazoReenvio ? respostaInfo.prazoReenvio.split("T")[0] : ""}
                                                      min={new Date().toISOString().split("T")[0]}
                                                      onChange={(e) => {
                                                        if (e.target.value && respostaInfo.id) {
                                                          alterarPrazoReenvio(respostaInfo.id, e.target.value, respostaInfo.parecer || undefined);
                                                        }
                                                      }}
                                                      disabled={isValidandoResposta}
                                                      style={{
                                                        padding: "6px 10px",
                                                        border: "1px solid #d1d5db",
                                                        borderRadius: "6px",
                                                        fontSize: "13px",
                                                        fontFamily: "inherit",
                                                        outline: "none",
                                                        cursor: isValidandoResposta ? "not-allowed" : "pointer",
                                                        opacity: isValidandoResposta ? 0.6 : 1,
                                                      }}
                                                    />
                                                  </div>
                                                ) : respostaInvalidadaPrazoVencido ? (
                                                  /* Prazo vencido: botão para RE-solicitar correção */
                                                  <button
                                                    onClick={() => respostaInfo.id && abrirModalInvalidar(respostaInfo.id, perguntaInfo?.pergunta)}
                                                    disabled={isValidandoResposta}
                                                    style={{
                                                      padding: "8px 12px",
                                                      backgroundColor: isValidandoResposta ? "#cbd5e1" : "#ea580c",
                                                      color: isValidandoResposta ? "#64748b" : "#ffffff",
                                                      border: "none",
                                                      borderRadius: "6px",
                                                      cursor: isValidandoResposta ? "not-allowed" : "pointer",
                                                      fontWeight: 600,
                                                      fontSize: "13px",
                                                      boxShadow: isValidandoResposta ? "none" : "0 2px 6px rgba(234, 88, 12, 0.3)",
                                                      transition: "background-color 0.2s, transform 0.1s",
                                                    }}
                                                  >
                                                    {isValidandoResposta ? "Processando..." : "Resolicitar correção"}
                                                  </button>
                                                ) : respostaInvalidadaDefinitiva ? (
                                                  /* Invalidada definitiva: botão para solicitar correção (laranja) */
                                                  <button
                                                    onClick={() => respostaInfo.id && abrirModalInvalidar(respostaInfo.id, perguntaInfo?.pergunta)}
                                                    disabled={isValidandoResposta}
                                                    style={{
                                                      padding: "8px 12px",
                                                      backgroundColor: isValidandoResposta ? "#cbd5e1" : "#ea580c",
                                                      color: isValidandoResposta ? "#64748b" : "#ffffff",
                                                      border: "none",
                                                      borderRadius: "6px",
                                                      cursor: isValidandoResposta ? "not-allowed" : "pointer",
                                                      fontWeight: 600,
                                                      fontSize: "13px",
                                                      boxShadow: isValidandoResposta ? "none" : "0 2px 6px rgba(234, 88, 12, 0.3)",
                                                      transition: "background-color 0.2s, transform 0.1s",
                                                    }}
                                                  >
                                                    {isValidandoResposta ? "Processando..." : "Solicitar correção"}
                                                  </button>
                                                ) : (
                                                  /* Botão Invalidar - fundo vermelho forte, texto claro */
                                                  <button
                                                    onClick={() => respostaInfo.id && abrirModalInvalidar(respostaInfo.id, perguntaInfo?.pergunta)}
                                                    disabled={isValidandoResposta}
                                                    style={{
                                                      padding: "8px 12px",
                                                      backgroundColor: isValidandoResposta ? "#cbd5e1" : "#dc2626",
                                                      color: isValidandoResposta ? "#64748b" : "#ffffff",
                                                      border: "none",
                                                      borderRadius: "6px",
                                                      cursor: isValidandoResposta ? "not-allowed" : "pointer",
                                                      fontWeight: 600,
                                                      fontSize: "13px",
                                                      boxShadow: isValidandoResposta ? "none" : "0 2px 6px rgba(220, 38, 38, 0.3)",
                                                      transition: "background-color 0.2s, transform 0.1s",
                                                    }}
                                                  >
                                                    {isValidandoResposta ? "Processando..." : "Invalidar"}
                                                  </button>
                                                )}
                                                {!respostaValidada && (
                                                  <button
                                                    onClick={() => respostaInfo.id && abrirModalValidar(respostaInfo.id, perguntaInfo?.pergunta)}
                                                    disabled={isValidandoResposta}
                                                    style={{
                                                      padding: "8px 12px",
                                                      backgroundColor: isValidandoResposta ? "#cbd5e1" : "#2563eb",
                                                      color: "white",
                                                      border: "none",
                                                      borderRadius: "6px",
                                                      cursor: isValidandoResposta ? "not-allowed" : "pointer",
                                                      fontWeight: 600,
                                                      fontSize: "13px",
                                                      boxShadow: isValidandoResposta ? "none" : "0 2px 6px rgba(37, 99, 235, 0.25)",
                                                      transition: "background-color 0.2s, transform 0.1s",
                                                    }}
                                                  >
                                                    {isValidandoResposta ? "Validando..." : "Validar"}
                                                  </button>
                                                )}
                                              </>
                                            )}
                                            {!respostaInfo?.id && (
                                              <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>
                                                Sem resposta para avaliar
                                              </span>
                                            )}
                                          </div>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                    <FileText style={{ width: "48px", height: "48px", margin: "0 auto 16px", opacity: 0.5 }} />
                                    <p>Nenhuma pergunta encontrada neste questionário.</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "8px 4px 24px",
                      textAlign: "left",
                    }}
                  >
                    {inscricaoSelecionada && (() => {
                      const alunoInfo = mergeAlunoInformacoesGerais(inscricaoSelecionada, stepsCompletos?.aluno);
                      const idInsc = String(inscricaoSelecionada.inscricao_id || "").trim();
                      const fmtIngresso = (v: string) => {
                        const t = v?.trim();
                        if (!t) return "—";
                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) return t;
                        return formatDataHoraOuDataBr(t);
                      };
                      return (
                      <>
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                          Informações Gerais
                        </h3>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                            gap: "12px 20px",
                            marginBottom: "24px",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Edital</div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px" }}>
                              {stepsCompletos?.edital?.titulo_edital ||
                                stepsCompletos?.edital?.titulo ||
                                editalSelecionado?.titulo_edital ||
                                "—"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Inscrição</div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px" }}>
                              {idInsc ? `#${idInsc}` : "—"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Análise da inscrição
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              <span className={getStatusBadgeClass(inscricaoSelecionada.status_inscricao)}>
                                {getStatusLabel(inscricaoSelecionada.status_inscricao)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Situação da solicitação
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              {(() => {
                                const situacaoAtual = resolveSituacaoSolicitacao(inscricaoSelecionada);
                                return (
                              <span
                                className={getStatusBadgeClass(
                                      situacaoAtual,
                                )}
                              >
                                {getStatusLabel(
                                      situacaoAtual,
                                )}
                              </span>
                                );
                              })()}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Benefício no edital
                            </div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px", fontWeight: 600 }}>
                              {inscricaoSelecionada.status_beneficio_edital || "Homologação pendente"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Publicação do resultado
                            </div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px", fontWeight: 600 }}>
                              {inscricaoSelecionada.resultado_fase || "Nao publicado"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Recurso
                            </div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px", fontWeight: 600 }}>
                              {inscricaoSelecionada.recurso_status || "Sem recurso"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Vaga / benefício</div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px" }}>
                              {inscricaoSelecionada.beneficio_nome || "—"}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Data da inscrição</div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px" }}>
                              {formatDataHoraOuDataBr(inscricaoSelecionada.data_inscricao)}
                            </div>
                          </div>
                        </div>

                        {somenteConsulta ? (
                          <div
                            style={{
                              marginBottom: "24px",
                              padding: "12px 14px",
                              background: "#f8fafc",
                              borderRadius: "10px",
                              border: "1px dashed #cbd5e1",
                              color: "#475569",
                              fontSize: "13px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Lock style={{ width: "16px", height: "16px" }} />
                            Perfil Coordenação — somente consulta. Análise e validação de respostas são feitas por perfis técnico ou gerencial.
                          </div>
                        ) : (
                        <div
                          style={{
                            marginBottom: "24px",
                            padding: "16px",
                            background: "#f0f9ff",
                            borderRadius: "10px",
                            border: "1px solid #bae6fd",
                          }}
                        >
                          <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 700, color: "#0c4a6e" }}>
                            Decisões PROAE (análise e benefício)
                          </h4>
                          <p style={{ margin: "0 0 18px 0", fontSize: "12px", color: "#0369a1", lineHeight: 1.45 }}>
                            Registre aqui o status da análise da inscrição e, quando couber, a situação do benefício no edital. O histórico abaixo é atualizado após salvar.
                          </p>

                          {/** Estilos compartilhados entre as duas subseções */}
                          {(() => {
                            const fieldMax = "480px";
                            const labelStyle: CSSProperties = {
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#64748b",
                              display: "block",
                              marginBottom: "6px",
                            };
                            const controlStyle: CSSProperties = {
                              width: "100%",
                              maxWidth: fieldMax,
                              padding: "8px 10px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              fontSize: "14px",
                              boxSizing: "border-box",
                            };
                            const subTitleStyle: CSSProperties = {
                              margin: "0 0 6px 0",
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#0c4a6e",
                            };
                            const hintStyle: CSSProperties = {
                              margin: "0 0 14px 0",
                              fontSize: "12px",
                              color: "#0369a1",
                              lineHeight: 1.45,
                            };
                            const saveBtnStyle = (loading: boolean): CSSProperties => ({
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              width: "100%",
                              maxWidth: fieldMax,
                              marginTop: "16px",
                              marginBottom: "4px",
                              padding: "10px 16px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#0284c7",
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: "13px",
                              cursor: loading ? "wait" : "pointer",
                              opacity: loading ? 0.88 : 1,
                              boxSizing: "border-box",
                            });
                            return (
                              <>
                                <div style={{ marginBottom: "20px" }}>
                                  <h5 style={subTitleStyle}>1. Análise da inscrição</h5>
                                  <p style={hintStyle}>
                                    Documentação, parecer e trâmite da inscrição — independente de ser beneficiário da vaga.
                                  </p>
                                  <div style={{ marginBottom: "12px" }}>
                                    <label style={labelStyle}>Status da inscrição (análise)</label>
                                    <select
                                      value={adminStatusDraft}
                                      onChange={(e) => setAdminStatusDraft(e.target.value)}
                                      disabled={salvandoAdminStatus}
                                      style={controlStyle}
                                    >
                                      {adminStatusOpcoesDisponiveis.map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                      {adminStatusDraft &&
                                      !ADMIN_STATUS_OPCOES.includes(adminStatusDraft as (typeof ADMIN_STATUS_OPCOES)[number]) ? (
                                        <option value={adminStatusDraft}>{adminStatusDraft} (valor atual)</option>
                                      ) : null}
                                    </select>
                                  </div>
                                  <div>
                                    <label style={labelStyle}>Observação / motivo (opcional, visível ao aluno)</label>
                                    <textarea
                                      value={adminObsDraft}
                                      onChange={(e) => setAdminObsDraft(e.target.value)}
                                      disabled={salvandoAdminStatus}
                                      rows={3}
                                      placeholder="Ex.: Ajuste solicitado pela comissão…"
                                      style={{ ...controlStyle, resize: "vertical", minHeight: "72px" }}
                                    />
                                  </div>
                                  <div
                                    style={{
                                      marginTop: "10px",
                                      padding: "10px",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "8px",
                                      background: "#f8fafc",
                                      maxWidth: fieldMax,
                                    }}
                                  >
                                    <label
                                      style={{
                                        ...labelStyle,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "6px",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={adminDesistenteDraft}
                                        disabled={salvandoAdminStatus}
                                        onChange={(e) => setAdminDesistenteDraft(e.target.checked)}
                                      />
                                      Marcar solicitação como desistente
                                    </label>
                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                      <button
                                        type="button"
                                        disabled={salvandoAdminStatus || adminDesistenteDraft}
                                        onClick={() => void toggleDesistenciaAdmin(true)}
                                        style={{
                                          padding: "7px 10px",
                                          borderRadius: "7px",
                                          border: "1px solid #fca5a5",
                                          background: "#fff1f2",
                                          color: "#9f1239",
                                          fontWeight: 600,
                                          fontSize: "12px",
                                          cursor: salvandoAdminStatus ? "wait" : "pointer",
                                        }}
                                      >
                                        Marcar desistente agora
                                      </button>
                                      <button
                                        type="button"
                                        disabled={salvandoAdminStatus || !adminDesistenteDraft}
                                        onClick={() => void toggleDesistenciaAdmin(false)}
                                        style={{
                                          padding: "7px 10px",
                                          borderRadius: "7px",
                                          border: "1px solid #cbd5e1",
                                          background: "#ffffff",
                                          color: "#334155",
                                          fontWeight: 600,
                                          fontSize: "12px",
                                          cursor: salvandoAdminStatus ? "wait" : "pointer",
                                        }}
                                      >
                                        Remover desistência
                                      </button>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void salvarStatusInscricaoAdmin()}
                                    disabled={salvandoAdminStatus}
                                    style={saveBtnStyle(salvandoAdminStatus)}
                                  >
                                    {salvandoAdminStatus ? (
                                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 0.8s linear infinite" }} />
                                    ) : (
                                      <Save style={{ width: "16px", height: "16px" }} />
                                    )}
                                    Salvar análise da inscrição
                                  </button>
                                </div>

                                {podeEditarBeneficioEdital ? (
                                  <div
                                    style={{
                                      paddingTop: "18px",
                                      paddingBottom: "20px",
                                      borderTop: "1px solid #bae6fd",
                                    }}
                                  >
                                    <h5 style={subTitleStyle}>2. Benefício no edital</h5>
                                    <p style={hintStyle}>
                                      Homologação como beneficiário da vaga — pode diferir do status da análise acima.
                                    </p>
                                    <div>
                                      <label style={labelStyle}>Situação do benefício</label>
                                      <select
                                        value={adminBeneficioDraft}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setAdminBeneficioDraft(value);
                                          if (value !== "Beneficiário no edital") {
                                            setAdminOverrideVagasDraft(false);
                                            setAdminOverrideJustificativaDraft("");
                                          }
                                        }}
                                        disabled={salvandoAdminBeneficio}
                                        style={controlStyle}
                                      >
                                        {adminBeneficioOpcoesDisponiveis.map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {adminBeneficioDraft === "Beneficiário no edital" ? (
                                      <div
                                        style={{
                                          marginTop: "10px",
                                          marginBottom: "16px",
                                          padding: "12px",
                                          border: "1px solid #fed7aa",
                                          background: "#fff7ed",
                                          borderRadius: "10px",
                                        }}
                                      >
                                        <label
                                          style={{
                                            ...labelStyle,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            marginBottom: "8px",
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={adminOverrideVagasDraft}
                                            disabled={salvandoAdminBeneficio}
                                            onChange={(e) => setAdminOverrideVagasDraft(e.target.checked)}
                                          />
                                          Autorizar homologação acima do limite de vagas
                                        </label>
                                        <p style={{ ...hintStyle, marginBottom: adminOverrideVagasDraft ? "8px" : 0 }}>
                                          Use apenas com autorização gerencial formal. A decisão ficará registrada no histórico de auditoria.
                                        </p>
                                        {adminOverrideVagasDraft ? (
                                          <textarea
                                            value={adminOverrideJustificativaDraft}
                                            onChange={(e) => setAdminOverrideJustificativaDraft(e.target.value)}
                                            disabled={salvandoAdminBeneficio}
                                            rows={3}
                                            placeholder="Justifique por que a homologação acima do limite é necessária..."
                                            style={{ ...controlStyle, resize: "vertical", minHeight: "72px" }}
                                          />
                                        ) : null}
                                      </div>
                                    ) : null}
                                    <button
                                      type="button"
                                      onClick={() => void salvarBeneficioEditalAdmin()}
                                      disabled={salvandoAdminBeneficio}
                                      style={saveBtnStyle(salvandoAdminBeneficio)}
                                    >
                                      {salvandoAdminBeneficio ? (
                                        <Loader2 style={{ width: "16px", height: "16px", animation: "spin 0.8s linear infinite" }} />
                                      ) : (
                                        <Save style={{ width: "16px", height: "16px" }} />
                                      )}
                                      Salvar benefício no edital
                                    </button>
                                  </div>
                                ) : null}

                                {podeEditarBeneficioEdital ? (
                                  <div
                                    style={{
                                      marginTop: "8px",
                                      paddingTop: "20px",
                                      borderTop: "1px solid #bae6fd",
                                    }}
                                  >
                                    <h5 style={subTitleStyle}>3. Resultado e recurso</h5>
                                    <p style={hintStyle}>
                                      Controle a publicação do resultado (preliminar/final) e o julgamento de recurso administrativo.
                                    </p>
                                    <div style={{ marginBottom: "12px" }}>
                                      <label style={labelStyle}>Fase do resultado</label>
                                      <select
                                        value={adminResultadoFaseDraft}
                                        onChange={(e) => setAdminResultadoFaseDraft(e.target.value as AdminResultadoFaseOpcao)}
                                        disabled={salvandoAdminResultadoRecurso}
                                        style={controlStyle}
                                      >
                                        {adminResultadoFaseOpcoesDisponiveis.map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div style={{ marginBottom: "12px" }}>
                                      <label style={labelStyle}>Situação do recurso</label>
                                      <select
                                        value={adminRecursoStatusDraft}
                                        onChange={(e) => setAdminRecursoStatusDraft(e.target.value as AdminRecursoStatusOpcao)}
                                        disabled={salvandoAdminResultadoRecurso}
                                        style={controlStyle}
                                      >
                                        {adminRecursoStatusOpcoesDisponiveis.map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label style={labelStyle}>Parecer do recurso (opcional)</label>
                                      <textarea
                                        value={adminRecursoObsDraft}
                                        onChange={(e) => setAdminRecursoObsDraft(e.target.value)}
                                        disabled={salvandoAdminResultadoRecurso}
                                        rows={3}
                                        placeholder="Ex.: Recurso deferido por revisão documental..."
                                        style={{ ...controlStyle, resize: "vertical", minHeight: "72px" }}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => void salvarResultadoRecursoAdmin()}
                                      disabled={salvandoAdminResultadoRecurso}
                                      style={saveBtnStyle(salvandoAdminResultadoRecurso)}
                                    >
                                      {salvandoAdminResultadoRecurso ? (
                                        <Loader2 style={{ width: "16px", height: "16px", animation: "spin 0.8s linear infinite" }} />
                                      ) : (
                                        <Save style={{ width: "16px", height: "16px" }} />
                                      )}
                                      Salvar resultado e recurso
                                    </button>
                                  </div>
                                ) : null}
                              </>
                            );
                          })()}
                        </div>
                        )}

                        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
                          <User style={{ width: "18px", height: "18px", color: "#2563eb" }} />
                          Dados do estudante
                        </h4>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                            gap: "10px 16px",
                            marginBottom: "28px",
                            padding: "16px",
                            background: "#f8fafc",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {[
                            { label: "Nome", value: alunoInfo.nome },
                            { label: "E-mail", value: alunoInfo.email },
                            { label: "Matrícula", value: alunoInfo.matricula },
                            { label: "CPF", value: alunoInfo.cpf },
                            { label: "Celular", value: alunoInfo.celular },
                            { label: "Curso", value: alunoInfo.curso },
                            { label: "Campus", value: alunoInfo.campus },
                            {
                              label: "Data de nascimento",
                              value: alunoInfo.data_nascimento ? formatDataHoraOuDataBr(alunoInfo.data_nascimento) : "—",
                            },
                            {
                              label: "Data de ingresso",
                              value: fmtIngresso(alunoInfo.data_ingresso),
                            },
                          ].map((row) => (
                            <div key={row.label}>
                              <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>{row.label}</div>
                              <div style={{ fontSize: "14px", color: "#0f172a", marginTop: "2px", wordBreak: "break-word" }}>{row.value || "—"}</div>
                            </div>
                          ))}
                        </div>

                        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
                          <History style={{ width: "18px", height: "18px", color: "#2563eb" }} />
                          Histórico de status (auditoria)
                        </h4>
                        {auditLoading ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", padding: "12px 0" }}>
                            <Loader2 style={{ width: "18px", height: "18px", animation: "spin 0.8s linear infinite" }} />
                            <span>Carregando histórico…</span>
                          </div>
                        ) : auditErro ? (
                          <p style={{ color: "#b91c1c", fontSize: "14px", margin: 0 }}>Não foi possível carregar o histórico de auditoria.</p>
                        ) : auditEntries.length === 0 ? (
                          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Nenhuma alteração de status registrada ainda.</p>
                        ) : (
                          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderLeft: "2px solid #e2e8f0" }}>
                            {auditEntries.map((ev) => (
                              <li
                                key={ev.id}
                                style={{
                                  position: "relative",
                                  paddingLeft: "20px",
                                  paddingBottom: "16px",
                                  marginLeft: "6px",
                                }}
                              >
                                <span
                                  style={{
                                    position: "absolute",
                                    left: "-7px",
                                    top: "4px",
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    background: "#2563eb",
                                    border: "2px solid #fff",
                                    boxShadow: "0 0 0 1px #e2e8f0",
                                  }}
                                  aria-hidden
                                />
                                <time
                                  style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}
                                  dateTime={ev.created_at}
                                >
                                  {new Date(ev.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                                </time>
                                <p style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#1e293b" }}>
                                  <span style={{ color: "#64748b" }}>{ev.status_anterior ?? "—"}</span>
                                  <span style={{ margin: "0 8px", color: "#94a3b8" }}>→</span>
                                  <strong>{ev.status_novo}</strong>
                                </p>
                                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#64748b" }}>
                                  Por:{" "}
                                <span style={{ fontWeight: 600, color: "#334155" }}>{formatActorAuditDisplay(ev)}</span>
                                </p>
                                {ev.observacao ? (
                                  <p style={{ margin: 0, fontSize: "13px", color: "#475569", fontStyle: "italic" }}>Obs.: {ev.observacao}</p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Invalidação */}
      {modalInvalidarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={fecharModalInvalidar}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "520px",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>Invalidar resposta</h3>
            {invalidarPerguntaTitulo && (
              <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "14px", lineHeight: "1.4" }}>{invalidarPerguntaTitulo}</p>
            )}

            {/* Checkbox - apenas invalidar */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                cursor: "pointer",
                padding: "12px",
                backgroundColor: apenasInvalidar ? "#fef2f2" : "#f8fafc",
                border: apenasInvalidar ? "1px solid #fecaca" : "1px solid #e2e8f0",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={apenasInvalidar}
                onChange={(e) => setApenasInvalidar(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#dc2626", cursor: "pointer" }}
              />
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Apenas invalidar</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Não permitir que o aluno reenvie uma nova resposta</div>
              </div>
            </label>

            {/* Campos condicionais - parecer e prazo */}
            {!apenasInvalidar && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Motivo / Instrução de correção <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    value={invalidarParecer}
                    onChange={(e) => setInvalidarParecer(e.target.value)}
                    placeholder="Ex: Documento está ilegível, favor reenviar com melhor qualidade"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      resize: "vertical",
                      fontFamily: "inherit",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Prazo para reenvio <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={invalidarPrazo}
                    onChange={(e) => setInvalidarPrazo(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                  />
                </div>
              </>
            )}

            {/* Botões de ação */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
              <button
                onClick={fecharModalInvalidar}
                disabled={enviandoInvalidacao}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: enviandoInvalidacao ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarInvalidacao}
                disabled={enviandoInvalidacao}
                style={{
                  padding: "10px 20px",
                  backgroundColor: enviandoInvalidacao ? "#cbd5e1" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: enviandoInvalidacao ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: enviandoInvalidacao ? "none" : "0 2px 6px rgba(220, 38, 38, 0.3)",
                  transition: "background-color 0.2s",
                }}
              >
                {enviandoInvalidacao ? "Enviando..." : apenasInvalidar ? "Confirmar invalidação" : "Invalidar e solicitar correção"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Validação */}
      {modalValidarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={fecharModalValidar}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "420px",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>Confirmar validação</h3>
            <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "14px", lineHeight: "1.5" }}>
              {validarPerguntaTitulo ? (
                <>
                  Deseja validar a resposta da pergunta <strong style={{ color: "#1e293b" }}>"{validarPerguntaTitulo}"</strong>?
                </>
              ) : (
                "Deseja validar esta resposta?"
              )}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={fecharModalValidar}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarValidacao}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                  transition: "background-color 0.2s",
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmação antes de editar resposta ── */}
      {confirmarEdicaoOpen && (
        <div
          onClick={fecharConfirmacaoEdicao}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "460px",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                ⚠️
              </div>
              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>Atenção — Dado sensível</h3>
            </div>
            <p style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "14px", lineHeight: "1.6" }}>
              Você está prestes a <strong style={{ color: "#dc2626" }}>editar a resposta de um aluno</strong>. Esta é uma operação sensível pois
              altera diretamente os dados fornecidos pelo estudante.
            </p>
            <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: "14px", lineHeight: "1.6" }}>Tem certeza de que deseja prosseguir?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={fecharConfirmacaoEdicao}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={abrirModalEditar}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ea580c",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: "0 2px 6px rgba(234, 88, 12, 0.3)",
                  transition: "background-color 0.2s",
                }}
              >
                Sim, editar resposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Editar resposta ── */}
      {modalEditarOpen && (
        <div
          onClick={fecharModalEditar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10002,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "520px",
              padding: "28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "18px", fontWeight: "700" }}>Editar resposta</h3>
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "13px", lineHeight: "1.5" }}>
              Pergunta: <strong style={{ color: "#1e293b" }}>{editarPerguntaInfo?.pergunta}</strong>
            </p>

            {/* Valor atual */}
            {editarRespostaAtual && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    fontWeight: 600,
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Valor atual
                </div>
                <div style={{ fontSize: "14px", color: "#475569" }}>{editarRespostaAtual}</div>
              </div>
            )}

            {/* Campo de edição baseado no tipo */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Novo valor:</label>

              {isTipoOpcoes(editarPerguntaInfo?.tipo_Pergunta) ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(editarPerguntaInfo?.opcoes || []).map((opcao, idx) => {
                    const selecionada = editarValorOpcoes.includes(opcao);
                    return (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: selecionada ? "2px solid #2563eb" : "1px solid #e2e8f0",
                          backgroundColor: selecionada ? "#eff6ff" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          fontSize: "14px",
                          color: "#1e293b",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => toggleOpcao(opcao)}
                          style={{ accentColor: "#2563eb", width: "16px", height: "16px" }}
                        />
                        {opcao}
                      </label>
                    );
                  })}
                  {(!editarPerguntaInfo?.opcoes || editarPerguntaInfo.opcoes.length === 0) && (
                    <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>Nenhuma opção disponível para esta pergunta.</p>
                  )}
                </div>
              ) : (
                <textarea
                  value={editarValorTexto}
                  onChange={(e) => setEditarValorTexto(e.target.value)}
                  rows={4}
                  placeholder="Digite o novo valor da resposta..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={fecharModalEditar}
                disabled={enviandoEdicao}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: enviandoEdicao ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  opacity: enviandoEdicao ? 0.6 : 1,
                  transition: "background-color 0.2s",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEdicaoResposta}
                disabled={enviandoEdicao}
                style={{
                  padding: "10px 20px",
                  backgroundColor: enviandoEdicao ? "#94a3b8" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: enviandoEdicao ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: enviandoEdicao ? "none" : "0 2px 6px rgba(37, 99, 235, 0.3)",
                  transition: "background-color 0.2s",
                }}
              >
                {enviandoEdicao ? "Salvando..." : "Salvar alteração"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Reabrir Complemento (definir novo prazo) ── */}
      {modalReabrirComplementoOpen && (
        <div
          onClick={fecharModalReabrirComplemento}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10003,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "28px",
              width: "440px",
              maxWidth: "90vw",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                🔄
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
                  Reabrir prazo de complemento
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Defina um novo prazo para o aluno enviar a resposta.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "12px 14px",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>Pergunta:</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>{reabrirPerguntaTitulo}</div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Novo prazo para resposta
              </label>
              <input
                type="datetime-local"
                value={reabrirNovoPrazo}
                onChange={(e) => setReabrirNovoPrazo(e.target.value)}
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={fecharModalReabrirComplemento}
                disabled={enviandoReabertura}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  cursor: enviandoReabertura ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  opacity: enviandoReabertura ? 0.6 : 1,
                  transition: "background-color 0.2s",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReabrirComplemento}
                disabled={enviandoReabertura || !reabrirNovoPrazo}
                style={{
                  padding: "10px 20px",
                  backgroundColor: enviandoReabertura || !reabrirNovoPrazo ? "#94a3b8" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: enviandoReabertura || !reabrirNovoPrazo ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: enviandoReabertura || !reabrirNovoPrazo ? "none" : "0 2px 6px rgba(37, 99, 235, 0.3)",
                  transition: "background-color 0.2s",
                }}
              >
                {enviandoReabertura ? "Reabrindo..." : "Confirmar novo prazo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Visualizador de Documento ── */}
      {documentoViewerOpen && (
        <div
          onClick={fecharVisualizadorDocumento}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10004,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "90vw",
              maxWidth: "900px",
              height: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}
          >
            {/* Header do Viewer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                <FileText style={{ width: "20px", height: "20px", color: "#0ea5e9", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#1e293b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {documentoNome}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                {documentoUrl && (
                  <button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = documentoUrl;
                      a.download = documentoNome;
                      a.target = "_blank";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    style={{
                      padding: "8px 14px",
                      backgroundColor: "#0ea5e9",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0ea5e9")}
                  >
                    <Download style={{ width: "14px", height: "14px" }} /> Salvar
                  </button>
                )}
                <button
                  onClick={fecharVisualizadorDocumento}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                    e.currentTarget.style.color = "#dc2626";
                    e.currentTarget.style.borderColor = "#fca5a5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>

            {/* Corpo do Viewer */}
            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
              {documentoLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid #e2e8f0",
                      borderTopColor: "#0ea5e9",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 16px",
                    }}
                  />
                  <div style={{ fontSize: "14px", color: "#64748b" }}>Carregando documento...</div>
                </div>
              ) : documentoErro ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
                  <div style={{ fontSize: "14px", color: "#991b1b", fontWeight: 500 }}>{documentoErro}</div>
                  <button
                    onClick={() => {
                      if (documentoNome) abrirVisualizadorDocumento(documentoNome);
                    }}
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      backgroundColor: "#0ea5e9",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : documentoUrl ? (
                (() => {
                  const ext = getExtensaoArquivo(documentoNome);
                  if (isPdfExtensao(ext)) {
                    return (
                      <iframe
                        src={documentoUrl}
                        title={documentoNome}
                        style={{ width: "100%", height: "100%", border: "none" }}
                      />
                    );
                  } else if (isImagemExtensao(ext)) {
                    return (
                      <img
                        src={documentoUrl}
                        alt={documentoNome}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          padding: "20px",
                        }}
                      />
                    );
                  } else {
                    return (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <FileText style={{ width: "60px", height: "60px", color: "#94a3b8", marginBottom: "16px" }} />
                        <div style={{ fontSize: "15px", color: "#475569", fontWeight: 500, marginBottom: "4px" }}>
                          Pré-visualização não disponível
                        </div>
                        <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
                          Este tipo de arquivo não pode ser exibido no navegador.
                        </div>
                        <button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = documentoUrl!;
                            a.download = documentoNome;
                            a.target = "_blank";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "#0ea5e9",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "14px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Download style={{ width: "16px", height: "16px" }} /> Baixar arquivo
                        </button>
                      </div>
                    );
                  }
                })()
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
