import { useState, useEffect } from "react";
import { FileText, Search, Filter, Calendar, User, Mail, BookOpen, MapPin, ChevronRight, Download, Pencil } from "lucide-react";
import { editalService } from "@/services/EditalService/editalService";
import { Edital } from "@/types/edital";
import { inscricaoServiceManager } from "@/services/InscricaoService/inscricaoService";
import { AlunoInscrito } from "@/types/inscricao";
import { respostaService } from "@/services/RespostaService/respostaService";
import "./InscricoesProae.css";

interface PerguntaPayload {
  id: number;
  pergunta: string;
  tipo_Pergunta: string;
  obrigatoriedade: boolean;
  opcoes?: string[] | null;
  tipo_formatacao?: string | null;
  placeholder?: string | null;
}

interface RespostaPayload {
  id: number;
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
}

interface PerguntaComResposta {
  pergunta: PerguntaPayload;
  resposta: RespostaPayload | null;
}

interface StepComStatus {
  step: {
    id: number;
    texto: string;
  };
  status: string;
  perguntas: PerguntaComResposta[];
}

interface StepsCompletos {
  edital: {
    id: number;
    titulo?: string;
    titulo_edital?: string;
    descricao?: string;
    status?: string;
  };
  aluno: {
    aluno_id: number;
    nome: string;
    email: string;
    matricula: string;
  };
  steps: StepComStatus[];
}

export default function InscricoesProae() {
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
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState<number | null>(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [validandoRespostas, setValidandoRespostas] = useState<Record<number, boolean>>({});
  const [validandoTodas, setValidandoTodas] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Estado do modal de confirmação de validação
  const [modalValidarOpen, setModalValidarOpen] = useState(false);
  const [validarRespostaId, setValidarRespostaId] = useState<number | null>(null);
  const [validarPerguntaTitulo, setValidarPerguntaTitulo] = useState<string>("");

  // Estado do modal de invalidação
  const [modalInvalidarOpen, setModalInvalidarOpen] = useState(false);
  const [invalidarRespostaId, setInvalidarRespostaId] = useState<number | null>(null);
  const [invalidarPerguntaTitulo, setInvalidarPerguntaTitulo] = useState<string>("");
  const [invalidarParecer, setInvalidarParecer] = useState("");
  const [invalidarPrazo, setInvalidarPrazo] = useState("");
  const [apenasInvalidar, setApenasInvalidar] = useState(false);
  const [enviandoInvalidacao, setEnviandoInvalidacao] = useState(false);

  // Estado para edição de resposta pela PROAE
  const [confirmarEdicaoOpen, setConfirmarEdicaoOpen] = useState(false);
  const [editarRespostaId, setEditarRespostaId] = useState<number | null>(null);
  const [editarPerguntaInfo, setEditarPerguntaInfo] = useState<PerguntaPayload | null>(null);
  const [editarRespostaAtual, setEditarRespostaAtual] = useState<string>("");
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editarValorTexto, setEditarValorTexto] = useState("");
  const [editarValorOpcoes, setEditarValorOpcoes] = useState<string[]>([]);
  const [enviandoEdicao, setEnviandoEdicao] = useState(false);

  useEffect(() => {
    carregarEditais();
  }, []);

  useEffect(() => {
    if (editalSelecionado?.id) {
      carregarInscricoes();
    }
  }, [editalSelecionado]);

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
        return "status-badge status-aprovada";
      case "REJEITADA":
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
      case "PENDENTE":
      default:
        return "status-badge status-pendente";
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "APROVADA":
        return "Aprovada";
      case "REJEITADA":
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
      case "PENDENTE":
      default:
        return "Pendente";
    }
  };

  const handleVerDetalhes = async (inscricao: AlunoInscrito) => {
    setInscricaoSelecionada(inscricao);
    setIsModalOpen(true);
    await carregarStepsCompletos(inscricao.aluno_id);
  };

  const carregarStepsCompletos = async (alunoId: number) => {
    if (!editalSelecionado?.id || !alunoId) return;

    try {
      setIsLoadingModal(true);
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/aluno/${alunoId}/edital/${editalSelecionado.id}/steps-completos`;
      const response = await fetch(url);

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

  const abrirModalValidar = (respostaId: number, perguntaTitulo?: string) => {
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

  const abrirModalInvalidar = (respostaId: number, perguntaTitulo?: string) => {
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
  const abrirConfirmacaoEdicao = (respostaId: number, pergunta: PerguntaPayload, respostaAtual: string) => {
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

  const alterarPrazoReenvio = async (respostaId: number, novoPrazo: string, parecerExistente?: string) => {
    setValidandoRespostas((prev) => ({ ...prev, [respostaId]: true }));
    try {
      const prazoDate = new Date(novoPrazo + "T23:59:59.000Z");
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/respostas/${respostaId}/validate`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  const validarTodasRespostas = async () => {
    const stepAtual = stepsCompletos?.steps?.find((s) => s.step.id === questionarioSelecionado);
    const pendentes = stepAtual?.perguntas?.filter((p) => p.resposta?.id && p.resposta.validada !== true) || [];
    const ids = pendentes.map((p) => p.resposta!.id);

    if (!ids.length) {
      window.alert("Não há respostas pendentes para validar.");
      return;
    }

    if (!window.confirm(`Validar ${ids.length} resposta${ids.length > 1 ? "s" : ""} deste questionário?`)) return;

    setValidandoTodas(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${import.meta.env.VITE_API_URL_SERVICES}/respostas/${id}/validate`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ validada: true }),
          }),
        ),
      );

      if (inscricaoSelecionada?.aluno_id) {
        await carregarStepsCompletos(inscricaoSelecionada.aluno_id);
      }
    } catch (err: any) {
      console.error("Erro ao validar respostas:", err);
      window.alert("Não foi possível validar todas as respostas. Tente novamente.");
    } finally {
      setValidandoTodas(false);
    }
  };

  const baixarPdfAprovados = async () => {
    if (!editalSelecionado?.id) {
      window.alert("Selecione um edital primeiro.");
      return;
    }

    setDownloadingPdf(true);
    try {
      const url = `${import.meta.env.VITE_API_URL_SERVICES}/inscricoes/aprovados/pdf?editalId=${editalSelecionado.id}`;
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        if (response.status === 404) {
          throw new Error("Nenhum estudante aprovado encontrado para este edital.");
        }
        throw new Error(`Erro ao baixar PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `estudantes-aprovados-edital-${editalSelecionado.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error("Erro ao baixar PDF:", err);
      window.alert(err.message || "Não foi possível baixar o PDF. Tente novamente.");
    } finally {
      setDownloadingPdf(false);
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
        return "Pendente de Correção";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "NAO_INICIADO":
        return "Não Iniciado";
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
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "EM_ANDAMENTO":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "NAO_INICIADO":
        return { backgroundColor: "#f1f5f9", color: "#475569" };
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
                value={editalSelecionado?.id || ""}
                onChange={(e) => {
                  const edital = editais.find((ed) => ed.id === Number(e.target.value));
                  setEditalSelecionado(edital || null);
                }}
                disabled={isLoadingEditais}
              >
                <option value="">Selecione um edital...</option>
                {editais.map((edital) => (
                  <option key={edital.id} value={edital.id}>
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
                  </select>
                </div>
                <button onClick={baixarPdfAprovados} disabled={downloadingPdf} className="download-pdf-button" title="Baixar PDF dos aprovados">
                  <Download className="w-4 h-4" />
                  <span>{downloadingPdf ? "Baixando..." : "PDF Aprovados"}</span>
                </button>
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
                        <th>ID</th>
                        <th>Matrícula</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Curso</th>
                        <th>Campus</th>
                        <th>Data Inscrição</th>
                        <th>Status</th>
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
                          <td>{inscricao.inscricao_id || "N/A"}</td>
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
                                {stepItem.step.texto || `Questionário ${stepItem.step.id}`}
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
                                  <button
                                    onClick={validarTodasRespostas}
                                    disabled={validandoTodas || !stepAtual?.perguntas?.some((p) => p.resposta?.id && p.resposta.validada !== true)}
                                    style={{
                                      padding: "10px 14px",
                                      backgroundColor: validandoTodas
                                        ? "#cbd5e1"
                                        : !stepAtual?.perguntas?.some((p) => p.resposta?.id && p.resposta.validada !== true)
                                          ? "#dcfce7"
                                          : "#16a34a",
                                      color: !stepAtual?.perguntas?.some((p) => p.resposta?.id && p.resposta.validada !== true) ? "#166534" : "white",
                                      border: !stepAtual?.perguntas?.some((p) => p.resposta?.id && p.resposta.validada !== true)
                                        ? "1px solid #bbf7d0"
                                        : "none",
                                      borderRadius: "8px",
                                      cursor:
                                        validandoTodas || !stepAtual?.perguntas?.some((p) => p.resposta?.id && p.resposta.validada !== true)
                                          ? "default"
                                          : "pointer",
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      transition: "background-color 0.2s, transform 0.1s",
                                      boxShadow: !stepAtual?.perguntas?.some((p) => p.resposta?.id && p.resposta.validada !== true)
                                        ? "none"
                                        : "0 2px 6px rgba(22, 163, 74, 0.25)",
                                    }}
                                  >
                                    {validandoTodas
                                      ? "Validando..."
                                      : !stepAtual?.perguntas?.some((p) => p.resposta?.id && p.resposta.validada !== true)
                                        ? "✓ Todas validadas"
                                        : "Validar todas"}
                                  </button>
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

                                      if (!respostaInfo) {
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

                                          {/* Resposta */}
                                          {respostaConteudo ? (
                                            <div
                                              style={{
                                                padding: "12px",
                                                backgroundColor: respostaInvalidada ? "#fefce8" : "#f0fdf4",
                                                border: respostaInvalidada ? "1px solid #fde68a" : "1px solid #bbf7d0",
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
                                                    color: respostaInvalidada ? "#854d0e" : "#166534",
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
                                              <div style={{ fontSize: "14px", color: respostaInvalidada ? "#713f12" : "#15803d" }}>
                                                {respostaConteudo}
                                              </div>
                                            </div>
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
                  <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    <FileText style={{ width: "64px", height: "64px", margin: "0 auto 16px", opacity: 0.3 }} />
                    <h3 style={{ color: "#64748b", marginBottom: "8px" }}>Informações Gerais</h3>
                    <p>Seção em desenvolvimento. Informações adicionais serão exibidas aqui.</p>
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
    </div>
  );
}
