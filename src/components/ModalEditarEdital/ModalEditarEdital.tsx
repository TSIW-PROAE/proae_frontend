import React, { useState, useEffect, useRef } from "react";
import { Edital, DocumentoEdital, EtapaEdital } from "../../types/edital";
import { stepService } from "@/services/StepService/stepService";
import { perguntaService } from "@/services/PerguntaService/perguntaService";
import { editalService } from "../../services/EditalService/editalService";
import { toast } from "react-hot-toast";
import "./ModalEditarEdital.css";

// Importar tipos e utilitários
import {
  EditableDocumento,
  EditableEtapa,
  EditableVaga,
  StatusEdital,
  EditableQuestionario,
  PerguntaEditorItem,
} from "./types";
import { toInternalStatus, makeSnapshot } from "./utils";

// Importar componentes
import {
  StatusConfirmModal,
  StatusErrorModal,
  ModalHeader,
  DescricaoSection,
  VagasSection,
  QuestionariosSection,
  CronogramaSection,
  DocumentosSection,
  ModalFooter,
  QuestionarioDrawer,
  CelebrationOverlay,
} from "./components";

interface ModalEditarEditalProps {
  edital: Edital;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onStatusChanged?: () => void;
}

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
  const [editorPerguntas, setEditorPerguntas] = useState<PerguntaEditorItem[]>(
    []
  );

  // Estado local de Questionários (somente UI por enquanto)
  const [questionarios, setQuestionarios] = useState<EditableQuestionario[]>(
    []
  );

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
            nome: s.titulo || s.texto || "",
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

  const handleOpenQuestionario = async (index: number) => {
    setActiveQuestionarioIndex(index);
    setDrawerOpen(true);
    setQuizTitleEditing(false);
    // Carrega perguntas reais para este step (se existir id)
    setDrawerLoading(true);
    try {
      const stepId = questionarios[index].value.id;
      if (stepId) {
        const perguntas = await perguntaService.listarPerguntasPorStep(stepId);
        const mapped: PerguntaEditorItem[] = (perguntas || []).map((p) => ({
          texto: p.texto_pergunta || p.pergunta || "",
          tipo:
            (p.tipo_pergunta as PerguntaEditorItem["tipo"]) ||
            (p.tipo_Pergunta as PerguntaEditorItem["tipo"]) ||
            "texto",
          obrigatoria: Boolean(p.obrigatoria ?? p.obrigatoriedade ?? false),
          opcoes: (p.opcoes_resposta || p.opcoes || []) as string[],
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
      <StatusConfirmModal
        isOpen={showStatusConfirmModal}
        newStatus={newStatus}
        confirmText={confirmText}
        isSaving={isSaving}
        onConfirmTextChange={setConfirmText}
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
      />

      <StatusErrorModal
        isOpen={showStatusErrorModal}
        errorMessage={statusErrorMessage}
        onClose={() => setShowStatusErrorModal(false)}
      />

      {/* Modal Principal - Layout Horizontal */}
      <div
        className={`modal-horizontal ${drawerOpen ? "drawer-open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <CelebrationOverlay isVisible={showCelebration} />

        <ModalHeader
          titulo={titulo}
          tituloEditando={tituloEditando}
          status={status}
          showStatusDropdown={showStatusDropdown}
          onTituloChange={setTitulo}
          onTituloEditToggle={setTituloEditando}
          onTituloSave={handleTituloSave}
          onStatusDropdownToggle={() =>
            setShowStatusDropdown(!showStatusDropdown)
          }
          onStatusChange={handleStatusChange}
        />

        <div className="modal-content-horizontal">
          <DescricaoSection
            descricao={descricao}
            descricaoEditando={descricaoEditando}
            openDescricao={openDescricao}
            onDescricaoChange={setDescricao}
            onDescricaoEditToggle={setDescricaoEditando}
            onDescricaoSave={handleDescricaoSave}
            onToggleOpen={() => setOpenDescricao(!openDescricao)}
          />

          <VagasSection
            vagas={vagas}
            openVagas={openVagas}
            editalId={edital.id!}
            onVagasChange={setVagas}
            onToggleOpen={() => setOpenVagas(!openVagas)}
          />

          <QuestionariosSection
            questionarios={questionarios}
            openQuestionarios={openQuestionarios}
            onQuestionariosChange={setQuestionarios}
            onToggleOpen={() => setOpenQuestionarios(!openQuestionarios)}
            onOpenQuestionario={handleOpenQuestionario}
          />

          <div className="two-col-row">
            <CronogramaSection
              etapas={etapas}
              openCronograma={openCronograma}
              onEtapasChange={setEtapas}
              onToggleOpen={() => setOpenCronograma(!openCronograma)}
            />
            <DocumentosSection
              documentos={documentos}
              openLinks={openLinks}
              onDocumentosChange={setDocumentos}
              onToggleOpen={() => setOpenLinks(!openLinks)}
            />
          </div>

          {/* fim da row 2 colunas */}
        </div>

        <ModalFooter
          error={error}
          isSaving={isSaving}
          hasChanges={hasChanges}
          onSave={handleSave}
          onCancel={onClose}
        />

        <QuestionarioDrawer
          isOpen={drawerOpen}
          loading={drawerLoading}
          questionarios={questionarios}
          activeQuestionarioIndex={activeQuestionarioIndex}
          titleEditing={quizTitleEditing}
          perguntas={editorPerguntas}
          onClose={() => setDrawerOpen(false)}
          onQuestionarioSelect={(index) => {
            // Carrega as perguntas do questionário selecionado
            setActiveQuestionarioIndex(index);
            const questions =
              questionarios[index]?.value.previewPerguntas || [];
            const convertedQuestions: PerguntaEditorItem[] = questions.map(
              (texto) => ({
                texto,
                tipo: "texto",
                obrigatoria: false,
                opcoes: [],
              })
            );
            setEditorPerguntas(convertedQuestions);
          }}
          onTitleChange={(title) => {
            if (activeQuestionarioIndex !== null) {
              const list = [...questionarios];
              list[activeQuestionarioIndex].value.titulo = title;
              list[activeQuestionarioIndex].value.nome = title;
              setQuestionarios(list);
            }
          }}
          onTitleEditToggle={setQuizTitleEditing}
          onPerguntasChange={setEditorPerguntas}
          onSave={() => {
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
          adicionarQuestionario={() => {
            const novoQuestionario: EditableQuestionario = {
              value: {
                titulo: `Questionário ${questionarios.length + 1}`,
                nome: `Questionário ${questionarios.length + 1}`,
                previewPerguntas: [],
              },
              isEditing: false,
            };
            setQuestionarios([...questionarios, novoQuestionario]);
          }}
        />
      </div>
    </div>
  );
};

export default ModalEditarEdital;
