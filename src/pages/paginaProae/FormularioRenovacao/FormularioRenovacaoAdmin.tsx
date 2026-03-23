import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input, Switch, Select, SelectItem } from "@heroui/react";
import {
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Play,
  ClipboardList,
  Settings,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  formularioRenovacaoService,
  type FormularioRenovacaoResponse,
  type FormularioGeralStepCreate,
} from "@/services/FormularioRenovacaoService/formularioRenovacao.service";
import { stepService } from "@/services/StepService/stepService";
import { perguntaService } from "@/services/PerguntaService/perguntaService";
import FRInscricoesAdmin from "./FRInscricoesAdmin";
import {
  NIVEL_GRADUACAO,
  NIVEL_POS_GRADUACAO,
  OPCOES_NIVEL_ACADEMICO,
} from "@/constants/nivelAcademico";

const TIPOS_PERGUNTA = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "email", label: "E-mail" },
  { value: "textarea", label: "Texto longo" },
  { value: "date", label: "Data" },
  { value: "select", label: "Seleção única" },
  { value: "radio", label: "Radio" },
  { value: "file", label: "Arquivo" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  rascunho:       { label: "Rascunho",       color: "text-gray-700",   bg: "bg-gray-100",    border: "border-gray-300", icon: <Clock className="w-4 h-4" /> },
  aberto:         { label: "Aberto",         color: "text-emerald-700",bg: "bg-emerald-50",  border: "border-emerald-300", icon: <CheckCircle className="w-4 h-4" /> },
  encerrado:      { label: "Encerrado",      color: "text-red-700",    bg: "bg-red-50",      border: "border-red-300", icon: <XCircle className="w-4 h-4" /> },
  "em andamento": { label: "Em andamento",   color: "text-blue-700",   bg: "bg-blue-50",     border: "border-blue-300", icon: <Play className="w-4 h-4" /> },
};

function getStatusKey(status?: string): string {
  if (!status) return "rascunho";
  const s = status.toLowerCase();
  if (s.includes("aberto")) return "aberto";
  if (s.includes("encerrado") || s.includes("fechado")) return "encerrado";
  if (s.includes("andamento")) return "em andamento";
  return "rascunho";
}

const STATUS_EDITAL_VALUES: Record<string, string> = {
  rascunho: "Rascunho",
  aberto: "Edital em aberto",
  encerrado: "Edital encerrado",
  "em andamento": "Edital em andamento",
};

interface PerguntaLocal {
  _backendId?: number;
  pergunta: string;
  tipo_Pergunta: string;
  obrigatoriedade: boolean;
  opcoes?: string[];
  tipo_formatacao?: any;
}

interface StepLocal {
  _backendId?: number;
  texto: string;
  perguntas: PerguntaLocal[];
}

function stepsFromBackend(data: FormularioRenovacaoResponse | null): StepLocal[] {
  if (!data?.steps?.length) {
    return [{ texto: "Dados gerais", perguntas: [{ pergunta: "", tipo_Pergunta: "text", obrigatoriedade: true }] }];
  }
  return data.steps.map((s) => ({
    _backendId: s.id,
    texto: s.texto,
    perguntas: s.perguntas.map((p) => ({
      _backendId: p.id,
      pergunta: p.pergunta,
      tipo_Pergunta: p.tipo_Pergunta,
      obrigatoriedade: p.obrigatoriedade,
      opcoes: p.opcoes ?? undefined,
      tipo_formatacao: p.tipo_formatacao,
    })),
  }));
}

export default function FormularioRenovacaoAdmin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const expandInscricaoFromUrl = searchParams.get("expandInscricao");
  const nivelFromUrl = searchParams.get("nivel_academico");
  const [nivelAdmin, setNivelAdmin] = useState<string>(
    nivelFromUrl === NIVEL_POS_GRADUACAO ? NIVEL_POS_GRADUACAO : NIVEL_GRADUACAO,
  );
  const [data, setData] = useState<FormularioRenovacaoResponse | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [activeTab, setActiveTab] = useState<"config" | "inscricoes">("config");
  const [steps, setSteps] = useState<StepLocal[]>([
    { texto: "Dados gerais", perguntas: [{ pergunta: "", tipo_Pergunta: "text", obrigatoriedade: true }] },
  ]);

  useEffect(() => {
    const p = searchParams.get("nivel_academico");
    if (p === NIVEL_GRADUACAO || p === NIVEL_POS_GRADUACAO) setNivelAdmin(p);
  }, [searchParams]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await formularioRenovacaoService.getFormularioRenovacaoAdmin(nivelAdmin);
      if (res) {
        setData(res);
        setTitulo(res.titulo_edital ?? "");
        setDescricao(res.descricao ?? "");
        setSteps(stepsFromBackend(res));
      } else {
        setData(null);
        setTitulo("Formulário de Renovação");
        setDescricao("");
        setSteps([{ texto: "Dados gerais", perguntas: [{ pergunta: "", tipo_Pergunta: "text", obrigatoriedade: true }] }]);
      }
    } catch (e: any) {
      toast.error(e?.message ?? e?.mensagem ?? "Erro ao carregar");
      setData(undefined);
    } finally {
      setLoading(false);
    }
  }, [nivelAdmin]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (data === null || data === undefined) return;
    if (tabFromUrl === "inscricoes" || expandInscricaoFromUrl) {
      setActiveTab("inscricoes");
    }
  }, [data, tabFromUrl, expandInscricaoFromUrl]);

  /* ── Step / Pergunta helpers ── */
  const addStep = () => {
    setSteps((s) => [...s, { texto: "", perguntas: [{ pergunta: "", tipo_Pergunta: "text", obrigatoriedade: true }] }]);
  };
  const removeStep = (i: number) => setSteps((s) => s.filter((_, idx) => idx !== i));
  const updateStepTexto = (i: number, texto: string) =>
    setSteps((s) => s.map((step, idx) => (idx === i ? { ...step, texto } : step)));
  const addPergunta = (si: number) =>
    setSteps((s) =>
      s.map((step, i) =>
        i === si ? { ...step, perguntas: [...step.perguntas, { pergunta: "", tipo_Pergunta: "text", obrigatoriedade: true }] } : step
      )
    );
  const removePergunta = (si: number, pi: number) =>
    setSteps((s) =>
      s.map((step, i) => (i === si ? { ...step, perguntas: step.perguntas.filter((_, j) => j !== pi) } : step))
    );
  const updatePergunta = (si: number, pi: number, field: keyof PerguntaLocal, value: string | boolean | string[]) =>
    setSteps((s) =>
      s.map((step, i) =>
        i === si
          ? { ...step, perguntas: step.perguntas.map((p, j) => (j === pi ? { ...p, [field]: value } : p)) }
          : step
      )
    );

  const buildStepsPayload = (): FormularioGeralStepCreate[] | undefined => {
    const valid = steps
      .filter((s) => s.texto.trim() && s.perguntas.some((p) => p.pergunta.trim()))
      .map((s) => ({
        texto: s.texto.trim(),
        perguntas: s.perguntas
          .filter((p) => p.pergunta.trim())
          .map((p) => ({
            pergunta: p.pergunta.trim(),
            tipo_Pergunta: p.tipo_Pergunta,
            obrigatoriedade: p.obrigatoriedade,
            opcoes: p.opcoes?.length ? p.opcoes : undefined,
            tipo_formatacao: p.tipo_formatacao,
          })),
      }))
      .filter((s) => s.perguntas.length > 0);
    return valid.length ? valid : undefined;
  };

  /* ── Status change ── */
  const handleChangeStatus = async (newStatusKey: string) => {
    if (!data?.id) return;
    const statusValue = STATUS_EDITAL_VALUES[newStatusKey];
    if (!statusValue) return;
    setSaving(true);
    try {
      await formularioRenovacaoService.atualizarFormularioRenovacao(data.id, { status_edital: statusValue });
      toast.success(`Status alterado para "${STATUS_CONFIG[newStatusKey]?.label ?? newStatusKey}".`);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? e?.mensagem ?? "Erro ao alterar status");
    } finally {
      setSaving(false);
    }
  };

  /* ── Create ── */
  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) { toast.error("Título é obrigatório"); return; }
    setSaving(true);
    try {
      const stepsPayload = buildStepsPayload();
      const created = await formularioRenovacaoService.criarFormularioRenovacao({
        titulo_edital: titulo.trim(),
        nivel_academico: nivelAdmin,
        descricao: descricao.trim() || undefined,
        steps: stepsPayload,
      });
      toast.success("Formulário de renovação criado com status Aberto.");
      if (created?.id) {
        setData(created);
        setTitulo(created.titulo_edital ?? titulo.trim());
        setDescricao(created.descricao ?? "");
        setSteps(stepsFromBackend(created));
      } else {
        await load();
      }
    } catch (e: any) {
      toast.error(e?.message ?? e?.mensagem ?? "Erro ao criar");
    } finally {
      setSaving(false);
    }
  };

  /* ── Save (edit mode) ── */
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.id || !titulo.trim()) return;
    setSaving(true);
    try {
      await formularioRenovacaoService.atualizarFormularioRenovacao(data.id, {
        titulo_edital: titulo.trim(),
        descricao: descricao.trim() || undefined,
      });

      const originalSteps = data.steps ?? [];
      const originalStepIds = new Set(originalSteps.map((s) => s.id));
      const currentBackendStepIds = new Set(steps.filter((s) => s._backendId).map((s) => s._backendId!));

      for (const id of originalStepIds) {
        if (!currentBackendStepIds.has(id)) await stepService.deletarStep(String(id));
      }

      for (const step of steps) {
        if (!step._backendId) {
          if (!step.texto.trim()) continue;
          const created = await stepService.criarStep(String(data.id), step.texto.trim());
          for (const p of step.perguntas) {
            if (!p.pergunta.trim()) continue;
            await perguntaService.criarPergunta({
              step_id: created.id, pergunta: p.pergunta.trim(), tipo_Pergunta: p.tipo_Pergunta as any,
              obrigatoriedade: p.obrigatoriedade, opcoes: p.opcoes?.length ? p.opcoes : undefined,
              tipo_formatacao: p.tipo_formatacao,
            } as any);
          }
        } else {
          const origStep = originalSteps.find((s) => s.id === step._backendId);
          if (origStep && origStep.texto !== step.texto.trim() && step.texto.trim()) {
            await stepService.atualizarStep(String(step._backendId), step.texto.trim());
          }
          const origPerguntaIds = new Set((origStep?.perguntas ?? []).map((p) => p.id));
          const curPerguntaIds = new Set(step.perguntas.filter((p) => p._backendId).map((p) => p._backendId!));
          for (const id of origPerguntaIds) {
            if (!curPerguntaIds.has(id)) await perguntaService.deletarPergunta(String(id));
          }
          for (const p of step.perguntas) {
            if (!p._backendId && p.pergunta.trim()) {
              await perguntaService.criarPergunta({
                step_id: step._backendId, pergunta: p.pergunta.trim(), tipo_Pergunta: p.tipo_Pergunta as any,
                obrigatoriedade: p.obrigatoriedade, opcoes: p.opcoes?.length ? p.opcoes : undefined,
                tipo_formatacao: p.tipo_formatacao,
              } as any);
            }
          }
        }
      }

      toast.success("Alterações salvas.");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? e?.mensagem ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  /* ── Deactivate ── */
  const handleDesativar = async () => {
    if (!data?.id) return;
    if (!window.confirm("Desativar o formulário de renovação? Não é possível desativar se houver inscrições vinculadas.")) return;
    setSaving(true);
    try {
      await formularioRenovacaoService.desativarFormularioRenovacao(data.id);
      toast.success("Formulário de renovação desativado.");
      setData(null);
      setTitulo("Formulário Geral");
      setDescricao("");
      setSteps([{ texto: "Dados gerais", perguntas: [{ pergunta: "", tipo_Pergunta: "text", obrigatoriedade: true }] }]);
    } catch (e: any) {
      toast.error(e?.message ?? e?.mensagem ?? "Erro ao desativar");
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#183b4e]" />
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  const isEditing = data !== null && data !== undefined;
  const statusKey = isEditing ? getStatusKey(data.status_edital) : null;
  const statusCfg = statusKey ? STATUS_CONFIG[statusKey] : null;
  const totalPerguntas = isEditing
    ? (data.steps ?? []).reduce((sum, s) => sum + (s.perguntas?.length ?? 0), 0)
    : 0;

  return (
    <div className={`mx-auto p-6 ${activeTab === "inscricoes" ? "max-w-5xl" : "max-w-3xl"}`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-8 h-8 text-[#183b4e]" />
        <h1 className="text-2xl font-semibold text-gray-900">Formulário de Renovação</h1>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        Gerenciamento do formulário de renovação (recadastro). Separado do formulário geral — alunos já aprovados em editais precisam concluí-lo quando estiver aberto.
      </p>

      <div className="mb-6 w-full max-w-md space-y-2">
        <div>
          <label
            htmlFor="fr-admin-nivel-academico"
            className="block text-sm font-medium text-gray-800"
          >
            Nível acadêmico
          </label>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            Graduação e Pós-graduação têm formulário e inscrições de renovação separados. Escolha o nível para editar ou ver inscrições.
          </p>
        </div>
        <Select
          id="fr-admin-nivel-academico"
          aria-label="Nível acadêmico"
          variant="bordered"
          radius="lg"
          fullWidth
          classNames={{
            base: "w-full",
            trigger: "min-h-12 h-12 bg-white border-gray-200 data-[hover=true]:border-gray-300",
          }}
          selectedKeys={new Set([nivelAdmin])}
          onSelectionChange={(keys) => {
            const v = Array.from(keys)[0] as string;
            if (!v) return;
            setNivelAdmin(v);
            setSearchParams(
              (prev) => {
                const n = new URLSearchParams(prev);
                n.set("nivel_academico", v);
                return n;
              },
              { replace: true },
            );
          }}
        >
          {OPCOES_NIVEL_ACADEMICO.map((o) => (
            <SelectItem key={o.value}>{o.label}</SelectItem>
          ))}
        </Select>
      </div>

      {/* ═══ TABS ═══ */}
      {isEditing && (
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "config"
                ? "border-[#183b4e] text-[#183b4e]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuração
          </button>
          <button
            onClick={() => setActiveTab("inscricoes")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "inscricoes"
                ? "border-[#183b4e] text-[#183b4e]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Inscrições
          </button>
        </div>
      )}

      {data === undefined ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-amber-800">Não foi possível carregar. Tente novamente.</p>
          <Button className="mt-4" onPress={() => load()} color="primary">Tentar novamente</Button>
        </div>
      ) : activeTab === "inscricoes" && isEditing ? (
        <FRInscricoesAdmin
          nivelAcademico={nivelAdmin}
          initialExpandInscricaoId={
            expandInscricaoFromUrl ? parseInt(expandInscricaoFromUrl, 10) : undefined
          }
        />
      ) : (
        <>
          {/* ═══ STATUS CARD (only when FG exists) ═══ */}
          {isEditing && statusCfg && (
            <div className={`rounded-xl border p-5 mb-6 ${statusCfg.bg} ${statusCfg.border}`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className={statusCfg.color}>{statusCfg.icon}</span>
                  <span className={`font-semibold ${statusCfg.color}`}>Status: {statusCfg.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{data.steps?.length ?? 0} etapa(s)</span>
                  <span className="text-gray-300">|</span>
                  <span>{totalPerguntas} pergunta(s)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {statusKey !== "aberto" && (
                  <Button
                    size="sm" color="success" variant="flat"
                    onPress={() => handleChangeStatus("aberto")}
                    isDisabled={saving}
                    startContent={<CheckCircle className="w-4 h-4" />}
                  >
                    Abrir para inscrições
                  </Button>
                )}
                {statusKey !== "encerrado" && statusKey !== "rascunho" && (
                  <Button
                    size="sm" color="danger" variant="flat"
                    onPress={() => handleChangeStatus("encerrado")}
                    isDisabled={saving}
                    startContent={<XCircle className="w-4 h-4" />}
                  >
                    Encerrar inscrições
                  </Button>
                )}
                {statusKey !== "rascunho" && (
                  <Button
                    size="sm" variant="flat"
                    onPress={() => handleChangeStatus("rascunho")}
                    isDisabled={saving}
                    startContent={<Clock className="w-4 h-4" />}
                  >
                    Voltar a rascunho
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ═══ FORM ═══ */}
          <form onSubmit={isEditing ? handleSalvar : handleCriar} className="space-y-6">
            {/* Title / Description */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
              <h3 className="text-sm font-medium text-gray-700">Informações gerais</h3>
              <Input
                label="Título do edital"
                value={titulo}
                onValueChange={setTitulo}
                placeholder="Ex: Renovação PROAE 2026.1"
                isRequired
                isDisabled={saving}
              />
              <Input
                label="Descrição (opcional)"
                value={descricao}
                onValueChange={setDescricao}
                placeholder="Descrição do formulário de renovação"
                isDisabled={saving}
              />
            </div>

            {/* ═══ STEPS / PERGUNTAS EDITOR ═══ */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Etapas e perguntas</h3>
                <div className="flex gap-2">
                  {isEditing && (
                    <Button type="button" size="sm" variant="flat" onPress={load} isDisabled={saving}
                      startContent={<RefreshCw className="w-4 h-4" />}>
                      Recarregar
                    </Button>
                  )}
                  <Button type="button" size="sm" variant="flat" onPress={addStep} isDisabled={saving}
                    startContent={<Plus className="w-4 h-4" />}>
                    Adicionar etapa
                  </Button>
                </div>
              </div>

              {!isEditing && (
                <p className="text-xs text-gray-500">
                  Adicione etapas e perguntas para o formulário. Cada etapa agrupa perguntas relacionadas.
                </p>
              )}
              {isEditing && steps.every((s) => !s._backendId && !s.perguntas.some((p) => p.pergunta.trim())) && (
                <p className="text-xs text-amber-600">
                  Nenhuma etapa configurada. Adicione etapas e perguntas e clique em "Salvar alterações".
                </p>
              )}

              {steps.map((step, stepIndex) => (
                <div key={stepIndex}
                  className={`bg-white rounded-lg p-4 border space-y-3 ${
                    step._backendId ? "border-gray-200" : "border-blue-200 ring-1 ring-blue-100"
                  }`}>
                  <div className="flex gap-2 items-center">
                    <Input
                      label={`Etapa ${stepIndex + 1}`}
                      value={step.texto}
                      onValueChange={(v) => updateStepTexto(stepIndex, v)}
                      placeholder="Ex: Dados pessoais"
                      size="sm" isDisabled={saving} className="flex-1"
                    />
                    {!step._backendId && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">Nova</span>
                    )}
                    <Button type="button" size="sm" color="danger" variant="light" isIconOnly
                      onPress={() => removeStep(stepIndex)} isDisabled={saving || steps.length <= 1}
                      aria-label="Remover etapa">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="pl-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Perguntas</span>
                      <Button type="button" size="sm" variant="light" onPress={() => addPergunta(stepIndex)}
                        isDisabled={saving} startContent={<Plus className="w-3 h-3" />}>
                        Adicionar pergunta
                      </Button>
                    </div>

                    {step.perguntas.map((perg, pergIndex) => (
                      <div key={pergIndex}
                        className={`flex flex-wrap gap-2 items-end p-2 rounded ${
                          perg._backendId ? "bg-gray-50" : "bg-blue-50/50"
                        }`}>
                        <Input label="Pergunta" value={perg.pergunta}
                          onValueChange={(v) => updatePergunta(stepIndex, pergIndex, "pergunta", v)}
                          placeholder="Texto da pergunta" size="sm" isDisabled={saving}
                          className="min-w-[200px] flex-1" />
                        <select value={perg.tipo_Pergunta}
                          onChange={(e) => updatePergunta(stepIndex, pergIndex, "tipo_Pergunta", e.target.value)}
                          disabled={saving}
                          className="rounded border border-gray-200 px-2 py-2 text-sm min-w-[120px]">
                          {TIPOS_PERGUNTA.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        {(perg.tipo_Pergunta === "select" || perg.tipo_Pergunta === "radio") && (
                          <Input label="Opções (separadas por vírgula)"
                            value={(perg.opcoes ?? []).join(", ")}
                            onValueChange={(v) =>
                              updatePergunta(stepIndex, pergIndex, "opcoes",
                                v.split(",").map((o) => o.trim()).filter(Boolean) as any)
                            }
                            placeholder="Opção 1, Opção 2, ..." size="sm" isDisabled={saving}
                            className="min-w-[200px] flex-1" />
                        )}
                        <label className="flex items-center gap-1 text-sm">
                          <Switch isSelected={perg.obrigatoriedade}
                            onValueChange={(v) => updatePergunta(stepIndex, pergIndex, "obrigatoriedade", v)}
                            isDisabled={saving} size="sm" />
                          Obrigatória
                        </label>
                        <Button type="button" size="sm" color="danger" variant="light" isIconOnly
                          onPress={() => removePergunta(stepIndex, pergIndex)}
                          isDisabled={saving || step.perguntas.length <= 1}
                          aria-label="Remover pergunta">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ═══ ACTION BAR ═══ */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button type="submit" color="primary" isLoading={saving} isDisabled={saving}
                startContent={!saving ? <Save className="w-4 h-4" /> : undefined}>
                {isEditing ? "Salvar alterações" : "Criar formulário de renovação"}
              </Button>
              {isEditing && (
                <Button type="button" color="danger" variant="flat" onPress={handleDesativar}
                  isLoading={saving} isDisabled={saving}
                  startContent={<AlertCircle className="w-4 h-4" />}>
                  Desativar formulário de renovação
                </Button>
              )}
              <Button type="button" variant="light" onPress={() => navigate("/portal-proae/inscricoes")}>
                Voltar
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
