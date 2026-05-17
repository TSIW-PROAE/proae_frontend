import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  ShieldCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { AdminService } from "@/services/AdminService/admin.service";
import type { AdminEquipeItem } from "@/types/adminEquipe";
import type { AdminPerfil } from "@/types/auth";
import { adminPerfilLabel } from "@/utils/authRoles";
import { getApiErrorMessage } from "@/utils/apiError";

const PERFIL_OPTIONS: { value: AdminPerfil; label: string; description: string }[] = [
  {
    value: "tecnico",
    label: "Técnico",
    description: "Análise das inscrições; sem gestão de editais.",
  },
  {
    value: "gerencial",
    label: "Gerencial",
    description: "Criação, gestão e publicação de editais; gerencia perfis.",
  },
  {
    value: "coordenacao",
    label: "Coordenação",
    description: "Somente consulta. Sem permissão de edição.",
  },
];

function PerfilBadge({ perfil }: { perfil: AdminPerfil }) {
  const styles: Record<AdminPerfil, string> = {
    tecnico: "bg-amber-100 text-amber-800 border-amber-200",
    gerencial: "bg-emerald-100 text-emerald-800 border-emerald-200",
    coordenacao: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[perfil]}`}
    >
      <ShieldCheck className="w-3 h-3" />
      {adminPerfilLabel(perfil)}
    </span>
  );
}

export default function GerenciarAdmins() {
  const adminService = useMemo(() => new AdminService(), []);

  const [admins, setAdmins] = useState<AdminEquipeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState<"todos" | AdminPerfil>("todos");
  const [filtroAprovacao, setFiltroAprovacao] = useState<"todos" | "aprovados" | "pendentes">("todos");
  const [salvandoId, setSalvandoId] = useState<number | null>(null);

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregar = async () => {
    setIsLoading(true);
    setErro(null);
    try {
      const resp = await adminService.listarEquipe();
      setAdmins(resp.dados ?? []);
    } catch (e) {
      setErro(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlterarPerfil = async (item: AdminEquipeItem, novo: AdminPerfil) => {
    if (item.perfil === novo) return;
    if (item.sou_eu) {
      toast.error(
        "Para alterar seu próprio perfil, peça a outro gerencial. Isto evita rebaixar o último gerencial sem querer.",
      );
      return;
    }
    setSalvandoId(item.id_admin);
    try {
      const resp = await adminService.alterarPerfilDeAdmin(item.id_admin, novo);
      setAdmins((prev) =>
        prev.map((a) =>
          a.id_admin === item.id_admin ? { ...a, perfil: resp.dados.perfil } : a,
        ),
      );
      toast.success(`Perfil de ${item.nome || item.email} atualizado para ${adminPerfilLabel(resp.dados.perfil)}.`);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoId(null);
    }
  };

  const adminsFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return admins.filter((a) => {
      if (filtroPerfil !== "todos" && a.perfil !== filtroPerfil) return false;
      if (filtroAprovacao === "aprovados" && !a.aprovado) return false;
      if (filtroAprovacao === "pendentes" && a.aprovado) return false;
      if (!termo) return true;
      return (
        a.nome.toLowerCase().includes(termo) ||
        a.email.toLowerCase().includes(termo) ||
        (a.cargo ?? "").toLowerCase().includes(termo)
      );
    });
  }, [admins, busca, filtroPerfil, filtroAprovacao]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#183b4e] text-white flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Equipe PROAE</h1>
              <p className="text-sm text-slate-600">
                Gerencie os perfis de acesso dos servidores cadastrados (técnico, gerencial e coordenação).
              </p>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, email ou cargo"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroPerfil}
              onChange={(e) =>
                setFiltroPerfil(e.target.value as "todos" | AdminPerfil)
              }
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              aria-label="Filtrar por perfil"
            >
              <option value="todos">Todos os perfis</option>
              {PERFIL_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={filtroAprovacao}
              onChange={(e) =>
                setFiltroAprovacao(
                  e.target.value as "todos" | "aprovados" | "pendentes",
                )
              }
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              aria-label="Filtrar por aprovação"
            >
              <option value="todos">Todos os status</option>
              <option value="aprovados">Apenas aprovados</option>
              <option value="pendentes">Apenas pendentes</option>
            </select>
          </div>
        </section>

        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Não foi possível carregar a equipe</p>
              <p className="text-sm">{erro}</p>
            </div>
            <button
              onClick={() => void carregar()}
              className="text-sm font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-slate-500">Carregando equipe...</div>
          ) : adminsFiltrados.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              Nenhum admin encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {adminsFiltrados.map((item) => (
                <article key={item.id_admin} className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 truncate">
                          {item.nome || "(sem nome)"}
                          {item.sou_eu && (
                            <span className="ml-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              você
                            </span>
                          )}
                        </h3>
                        <PerfilBadge perfil={item.perfil} />
                        {item.aprovado ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <Clock className="w-3 h-3" />
                            Aguardando aprovação
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-slate-600 truncate">
                        {item.email}
                      </div>
                      {item.cargo && (
                        <div className="mt-0.5 text-xs text-slate-500 truncate">
                          {item.cargo}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label
                        htmlFor={`perfil-${item.id_admin}`}
                        className="text-xs font-semibold text-slate-500"
                      >
                        Perfil:
                      </label>
                      <select
                        id={`perfil-${item.id_admin}`}
                        value={item.perfil}
                        disabled={item.sou_eu || salvandoId === item.id_admin}
                        onChange={(e) =>
                          void handleAlterarPerfil(
                            item,
                            e.target.value as AdminPerfil,
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
                        title={
                          item.sou_eu
                            ? "Para alterar seu próprio perfil, peça a outro gerencial."
                            : undefined
                        }
                      >
                        {PERFIL_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      {salvandoId === item.id_admin && (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {PERFIL_OPTIONS.find((p) => p.value === item.perfil)?.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="text-xs text-slate-500 text-center">
          {admins.length} admin{admins.length !== 1 ? "s" : ""} cadastrado
          {admins.length !== 1 ? "s" : ""}.
        </footer>
      </div>
    </div>
  );
}
