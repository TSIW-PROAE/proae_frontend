import BenefitsCard from "@/components/BenefitsCard/BenefitsCard";
import OpenSelections from "@/pages/paginaAluno/PortalAluno/componentes/OpenSelections";
import { FetchAdapter } from "@/services/api";
import PortalAlunoService from "@/services/PortalAluno/PortalAlunoService";
import { API_BASE_URL } from "@/config/api";
import { NIVEL_GRADUACAO } from "@/constants/nivelAcademico";
import { formularioGeralService } from "@/services/FormularioGeralService/formularioGeral.service";
import { useEffect, useState, useContext, useMemo, useRef, useCallback } from "react";
import {
  buildPortalNotifications,
  countUrgentNotifications,
} from "./buildPortalNotifications";
import "./PortalAluno.css";
import CandidateStatus from "./componentes/CandidateStatus";
import { User, BookOpen, FileText, Award, TrendingUp, Clock, CheckCircle, AlertCircle, Bell, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { LoadingSpin } from "@/components/Loading/LoadingScreen";
import toast from "react-hot-toast";

interface ResponseData {
  dados: {
    beneficios: [];
  };
}

export default function PortalAluno() {
  const navigate = useNavigate();
  const { userInfo: user } = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [userId, setUserId] = useState("");
  const [benefits, setBenefits] = useState<any[]>([]);
  const [openSelections, setOpenSelections] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [podeSeInscreverEmOutros, setPodeSeInscreverEmOutros] = useState<boolean>(true);
  const [renovacaoPendente, setRenovacaoPendente] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifWrapRef = useRef<HTMLDivElement>(null);
  const prevUrgentCountRef = useRef(0);

  useEffect(() => {
    if (user) {
      setFirstName(user.nome || "");
      setUserId(user.email);
    }
  }, [user]);

  const client = new FetchAdapter();
  const portalAlunoService = new PortalAlunoService(client);

  const getBenefits = async () => {
    try {
      const response = (await portalAlunoService.getBenefts()) as ResponseData | null;
      const data = response?.dados?.beneficios ?? [];
      setBenefits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao obter benefícios:", error);
      setBenefits([]);
    }
  };

  const getInscriptions = async () => {
    try {
      const response = await portalAlunoService.getInscriptions();
      if (!response || !Array.isArray(response)) {
        throw new Error("Resposta inválida do servidor");
      }
      setInscriptions(response);
    } catch (error) {
      console.error("Erro ao obter seleções abertas:", error);
    }
  };

  const getFormularioGeralStatus = async () => {
    try {
      const fg = await formularioGeralService.getFormularioGeralOrNull();
      setPodeSeInscreverEmOutros(fg?.pode_se_inscrever_em_outros ?? true);
      setRenovacaoPendente(!!fg?.renovacao_pendente);
    } catch {
      setPodeSeInscreverEmOutros(true);
      setRenovacaoPendente(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      let nivel: string = NIVEL_GRADUACAO;
      try {
        const r = (await client.get(`${API_BASE_URL}/aluno/me`)) as {
          dados?: { aluno?: { nivel_academico?: string } };
        };
        const n = r?.dados?.aluno?.nivel_academico;
        if (n) nivel = n as string;
      } catch {
        nivel = NIVEL_GRADUACAO;
      }
      if (cancelled) return;
      try {
        const response = await portalAlunoService.getEditals(nivel);
        if (!cancelled && response && Array.isArray(response)) {
          setOpenSelections(response);
        }
      } catch {
        if (!cancelled) setOpenSelections([]);
      }
      if (cancelled) return;
      await Promise.all([
        getBenefits(),
        getInscriptions(),
        getFormularioGeralStatus(),
      ]);
    })().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const hasPendenciasLike = (inscricao: any) => {
    const totalPendencias = Number(inscricao?.total_pendencias ?? 0);
    const totalNovas = Number(inscricao?.total_novas_perguntas ?? 0);
    const status = String(inscricao?.status_inscricao ?? "").toLowerCase();
    const statusIndicaAjuste =
      status.includes("ajuste") ||
      status.includes("complemento") ||
      status.includes("regulariza") ||
      status.includes("pendente_regularizacao");
    return (
      inscricao?.possui_pendencias === true ||
      inscricao?.possui_novas_perguntas_pendentes === true ||
      totalPendencias > 0 ||
      totalNovas > 0 ||
      statusIndicaAjuste
    );
  };

  const inscricoesComPendenciaCount =
    inscriptions?.filter((i) => hasPendenciasLike(i)).length ?? 0;

  const portalNotifications = useMemo(
    () => buildPortalNotifications(inscriptions, renovacaoPendente),
    [inscriptions, renovacaoPendente],
  );
  const urgentNotifCount = useMemo(
    () => countUrgentNotifications(portalNotifications),
    [portalNotifications],
  );

  const closeNotif = useCallback(() => setNotifOpen(false), []);

  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = notifWrapRef.current;
      if (el && !el.contains(e.target as Node)) closeNotif();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNotif();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen, closeNotif]);

  useEffect(() => {
    const prev = prevUrgentCountRef.current;
    if (urgentNotifCount > prev) {
      const novas = urgentNotifCount - prev;
      toast(
        novas === 1
          ? "Você recebeu 1 nova notificação de pendência."
          : `Você recebeu ${novas} novas notificações de pendência.`,
        { icon: "🔔" },
      );
    }
    prevUrgentCountRef.current = urgentNotifCount;
  }, [urgentNotifCount]);

  // Estatísticas do dashboard
  const stats = [
    {
      icon: Award,
      label: "Benefícios no edital",
      value: benefits?.filter((b) => b.beneficio?.toLowerCase().includes("ativo")).length || 0,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      icon: BookOpen,
      label: "Seleções Abertas",
      value: openSelections?.filter((s) => s.status_edital?.toLowerCase().includes("aberto")).length || 0,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      icon: FileText,
      label: "Inscrições Ativas",
      value: inscriptions?.length || 0,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      icon: Clock,
      label: "Pendências",
      value: inscricoesComPendenciaCount,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  if (loading) {
    return <LoadingSpin />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/*<Toaster position="top-right" />*/}

      <div className="max-w-7xl mx-auto p-4 ">
        {/* Header Principal */}
        <header className="portal-header">
          <div className="header-content">
            <div className="welcome-section">
              <div className="avatar-container">
                <div className="avatar">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="welcome-text">
                <h1 className="welcome-title">
                  Olá, {firstName}!<span className="welcome-emoji">👋</span>
                </h1>
                <p className="welcome-subtitle">Bem-vindo ao seu portal do estudante</p>
              </div>
            </div>

            <div className="header-actions">
              <div className="notification-wrap" ref={notifWrapRef}>
                <button
                  type="button"
                  className="notification-icon"
                  aria-label="Notificações"
                  aria-expanded={notifOpen}
                  aria-haspopup="true"
                  onClick={() => setNotifOpen((o) => !o)}
                >
                  <Bell className="w-5 h-5" />
                  {urgentNotifCount > 0 && (
                    <span className="notification-badge">
                      {urgentNotifCount > 9 ? "9+" : urgentNotifCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="notification-dropdown" role="region" aria-label="Lista de notificações">
                    <div className="notification-dropdown-header">Notificações</div>
                    <p className="notification-dropdown-hint">
                      Resumo com base nas suas inscrições e renovação. Itens em vermelho/laranja pedem ação.
                    </p>
                    {portalNotifications.length === 0 ? (
                      <p className="notification-dropdown-empty">Nada a mostrar no momento.</p>
                    ) : (
                      <ul className="notification-list">
                        {portalNotifications.map((n) => (
                          <li key={n.id}>
                            {n.href ? (
                              <button
                                type="button"
                                className={`notification-item notification-item--${n.variant}`}
                                onClick={() => {
                                  navigate(n.href!);
                                  closeNotif();
                                }}
                              >
                                <span className="notification-item-title">{n.title}</span>
                                <span className="notification-item-body">{n.body}</span>
                                <span className="notification-item-cta">Abrir →</span>
                              </button>
                            ) : (
                              <div className={`notification-item notification-item--${n.variant} notification-item--static`}>
                                <span className="notification-item-title">{n.title}</span>
                                <span className="notification-item-body">{n.body}</span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mb-4 p-4 rounded-xl border border-slate-200 bg-white/90 text-slate-800 text-sm leading-relaxed shadow-sm">
          <p className="font-semibold text-slate-900 m-0 mb-1">Como ler o portal</p>
          <ul className="list-disc pl-5 m-0 space-y-1">
            <li>
              <strong>Minhas inscrições</strong>: situação da sua inscrição no processo (análise, pendências, etc.).
            </li>
            <li>
              <strong>Benefícios no edital</strong>: aparece quando a inscrição está <strong>aprovada na análise</strong> e você foi{" "}
              <strong>homologado como beneficiário da vaga</strong> naquele edital — são duas etapas diferentes.
            </li>
          </ul>
        </div>

        {renovacaoPendente && (
          <div className="mb-4 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-950 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-start gap-2">
              <RefreshCw className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Renovação obrigatória</p>
                <p className="text-sm opacity-90">
                  Há um formulário de renovação aberto. Conclua-o para voltar a se inscrever em editais e benefícios.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/portal-aluno/formulario-renovacao")}
              className="px-4 py-2 rounded-lg bg-amber-800 text-white text-sm font-medium hover:bg-amber-900"
            >
              Preencher renovação
            </button>
          </div>
        )}

        {/* Estatísticas Cards */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className={`stat-icon ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conteúdo Principal */}
        <main className="main-content">
          {/* Seção de Benefícios e Seleções */}
          <section className="benefits-selections-section">
            <div className="content-grid">
              <div className="benefits-container">
                <div className="card-container">
                  <BenefitsCard benefits={benefits} />
                </div>
              </div>

              <div className="selections-container">
                <div className="card-container">
                  <OpenSelections
                    editais={openSelections}
                    podeSeInscreverEmOutros={podeSeInscreverEmOutros}
                    inscricoesAluno={inscriptions}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Inscrições */}
          <section className="inscriptions-section">
            <div className="section-header">
              <FileText className="w-5 h-5 text-purple-600" />
              <h2 className="section-title">Minhas Inscrições</h2>
              <div className="section-actions">
                <span className="section-count">
                  {inscriptions?.length || 0}{" "}
                  {(inscriptions?.length || 0) !== 1 ? "inscrições" : "inscrição"}
                </span>
              </div>
            </div>

            <div className="inscriptions-container">
              {inscriptions && inscriptions.length > 0 ? (
                <div className="inscriptions-grid">
                  {inscriptions.map((edital, index) => (
                    <div key={edital.id || index} className="inscription-card">
                      <CandidateStatus edital={edital} onReload={() => getInscriptions()} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="empty-title">Nenhuma inscrição encontrada</h3>
                  <p className="empty-description">Você ainda não se inscreveu em nenhum edital. Explore as seleções abertas acima!</p>
                </div>
              )}
            </div>
          </section>

          {/* Seção de Status Rápido */}
          <section className="quick-status-section">
            <div className="status-grid">
              <div className="status-card success">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div className="status-content">
                  <h3 className="status-title">Documentação</h3>
                  <p className="status-description">
                    {inscriptions?.filter((i) => !i.possui_pendencias && !i.possui_novas_perguntas_pendentes).length || 0} inscri
                    {(inscriptions?.filter((i) => !i.possui_pendencias && !i.possui_novas_perguntas_pendentes).length || 0) !== 1 ? "ções" : "ção"} em dia
                  </p>
                </div>
              </div>

              <div className="status-card warning">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div className="status-content">
                  <h3 className="status-title">Pendências</h3>
                  <p className="status-description">
                    {inscricoesComPendenciaCount}{" "}
                    {inscricoesComPendenciaCount === 1 ? "item" : "itens"} para resolver
                  </p>
                </div>
              </div>

              <div className="status-card info">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <div className="status-content">
                  <h3 className="status-title">Homologações</h3>
                  <p className="status-description">
                    {benefits.length} processo
                    {benefits.length !== 1 ? "s" : ""} com inscrição aprovada e benefício homologado no edital
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
