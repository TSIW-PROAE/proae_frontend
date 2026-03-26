import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Edital } from "../../types/edital";
import { stepService } from "@/services/StepService/stepService";
import { perguntaService } from "@/services/PerguntaService/perguntaService";
import { editalService } from "../../services/EditalService/editalService";
import { dadoService, Dado } from "@/services/DadoService/dado.service";
import { toast } from "react-hot-toast";
import {
  NIVEL_GRADUACAO,
  NIVEL_POS_GRADUACAO,
} from "@/constants/nivelAcademico";
import "./ModalEditarEdital.css";

// Importar tipos e utilitários
import { EditableDocumento, EditableEtapa, EditableVaga, StatusEdital, EditableQuestionario, PerguntaEditorItem } from "./types";
import { toInternalStatus } from "./utils";
import type { AutoSaveStatus } from "./components/ModalFooter";

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

const ModalEditarEdital: React.FC<ModalEditarEditalProps> = ({ edital, isOpen, onClose, onSave, onStatusChanged }) => {
  const [titulo, setTitulo] = useState(edital.titulo_edital);
  const [tituloEditando, setTituloEditando] = useState(false);
  const [descricao, setDescricao] = useState(edital.descricao || "");
  const [descricaoEditando, setDescricaoEditando] = useState(false);
  /** YYYY-MM-DD para input date; vazio = sem fim de vigência definido */
  const [dataFimVigencia, setDataFimVigencia] = useState<string>("");
  const [nivelAcademico, setNivelAcademico] = useState<string>(NIVEL_GRADUACAO);
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
  // Auto-save status indicator
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  // Celebração visual após sucesso
  const [showCelebration, setShowCelebration] = useState(false);

  // Drawer lateral de Questionários
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeQuestionarioIndex, setActiveQuestionarioIndex] = useState<number | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [quizTitleEditing, setQuizTitleEditing] = useState(false);
  const [editorPerguntas, setEditorPerguntas] = useState<PerguntaEditorItem[]>([]);

  /** Step ativo no drawer — cobre o tick em que o step acabou de ser criado e o state ainda não atualizou. */
  const activeDrawerStepIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!drawerOpen) {
      activeDrawerStepIdRef.current = undefined;
    }
  }, [drawerOpen]);

  // Estado local de Questionários (somente UI por enquanto)
  const [questionarios, setQuestionarios] = useState<EditableQuestionario[]>([]);

  // Estado de Dados do Aluno
  const [dadosAluno, setDadosAluno] = useState<Dado[]>([]);

  // Estado do modal de confirmação para nova pergunta em edital com inscrições
  const [showNovaPerguntaConfirm, setShowNovaPerguntaConfirm] = useState(false);
  const [novaPerguntaPrazo, setNovaPerguntaPrazo] = useState("");
  const [novaPerguntaPendingIndex, setNovaPerguntaPendingIndex] = useState<number | null>(null);

  // Estado do modal de confirmação para deletar pergunta em edital com inscrições
  const [showDeletePerguntaConfirm, setShowDeletePerguntaConfirm] = useState(false);
  const [deletePerguntaPendingIndex, setDeletePerguntaPendingIndex] = useState<number | null>(null);
  const [deletePerguntaTexto, setDeletePerguntaTexto] = useState("");

  useEffect(() => {
    if (isOpen && edital) {
      setAutoSaveStatus("idle");
      setTitulo(edital.titulo_edital);
      setDescricao(edital.descricao || "");
      setNivelAcademico(edital.nivel_academico?.trim() || NIVEL_GRADUACAO);
      // Garantir que o status atual esteja refletido ao abrir, normalizando caso venha em outro formato da API
      setStatus(toInternalStatus((edital.status_edital as unknown as string) || ""));

      // Inicializar documentos e etapas a partir do edital
      const docs = edital.edital_url || [];
      setDocumentos([...docs.map((doc) => ({ value: doc, isEditing: false }))]);

      const etapasData = (edital.etapa_edital || [])
        .slice()
        .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
        .map((etapa, idx) => ({ ...etapa, ordem_elemento: idx + 1 }));
      setEtapas([...etapasData.map((etapa) => ({ value: etapa, isEditing: false }))]);

      // Carregar vagas
      loadVagas();

      // Carregar Steps deste edital e montar UI de questionários
      loadSteps();

      // Carregar Dados do Aluno
      loadDadosAluno();
    }
  }, [isOpen, edital]);

  // UX: fechar com tecla Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Prioridade: fecha drawer primeiro; depois modais; por último fecha o modal principal
        if (showDeletePerguntaConfirm) {
          cancelDeletePergunta();
          return;
        }
        if (showNovaPerguntaConfirm) {
          cancelNovaPergunta();
          return;
        }
        if (drawerOpen) {
          setDrawerOpen(false);
          return;
        }
        if (!showStatusConfirmModal && !showStatusErrorModal) handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, showStatusConfirmModal, showStatusErrorModal, drawerOpen, showNovaPerguntaConfirm, showDeletePerguntaConfirm]);

  const loadVagas = async () => {
    if (!edital.id) return;
    try {
      const vagasData = await editalService.buscarVagasDoEdital(edital.id);
      const vagasEditable = [...vagasData.map((vaga) => ({ value: vaga, isEditing: false }))];
      setVagas(vagasEditable);
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    }
  };

  const loadSteps = async () => {
    if (!edital.id) return;
    try {
      const steps = await stepService.listarStepsPorEdital(edital.id.toString());
      // Monta questionários com preview vazio inicialmente
      const qs: EditableQuestionario[] = steps
        .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
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
          const preview = (perguntas || []).slice(0, 3).map((p) => p.pergunta || "");
          setQuestionarios((prev) => prev.map((q) => (q.value.id === s.id ? { ...q, value: { ...q.value, previewPerguntas: preview } } : q)));
        } catch (e) {
          // ignora erro de perguntas individuais
        }
      }
    } catch (error) {
      console.error("Erro ao carregar steps:", error);
    }
  };

  const loadDadosAluno = async () => {
    try {
      const dados = await dadoService.listarDados();
      setDadosAluno(dados || []);
    } catch (error) {
      console.error("Erro ao carregar dados do aluno:", error);
    }
  };


  // ── Auto-save helpers ──────────────────────────────────────────────
  const showSaved = useCallback(() => {
    setAutoSaveStatus("saved");
    const timer = setTimeout(() => setAutoSaveStatus((prev) => (prev === "saved" ? "idle" : prev)), 2000);
    return () => clearTimeout(timer);
  }, []);

  const showError = useCallback((msg?: string) => {
    setAutoSaveStatus("error");
    if (msg) toast.error(msg);
    setTimeout(() => setAutoSaveStatus((prev) => (prev === "error" ? "idle" : prev)), 3000);
  }, []);

  /** Persiste título, descrição, documentos e etapas do edital (tudo junto num único PUT). */
  const autoSaveEdital = useCallback(
    async (
      overrides: {
        documentosOverride?: EditableDocumento[];
        etapasOverride?: EditableEtapa[];
        /** Se definido, grava este valor como data_fim_vigencia (null limpa no banco) */
        dataFimVigenciaOverride?: string | null;
        /** Se definido, grava este nível (ex.: ao mudar o select antes do próximo render) */
        nivelAcademicoOverride?: string;
      } = {},
    ) => {
      if (!edital.id) return;
      setAutoSaveStatus("saving");
      try {
        const docs = overrides.documentosOverride ?? documentos;
        const etps = overrides.etapasOverride ?? etapas;

        const documentosValidos = docs.filter((doc) => doc.value.titulo_documento && doc.value.url_documento).map((doc) => doc.value);

        const etapasValidas = etps
          .filter((etapa) => etapa.value.etapa && etapa.value.data_inicio && etapa.value.data_fim)
          .map((etapa) => etapa.value)
          .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
          .map((etapa, idx) => ({ ...etapa, ordem_elemento: idx + 1 }));

        let data_fim_vigencia: string | null;
        if (overrides.dataFimVigenciaOverride !== undefined) {
          data_fim_vigencia =
            overrides.dataFimVigenciaOverride === null || overrides.dataFimVigenciaOverride === ""
              ? null
              : overrides.dataFimVigenciaOverride;
        } else {
          data_fim_vigencia = dataFimVigencia.trim() === "" ? null : dataFimVigencia.trim();
        }

        const nivel =
          overrides.nivelAcademicoOverride ?? nivelAcademico;

        await editalService.atualizarEdital(edital.id, {
          titulo_edital: titulo,
          descricao: descricao,
          edital_url: documentosValidos,
          etapa_edital: etapasValidas,
          data_fim_vigencia,
          nivel_academico: nivel,
        });

        showSaved();
      } catch (err) {
        console.error("Erro ao salvar edital:", err);
        showError("Erro ao salvar alterações");
      }
    },
    [edital.id, titulo, descricao, documentos, etapas, dataFimVigencia, nivelAcademico, showSaved, showError],
  );

  /** Persiste uma vaga individual (cria ou atualiza). */
  const handleSaveVaga = useCallback(
    async (index: number) => {
      if (!edital.id) return;
      const vaga = vagas[index];
      setAutoSaveStatus("saving");
      try {
        if (vaga.value.id) {
          await editalService.atualizarVaga(vaga.value.id, {
            beneficio: vaga.value.beneficio,
            descricao_beneficio: vaga.value.descricao_beneficio,
            numero_vagas: vaga.value.numero_vagas,
          });
        } else {
          const created = await editalService.criarVaga({
            edital_id: Number(edital.id),
            beneficio: vaga.value.beneficio,
            descricao_beneficio: vaga.value.descricao_beneficio,
            numero_vagas: vaga.value.numero_vagas,
          });
          if (created.id) {
            setVagas((prev) => prev.map((v, i) => (i === index ? { ...v, value: { ...v.value, id: created.id } } : v)));
          }
        }
        showSaved();
      } catch (err) {
        console.error("Erro ao salvar vaga:", err);
        showError("Erro ao salvar vaga");
        throw err; // propaga para o sub-componente não sair do modo edição
      }
    },
    [edital.id, vagas, showSaved, showError],
  );

  /** Deleta uma vaga no backend. */
  const handleDeleteVaga = useCallback(
    async (index: number) => {
      const vaga = vagas[index];
      if (!vaga.value.id) return;
      setAutoSaveStatus("saving");
      try {
        await editalService.deletarVaga(vaga.value.id);
        showSaved();
      } catch (err) {
        console.error("Erro ao deletar vaga:", err);
        showError("Erro ao remover vaga");
        throw err;
      }
    },
    [vagas, showSaved, showError],
  );

  /** Callback de persistência para o CronogramaSection. */
  const handleEtapasPersist = useCallback(
    (newEtapas: EditableEtapa[]) => {
      autoSaveEdital({ etapasOverride: newEtapas });
    },
    [autoSaveEdital],
  );

  /** Callback de persistência para o DocumentosSection. */
  const handleDocumentosPersist = useCallback(
    (newDocs: EditableDocumento[]) => {
      autoSaveEdital({ documentosOverride: newDocs });
    },
    [autoSaveEdital],
  );

  // ── Fim auto-save helpers ──────────────────────────────────────────

  const isEditalCompleteLocal = () => {
    const hasTitulo = Boolean(titulo && titulo.trim().length > 0);
    const hasDescricao = Boolean(descricao && descricao.trim().length > 0);
    const docsValidos = documentos.map((d) => d.value).filter((d) => d.titulo_documento && d.url_documento);
    const etapasValidas = etapas.map((e) => e.value).filter((e) => e.etapa && e.data_inicio && e.data_fim);
    return hasTitulo && hasDescricao && docsValidos.length > 0 && etapasValidas.length > 0;
  };

  const handleStatusChange = (newStatusValue: StatusEdital) => {
    setShowStatusDropdown(false);

    // Regras de transição locais antes da confirmação
    if (newStatusValue === "ABERTO" || newStatusValue === "EM_ANDAMENTO") {
      if (!isEditalCompleteLocal()) {
        setStatusErrorMessage(
          "Para alterar o status para ABERTO ou EM ANDAMENTO, todos os dados do edital devem estar preenchidos (título, descrição, ao menos 1 link/documento e ao menos 1 etapa do cronograma).",
        );
        setShowStatusErrorModal(true);
        return;
      }
    }
    if (newStatusValue === "ENCERRADO") {
      if (!(status === "ABERTO" || status === "EM_ANDAMENTO")) {
        setStatusErrorMessage("Só é possível alterar para ENCERRADO se o edital estiver ABERTO ou EM ANDAMENTO.");
        setShowStatusErrorModal(true);
        return;
      }
    }

    setNewStatus(newStatusValue);
    setShowStatusConfirmModal(true);
    setConfirmText("");
  };

  const confirmStatusChange = async () => {
    if (!newStatus || !edital.id) return;
    try {
      setIsSaving(true);
      const atualizado = await editalService.alterarStatusEdital(edital.id, newStatus);
      // Atualiza status local com o retornado ou com newStatus
      setStatus(toInternalStatus(((atualizado?.status_edital as unknown as string) || newStatus) as string));
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
    autoSaveEdital();
  };

  const handleDescricaoSave = async () => {
    setDescricaoEditando(false);
    autoSaveEdital();
  };

  /** Salva o título do questionário no drawer (via API de step). */
  const handleQuizTitleSave = async () => {
    setQuizTitleEditing(false);
    if (activeQuestionarioIndex !== null) {
      const q = questionarios[activeQuestionarioIndex];
      if (q.value.id && q.value.titulo.trim()) {
        setAutoSaveStatus("saving");
        try {
          await stepService.atualizarStep(q.value.id, q.value.titulo.trim());
          showSaved();
        } catch (err) {
          console.error("Erro ao salvar título do questionário:", err);
          showError("Erro ao salvar título do questionário");
        }
      }
    }
  };

  /** Fecha o modal e notifica o pai para recarregar a lista. */
  const handleClose = () => {
    onSave();   // recarrega a lista de editais no pai
    onClose();  // fecha o modal
  };

  const handleAddQuestionario = () => {
    // Adiciona um questionário temporário em modo de edição (sem ID ainda)
    const novoQuestionario: EditableQuestionario = {
      value: {
        titulo: "",
        nome: "",
        previewPerguntas: [],
      },
      isEditing: true, // Modo de edição ativado para permitir nomeação
    };
    setQuestionarios([...questionarios, novoQuestionario]);
  };

  const handleOpenQuestionario = async (index: number) => {
    if (!edital.id) {
      toast.error("Erro: ID do edital não encontrado");
      return;
    }

    setActiveQuestionarioIndex(index);
    setDrawerOpen(true);
    setQuizTitleEditing(false);
    setDrawerLoading(true);
    try {
      let stepId = questionarios[index]?.value?.id;

      /** Cria o Step no backend na primeira vez que o editor abre — não exige “salvar” antes das perguntas. */
      if (!stepId) {
        const tituloTrimmed =
          (questionarios[index]?.value?.titulo || "").trim() || "Questionário";
        const created = await stepService.criarStep(String(edital.id), tituloTrimmed);
        if (!created?.id) {
          toast.error("Erro ao criar questionário");
          setDrawerOpen(false);
          setActiveQuestionarioIndex(null);
          return;
        }
        stepId = created.id;
        setQuestionarios((prev) => {
          const next = [...prev];
          if (!next[index]) return prev;
          next[index] = {
            value: {
              ...next[index].value,
              id: created.id,
              titulo: tituloTrimmed,
              nome: tituloTrimmed,
            },
            isEditing: false,
          };
          return next;
        });
      }

      if (stepId) {
        activeDrawerStepIdRef.current = String(stepId);
        // Garantir que os dados do aluno estejam carregados antes de mapear as perguntas
        console.log("Carregando dados do aluno...");
        await loadDadosAluno();
        console.log("Dados do aluno carregados:", dadosAluno.length, "itens");

        console.log("Carregando perguntas para step:", stepId);
        const perguntas = await perguntaService.listarPerguntasPorStep(stepId);
        console.log("Perguntas recebidas da API:", perguntas);

        const mapped: PerguntaEditorItem[] = (perguntas || []).map((p) => {
          // Verifica se existe dado vinculado
          const dadoVinculado = (p as any).dado;
          const isVinculada = Boolean(dadoVinculado);
          console.log(`Processando pergunta "${p.pergunta}":`, {
            dadoVinculado,
            isVinculada,
          });

          // Mapeia os tipos da API para os tipos do componente
          let tipoFromAPI = p.tipo_pergunta || p.tipo_Pergunta || "text";
          let opcoesFromAPI = (p.opcoes || []) as string[];
          let obrigatoriaFromAPI = Boolean(p.obrigatoria ?? p.obrigatoriedade ?? false);

          // Se tem dado vinculado, busca o tipo, opções e obrigatoriedade do dado
          if (isVinculada && dadoVinculado) {
            console.log(`Buscando dado com ID ${dadoVinculado.id} na lista de ${dadosAluno.length} dados`);
            const dadoCompleto = dadosAluno.find((d) => d.id === dadoVinculado.id);
            if (dadoCompleto) {
              console.log(`Pergunta "${p.pergunta}" vinculada ao dado "${dadoCompleto.nome}":`, {
                tipoOriginal: tipoFromAPI,
                tipoNovo: dadoCompleto.tipo,
                obrigatoriaOriginal: obrigatoriaFromAPI,
                obrigatoriaNova: dadoCompleto.obrigatorio,
              });
              tipoFromAPI = dadoCompleto.tipo;
              opcoesFromAPI = dadoCompleto.opcoes || [];
              obrigatoriaFromAPI = Boolean(dadoCompleto.obrigatorio);
            } else {
              console.warn(`Dado com ID ${dadoVinculado.id} não encontrado na lista de dados do aluno`);
            }
          }

          let tipoMapeado: PerguntaEditorItem["tipo"] = "texto";

          switch (tipoFromAPI) {
            case "text":
              tipoMapeado = "texto";
              break;
            case "number":
              tipoMapeado = "numero";
              break;
            case "date":
              tipoMapeado = "data";
              break;
            case "select":
              tipoMapeado = "multipla_escolha";
              break;
            case "file":
              tipoMapeado = "arquivo";
              break;
            case "email":
              tipoMapeado = "email";
              break;
            default:
              tipoMapeado = "texto";
          }

          const result = {
            id: p.id, // Adiciona o ID da pergunta
            texto: p.pergunta || "",
            tipo: tipoMapeado,
            obrigatoria: (p as any).obrigatoriedade ?? obrigatoriaFromAPI,
            opcoes: opcoesFromAPI,
            vincularDadosAluno: isVinculada, // Define se está vinculada
            dadoVinculado: dadoVinculado?.nome || undefined, // Nome do dado vinculado
            dadoId: dadoVinculado?.id || undefined, // ID do dado vinculado
          };

          console.log(`Resultado final da pergunta "${p.pergunta}":`, result);
          return result;
        });
        console.log("Perguntas mapeadas:", mapped);
        setEditorPerguntas(mapped);
      } else {
        // novo questionário ainda sem id
        setEditorPerguntas([]);
      }
    } catch (e) {
      console.error("Erro ao carregar questionário:", e);
      setEditorPerguntas([]);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCreateDado = async (novoDado: Omit<Dado, "id" | "created_at" | "updated_at">): Promise<Dado | null> => {
    try {
      const created = await dadoService.criarDado(novoDado);

      // Atualiza a lista local de dados
      setDadosAluno((prev) => [...prev, created]);

      toast.success("Dado criado com sucesso");
      return created;
    } catch (error) {
      console.error("Erro ao criar dado:", error);
      toast.error("Erro ao criar dado. Tente novamente.");
      return null;
    }
  };

  const handleSavePergunta = async (perguntaIndex: number) => {
    if (activeQuestionarioIndex === null) {
      toast.error("Nenhum questionário ativo");
      return;
    }

    const questionario = questionarios[activeQuestionarioIndex];
    const stepId =
      questionario.value.id ?? activeDrawerStepIdRef.current;

    if (!stepId) {
      toast.error("Abra o editor do questionário novamente e tente salvar a pergunta.");
      return;
    }

    const pergunta = editorPerguntas[perguntaIndex];
    const textoTrimmed = pergunta.texto.trim();

    if (!textoTrimmed) {
      toast.error("O texto da pergunta não pode estar vazio");
      return;
    }

    if (textoTrimmed.length > 255) {
      toast.error("O texto da pergunta deve ter no máximo 255 caracteres");
      return;
    }

    // Se é uma NOVA pergunta (sem ID) e o edital já possui inscrições, pedir confirmação
    if (!pergunta.id && edital.possui_inscricoes && (edital.total_inscricoes ?? 0) > 0) {
      setNovaPerguntaPendingIndex(perguntaIndex);
      setNovaPerguntaPrazo("");
      setShowNovaPerguntaConfirm(true);
      return;
    }

    // Caso contrário, executa normalmente
    await executeSavePergunta(perguntaIndex);
  };

  /** Confirmação do popup: cria a pergunta passando prazoResposta. */
  const confirmNovaPergunta = async () => {
    if (novaPerguntaPendingIndex === null) return;

    if (!novaPerguntaPrazo) {
      toast.error("Informe o prazo de resposta para os alunos já inscritos");
      return;
    }

    // Validar que a data é futura
    if (new Date(novaPerguntaPrazo).getTime() <= Date.now()) {
      toast.error("O prazo deve ser uma data futura");
      return;
    }

    setShowNovaPerguntaConfirm(false);
    await executeSavePergunta(novaPerguntaPendingIndex, novaPerguntaPrazo);
    setNovaPerguntaPendingIndex(null);
    setNovaPerguntaPrazo("");
  };

  const cancelNovaPergunta = () => {
    setShowNovaPerguntaConfirm(false);
    setNovaPerguntaPendingIndex(null);
    setNovaPerguntaPrazo("");
  };

  /** Executa de fato o salvamento da pergunta (criação ou atualização). */
  const executeSavePergunta = async (perguntaIndex: number, prazoResposta?: string) => {
    if (activeQuestionarioIndex === null) return;

    const questionario = questionarios[activeQuestionarioIndex];
    const stepId =
      questionario.value.id ?? activeDrawerStepIdRef.current;
    if (!stepId) return;

    const pergunta = editorPerguntas[perguntaIndex];
    const textoTrimmed = pergunta.texto.trim();

    // Mapear o tipo da pergunta para o formato do backend (EnumTipoInput)
    const tipoBackend =
      pergunta.tipo === "texto"
        ? "text"
        : pergunta.tipo === "numero"
          ? "number"
          : pergunta.tipo === "data"
            ? "date"
            : pergunta.tipo === "multipla_escolha"
              ? "select"
              : pergunta.tipo === "multipla_selecao"
                ? "selectGroup"
                : pergunta.tipo === "arquivo"
                  ? "file"
                  : pergunta.tipo === "email"
                    ? "email"
                    : "text";

    // Validar opções para tipos de seleção
    if (
      (tipoBackend === "select" || tipoBackend === "selectGroup") &&
      (!pergunta.opcoes || pergunta.opcoes.length === 0 || pergunta.opcoes.every((o) => !o.trim()))
    ) {
      toast.error("Perguntas de seleção precisam ter pelo menos uma opção");
      return;
    }

    // Preparar opções filtradas (remover vazias)
    const opcoesValidas = pergunta.opcoes?.filter((o) => o.trim()) || [];

    try {
      if (pergunta.id) {
        // Atualizar pergunta existente
        const payload: any = {
          pergunta: textoTrimmed,
          obrigatoriedade: pergunta.obrigatoria,
        };

        // Adicionar opções apenas se for tipo de seleção
        if (tipoBackend === "select" || tipoBackend === "selectGroup") {
          payload.opcoes = opcoesValidas;
        }

        // Adicionar dadoId (pode ser null para desvincular, ou um ID para vincular/trocar)
        payload.dadoId = pergunta.dadoId || null;

        const updated = await perguntaService.atualizarPergunta(pergunta.id, payload);

        // Atualizar na UI
        const updatedPerguntas = [...editorPerguntas];
        updatedPerguntas[perguntaIndex] = {
          ...pergunta,
          id: updated.id,
          isEditing: false,
        };
        setEditorPerguntas(updatedPerguntas);
        toast.success("Pergunta atualizada com sucesso");
      } else {
        // Criar nova pergunta
        const payload: any = {
          step_id: stepId,
          pergunta: textoTrimmed,
          tipo_Pergunta: tipoBackend,
          obrigatoriedade: pergunta.obrigatoria,
        };

        // Adicionar opções apenas se for tipo de seleção
        if (tipoBackend === "select" || tipoBackend === "selectGroup") {
          payload.opcoes = opcoesValidas;
        }

        // Adicionar dadoId se a pergunta estiver vinculada a um dado
        if (pergunta.dadoId) {
          payload.dadoId = pergunta.dadoId;
        }

        // Se o edital possui inscrições, enviar prazoResposta
        if (prazoResposta) {
          payload.prazoResposta = prazoResposta;
        }

        const created = await perguntaService.criarPergunta(payload);

        // Atualizar na UI com o ID retornado
        const updatedPerguntas = [...editorPerguntas];
        updatedPerguntas[perguntaIndex] = {
          ...pergunta,
          id: created.id,
          isEditing: false,
        };
        setEditorPerguntas(updatedPerguntas);

        if (prazoResposta) {
          toast.success(
            `Pergunta criada com sucesso. ${edital.total_inscricoes} inscrição(ões) receberão esta pergunta como pendência.`,
            { duration: 5000 },
          );
        } else {
          toast.success("Pergunta criada com sucesso");
        }
      }

      // Atualizar o preview do questionário
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
            : qq,
        ),
      );
    } catch (error) {
      console.error("Erro ao salvar pergunta:", error);
      toast.error("Erro ao salvar pergunta. Tente novamente.");
    }
  };

  const handleDeletePergunta = async (perguntaIndex: number) => {
    const pergunta = editorPerguntas[perguntaIndex];

    // Se o edital possui inscrições e a pergunta já existe no backend, mostra popup de confirmação
    if (pergunta.id && edital.possui_inscricoes && (edital.total_inscricoes ?? 0) > 0) {
      setDeletePerguntaPendingIndex(perguntaIndex);
      setDeletePerguntaTexto(pergunta.texto || "Pergunta");
      setShowDeletePerguntaConfirm(true);
      return;
    }

    // Caso contrário, executa diretamente
    await executeDeletePergunta(perguntaIndex);
  };

  const confirmDeletePergunta = async () => {
    if (deletePerguntaPendingIndex === null) return;
    setShowDeletePerguntaConfirm(false);
    await executeDeletePergunta(deletePerguntaPendingIndex);
    setDeletePerguntaPendingIndex(null);
    setDeletePerguntaTexto("");
  };

  const cancelDeletePergunta = () => {
    setShowDeletePerguntaConfirm(false);
    setDeletePerguntaPendingIndex(null);
    setDeletePerguntaTexto("");
  };

  const executeDeletePergunta = async (perguntaIndex: number) => {
    const pergunta = editorPerguntas[perguntaIndex];

    // Se tem ID, deleta do backend
    if (pergunta.id) {
      try {
        await perguntaService.deletarPergunta(pergunta.id);
        toast.success("Pergunta removida com sucesso");
      } catch (error) {
        console.error("Erro ao deletar pergunta:", error);
        toast.error("Erro ao remover pergunta. Tente novamente.");
        return;
      }
    }

    // Remove da UI
    const newPerguntas = editorPerguntas.filter((_, i) => i !== perguntaIndex);
    setEditorPerguntas(newPerguntas);

    // Atualizar o preview do questionário
    if (activeQuestionarioIndex !== null) {
      const preview = newPerguntas
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
            : qq,
        ),
      );
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
        if (!showStatusConfirmModal && !showStatusErrorModal) handleClose();
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

      <StatusErrorModal isOpen={showStatusErrorModal} errorMessage={statusErrorMessage} onClose={() => setShowStatusErrorModal(false)} />

      {/* Modal de confirmação para nova pergunta em edital com inscrições */}
      {showNovaPerguntaConfirm && createPortal(
        <div className="nova-pergunta-confirm-overlay" onClick={(e) => { e.stopPropagation(); cancelNovaPergunta(); }}>
          <div className="nova-pergunta-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nova-pergunta-confirm-header">
              <div className="nova-pergunta-confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3>Atenção: Edital com inscrições ativas</h3>
            </div>

            <div className="nova-pergunta-confirm-body">
              <p className="nova-pergunta-confirm-alert">
                Este edital já possui <strong>{edital.total_inscricoes ?? 0} inscrição(ões)</strong> ativas.
              </p>

              <div className="nova-pergunta-confirm-info">
                <p>Ao criar esta nova pergunta:</p>
                <ul>
                  <li>
                    Será gerada automaticamente uma <strong>pendência de resposta</strong> para cada aluno já inscrito.
                  </li>
                  <li>
                    O status de todas as inscrições existentes será alterado para <strong>"Pendente de Reenvio"</strong>.
                  </li>
                  <li>
                    Cada aluno verá esta pergunta como uma <strong>nova pendência</strong> no seu portal, com a mensagem de que uma pergunta foi adicionada ao questionário após sua inscrição e precisa ser respondida até o prazo informado.
                  </li>
                </ul>
              </div>

              <div className="nova-pergunta-confirm-prazo">
                <label htmlFor="prazo-resposta-nova-pergunta">
                  Prazo para os alunos responderem esta nova pergunta: <span className="required">*</span>
                </label>
                <input
                  id="prazo-resposta-nova-pergunta"
                  type="datetime-local"
                  value={novaPerguntaPrazo}
                  onChange={(e) => setNovaPerguntaPrazo(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="nova-pergunta-prazo-input"
                />
                <p className="nova-pergunta-prazo-hint">
                  Após este prazo, caso o aluno não responda, a inscrição poderá ser rejeitada automaticamente.
                </p>
              </div>
            </div>

            <div className="nova-pergunta-confirm-actions">
              <button
                className="btn-cancel-nova-pergunta"
                onClick={cancelNovaPergunta}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-nova-pergunta"
                onClick={confirmNovaPergunta}
                disabled={!novaPerguntaPrazo}
              >
                Confirmar e Criar Pergunta
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de confirmação para deletar pergunta em edital com inscrições */}
      {showDeletePerguntaConfirm && createPortal(
        <div className="nova-pergunta-confirm-overlay" onClick={(e) => { e.stopPropagation(); cancelDeletePergunta(); }}>
          <div className="nova-pergunta-confirm-modal delete-pergunta-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-pergunta-confirm-header">
              <div className="delete-pergunta-confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h3>Excluir pergunta de edital com inscrições</h3>
            </div>

            <div className="nova-pergunta-confirm-body">
              <p className="nova-pergunta-confirm-alert">
                Este edital já possui <strong>{edital.total_inscricoes ?? 0} inscrição(ões)</strong> ativas.
              </p>

              <div className="delete-pergunta-confirm-info">
                <p className="delete-pergunta-nome">
                  Pergunta: <strong>"{deletePerguntaTexto}"</strong>
                </p>
                <div className="delete-pergunta-aviso">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Ao excluir esta pergunta, <strong>todas as respostas já enviadas pelos alunos</strong> para esta pergunta serão permanentemente apagadas. Esta ação não pode ser desfeita.</span>
                </div>
              </div>
            </div>

            <div className="nova-pergunta-confirm-actions">
              <button
                className="btn-cancel-nova-pergunta"
                onClick={cancelDeletePergunta}
              >
                Cancelar
              </button>
              <button
                className="btn-delete-pergunta-confirm"
                onClick={confirmDeletePergunta}
              >
                Excluir Pergunta
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Principal - Layout Horizontal */}
      <div className={`modal-horizontal ${drawerOpen ? "drawer-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <CelebrationOverlay isVisible={showCelebration} />

        <ModalHeader
          titulo={titulo}
          tituloEditando={tituloEditando}
          status={status}
          showStatusDropdown={showStatusDropdown}
          onTituloChange={setTitulo}
          onTituloEditToggle={setTituloEditando}
          onTituloSave={handleTituloSave}
          onStatusDropdownToggle={() => setShowStatusDropdown(!showStatusDropdown)}
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

          <section
            className="modal-nivel-section"
            style={{ padding: "0 1.25rem 1rem", borderBottom: "1px solid #e5e7eb" }}
          >
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Nível acadêmico</h3>
            <p className="text-xs text-slate-500 mb-2">
              Define se o edital aparece para alunos de <strong>Graduação</strong> ou{" "}
              <strong>Pós-graduação</strong> (inscrições e formulários seguem esse nível).
            </p>
            <select
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm min-w-[200px] bg-white"
              value={nivelAcademico}
              onChange={(e) => {
                const v = e.target.value;
                setNivelAcademico(v);
                void autoSaveEdital({ nivelAcademicoOverride: v });
              }}
              aria-label="Nível acadêmico do edital"
            >
              <option value={NIVEL_GRADUACAO}>Graduação</option>
              <option value={NIVEL_POS_GRADUACAO}>Pós-graduação</option>
            </select>
          </section>

          <section className="modal-vigencia-section" style={{ padding: "0 1.25rem 1rem", borderBottom: "1px solid #e5e7eb" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Vigência no portal</h3>
            <p className="text-xs text-slate-500 mb-2">
              Após esta data o vínculo com este edital deixa de ser tratado como ativo para o aluno (avisos e regras de elegibilidade). Opcional.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                value={dataFimVigencia}
                onChange={(e) => setDataFimVigencia(e.target.value)}
                onBlur={() => autoSaveEdital()}
              />
              <button
                type="button"
                className="text-xs text-slate-600 underline"
                onClick={() => {
                  setDataFimVigencia("");
                  void autoSaveEdital({ dataFimVigenciaOverride: null });
                }}
              >
                Limpar data
              </button>
            </div>
          </section>

          <VagasSection
            vagas={vagas}
            openVagas={openVagas}
            editalId={edital.id!}
            onVagasChange={setVagas}
            onToggleOpen={() => setOpenVagas(!openVagas)}
            onSaveVaga={handleSaveVaga}
            onDeleteVaga={handleDeleteVaga}
          />

          <QuestionariosSection
            questionarios={questionarios}
            openQuestionarios={openQuestionarios}
            onQuestionariosChange={setQuestionarios}
            onToggleOpen={() => setOpenQuestionarios(!openQuestionarios)}
            onOpenQuestionario={handleOpenQuestionario}
            onAddQuestionario={handleAddQuestionario}
          />

          <div className="two-col-row">
            <CronogramaSection
              etapas={etapas}
              openCronograma={openCronograma}
              onEtapasChange={setEtapas}
              onToggleOpen={() => setOpenCronograma(!openCronograma)}
              onPersist={handleEtapasPersist}
            />
            <DocumentosSection
              documentos={documentos}
              openLinks={openLinks}
              onDocumentosChange={setDocumentos}
              onToggleOpen={() => setOpenLinks(!openLinks)}
              onPersist={handleDocumentosPersist}
            />
          </div>

          {/* fim da row 2 colunas */}
        </div>

        <ModalFooter autoSaveStatus={autoSaveStatus} error={error} onClose={handleClose} />

        <QuestionarioDrawer
          isOpen={drawerOpen}
          loading={drawerLoading}
          questionarios={questionarios}
          activeQuestionarioIndex={activeQuestionarioIndex}
          titleEditing={quizTitleEditing}
          perguntas={editorPerguntas}
          dadosAluno={dadosAluno.map((d) => ({
            id: d.id,
            nome: d.nome,
            tipo: d.tipo,
            obrigatorio: d.obrigatorio,
            opcoes: d.opcoes || [],
          }))}
          onClose={() => setDrawerOpen(false)}
          onQuestionarioSelect={(index) => {
            // Carrega as perguntas do questionário selecionado
            handleOpenQuestionario(index);
          }}
          onTitleChange={(title) => {
            if (activeQuestionarioIndex !== null) {
              const list = [...questionarios];
              list[activeQuestionarioIndex].value.titulo = title;
              list[activeQuestionarioIndex].value.nome = title;
              setQuestionarios(list);
            }
          }}
          onTitleEditToggle={(editing) => {
            if (!editing) {
              handleQuizTitleSave();
            } else {
              setQuizTitleEditing(true);
            }
          }}
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
                    : qq,
                ),
              );
            }
            toast.success("Alterações do questionário aplicadas (UI)");
            setDrawerOpen(false);
          }}
          onSavePergunta={handleSavePergunta}
          onDeletePergunta={handleDeletePergunta}
          onCreateDado={async (novoDado) => {
            const created = await handleCreateDado(novoDado);
            return created ? { ...created } : null;
          }}
          adicionarQuestionario={handleAddQuestionario}
          removerQuestionario={async (index) => {
            const questionarioToRemove = questionarios[index];

            // Se tem ID, deleta do backend
            if (questionarioToRemove.value.id) {
              try {
                await stepService.deletarStep(questionarioToRemove.value.id);
                toast.success("Questionário removido com sucesso");
              } catch (error) {
                console.error("Erro ao deletar questionário:", error);
                toast.error("Erro ao remover questionário. Tente novamente.");
                return; // Não remove da UI se falhar no backend
              }
            }

            const newQuestionarios = questionarios.filter((_, i) => i !== index);
            setQuestionarios(newQuestionarios);

            // Se o questionário ativo foi removido, limpar a seleção
            if (activeQuestionarioIndex === index) {
              setActiveQuestionarioIndex(null);
              setEditorPerguntas([]);
            } else if (activeQuestionarioIndex !== null && activeQuestionarioIndex > index) {
              // Se um questionário antes do ativo foi removido, ajustar o índice
              setActiveQuestionarioIndex(activeQuestionarioIndex - 1);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ModalEditarEdital;
