import BenefitsCard from "@/components/BenefitsCard/BenefitsCard";
import OpenSelections from "@/pages/paginaAluno/PortalAluno/componentes/OpenSelections";
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import PortalAlunoService from "@/services/PortalAluno/PortalAlunoService";
import { useEffect, useState, useContext } from "react";
import "./PortalAluno.css";
import CandidateStatus from "./componentes/CandidateStatus";
import {
  User,
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { LoadingSpin } from "@/components/Loading/LoadingScreen";

interface ResponseData {
  dados: {
    beneficios: [];
  };
}

export default function PortalAluno() {
  const { userInfo:user } = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [userId, setUserId] = useState("");
  const [benefits, setBenefits] = useState<any[]>([]);
  const [openSelections, setOpenSelections] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


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
      const response = await portalAlunoService.getBenefts();
      const data = (response as ResponseData).dados.beneficios;
      setBenefits(data);
    } catch (error) {
      console.error("Erro ao obter benefícios:", error);
    }
  };

  const getOpenSelections = async () => {
    try {
      const response = await portalAlunoService.getEditals();
      if (!response || !Array.isArray(response)) {
        throw new Error("Resposta inválida do servidor");
      }
      setOpenSelections(response);
    } catch (error) {
      console.error("Erro ao obter seleções abertas:", error);
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

  useEffect(() => {
    if (userId) {
      Promise.all([
        getBenefits(),
        getOpenSelections(),
        getInscriptions(),
      ]).finally(() => setLoading(false));
    }
  }, [userId]);

  // Estatísticas do dashboard
  const stats = [
    {
      icon: Award,
      label: "Benefícios Ativos",
      value: benefits?.filter((b) =>
        b.beneficio?.toLowerCase().includes("ativo")
      ).length || 0,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      icon: BookOpen,
      label: "Seleções Abertas",
      value: openSelections?.filter((s) =>
        s.status_edital?.toLowerCase().includes("aberto")
      ).length || 0,
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
      value: inscriptions?.filter((i) => i.possui_pendencias).length || 0,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  if (loading) {
    return (
      <LoadingSpin/>
    );
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
                <p className="welcome-subtitle">
                  Bem-vindo ao seu portal do estudante
                </p>
              </div>
            </div>

            <div className="header-actions">
              <div className="notification-icon">
                <Bell className="w-5 h-5" />
                {(inscriptions?.filter((i) => i.possui_pendencias).length || 0) > 0 && (
                  <span className="notification-badge">
                    {inscriptions?.filter((i) => i.possui_pendencias).length || 0}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

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
                <div className="section-header">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h2 className="section-title">Meus Benefícios</h2>
                </div>
                <div className="card-container">
                  <BenefitsCard benefits={benefits} />
                </div>
              </div>

              <div className="selections-container">
                <div className="section-header">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="section-title">Seleções Abertas</h2>
                </div>
                <div className="card-container">
                  <OpenSelections editais={openSelections} />
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
                  {inscriptions?.length || 0} inscrição
                  {(inscriptions?.length || 0) !== 1 ? "ões" : ""}
                </span>
              </div>
            </div>

            <div className="inscriptions-container">
              {(inscriptions && inscriptions.length > 0) ? (
                <div className="inscriptions-grid">
                  {inscriptions.map((edital, index) => (
                    <div key={edital.id || index} className="inscription-card">
                      <CandidateStatus edital={edital} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="empty-title">Nenhuma inscrição encontrada</h3>
                  <p className="empty-description">
                    Você ainda não se inscreveu em nenhum edital. Explore as
                    seleções abertas acima!
                  </p>
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
                    {(inscriptions?.filter((i) => !i.possui_pendencias).length || 0)}{" "}
                    inscri
                    {(inscriptions?.filter((i) => !i.possui_pendencias).length || 0) !==
                    1
                      ? "ções"
                      : "ção"}{" "}
                    em dia
                  </p>
                </div>
              </div>

              <div className="status-card warning">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div className="status-content">
                  <h3 className="status-title">Pendências</h3>
                  <p className="status-description">
                    {(inscriptions?.filter((i) => i.possui_pendencias).length || 0)}{" "}
                    item
                    {(inscriptions?.filter((i) => i.possui_pendencias).length || 0) !==
                    1
                      ? "s"
                      : ""}{" "}
                    para resolver
                  </p>
                </div>
              </div>

              <div className="status-card info">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <div className="status-content">
                  <h3 className="status-title">Progresso</h3>
                  <p className="status-description">
                    {benefits.length} benefício
                    {benefits.length !== 1 ? "s" : ""} conquistado
                    {benefits.length !== 1 ? "s" : ""}
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


