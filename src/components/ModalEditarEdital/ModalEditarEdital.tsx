import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Edit,
  Link,
  Calendar,
  Users,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react";
import { Edital, DocumentoEdital, EtapaEdital, Vaga } from "../../types/edital";
import { stepService } from "@/services/StepService/stepService";
import { perguntaService } from "@/services/PerguntaService/perguntaService";
import { editalService } from "../../services/EditalService/editalService";
import { toast } from "react-hot-toast";
import "./ModalEditarEdital.css";

interface ModalEditarEditalProps {
  edital: Edital;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onStatusChanged?: () => void;
}

interface EditableDocumento {
  value: DocumentoEdital;
  isEditing: boolean;
}

interface EditableEtapa {
  value: EtapaEdital;
  isEditing: boolean;
}

interface EditableVaga {
  value: Vaga;
  isEditing: boolean;
}

type StatusEdital = "RASCUNHO" | "ABERTO" | "EM_ANDAMENTO" | "ENCERRADO";

const statusLabelMap: Record<StatusEdital, string> = {
  RASCUNHO: "Rascunho",
  ABERTO: "Edital em aberto",
  EM_ANDAMENTO: "Edital em andamento",
  ENCERRADO: "Edital encerrado",
};

const toInternalStatus = (value: string): StatusEdital => {
  const norm = (value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (norm === "rascunho") return "RASCUNHO";
  if (norm === "aberto" || norm === "edital em aberto") return "ABERTO";
  if (norm === "em andamento" || norm === "edital em andamento")
    return "EM_ANDAMENTO";
  if (norm === "encerrado" || norm === "edital encerrado") return "ENCERRADO";
  // também aceitar já no formato interno
  const upper = (value || "").toUpperCase();
  if (
    upper === "RASCUNHO" ||
    upper === "ABERTO" ||
    upper === "EM_ANDAMENTO" ||
    upper === "ENCERRADO"
  ) {
    return upper as StatusEdital;
  }
  return "RASCUNHO";
};

const ModalEditarEdital: React.FC<ModalEditarEditalProps> = ({
  edital,
  isOpen,
  onClose,
  onSave,
  onStatusChanged,
}) => {
  const [titulo, setTitulo] = useState(edital.titulo_edital);
  const [tituloEditando, setTituloEditando] = useState(false);
  const [descricao, setDescricao] = useState(edital.descricao || "");
  const [descricaoEditando, setDescricaoEditando] = useState(false);
  const [status, setStatus] = useState<StatusEdital>(edital.status_edital);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);
  const [showStatusErrorModal, setShowStatusErrorModal] = useState(false);
  const [statusErrorMessage, setStatusErrorMessage] = useState("");
  const [newStatus, setNewStatus] = useState<StatusEdital | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [documentos, setDocumentos] = useState<EditableDocumento[]>([]);
  const [etapas, setEtapas] = useState<EditableEtapa[]>([]);
  const [vagas, setVagas] = useState<EditableVaga[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openDescricao, setOpenDescricao] = useState(true);
  const [openLinks, setOpenLinks] = useState(true);
  const [openCronograma, setOpenCronograma] = useState(true);
  const [openVagas, setOpenVagas] = useState(true);
  const [openQuestionarios, setOpenQuestionarios] = useState(true);
  // Controle de alterações locais
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const baselineSnapshotRef = useRef<string | null>(null);
  // Celebração visual após sucesso
  const [showCelebration, setShowCelebration] = useState(false);

  // Drawer lateral de Questionários
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeQuestionarioIndex, setActiveQuestionarioIndex] = useState<
    number | null
  >(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [quizTitleEditing, setQuizTitleEditing] = useState(false);
  interface PerguntaEditorItem {
    texto: string;
    tipo:
      | "texto"
      | "texto_curto"
      | "numero"
      | "data"
      | "multipla_escolha"
      | "multipla_selecao"
      | "arquivo"
      | "email";
    obrigatoria: boolean;
    opcoes: string[];
  }
  const [editorPerguntas, setEditorPerguntas] = useState<PerguntaEditorItem[]>(
    []
  );

  // Estado local de Questionários (somente UI por enquanto)
  interface QuestionarioItem {
    id?: number; // id do step
    titulo: string;
    previewPerguntas: string[]; // primeiras perguntas carregadas
  }
  interface EditableQuestionario {
    value: QuestionarioItem;
    isEditing: boolean;
  }
  const [questionarios, setQuestionarios] = useState<EditableQuestionario[]>(
    []
  );

  const makeSnapshot = (
    t: string,
    d: string,
    docsArr: DocumentoEdital[],
    etapasArr: EtapaEdital[],
    vagasArr: Vaga[],
    questionariosArr: QuestionarioItem[] = []
  ) => {
    const norm = {
      titulo: (t || "").trim(),
      descricao: (d || "").trim(),
      documentos: (docsArr || []).map((x) => ({
        titulo_documento: (x.titulo_documento || "").trim(),
        url_documento: (x.url_documento || "").trim(),
      })),
      etapas: (etapasArr || []).map((x) => ({
        etapa: (x.etapa || "").trim(),
        data_inicio: x.data_inicio || "",
        data_fim: x.data_fim || "",
        ordem_elemento: x.ordem_elemento ?? null,
      })),
      vagas: (vagasArr || []).map((x) => ({
        beneficio: (x.beneficio || "").trim(),
        descricao_beneficio: (x.descricao_beneficio || "").trim(),
        numero_vagas: Number(x.numero_vagas) || 0,
      })),
      questionarios: (questionariosArr || []).map((q) => ({
        titulo: (q.titulo || "").trim(),
        previewPerguntas: (q.previewPerguntas || []).map((p) =>
          (p || "").trim()
        ),
      })),
    };
    return JSON.stringify(norm);
  };

  useEffect(() => {
    if (isOpen && edital) {
      setInitialized(false);
      setHasChanges(false);
      setTitulo(edital.titulo_edital);
      setDescricao(edital.descricao || "");
      // Garantir que o status atual esteja refletido ao abrir, normalizando caso venha em outro formato da API
      setStatus(
        toInternalStatus((edital.status_edital as unknown as string) || "")
      );

      // Inicializar documentos e etapas a partir do edital
      const docs = edital.edital_url || [];
      setDocumentos([...docs.map((doc) => ({ value: doc, isEditing: false }))]);

      const etapasData = edital.etapa_edital || [];
      setEtapas([
        ...etapasData.map((etapa) => ({ value: etapa, isEditing: false })),
      ]);

      // Carregar vagas e montar snapshot baseline assim que chegarem
      loadVagasAndInitBaseline();

      // Carregar Steps deste edital e montar UI de questionários
      loadSteps();
    }
  }, [isOpen, edital]);

  // UX: fechar com tecla Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Prioridade: fecha drawer primeiro; depois modais de status; por último fecha o modal principal
        if (drawerOpen) {
          setDrawerOpen(false);
          return;
        }
        if (!showStatusConfirmModal && !showStatusErrorModal) onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isOpen,
    onClose,
    showStatusConfirmModal,
    showStatusErrorModal,
    drawerOpen,
  ]);

  const loadVagasAndInitBaseline = async () => {
    if (!edital.id) return;
    try {
      const vagasData = await editalService.buscarVagasDoEdital(edital.id);
      const vagasEditable = [
        ...vagasData.map((vaga) => ({ value: vaga, isEditing: false })),
      ];
      setVagas(vagasEditable);

      // Criar baseline snapshot a partir do próprio edital + vagas retornadas
      const docsOrig = (edital.edital_url || []) as DocumentoEdital[];
      const etapasOrig = (edital.etapa_edital || []) as EtapaEdital[];
      const baseline = makeSnapshot(
        edital.titulo_edital || "",
        edital.descricao || "",
        docsOrig,
        etapasOrig,
        vagasData,
        []
      );
      baselineSnapshotRef.current = baseline;
      setInitialized(true);
      setHasChanges(false);
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    }
  };

  const loadSteps = async () => {
    if (!edital.id) return;
    try {
      const steps = await stepService.listarStepsPorEdital(edital.id);
      // Monta questionários com preview vazio inicialmente
      const qs: EditableQuestionario[] = steps
        .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
        .map((s) => ({
          value: {
            id: s.id,
            titulo: s.titulo || s.texto || "",
            previewPerguntas: [],
          },
          isEditing: false,
        }));
      setQuestionarios(qs);

      // Carrega preguiçosamente as primeiras perguntas de cada step para preview
      for (const s of steps) {
        if (!s.id) continue;
        try {
          const perguntas = await perguntaService.listarPerguntasPorStep(s.id);
          const preview = (perguntas || [])
            .slice(0, 3)
            .map((p) => p.texto_pergunta || p.pergunta || "");
          setQuestionarios((prev) =>
            prev.map((q) =>
              q.value.id === s.id
                ? { ...q, value: { ...q.value, previewPerguntas: preview } }
                : q
            )
          );
        } catch (e) {
          // ignora erro de perguntas individuais
        }
      }
    } catch (error) {
      console.error("Erro ao carregar steps:", error);
    }
  };

  // Recalcula hasChanges após inicialização e a cada alteração
  useEffect(() => {
    if (!initialized) return;
    const currentSnapshot = makeSnapshot(
      titulo,
      descricao,
      documentos.map((d) => d.value),
      etapas.map((e) => e.value),
      vagas.map((v) => v.value),
      questionarios.map((q) => q.value)
    );
    setHasChanges(currentSnapshot !== baselineSnapshotRef.current);
  }, [
    initialized,
    titulo,
    descricao,
    documentos,
    etapas,
    vagas,
    questionarios,
  ]);

  const getStatusIcon = (statusValue: StatusEdital) => {
    switch (statusValue) {
      case "RASCUNHO":
        return <FileText size={16} />;
      case "ABERTO":
        return <CheckCircle size={16} />;
      case "EM_ANDAMENTO":
        return <Clock size={16} />;
      case "ENCERRADO":
        return <AlertTriangle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const isEditalCompleteLocal = () => {
    const hasTitulo = Boolean(titulo && titulo.trim().length > 0);
    const hasDescricao = Boolean(descricao && descricao.trim().length > 0);
    const docsValidos = documentos
      .map((d) => d.value)
      .filter((d) => d.titulo_documento && d.url_documento);
    const etapasValidas = etapas
      .map((e) => e.value)
      .filter((e) => e.etapa && e.data_inicio && e.data_fim);
    return (
      hasTitulo &&
      hasDescricao &&
      docsValidos.length > 0 &&
      etapasValidas.length > 0
    );
  };

  const handleStatusChange = (newStatusValue: StatusEdital) => {
    setShowStatusDropdown(false);

    // Regras de transição locais antes da confirmação
    if (newStatusValue === "ABERTO" || newStatusValue === "EM_ANDAMENTO") {
      if (!isEditalCompleteLocal()) {
        setStatusErrorMessage(
          "Para alterar o status para ABERTO ou EM ANDAMENTO, todos os dados do edital devem estar preenchidos (título, descrição, ao menos 1 link/documento e ao menos 1 etapa do cronograma)."
        );
        setShowStatusErrorModal(true);
        return;
      }
    }
    if (newStatusValue === "ENCERRADO") {
      if (!(status === "ABERTO" || status === "EM_ANDAMENTO")) {
        setStatusErrorMessage(
          "Só é possível alterar para ENCERRADO se o edital estiver ABERTO ou EM ANDAMENTO."
        );
        setShowStatusErrorModal(true);
        return;
      }
    }

    setNewStatus(newStatusValue);
    setShowStatusConfirmModal(true);
    setConfirmText("");
  };

  const persistChanges = async (): Promise<boolean> => {
    if (!edital.id) return false;
    setIsSaving(true);
    setError(null);
    try {
      // Salvar edital
      const documentosValidos = documentos
        .filter((doc) => doc.value.titulo_documento && doc.value.url_documento)
        .map((doc) => doc.value);

      const etapasValidas = etapas
        .filter(
          (etapa) =>
            etapa.value.etapa && etapa.value.data_inicio && etapa.value.data_fim
        )
        .map((etapa) => etapa.value);

      await editalService.atualizarEdital(edital.id, {
        titulo_edital: titulo,
        descricao: descricao,
        edital_url: documentosValidos,
        etapa_edital: etapasValidas,
      });

      // Sincronizar Steps (Questionários)
      // 1) Buscar steps atuais do backend
      const stepsExistentes = await stepService.listarStepsPorEdital(edital.id);
      const idsExistentesSteps = new Set(
        (stepsExistentes || []).map((s) => s.id!).filter(Boolean)
      );

      // 2) Criar/Atualizar conforme UI
      const idsPersistentesSteps = new Set<number>();
      let ordem = 1;
      for (const q of questionarios) {
        const tituloStep = q.value.titulo?.trim();
        if (!tituloStep) continue; // ignora sem título
        if (q.value.id) {
          const updated = await stepService.atualizarStep(q.value.id, {
            texto: tituloStep,
          });
          if (updated.id) idsPersistentesSteps.add(updated.id);
        } else {
          const created = await stepService.criarStep({
            texto: tituloStep,
            edital_id: edital.id,
          });
          if (created.id) {
            idsPersistentesSteps.add(created.id);
            // atualiza id na UI
            setQuestionarios((prev) =>
              prev.map((qq) =>
                qq === q
                  ? { ...qq, value: { ...qq.value, id: created.id } }
                  : qq
              )
            );
          }
        }
        ordem++;
      }

      // 3) Deletar steps removidos pela UI
      for (const id of idsExistentesSteps) {
        if (!idsPersistentesSteps.has(id)) {
          await stepService.deletarStep(id);
        }
      }

      // Sincronização de Vagas: cria/atualiza/deleta
      const vagasValidas = vagas.filter(
        (vaga) => vaga.value.beneficio && vaga.value.numero_vagas > 0
      );

      const vagasExistentes =
        (await editalService.buscarVagasDoEdital(edital.id)) || [];
      const idsExistentes = new Set(
        vagasExistentes.map((v) => v.id!).filter(Boolean)
      );

      const idsPersistentes = new Set<number>();
      for (const vaga of vagasValidas) {
        if (vaga.value.id) {
          const updated = await editalService.atualizarVaga(vaga.value.id, {
            beneficio: vaga.value.beneficio,
            descricao_beneficio: vaga.value.descricao_beneficio,
            numero_vagas: vaga.value.numero_vagas,
          });
          if (updated.id) idsPersistentes.add(updated.id);
        } else {
          const created = await editalService.criarVaga({
            edital_id: edital.id,
            beneficio: vaga.value.beneficio,
            descricao_beneficio: vaga.value.descricao_beneficio,
            numero_vagas: vaga.value.numero_vagas,
          });
          if (created.id) idsPersistentes.add(created.id);
        }
      }

      for (const id of idsExistentes) {
        if (!idsPersistentes.has(id)) {
          await editalService.deletarVaga(id);
        }
      }

      // Atualiza baseline e estado de alterações
      baselineSnapshotRef.current = makeSnapshot(
        titulo,
        descricao,
        documentos.map((d) => d.value),
        etapas.map((e) => e.value),
        vagas
          .filter((vaga) => vaga.value.beneficio && vaga.value.numero_vagas > 0)
          .map((v) => v.value),
        questionarios.map((q) => q.value)
      );
      setHasChanges(false);
      return true;
    } catch (error) {
      console.error("Erro ao salvar edital:", error);
      setError("Erro ao salvar edital. Tente novamente.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!newStatus || !edital.id) return;
    try {
      setIsSaving(true);
      // Se há mudanças locais, persistir antes de alterar o status
      if (hasChanges) {
        const ok = await persistChanges();
        if (!ok) {
          // Erro já tratado em persistChanges
          return;
        }
      }
      const atualizado = await editalService.alterarStatusEdital(
        edital.id,
        newStatus
      );
      // Atualiza status local com o retornado ou com newStatus
      setStatus(
        toInternalStatus(
          ((atualizado?.status_edital as unknown as string) ||
            newStatus) as string
        )
      );
      setShowStatusConfirmModal(false);
      setNewStatus(null);
      setConfirmText("");
      toast.success("Status alterado com sucesso.", { duration: 2500 });
      // Dispara celebração breve
      setShowCelebration(true);
      window.setTimeout(() => setShowCelebration(false), 1800);
      // Atualizar lista sem fechar o modal (se fornecido)
      if (onStatusChanged) {
        onStatusChanged();
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      setError("Não foi possível alterar o status. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelStatusChange = () => {
    setShowStatusConfirmModal(false);
    setNewStatus(null);
  };

  const handleTituloSave = async () => {
    setTituloEditando(false);
  };

  const handleDescricaoSave = async () => {
    setDescricaoEditando(false);
  };

  const handleSave = async () => {
    if (!edital.id) return;
    const ok = await persistChanges();
    if (ok) {
      onSave();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (drawerOpen) {
          setDrawerOpen(false);
          return;
        }
        if (!showStatusConfirmModal && !showStatusErrorModal) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Editar edital"
    >
      {/* Modal de Confirmação de Status */}
      {showStatusConfirmModal && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div
            className="status-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="confirm-title warn">
              <AlertTriangle size={18} className="icon-warn" />
              Confirmar mudança de status
            </h3>
            <p>
              A mudança de status é imediata e não requer salvar o formulário.
            </p>
            <p>
              Novo status:{" "}
              <strong>{newStatus ? statusLabelMap[newStatus] : ""}</strong>
            </p>
            <div className="confirm-input-group">
              <label htmlFor="confirm-status-input">
                Para continuar, digite exatamente: TENHO CERTEZA
              </label>
              <input
                id="confirm-status-input"
                className="confirm-input"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="TENHO CERTEZA"
                autoFocus
              />
            </div>
            <div className="confirm-buttons">
              <button onClick={cancelStatusChange} className="btn-cancel">
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                className="btn-confirm"
                disabled={confirmText !== "TENHO CERTEZA" || isSaving}
                title={
                  confirmText !== "TENHO CERTEZA"
                    ? "Digite TENHO CERTEZA para confirmar"
                    : "Confirmar mudança"
                }
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusErrorModal && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div
            className="status-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="confirm-title danger">
              <AlertTriangle size={18} className="icon-danger" />
              Não é possível alterar o status
            </h3>
            <p>{statusErrorMessage}</p>
            <div className="confirm-buttons">
              <button
                onClick={() => setShowStatusErrorModal(false)}
                className="btn-confirm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Principal - Layout Horizontal */}
      <div
        className={`modal-horizontal ${drawerOpen ? "drawer-open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Camada de celebração (balões) */}
        {showCelebration && (
          <div className="celebration-container" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={`balloon b${i + 1}`} />
            ))}
          </div>
        )}
        {/* Header fixo com Título e Status */}
        <div className="modal-header-horizontal">
          <div className="header-container">
            {/* Título Editável */}
            <div className="titulo-section">
              {tituloEditando ? (
                <div className="titulo-editing">
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="titulo-input"
                    autoFocus
                    onBlur={handleTituloSave}
                    onKeyPress={(e) => e.key === "Enter" && handleTituloSave()}
                    placeholder="Título do edital"
                    title="Título do edital"
                  />
                </div>
              ) : (
                <div
                  className="titulo-display"
                  onClick={() => setTituloEditando(true)}
                >
                  <h1>{titulo}</h1>
                  <Edit size={16} className="edit-icon" />
                </div>
              )}
            </div>

            {/* Status com Dropdown - sem label */}
            <div className="status-section">
              <div className="status-selector">
                <button
                  className={`status-button status-${status.toLowerCase().replace("_", "-")}`}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  {getStatusIcon(status)}
                  <span>{statusLabelMap[status]}</span>
                  <div className="status-indicator-active"></div>
                  <ChevronDown size={16} />
                </button>
                {showStatusDropdown && (
                  <div className="status-dropdown">
                    {(
                      [
                        "RASCUNHO",
                        "ABERTO",
                        "EM_ANDAMENTO",
                        "ENCERRADO",
                      ] as StatusEdital[]
                    ).map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => handleStatusChange(statusOption)}
                        className={`status-option ${statusOption === status ? "active" : ""}`}
                        aria-current={
                          statusOption === status ? "true" : undefined
                        }
                      >
                        {getStatusIcon(statusOption)}
                        <span>{statusLabelMap[statusOption]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-content-horizontal">
          {/* Descrição - topo */}
          <section className="section-card">
            <div
              className="section-header-modal"
              onClick={() => setOpenDescricao(!openDescricao)}
            >
              <div className="section-title">
                <h3>Descrição</h3>
                <p className="section-subtitle">
                  Resumo claro sobre o edital para orientar o aluno
                </p>
              </div>
              <button
                className={`section-toggle ${openDescricao ? "open" : ""}`}
                aria-label="Alternar descrição"
                title="Alternar descrição"
              >
                <ChevronDown size={18} />
              </button>
            </div>
            {openDescricao && (
              <div className="section-body">
                {descricaoEditando ? (
                  <div className="descricao-editing">
                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="descricao-textarea"
                      rows={4}
                      autoFocus
                      onBlur={handleDescricaoSave}
                      placeholder="Descrição do edital"
                      title="Descrição do edital"
                    />
                  </div>
                ) : (
                  <div
                    className="descricao-display"
                    onClick={() => setDescricaoEditando(true)}
                  >
                    <p>{descricao || "Clique para adicionar uma descrição"}</p>
                    <Edit size={16} className="edit-icon" />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Seção de Vagas - Largura completa (movida para logo após Descrição) */}
          <section className="vagas-section-full section-card">
            <div
              className="section-header-modal"
              onClick={() => setOpenVagas(!openVagas)}
            >
              <div className="section-title">
                <h3>
                  <Users size={20} /> Vagas
                </h3>
                <p className="section-subtitle">
                  Gerencie benefícios, quantidades e descrições
                </p>
              </div>
              <button
                className={`section-toggle ${openVagas ? "open" : ""}`}
                aria-label="Alternar vagas"
                title="Alternar vagas"
              >
                <ChevronDown size={18} />
              </button>
            </div>
            {openVagas && (
              <div className="vagas-list section-body">
                {vagas.map((vaga, index) => (
                  <div key={index} className="vaga-item">
                    {vaga.isEditing ? (
                      <div className="vaga-editing">
                        <input
                          type="text"
                          placeholder="Benefício"
                          value={vaga.value.beneficio}
                          onChange={(e) => {
                            const newVagas = [...vagas];
                            newVagas[index].value.beneficio = e.target.value;
                            setVagas(newVagas);
                          }}
                          className="vaga-input"
                        />
                        <input
                          type="number"
                          placeholder="Número de vagas"
                          value={vaga.value.numero_vagas}
                          onChange={(e) => {
                            const newVagas = [...vagas];
                            newVagas[index].value.numero_vagas =
                              parseInt(e.target.value) || 0;
                            setVagas(newVagas);
                          }}
                          className="vaga-number"
                          min={0}
                        />
                        <textarea
                          placeholder="Descrição do benefício"
                          value={vaga.value.descricao_beneficio}
                          onChange={(e) => {
                            const newVagas = [...vagas];
                            newVagas[index].value.descricao_beneficio =
                              e.target.value;
                            setVagas(newVagas);
                          }}
                          className="vaga-textarea"
                          rows={2}
                        />
                        <div className="vaga-actions">
                          <button
                            aria-label="Salvar vaga"
                            title="Salvar vaga"
                            onClick={() => {
                              if (
                                vaga.value.beneficio &&
                                vaga.value.numero_vagas > 0
                              ) {
                                const newVagas = [...vagas];
                                newVagas[index].isEditing = false;
                                setVagas(newVagas);
                              }
                            }}
                            className="btn-save-vaga"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            aria-label="Excluir vaga"
                            title="Excluir vaga"
                            onClick={() => {
                              const newVagas = vagas.filter(
                                (_, i) => i !== index
                              );
                              setVagas(newVagas);
                            }}
                            className="btn-delete-vaga"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="vaga-display">
                        <div className="vaga-content">
                          <div className="vaga-header">
                            <h4>{vaga.value.beneficio}</h4>
                            <span className="vaga-count">
                              {vaga.value.numero_vagas} vagas
                            </span>
                          </div>
                          {vaga.value.descricao_beneficio && (
                            <p className="vaga-description">
                              {vaga.value.descricao_beneficio}
                            </p>
                          )}
                        </div>
                        <div className="vaga-actions">
                          <button
                            aria-label="Editar vaga"
                            title="Editar vaga"
                            onClick={() => {
                              const newVagas = [...vagas];
                              newVagas[index].isEditing = true;
                              setVagas(newVagas);
                            }}
                            className="btn-edit-vaga"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            aria-label="Excluir vaga"
                            title="Excluir vaga"
                            onClick={() => {
                              const newVagas = vagas.filter(
                                (_, i) => i !== index
                              );
                              setVagas(newVagas);
                            }}
                            className="btn-delete-vaga"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {vagas.length === 0 && (
                  <div className="empty-state">Nenhuma vaga adicionada.</div>
                )}
                <button
                  onClick={() => {
                    setVagas([
                      ...vagas,
                      {
                        value: {
                          edital_id: edital.id!,
                          beneficio: "",
                          descricao_beneficio: "",
                          numero_vagas: 1,
                        },
                        isEditing: true,
                      },
                    ]);
                  }}
                  className="btn-add-vaga"
                >
                  <Plus size={16} />
                  Adicionar Vaga
                </button>
              </div>
            )}
          </section>

          {/* Seção de Questionários - abaixo de Vagas (UI-only) */}
          <section className="questionarios-section-full section-card">
            <div
              className="section-header-modal"
              onClick={() => setOpenQuestionarios(!openQuestionarios)}
            >
              <div className="section-title">
                <h3>
                  <FileText size={20} /> Questionários
                </h3>
                <p className="section-subtitle">
                  Organize formulários em seções com prévia de perguntas
                </p>
              </div>
              <button
                className={`section-toggle ${openQuestionarios ? "open" : ""}`}
                aria-label="Alternar questionários"
                title="Alternar questionários"
              >
                <ChevronDown size={18} />
              </button>
            </div>
            {openQuestionarios && (
              <div className="questionarios-grid section-body">
                {questionarios.map((q, index) => (
                  <div key={index} className="questionario-item">
                    {q.isEditing ? (
                      <div className="questionario-editing">
                        <input
                          type="text"
                          placeholder="Título do questionário"
                          value={q.value.titulo}
                          onChange={(e) => {
                            const list = [...questionarios];
                            list[index].value.titulo = e.target.value;
                            setQuestionarios(list);
                          }}
                          className="questionario-input"
                        />
                        <div className="questionario-actions">
                          <button
                            aria-label="Salvar questionário"
                            title="Salvar questionário"
                            onClick={() => {
                              if (q.value.titulo.trim().length > 0) {
                                const list = [...questionarios];
                                list[index].isEditing = false;
                                setQuestionarios(list);
                              }
                            }}
                            className="btn-save-questionario"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            aria-label="Excluir questionário"
                            title="Excluir questionário"
                            onClick={() => {
                              setQuestionarios(
                                questionarios.filter((_, i) => i !== index)
                              );
                            }}
                            className="btn-delete-questionario"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="questionario-display"
                        onClick={async () => {
                          setActiveQuestionarioIndex(index);
                          setDrawerOpen(true);
                          setQuizTitleEditing(false);
                          // Carrega perguntas reais para este step (se existir id)
                          setDrawerLoading(true);
                          try {
                            const stepId = questionarios[index].value.id;
                            if (stepId) {
                              const perguntas =
                                await perguntaService.listarPerguntasPorStep(
                                  stepId
                                );
                              const mapped: PerguntaEditorItem[] = (
                                perguntas || []
                              ).map((p) => ({
                                texto: p.texto_pergunta || p.pergunta || "",
                                tipo:
                                  (p.tipo_pergunta as PerguntaEditorItem["tipo"]) ||
                                  (p.tipo_Pergunta as PerguntaEditorItem["tipo"]) ||
                                  "texto",
                                obrigatoria: Boolean(
                                  p.obrigatoria ?? p.obrigatoriedade ?? false
                                ),
                                opcoes: (p.opcoes_resposta ||
                                  p.opcoes ||
                                  []) as string[],
                              }));
                              setEditorPerguntas(mapped);
                            } else {
                              // novo questionário ainda sem id
                              setEditorPerguntas([]);
                            }
                          } catch (e) {
                            setEditorPerguntas([]);
                          } finally {
                            setDrawerLoading(false);
                          }
                        }}
                      >
                        <div className="questionario-preview">
                          {q.value.previewPerguntas &&
                          q.value.previewPerguntas.length > 0 ? (
                            <div
                              className="preview-list"
                              title={q.value.previewPerguntas.join("\n")}
                            >
                              {q.value.previewPerguntas
                                .filter((t) => (t || "").trim().length > 0)
                                .slice(0, 4)
                                .map((t, i) => (
                                  <p key={i} className="preview-line">
                                    {t}
                                  </p>
                                ))}
                            </div>
                          ) : (
                            <div className="preview-empty">Sem perguntas</div>
                          )}
                        </div>
                        <div className="questionario-header">
                          <h4 title={q.value.titulo}>
                            {q.value.titulo || "Sem título"}
                          </h4>
                          <div className="questionario-meta">
                            <span className="questionario-count">
                              {q.value.previewPerguntas?.length || 0}{" "}
                              {(q.value.previewPerguntas?.length || 0) === 1
                                ? "pergunta"
                                : "perguntas"}
                            </span>
                            <ChevronRight
                              className="open-indicator"
                              size={16}
                            />
                            <div className="questionario-actions">
                              {/* <button
                                aria-label="Editar questionário"
                                title="Editar questionário"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const list = [...questionarios];
                                  list[index].isEditing = true;
                                  setQuestionarios(list);
                                }}
                                className="btn-edit-questionario"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                aria-label="Excluir questionário"
                                title="Excluir questionário"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuestionarios(
                                    questionarios.filter((_, i) => i !== index)
                                  );
                                }}
                                className="btn-delete-questionario"
                              >
                                <Trash2 size={16} />
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {questionarios.length === 0 && (
                  <div className="empty-state">
                    Nenhum questionário adicionado.
                  </div>
                )}
                <button
                  onClick={() => {
                    setQuestionarios([
                      ...questionarios,
                      {
                        value: { titulo: "", previewPerguntas: [] },
                        isEditing: true,
                      },
                    ]);
                  }}
                  className="btn-add-questionario"
                >
                  <Plus size={16} />
                  Adicionar Questionário
                </button>
              </div>
            )}
          </section>

          {/* Row de 2 colunas: Cronograma (esquerda) e Links (direita) */}
          <div className="two-col-row">
            {/* Cronograma */}
            <section className="timeline-section-full section-card">
              <div
                className="section-header-modal"
                onClick={() => setOpenCronograma(!openCronograma)}
              >
                <div className="section-title">
                  <h3>
                    <Calendar size={20} /> Cronograma
                  </h3>
                  <p className="section-subtitle">
                    Defina as etapas e períodos do processo seletivo
                  </p>
                </div>
                <button
                  className={`section-toggle ${openCronograma ? "open" : ""}`}
                  aria-label="Alternar cronograma"
                  title="Alternar cronograma"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              {openCronograma && (
                <div className="timeline-container section-body">
                  {etapas.map((etapa, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-dot"></div>
                      {etapa.isEditing ? (
                        <div className="timeline-editing">
                          <input
                            type="text"
                            placeholder="Nome da etapa"
                            value={etapa.value.etapa}
                            onChange={(e) => {
                              const newEtapas = [...etapas];
                              newEtapas[index].value.etapa = e.target.value;
                              setEtapas(newEtapas);
                            }}
                            className="timeline-input"
                          />
                          <div className="timeline-dates">
                            <input
                              type="date"
                              value={etapa.value.data_inicio}
                              title="Data de início"
                              onChange={(e) => {
                                const newEtapas = [...etapas];
                                newEtapas[index].value.data_inicio =
                                  e.target.value;
                                setEtapas(newEtapas);
                              }}
                              className="date-input"
                            />
                            <span>até</span>
                            <input
                              type="date"
                              value={etapa.value.data_fim}
                              title="Data de término"
                              onChange={(e) => {
                                const newEtapas = [...etapas];
                                newEtapas[index].value.data_fim =
                                  e.target.value;
                                setEtapas(newEtapas);
                              }}
                              className="date-input"
                            />
                          </div>
                          <div className="timeline-actions">
                            <button
                              aria-label="Salvar etapa"
                              title="Salvar etapa"
                              onClick={() => {
                                if (
                                  etapa.value.etapa &&
                                  etapa.value.data_inicio &&
                                  etapa.value.data_fim
                                ) {
                                  const newEtapas = [...etapas];
                                  newEtapas[index].isEditing = false;
                                  setEtapas(newEtapas);
                                }
                              }}
                              className="btn-save-timeline"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              aria-label="Excluir etapa"
                              title="Excluir etapa"
                              onClick={() => {
                                const newEtapas = etapas.filter(
                                  (_, i) => i !== index
                                );
                                setEtapas(newEtapas);
                              }}
                              className="btn-delete-timeline"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="timeline-display">
                          <div className="timeline-content">
                            <h4>{etapa.value.etapa}</h4>
                            <div className="timeline-period">
                              {new Date(
                                etapa.value.data_inicio
                              ).toLocaleDateString("pt-BR")}{" "}
                              -{" "}
                              {new Date(
                                etapa.value.data_fim
                              ).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                          <div className="timeline-actions">
                            <button
                              aria-label="Editar etapa"
                              title="Editar etapa"
                              onClick={() => {
                                const newEtapas = [...etapas];
                                newEtapas[index].isEditing = true;
                                setEtapas(newEtapas);
                              }}
                              className="btn-edit-timeline"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              aria-label="Excluir etapa"
                              title="Excluir etapa"
                              onClick={() => {
                                const newEtapas = etapas.filter(
                                  (_, i) => i !== index
                                );
                                setEtapas(newEtapas);
                              }}
                              className="btn-delete-timeline"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setEtapas([
                        ...etapas,
                        {
                          value: {
                            etapa: "",
                            ordem_elemento: etapas.length + 1,
                            data_inicio: "",
                            data_fim: "",
                          },
                          isEditing: true,
                        },
                      ]);
                    }}
                    className="btn-add-timeline"
                  >
                    <Plus size={16} />
                    Adicionar Etapa
                  </button>
                </div>
              )}
            </section>

            {/* Links/Documentos */}
            <section className="section-card">
              <div
                className="section-header-modal"
                onClick={() => setOpenLinks(!openLinks)}
              >
                <div className="section-title">
                  <h3>
                    <Link size={20} /> Links e Documentos
                  </h3>
                  <p className="section-subtitle">
                    URLs e PDFs relevantes que complementam o edital
                  </p>
                </div>
                <button
                  className={`section-toggle ${openLinks ? "open" : ""}`}
                  aria-label="Alternar links"
                  title="Alternar links"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
              {openLinks && (
                <div className="links-list section-body">
                  {documentos.map((documento, index) => (
                    <div key={index} className="link-item">
                      {documento.isEditing ? (
                        <div className="link-editing">
                          <input
                            type="text"
                            placeholder="Título do documento"
                            value={documento.value.titulo_documento}
                            onChange={(e) => {
                              const newDocs = [...documentos];
                              newDocs[index].value.titulo_documento =
                                e.target.value;
                              setDocumentos(newDocs);
                            }}
                            className="link-input"
                          />
                          <input
                            type="url"
                            placeholder="URL do documento"
                            value={documento.value.url_documento}
                            onChange={(e) => {
                              const newDocs = [...documentos];
                              newDocs[index].value.url_documento =
                                e.target.value;
                              setDocumentos(newDocs);
                            }}
                            className="link-input"
                          />
                          <div className="link-actions">
                            <button
                              aria-label="Salvar link"
                              title="Salvar link"
                              onClick={() => {
                                if (
                                  documento.value.titulo_documento &&
                                  documento.value.url_documento
                                ) {
                                  const newDocs = [...documentos];
                                  newDocs[index].isEditing = false;
                                  setDocumentos(newDocs);
                                }
                              }}
                              className="btn-save-link"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              aria-label="Excluir link"
                              title="Excluir link"
                              onClick={() => {
                                const newDocs = documentos.filter(
                                  (_, i) => i !== index
                                );
                                setDocumentos(newDocs);
                              }}
                              className="btn-delete-link"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="link-display">
                          <div className="link-info">
                            <span className="link-title">
                              {documento.value.titulo_documento}
                            </span>
                            <a
                              href={documento.value.url_documento}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link-url"
                            >
                              {documento.value.url_documento}
                            </a>
                          </div>
                          <div className="link-actions">
                            <button
                              aria-label="Editar link"
                              title="Editar link"
                              onClick={() => {
                                const newDocs = [...documentos];
                                newDocs[index].isEditing = true;
                                setDocumentos(newDocs);
                              }}
                              className="btn-edit-link"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              aria-label="Excluir link"
                              title="Excluir link"
                              onClick={() => {
                                const newDocs = documentos.filter(
                                  (_, i) => i !== index
                                );
                                setDocumentos(newDocs);
                              }}
                              className="btn-delete-link"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {documentos.length === 0 && (
                    <div className="empty-state">Nenhum link adicionado.</div>
                  )}
                  <button
                    onClick={() => {
                      setDocumentos([
                        ...documentos,
                        {
                          value: { titulo_documento: "", url_documento: "" },
                          isEditing: true,
                        },
                      ]);
                    }}
                    className="btn-add-link"
                  >
                    <Plus size={16} />
                    Adicionar Link
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* fim da row 2 colunas */}
        </div>

        {/* Footer com botões de ação */}
        <div className="modal-footer-horizontal">
          {error && <div className="error-message">{error}</div>}
          <div className="footer-buttons">
            <button onClick={onClose} className="btn-cancel-footer">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="btn-save-footer"
              title={!hasChanges ? "Nenhuma alteração para salvar" : undefined}
            >
              {isSaving ? (
                <span className="btn-save-content">
                  <span className="spinner" aria-hidden="true" />
                  Salvando...
                </span>
              ) : (
                <span className="btn-save-content">
                  <Save size={16} />
                  Salvar Alterações
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Drawer Lateral para edição de Questionários */}
        <aside className={`drawer-panel ${drawerOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <div className="drawer-title">
              {quizTitleEditing && activeQuestionarioIndex !== null ? (
                <input
                  type="text"
                  className="drawer-title-input"
                  value={questionarios[activeQuestionarioIndex].value.titulo}
                  onChange={(e) => {
                    const list = [...questionarios];
                    list[activeQuestionarioIndex].value.titulo = e.target.value;
                    setQuestionarios(list);
                  }}
                  autoFocus
                  onBlur={() => setQuizTitleEditing(false)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && setQuizTitleEditing(false)
                  }
                  placeholder="Título do questionário"
                  title="Título do questionário"
                />
              ) : (
                <button
                  type="button"
                  className="drawer-title-display"
                  onClick={() => setQuizTitleEditing(true)}
                  title="Clique para editar o título do questionário"
                >
                  <span>
                    {activeQuestionarioIndex !== null
                      ? questionarios[activeQuestionarioIndex]?.value.titulo ||
                        "Questionário"
                      : "Questionário"}
                  </span>
                  <Edit size={16} className="edit-icon" />
                </button>
              )}
            </div>
            <button
              className="drawer-close"
              aria-label="Fechar editor de questionário"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="drawer-body">
            {drawerLoading ? (
              <div className="drawer-loading">Carregando perguntas…</div>
            ) : (
              <>
                {/* Título do questionário agora é editado no header */}

                {/* Lista de perguntas (UI-only) */}
                <div className="perguntas-list">
                  {editorPerguntas.length === 0 && (
                    <div className="empty-state">
                      Nenhuma pergunta adicionada.
                    </div>
                  )}
                  {editorPerguntas.map((p, i) => (
                    <div key={i} className="pergunta-item">
                      <div className="field-row">
                        <input
                          type="text"
                          placeholder={`Pergunta #${i + 1}`}
                          value={p.texto}
                          onChange={(e) => {
                            const list = [...editorPerguntas];
                            list[i].texto = e.target.value;
                            setEditorPerguntas(list);
                          }}
                        />
                      </div>
                      <div className="field-row two">
                        <select
                          aria-label="Tipo da pergunta"
                          title="Tipo da pergunta"
                          value={p.tipo}
                          onChange={(e) => {
                            const list = [...editorPerguntas];
                            list[i].tipo = e.target
                              .value as PerguntaEditorItem["tipo"];
                            // Se o tipo mudar para múltipla escolha/seleção, garante opcoes
                            if (
                              list[i].tipo === "multipla_escolha" ||
                              list[i].tipo === "multipla_selecao"
                            ) {
                              list[i].opcoes = list[i].opcoes || [""];
                            }
                            setEditorPerguntas(list);
                          }}
                        >
                          <option value="texto">Texto</option>
                          <option value="texto_curto">Texto curto</option>
                          <option value="numero">Número</option>
                          <option value="data">Data</option>
                          <option value="email">Email</option>
                          <option value="arquivo">Arquivo</option>
                          <option value="multipla_escolha">
                            Múltipla escolha
                          </option>
                          <option value="multipla_selecao">
                            Múltipla seleção
                          </option>
                        </select>
                        <label className="checkbox-inline">
                          <input
                            type="checkbox"
                            checked={p.obrigatoria}
                            onChange={(e) => {
                              const list = [...editorPerguntas];
                              list[i].obrigatoria = e.target.checked;
                              setEditorPerguntas(list);
                            }}
                          />
                          Obrigatória
                        </label>
                      </div>

                      {(p.tipo === "multipla_escolha" ||
                        p.tipo === "multipla_selecao") && (
                        <div className="opcoes-list">
                          {(p.opcoes || []).map((opt, j) => (
                            <div key={j} className="field-row">
                              <input
                                type="text"
                                placeholder={`Opção ${j + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const list = [...editorPerguntas];
                                  const ops = [...(list[i].opcoes || [])];
                                  ops[j] = e.target.value;
                                  list[i].opcoes = ops;
                                  setEditorPerguntas(list);
                                }}
                              />
                              <button
                                className="btn-small danger"
                                onClick={() => {
                                  const list = [...editorPerguntas];
                                  const ops = [...(list[i].opcoes || [])];
                                  ops.splice(j, 1);
                                  list[i].opcoes = ops;
                                  setEditorPerguntas(list);
                                }}
                                aria-label="Remover opção"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            className="btn-small"
                            onClick={() => {
                              const list = [...editorPerguntas];
                              list[i].opcoes = [...(list[i].opcoes || []), ""];
                              setEditorPerguntas(list);
                            }}
                          >
                            <Plus size={14} /> Adicionar opção
                          </button>
                        </div>
                      )}

                      <div className="pergunta-actions">
                        <button
                          className="btn-delete-timeline"
                          title="Excluir pergunta"
                          aria-label="Excluir pergunta"
                          onClick={() => {
                            setEditorPerguntas((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            );
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="drawer-actions">
                  <button
                    className="btn-primary-outline"
                    onClick={() =>
                      setEditorPerguntas((prev) => [
                        ...prev,
                        {
                          texto: "",
                          tipo: "texto",
                          obrigatoria: false,
                          opcoes: [],
                        },
                      ])
                    }
                  >
                    <Plus size={16} /> Adicionar pergunta
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Rodapé fixo do drawer */}
          <div className="drawer-footer">
            {/* <div className="spacer" /> */}
            <button
              className="btn-save-footer"
              onClick={() => {
                // UI-only: atualiza a prévia com base nas primeiras 3 perguntas
                if (activeQuestionarioIndex !== null) {
                  const preview = editorPerguntas
                    .map((p) => p.texto.trim())
                    .filter(Boolean)
                    .slice(0, 3);
                  setQuestionarios((prev) =>
                    prev.map((qq, idx) =>
                      idx === activeQuestionarioIndex
                        ? {
                            ...qq,
                            value: {
                              ...qq.value,
                              previewPerguntas: preview,
                            },
                          }
                        : qq
                    )
                  );
                }
                toast.success("Alterações do questionário aplicadas (UI)");
                setDrawerOpen(false);
              }}
            >
              <Save size={16} /> Aplicar alterações
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ModalEditarEdital;
