import { useEffect, useState, useCallback, useRef } from "react";
import { Button, Input } from "@heroui/react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  formularioRenovacaoService,
} from "@/services/FormularioRenovacaoService/formularioRenovacao.service";
import type {
  FGInscricaoResumo,
  FGInscricaoDetalhe,
} from "@/services/FormularioGeralService/formularioGeral.service";
import DocumentViewerModal from "@/components/DocumentViewerModal/DocumentViewerModal";

const STATUS_INSCRICAO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  "Inscrição Pendente":   { label: "Pendente",    color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  "Inscrição Aprovada":   { label: "Aprovada",    color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  "Inscrição Negada":     { label: "Negada",      color: "text-red-700",     bg: "bg-red-50",      border: "border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  "Ajuste Necessário":    { label: "Ajuste",      color: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_INSCRICAO_CONFIG[status] ?? STATUS_INSCRICAO_CONFIG["Inscrição Pendente"];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

const FILTER_OPTIONS = [
  { key: "todos", label: "Todos" },
  { key: "Inscrição Pendente", label: "Pendentes" },
  { key: "Inscrição Aprovada", label: "Aprovadas" },
  { key: "Inscrição Negada", label: "Negadas" },
  { key: "Ajuste Necessário", label: "Ajuste" },
];

interface InscricaoDetailPanelProps {
  inscricaoId: number;
  nivelAcademico: string;
  onStatusChanged: () => void;
}

function InscricaoDetailPanel({
  inscricaoId,
  nivelAcademico,
  onStatusChanged,
}: InscricaoDetailPanelProps) {
  const [detail, setDetail] = useState<FGInscricaoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFileRef, setViewerFileRef] = useState<string | null>(null);

  const abrirArquivo = (ref: string | null | undefined) => {
    if (!ref?.trim()) return;
    setViewerFileRef(ref);
    setViewerOpen(true);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    formularioRenovacaoService
      .detalheInscricaoFR(inscricaoId, nivelAcademico)
      .then((d: FGInscricaoDetalhe) => {
        if (cancelled) return;
        setDetail(d);
        setObservacao(d.observacao_admin ?? "");
      })
      .catch((e) => {
        if (!cancelled) toast.error(e?.message ?? "Erro ao carregar detalhe");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [inscricaoId, nivelAcademico]);

  const handleAction = async (status: string) => {
    if (status === "Ajuste Necessário" && !observacao.trim()) {
      toast.error("Informe uma observação/motivo ao pedir ajustes.");
      return;
    }
    setSaving(true);
    try {
      await formularioRenovacaoService.alterarStatusInscricaoFR(
        inscricaoId,
        status,
        observacao.trim() || undefined,
        nivelAcademico,
      );
      const cfg = STATUS_INSCRICAO_CONFIG[status];
      toast.success(`Inscrição marcada como "${cfg?.label ?? status}".`);
      onStatusChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao alterar status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 px-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#183b4e]" />
        Carregando detalhes...
      </div>
    );
  }

  if (!detail) return <p className="text-sm text-gray-500 p-2">Não foi possível carregar.</p>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Aluno info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-500 block text-xs">Nome</span>
          <span className="font-medium">{detail.aluno.nome ?? "—"}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Matrícula</span>
          <span className="font-medium">{detail.aluno.matricula ?? "—"}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">E-mail</span>
          <span className="font-medium break-all">{detail.aluno.email ?? "—"}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">CPF</span>
          <span className="font-medium">{detail.aluno.cpf ?? "—"}</span>
        </div>
        {detail.aluno.curso && (
          <div>
            <span className="text-gray-500 block text-xs">Curso</span>
            <span className="font-medium">{detail.aluno.curso}</span>
          </div>
        )}
        {detail.aluno.campus && (
          <div>
            <span className="text-gray-500 block text-xs">Campus</span>
            <span className="font-medium">{detail.aluno.campus}</span>
          </div>
        )}
        {detail.aluno.celular && (
          <div>
            <span className="text-gray-500 block text-xs">Celular</span>
            <span className="font-medium">{detail.aluno.celular}</span>
          </div>
        )}
      </div>

      {/* Respostas por step */}
      {detail.steps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Respostas</h4>
          {detail.steps.map((step) => (
            <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-3">
              <h5 className="text-xs font-semibold text-[#183b4e] mb-2">{step.texto}</h5>
              <div className="space-y-2">
                {step.respostas.map((r, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="text-gray-500">{r.pergunta_texto}:</span>{" "}
                    {r.urlArquivo ? (
                      <button
                        type="button"
                        onClick={() => abrirArquivo(r.urlArquivo)}
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <FileText className="w-3 h-3" /> Ver PDF / arquivo
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : r.valorOpcoes?.length ? (
                      <span className="font-medium">{r.valorOpcoes.join(", ")}</span>
                    ) : (
                      <span className="font-medium">{r.valorTexto ?? "—"}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documentos */}
      {detail.documentos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Documentos</h4>
          <div className="grid gap-2">
            {detail.documentos.map((doc) => (
              <div key={doc.documento_id} className="flex items-center gap-3 bg-white rounded border border-gray-200 px-3 py-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="flex-1">{doc.tipo_documento}</span>
                <span className="text-xs text-gray-500">{doc.status_documento}</span>
                {doc.documento_url && (
                  <button
                    type="button"
                    onClick={() => abrirArquivo(doc.documento_url)}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs font-medium"
                  >
                    Ver PDF / arquivo <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observação + ações */}
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observação / Feedback para o aluno
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Motivo da aprovação, negação ou ajustes necessários..."
            rows={3}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#183b4e]/30 focus:border-[#183b4e] disabled:opacity-50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            color="success"
            onPress={() => handleAction("Inscrição Aprovada")}
            isLoading={saving}
            isDisabled={saving}
            startContent={<CheckCircle className="w-4 h-4" />}
          >
            Aprovar
          </Button>
          <Button
            size="sm"
            color="danger"
            onPress={() => handleAction("Inscrição Negada")}
            isLoading={saving}
            isDisabled={saving}
            startContent={<XCircle className="w-4 h-4" />}
          >
            Negar
          </Button>
          <Button
            size="sm"
            color="warning"
            onPress={() => handleAction("Ajuste Necessário")}
            isLoading={saving}
            isDisabled={saving}
            startContent={<AlertTriangle className="w-4 h-4" />}
          >
            Pedir Ajustes
          </Button>
        </div>
      </div>

      <DocumentViewerModal
        open={viewerOpen}
        fileRef={viewerFileRef}
        onClose={() => {
          setViewerOpen(false);
          setViewerFileRef(null);
        }}
      />
    </div>
  );
}

export interface FRInscricoesAdminProps {
  nivelAcademico: string;
  initialExpandInscricaoId?: number | null;
}

export default function FRInscricoesAdmin({
  nivelAcademico,
  initialExpandInscricaoId,
}: FRInscricoesAdminProps) {
  const [inscricoes, setInscricoes] = useState<FGInscricaoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const appliedInitialExpand = useRef(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await formularioRenovacaoService.listarInscricoesFR(
        nivelAcademico,
      )) as {
        inscricoes: FGInscricaoResumo[];
      };
      setInscricoes(res.inscricoes ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar inscrições");
    } finally {
      setLoading(false);
    }
  }, [nivelAcademico]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (appliedInitialExpand.current) return;
    if (initialExpandInscricaoId == null || Number.isNaN(Number(initialExpandInscricaoId))) return;
    appliedInitialExpand.current = true;
    setExpandedId(Number(initialExpandInscricaoId));
  }, [initialExpandInscricaoId]);

  const counts = inscricoes.reduce(
    (acc, i) => {
      acc[i.status_inscricao] = (acc[i.status_inscricao] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const filtered = inscricoes.filter((i) => {
    if (filterStatus !== "todos" && i.status_inscricao !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        i.aluno.nome?.toLowerCase().includes(q) ||
        i.aluno.email?.toLowerCase().includes(q) ||
        i.aluno.matricula?.toLowerCase().includes(q) ||
        i.aluno.cpf?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#183b4e]" />
        <span className="text-gray-600">Carregando inscrições...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {FILTER_OPTIONS.map((f) => {
          const count = f.key === "todos" ? inscricoes.length : (counts[f.key] ?? 0);
          const active = filterStatus === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`rounded-lg border px-3 py-2 text-center transition-colors text-sm
                ${active
                  ? "bg-[#183b4e] text-white border-[#183b4e]"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
            >
              <div className="font-bold text-lg">{count}</div>
              <div className="text-xs">{f.label}</div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Buscar por nome, e-mail, matrícula ou CPF..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          size="sm"
          isClearable
          onClear={() => setSearchTerm("")}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="font-medium">Nenhuma inscrição encontrada</p>
          <p className="text-sm">{filterStatus !== "todos" ? "Tente alterar o filtro." : "Ainda não há inscrições."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((insc) => {
            const isExpanded = expandedId === insc.id;
            return (
              <div key={insc.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : insc.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {insc.aluno.nome ?? "Sem nome"}
                      </span>
                      <StatusBadge status={insc.status_inscricao} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span>{insc.aluno.email}</span>
                      <span>Mat: {insc.aluno.matricula}</span>
                      <span>{new Date(insc.data_inscricao).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {insc.observacao_admin && (
                      <p className="text-xs text-orange-600 mt-1 truncate">
                        Obs: {insc.observacao_admin}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <InscricaoDetailPanel
                      inscricaoId={insc.id}
                      nivelAcademico={nivelAcademico}
                      onStatusChanged={load}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
