import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  ShieldCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
  Mail,
  UserCheck,
  UserX,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminService } from "@/services/AdminService/admin.service";
import type {
  AdminEquipeItem,
  AdminNotificacaoEmailItem,
} from "@/types/adminEquipe";
import type { AdminPerfil } from "@/types/auth";
import { adminPerfilLabel } from "@/utils/authRoles";
import { getApiErrorMessage } from "@/utils/apiError";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";

const PERFIL_OPTIONS: { value: AdminPerfil; label: string; description: string }[] = [
  {
    value: "tecnico",
    label: "Técnico",
    description: "Análise de inscrições.",
  },
  {
    value: "gerencial",
    label: "Gerencial",
    description: "Editais no geral e equipe PROAE.",
  },
  {
    value: "coordenacao",
    label: "Coordenação",
    description: "Apenas consulta.",
  },
];

const PAGE_SIZE = 20;

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
  const { confirm, dialogProps } = useConfirmDialog();

  const [admins, setAdmins] = useState<AdminEquipeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState<"todos" | AdminPerfil>("todos");
  const [filtroAprovacao, setFiltroAprovacao] = useState<"todos" | "aprovados" | "pendentes">("todos");
  const [salvandoId, setSalvandoId] = useState<number | null>(null);
  const [perfilAprovacao, setPerfilAprovacao] = useState<Record<number, AdminPerfil>>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [pendentesCount, setPendentesCount] = useState(0);
  const autoFiltroPendenteRef = useRef(false);

  const [notifEmails, setNotifEmails] = useState<AdminNotificacaoEmailItem[]>([]);
  const [notifEnvFallback, setNotifEnvFallback] = useState<string[]>([]);
  const [notifUsaBanco, setNotifUsaBanco] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);
  const [novoEmailNotif, setNovoEmailNotif] = useState("");
  const [salvandoNotif, setSalvandoNotif] = useState(false);

  useEffect(() => {
    void carregarNotificacoes();
  }, []);

  useEffect(() => {
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, busca, filtroPerfil, filtroAprovacao]);

  const carregar = async () => {
    setIsLoading(true);
    setErro(null);
    try {
      const resp = await adminService.listarEquipe({
        page: paginaAtual,
        limit: PAGE_SIZE,
        busca: busca.trim() || undefined,
        perfil: filtroPerfil !== "todos" ? filtroPerfil : undefined,
        aprovado:
          filtroAprovacao === "aprovados"
            ? true
            : filtroAprovacao === "pendentes"
              ? false
              : undefined,
      });
      const lista = resp.dados ?? [];
      const totalPaginasApi = Math.max(1, resp.paginacao?.total_paginas ?? 1);
      if (paginaAtual > totalPaginasApi) {
        setPaginaAtual(totalPaginasApi);
        return;
      }
      setAdmins(lista);
      setTotalPaginas(totalPaginasApi);
      setTotalItens(resp.paginacao?.total_itens ?? lista.length);
      const totalPendentes =
        resp.resumo?.total_pendentes ??
        lista.reduce((acc, item) => acc + (item.aprovado ? 0 : 1), 0);
      setPendentesCount(totalPendentes);

      if (
        !autoFiltroPendenteRef.current &&
        busca.trim() === "" &&
        filtroPerfil === "todos" &&
        filtroAprovacao === "todos" &&
        totalPendentes > 0
      ) {
        autoFiltroPendenteRef.current = true;
        setPaginaAtual(1);
        setFiltroAprovacao("pendentes");
        return;
      }

      setPerfilAprovacao((prev) => {
        const next = { ...prev };
        for (const item of lista) {
          if (!item.aprovado && !next[item.id_admin]) {
            next[item.id_admin] = item.perfil;
          }
        }
        return next;
      });
    } catch (e) {
      setErro(getApiErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const carregarNotificacoes = async () => {
    setNotifLoading(true);
    try {
      const resp = await adminService.listarNotificacoesAprovacao();
      setNotifEmails(resp.dados.emails ?? []);
      setNotifUsaBanco(resp.dados.usa_banco);
      setNotifEnvFallback(resp.dados.emails_ambiente ?? []);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setNotifLoading(false);
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
      await carregar();
      toast.success(`Perfil de ${item.nome || item.email} atualizado para ${adminPerfilLabel(resp.dados.perfil)}.`);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoId(null);
    }
  };

  const handleAprovar = async (item: AdminEquipeItem) => {
    const perfil = perfilAprovacao[item.id_admin] ?? item.perfil;
    setSalvandoId(item.id_admin);
    try {
      const resp = await adminService.aprovarAdmin(item.id_admin, perfil);
      await carregar();
      toast.success(`${item.nome || item.email} aprovado como ${adminPerfilLabel(resp.dados.perfil)}.`);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoId(null);
    }
  };

  const handleRejeitar = async (item: AdminEquipeItem) => {
    const ok = await confirm({
      title: "Rejeitar cadastro de admin?",
      message: `O pedido de ${item.nome || item.email} será removido. Esta ação não pode ser desfeita pela interface.`,
      confirmLabel: "Rejeitar",
      tone: "danger",
    });
    if (!ok) return;

    setSalvandoId(item.id_admin);
    try {
      await adminService.rejeitarAdmin(item.id_admin);
      await carregar();
      toast.success("Cadastro rejeitado.");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoId(null);
    }
  };

  const handleExcluirPerfilAdmin = async (item: AdminEquipeItem) => {
    if (item.sou_eu) {
      toast.error("Não é permitido excluir seu próprio perfil administrativo.");
      return;
    }
    if (item.perfil === "gerencial") {
      toast.error("Esta ação remove apenas perfis técnico ou coordenação.");
      return;
    }

    const ok = await confirm({
      title: "Excluir perfil de admin?",
      message: `O perfil ${adminPerfilLabel(item.perfil)} de ${item.nome || item.email} será removido e o acesso ao portal PROAE será revogado.`,
      confirmLabel: "Excluir perfil",
      tone: "danger",
    });
    if (!ok) return;

    setSalvandoId(item.id_admin);
    try {
      await adminService.excluirPerfilAdmin(item.id_admin);
      await carregar();
      toast.success("Perfil administrativo removido com sucesso.");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoId(null);
    }
  };

  const handleAdicionarEmailNotif = async () => {
    const email = novoEmailNotif.trim();
    if (!email) {
      toast.error("Informe um e-mail.");
      return;
    }
    setSalvandoNotif(true);
    try {
      const resp = await adminService.adicionarNotificacaoAprovacao(email);
      setNotifEmails((prev) => [...prev, resp.dados]);
      setNotifUsaBanco(true);
      setNotifEnvFallback([]);
      setNovoEmailNotif("");
      toast.success("E-mail adicionado à lista de notificações.");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoNotif(false);
    }
  };

  const handleRemoverEmailNotif = async (row: AdminNotificacaoEmailItem) => {
    const ok = await confirm({
      title: "Remover e-mail da lista?",
      message: `${row.email} deixará de receber pedidos de aprovação de novos admins.`,
      confirmLabel: "Remover",
      tone: "warning",
    });
    if (!ok) return;

    setSalvandoNotif(true);
    try {
      await adminService.removerNotificacaoAprovacao(row.id);
      const next = notifEmails.filter((e) => e.id !== row.id);
      setNotifEmails(next);
      if (next.length === 0) {
        setNotifUsaBanco(false);
        void carregarNotificacoes();
      }
      toast.success("E-mail removido.");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSalvandoNotif(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Toaster position="top-right" />
      <ConfirmDialog {...dialogProps} />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#183b4e] text-white flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Equipe PROAE</h1>
              <p className="text-sm text-slate-600">
                Gerencie perfis, aprove novos cadastros e configure quem recebe e-mail de pedidos de
                aprovação. Apenas perfil <strong>gerencial</strong>.
              </p>
            </div>
          </div>
        </header>

        {pendentesCount > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">
                {pendentesCount} cadastro{pendentesCount !== 1 ? "s" : ""} aguardando aprovação
              </p>
              <p className="text-sm text-amber-800 mt-1">
                Você pode aprovar ou rejeitar aqui (como nos links do e-mail) ou continuar usando o e-mail enviado aos destinatários configurados abaixo.
              </p>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#183b4e]" />
            <h2 className="text-lg font-semibold text-slate-800">
              E-mails de notificação (aprovação de novos admins)
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Quando alguém se cadastra como servidor PROAE, estes endereços recebem o e-mail com links de aprovação.
          </p>

          {notifLoading ? (
            <p className="text-sm text-slate-500">Carregando lista...</p>
          ) : (
            <>
              {!notifUsaBanco && notifEnvFallback.length > 0 && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                  <p className="font-medium">Usando variável de ambiente (ADMINS_EMAILS)</p>
                  <ul className="mt-1 list-disc list-inside">
                    {notifEnvFallback.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-blue-800">
                    Adicione e-mails abaixo para gerenciar pela interface; após o primeiro cadastro, só a lista do banco será usada.
                  </p>
                </div>
              )}

              {notifEmails.length > 0 ? (
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {notifEmails.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span className="truncate text-slate-700">{row.email}</span>
                      <button
                        type="button"
                        disabled={salvandoNotif}
                        onClick={() => void handleRemoverEmailNotif(row)}
                        className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 text-xs font-semibold disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                !notifEnvFallback.length && (
                  <p className="text-sm text-amber-700">
                    Nenhum destinatário configurado. Cadastros novos não dispararão e-mail até adicionar um endereço ou configurar ADMINS_EMAILS no servidor.
                  </p>
                )
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={novoEmailNotif}
                  onChange={(e) => setNovoEmailNotif(e.target.value)}
                  placeholder="email@instituicao.br"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <button
                  type="button"
                  disabled={salvandoNotif}
                  onClick={() => void handleAdicionarEmailNotif()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#183b4e] text-white text-sm font-semibold hover:bg-[#0f2a38] disabled:opacity-50"
                >
                  {salvandoNotif ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Adicionar e-mail
                </button>
              </div>
            </>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => {
                setPaginaAtual(1);
                setBusca(e.target.value);
              }}
              placeholder="Buscar por nome, email ou cargo"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroPerfil}
              onChange={(e) =>
                {
                  setPaginaAtual(1);
                  setFiltroPerfil(e.target.value as "todos" | AdminPerfil);
                }
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
                {
                  setPaginaAtual(1);
                  setFiltroAprovacao(
                    e.target.value as "todos" | "aprovados" | "pendentes",
                  );
                }
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
          ) : admins.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              Nenhum admin encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {admins.map((item) => (
                <article
                  key={item.id_admin}
                  className={`p-4 md:p-5 ${!item.aprovado ? "bg-amber-50/40" : ""}`}
                >
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

                    {!item.aprovado ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`aprovar-perfil-${item.id_admin}`}
                            className="text-xs font-semibold text-slate-500 whitespace-nowrap"
                          >
                            Aprovar como:
                          </label>
                          <select
                            id={`aprovar-perfil-${item.id_admin}`}
                            value={perfilAprovacao[item.id_admin] ?? item.perfil}
                            disabled={salvandoId === item.id_admin}
                            onChange={(e) =>
                              setPerfilAprovacao((prev) => ({
                                ...prev,
                                [item.id_admin]: e.target.value as AdminPerfil,
                              }))
                            }
                            className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
                          >
                            {PERFIL_OPTIONS.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          disabled={salvandoId === item.id_admin}
                          onClick={() => void handleAprovar(item)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {salvandoId === item.id_admin ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          Aprovar
                        </button>
                        <button
                          type="button"
                          disabled={salvandoId === item.id_admin}
                          onClick={() => void handleRejeitar(item)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </div>
                    ) : (
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
                        {!item.sou_eu && item.perfil !== "gerencial" && (
                          <button
                            type="button"
                            disabled={salvandoId === item.id_admin}
                            onClick={() => void handleExcluirPerfilAdmin(item)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                            title="Excluir perfil administrativo (técnico/coordenação)"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir perfil
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {PERFIL_OPTIONS.find((p) => p.value === item.perfil)?.description}
                  </p>
                </article>
              ))}
            </div>
          )}
          <div className="border-t border-slate-200 px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm text-slate-600">
            <span>
              Mostrando {admins.length} de {totalItens} admin
              {totalItens !== 1 ? "s" : ""}.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
                disabled={paginaAtual <= 1 || isLoading}
                className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500">
                Página {paginaAtual} de {Math.max(1, totalPaginas)}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPaginaAtual((prev) =>
                    Math.min(Math.max(1, totalPaginas), prev + 1),
                  )
                }
                disabled={paginaAtual >= totalPaginas || isLoading}
                className="px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </section>

        <footer className="text-xs text-slate-500 text-center">
          {totalItens} admin{totalItens !== 1 ? "s" : ""} cadastrado
          {totalItens !== 1 ? "s" : ""}.
        </footer>
      </div>
    </div>
  );
}
