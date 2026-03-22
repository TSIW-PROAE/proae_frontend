import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Search, Filter, Calendar, User, Mail, BookOpen, MapPin, ChevronRight, Download, Pencil, Eye, X, History, Loader2 } from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { Edital } from "@/types/edital";
import { inscricaoServiceManager } from "@/services/InscricaoService/inscricaoService";
import { AlunoInscrito } from "@/types/inscricao";
import type { InscricaoStatusAuditEntry } from "@/types/inscricaoStatusAudit";
import { respostaService } from "@/services/RespostaService/respostaService";
import "./InscricoesProae.css";

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

function formatActorIdAudit(id: string | null): string {
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

export default function InscricoesProae() {
  const [searchParams] = useSearchParams();
  const editalIdFromUrl = searchParams.get("editalId");
  const expandInscricaoFromUrl = searchParams.get("expandInscricao");
  const deepLinkExpandHandled = useRef(false);

  const [editais, setEditais] = useState<Edital[]>([]);
  const [editalSelecionado, setEditalSelecionado] = useState<Edital | null>(null);
  const [inscricoes, setInscricoes] = useState<AlunoInscrito[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEditais, setIsLoadingEditais] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
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
    if (editalSelecionado?.id) {
      carregarInscricoes();
    }
  }, [editalSelecionado]);

  useEffect(() => {
    if (!editais.length || !editalIdFromUrl) return;
    const ed = editais.find((e) => String(e.id) === String(editalIdFromUrl));
    if (ed) setEditalSelecionado(ed);
  }, [editais, editalIdFromUrl]);

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

  const carregarInscricoes = async () => {
    if (!editalSelecionado?.id) return;

    try {
      setIsLoading(true);
      const dados = await inscricaoServiceManager.listarInscritosPorEdital(editalSelecionado.id);
      setInscricoes(dados);
    } catch (err: any) {
      console.error("Erro ao carregar inscrições:", err);
      setInscricoes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const inscricoesFiltradas = inscricoes.filter((inscricao) => {
    const matchTermo =
      !termoBusca ||
      inscricao.nome?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      inscricao.email?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      inscricao.matricula?.toLowerCase().includes(termoBusca.toLowerCase());

    let matchStatus = filtroStatus === "todos";
    if (!matchStatus) {
      const statusNorm = inscricao.status_inscricao?.toUpperCase() || "";
      switch (filtroStatus) {
        case "aprovada":
          matchStatus = statusNorm === "APROVADA";
          break;
        case "rejeitada":
          matchStatus = statusNorm === "REJEITADA";
          break;
        case "em_analise":
          matchStatus = statusNorm === "EM ANÁLISE" || statusNorm === "EM_ANALISE";
          break;
        case "selecionada":
          matchStatus = statusNorm === "SELECIONADA";
          break;
        case "nao_selecionada":
          matchStatus = statusNorm === "NÃO SELECIONADA" || statusNorm === "NAO_SELECIONADA";
          break;
        case "pendente_regularizacao":
          matchStatus = statusNorm === "PENDENTE DE REGULARIZAÇÃO" || statusNorm === "PENDENTE_REGULARIZACAO";
          break;
        case "aguardando_complemento":
          matchStatus = statusNorm === "AGUARDANDO COMPLEMENTO" || statusNorm === "AGUARDANDO_COMPLEMENTO";
          break;
        case "rejeitada_prazo_complemento":
          matchStatus = statusNorm === "REJEITADA POR PRAZO DE COMPLEMENTO" || statusNorm === "REJEITADA_POR_PRAZO_COMPLEMENTO";
          break;
        case "pendente":
          matchStatus = statusNorm === "PENDENTE";
          break;
        default:
          matchStatus = statusNorm === filtroStatus.toUpperCase();
      }
    }

    return matchTermo && matchStatus;
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
      case "NÃO SELECIONADA":
      case "NAO_SELECIONADA":
        return "status-badge status-nao-selecionada";
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
      case "REJEITADA":
      case "INSCRIÇÃO NEGADA":
        return "Rejeitada";
      case "EM ANÁLISE":
      case "EM_ANALISE":
        return "Em Análise";
      case "SELECIONADA":
        return "Selecionada";
      case "NÃO SELECIONADA":
      case "NAO_SELECIONADA":
        return "Não Selecionada";
      case "PENDENTE DE REGULARIZAÇÃO":
      case "PENDENTE_REGULARIZACAO":
        return "Pendente de Regularização";
      case "AGUARDANDO COMPLEMENTO":
      case "AGUARDANDO_COMPLEMENTO":
        return "Aguardando Complemento";
      case "REJEITADA POR PRAZO DE COMPLEMENTO":
      case "REJEITADA_POR_PRAZO_COMPLEMENTO":
        return "Rejeitada por Prazo";
      case "PENDENTE":
      case "INSCRIÇÃO PENDENTE":
        return "Pendente";
      case "AJUSTE NECESSÁRIO":
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
    if (!expandInscricaoFromUrl || !inscricoes.length || deepLinkExpandHandled.current) return;
    const ins = inscricoes.find((i) => String(i.inscricao_id) === String(expandInscricaoFromUrl));
    if (ins) {
      deepLinkExpandHandled.current = true;
      void handleVerDetalhes(ins);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deep link uma vez ao carregar a lista
  }, [inscricoes, expandInscricaoFromUrl]);

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
  }, [isModalOpen, abaAtiva, inscricaoSelecionada?.inscricao_id]);

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
      window.alert("Não foi possível validar a resposta. Tente novamente.");
    } finally {
      setValidandoRespostas((prev) => {
        const clone = { ...prev };
        if (validarRespostaId) delete clone[validarRespostaId];
        return clone;
      });
    }
  };

  const abrirModalInvalidar = (respostaId: string, perguntaTitulo?: string) => {
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
      window.alert(err?.message || "Erro ao editar resposta.");
    } finally {
      setEnviandoEdicao(false);
    }
  };

  const confirmarInvalidacao = async () => {
    if (!invalidarRespostaId) return;

    // Validações
    if (!apenasInvalidar) {
      if (!invalidarParecer.trim()) {
        window.alert("Informe o motivo/instrução de correção.");
        return;
      }
      if (!invalidarPrazo) {
        window.alert("Informe o prazo para reenvio.");
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
      window.alert("Não foi possível invalidar a resposta. Tente novamente.");
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
      window.alert("Não foi possível alterar o prazo. Tente novamente.");
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
      window.alert("Não foi possível baixar o documento.");
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
      window.alert("O novo prazo deve ser uma data futura.");
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
      window.alert(err.message || "Não foi possível reabrir o prazo. Tente novamente.");
    } finally {
      setEnviandoReabertura(false);
    }
  };

  const baixarPdfInscricoesAprovadasAnalise = async () => {
    if (!editalSelecionado?.id) {
      window.alert("Selecione um edital primeiro.");
      return;
    }

    setDownloadingPdfAnalise(true);
    try {
      await inscricaoServiceManager.downloadPdfAprovados(String(editalSelecionado.id));
    } catch (err: unknown) {
      console.error("Erro ao baixar PDF:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível baixar o PDF.";
      window.alert(msg);
    } finally {
      setDownloadingPdfAnalise(false);
    }
  };

  const baixarPdfBeneficiariosEdital = async () => {
    if (!editalSelecionado?.id) {
      window.alert("Selecione um edital primeiro.");
      return;
    }

    setDownloadingPdfBeneficio(true);
    try {
      await inscricaoServiceManager.downloadPdfBeneficiarios(String(editalSelecionado.id));
    } catch (err: unknown) {
      console.error("Erro ao baixar PDF de beneficiários:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível baixar o PDF.";
      window.alert(msg);
    } finally {
      setDownloadingPdfBeneficio(false);
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
                <h1 className="welcome-title">Visualização de Inscrições</h1>
                <p className="welcome-subtitle">
                  {editalSelecionado
                    ? `Visualizando inscrições do edital: ${editalSelecionado.titulo_edital}`
                    : "Selecione um edital para visualizar as inscrições"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {/* Seletor de Edital */}
          <section className="edital-selector-section">
            <div className="selector-card">
              <label className="selector-label">Selecione um Edital</label>
              <select
                className="edital-select"
                value={editalSelecionado ? String(editalSelecionado.id) : ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const edital = editais.find((ed) => String(ed.id) === selectedId);
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
            <section className="filters-section">
              <div className="filters-card">
                <div className="search-container">
                  <Search className="w-4 h-4 search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, email ou matrícula..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filter-container">
                  <Filter className="w-4 h-4 filter-icon" />
                  <select className="status-filter" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                    <option value="todos">Todos os status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="rejeitada">Rejeitada</option>
                    <option value="selecionada">Selecionada</option>
                    <option value="nao_selecionada">Não Selecionada</option>
                    <option value="pendente_regularizacao">Pendente de Regularização</option>
                    <option value="aguardando_complemento">Aguardando Complemento</option>
                    <option value="rejeitada_prazo_complemento">Rejeitada por Prazo de Complemento</option>
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
                </div>
              </div>
            </section>
          )}

          {/* Lista de Inscrições */}
          {editalSelecionado && (
            <section className="inscricoes-list-section">
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
                    {termoBusca || filtroStatus !== "todos"
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
                        <th style={{ width: "20px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscricoesFiltradas.map((inscricao, index) => (
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
                            <div className={getStatusBadgeClass(inscricao.status_inscricao || "PENDENTE")}>
                              {getStatusLabel(inscricao.status_inscricao || "PENDENTE")}
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
                            <ChevronRight className="w-5 h-5" style={{ color: "#64748b" }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-footer">
                    <span>
                      {inscricoesFiltradas.length} de {inscricoes.length} inscrição
                      {inscricoes.length !== 1 ? "ões" : ""}
                    </span>
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
              <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#1e293b" }}>Detalhes da Inscrição</h2>

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
                              <div style={{ fontSize: "12px", color: "#64748b" }}>
                                {stepItem.perguntas?.length || 0} pergunta{stepItem.perguntas?.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Lista de Perguntas do Questionário Selecionado */}
                        {questionarioSelecionado &&
                          (() => {
                            const stepAtual = stepsCompletos?.steps?.find((s) => s.step.id === questionarioSelecionado);
                            return (
                              <div style={{ marginBottom: "32px" }}>
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
                                      const tipo = perguntaInfo?.tipo_Pergunta || "N/D";
                                      const obrigatoria = perguntaInfo?.obrigatoriedade ? "Sim" : "Não";
                                      const valorOpcoes = respostaInfo?.valorOpcoes?.length ? respostaInfo.valorOpcoes.join(", ") : null;
                                      const valorTexto =
                                        (respostaInfo?.valorTexto && respostaInfo.valorTexto.trim().length > 0 ? respostaInfo.valorTexto : null) ||
                                        (respostaInfo?.texto && respostaInfo.texto.trim().length > 0 ? respostaInfo.texto : null);
                                      const respostaConteudo = valorOpcoes || valorTexto;
                                      const isValidandoResposta = respostaInfo?.id ? validandoRespostas[respostaInfo.id] : false;
                                      const isDado = !!perguntaInfo?.dado;
                                      const dadoNome = perguntaInfo?.dado?.nome || null;

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
                                            <span>Tipo: {tipo}</span>
                                            <span>•</span>
                                            <span>Obrigatória: {obrigatoria}</span>
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
                                              {prazoNovaPergunta && new Date(prazoNovaPergunta).getTime() < Date.now() && (
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
                                                {respostaInfo?.id && (
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
                                            {respostaInfo?.id && (
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
                      maxHeight: "min(70vh, 640px)",
                      overflowY: "auto",
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
                              Benefício no edital
                            </div>
                            <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "4px", fontWeight: 600 }}>
                              {inscricaoSelecionada.status_beneficio_edital || "Pendente seleção"}
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
                                  Por: <code style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{formatActorIdAudit(ev.actor_usuario_id)}</code>
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
