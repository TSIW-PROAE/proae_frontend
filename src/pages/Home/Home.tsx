import { FetchAdapter } from "@/services/api";
import PortalAlunoService from "@/services/PortalAluno/PortalAlunoService";
import { Button } from "@heroui/button";
import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InfoCard from "../../components/InfoCard/InfoCard";
import ProcessoSeletivo from "../../components/ProcessoSeletivo/ProcessoSeletivo";
import restauranteIcon from "../../assets/dashboard icons/alimentação.svg";
import bolsaIcon from "../../assets/dashboard icons/bolsa.svg";
import crecheIcon from "../../assets/dashboard icons/creche.svg";
import buzufbaIcon from "../../assets/dashboard icons/bus.svg";
import residenciaIcon from "../../assets/dashboard icons/apartamento.svg";
import renovacaoIcon from "../../assets/dashboard icons/renvação.svg";
import "./Home.css";
import { AuthContext } from "@/context/AuthContext";
import { NIVEL_GRADUACAO } from "@/constants/nivelAcademico";
import type { DocumentoEdital } from "@/types/edital";
import { normalizeUrlForHref } from "@/utils/utils";
import { normalizeRoles } from "@/utils/authRoles";

/** API envia `edital_url` como `{ titulo_documento, url_documento }[]`, não como string[]. */
function mapEditalUrlParaDocumentos(
  editalUrl: unknown,
): { titulo: string; url: string }[] {
  if (!Array.isArray(editalUrl)) return [];
  return editalUrl.map((item, i) => {
    if (typeof item === "string") {
      return {
        titulo: `Documento ${i + 1}`,
        url: normalizeUrlForHref(item),
      };
    }
    const doc = item as DocumentoEdital;
    return {
      titulo: doc.titulo_documento?.trim() || `Documento ${i + 1}`,
      url: normalizeUrlForHref(doc.url_documento),
    };
  });
}

export default function Home() {
  const { isAuthenticated, userInfo, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigated = useRef(false);
  const [editais, setEditais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create stable values for role checking to prevent unnecessary re-renders
  const userRoleInfo = useMemo(() => {
    if (!userInfo) return { isAdmin: false, isAprovado: false, rolesString: "" };
    const roles = normalizeRoles(userInfo.roles);
    const isAdmin = roles.includes("admin");
    const isAprovado = userInfo.aprovado ?? false;
    const rolesString = roles.join(",");
    return { isAdmin, isAprovado, rolesString };
  }, [userInfo?.roles, userInfo?.aprovado]);

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        const client = new FetchAdapter();
        const portalAlunoService = new PortalAlunoService(client);
        const response = await portalAlunoService.getEditals(NIVEL_GRADUACAO);
        setEditais(Array.isArray(response) ? response : []);
      } catch (error) {
        setEditais([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEditais();
  }, []);

  useEffect(() => {
    // Only redirect if auth check is complete and user is authenticated
    // Don't redirect if not authenticated - let them stay on the home page
    // Also prevent multiple navigations with a ref and check current location
    const isOnHomePage = location.pathname === "/";
    const isOnPortalRoute = location.pathname.startsWith("/portal-") || location.pathname.startsWith("/tela-de-espera");

    if (!authLoading && isAuthenticated && !hasNavigated.current && isOnHomePage && !isOnPortalRoute) {
      hasNavigated.current = true;

      if (userRoleInfo.isAdmin && userRoleInfo.isAprovado) {
        navigate("/portal-proae/inscricoes", { replace: true });
      } else if (!userRoleInfo.isAprovado && userRoleInfo.isAdmin) {
        navigate("/tela-de-espera", { replace: true });
      } else {
        navigate("/portal-aluno", { replace: true });
      }
    }
    // Reset ref when user logs out or becomes unauthenticated
    if (!isAuthenticated) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, authLoading, navigate, location.pathname, userRoleInfo.isAdmin, userRoleInfo.isAprovado, userRoleInfo.rolesString]);

  const handleAccessPortal = () => {
    if (isAuthenticated && userInfo) {
      const roles = normalizeRoles(userInfo.roles);
      const isAdmin = roles.includes("admin");
      const aprovado = userInfo.aprovado === true;
      if (isAdmin && aprovado) {
        navigate("/portal-proae/inscricoes");
      } else if (isAdmin && !aprovado) {
        navigate("/tela-de-espera");
      } else {
        navigate("/portal-aluno");
      }
    } else if (!isAuthenticated) {
      navigate("/login");
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
          <h1>PROAE</h1>
        </div>
        <div className="header-actions ">
          <Button radius="full" onPress={handleAccessPortal} className="n-button-dash bg-[#183b4e] text-white">
            {isAuthenticated ? "Acessar Portal" : "Entrar"}
          </Button>
        </div>
      </header>
      <main className="home-content">
        <div className="home-title-container">
          <h2 className="home-title">Seu Portal de Benefícios Estudantis</h2>
          <p className="home-subtitle">Acesse seus benefícios e acompanhe suas solicitações</p>
          <div className="about-section">
            <div className="processos-seletivos-section">
              <div className="processos-seletivos-header">
                <h2 className="processos-title">Processos Seletivos</h2>
              </div>
              <div className="processos-seletivos-lista">
                {loading ? (
                  <div>Carregando editais...</div>
                ) : editais.length === 0 ? (
                  <div>Nenhum edital encontrado.</div>
                ) : (
                  editais.map((edital, idx) => (
                    <ProcessoSeletivo
                      key={edital.id || idx}
                      titulo={edital.titulo_edital}
                      codigo={edital.tipo_edital}
                      status={
                        edital.status_edital?.toLowerCase().includes("aberto")
                          ? "aberto"
                          : edital.status_edital?.toLowerCase().includes("fechado")
                            ? "fechado"
                            : "default"
                      }
                      inscricoesAbertas={edital.status_edital?.toLowerCase().includes("aberto")}
                      tema={idx % 2 === 0 ? "dourado" : "azul"}
                      etapas={
                        Array.isArray(edital.etapas)
                          ? [...edital.etapas]
                              .sort((a: any, b: any) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
                              .map((etapa: any) => ({
                                titulo: etapa.nome,
                                dataInicio: etapa.data_inicio,
                                dataFim: etapa.data_fim,
                              }))
                          : []
                      }
                      documentos={mapEditalUrlParaDocumentos(edital.edital_url)}
                      onInscrever={() => navigate("/login")}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="about-section">
        <h2 className="about-title">Sobre o PROAE</h2>
        <p className="about-text">
          O PROAE - Pró-Reitoria de Ações Afirmativas e Assistência Estudantil - tem como missão garantir a permanência e o sucesso dos estudantes da
          UFBA, por meio de auxílios financeiros, apoio pedagógico, ações afirmativas e acompanhamento individualizado. Acreditamos que todos merecem
          igualdade de oportunidades para alcançar seus sonhos acadêmicos.
        </p>

        <div className="info-cards-grid">
          <InfoCard
            icon={<img src={restauranteIcon} alt="Restaurante Universitário" />}
            title="Restaurantes Universitários"
            description="Receba refeições subsidiadas nos Restaurantes Universitários (RU) dos campi, garantindo sua permanência na UFBA."
            backgroundColor="var(--cor-dourado)"
            color="var(--cor-azul-escuro)"
          />

          <InfoCard
            icon={<img src={bolsaIcon} alt="Bolsa Permanência" />}
            title="Programa de Bolsa Permanência - PBP"
            description="Bolsa mensal do MEC para estudantes indígenas, quilombolas e em vulnerabilidade socioeconômica."
            backgroundColor="var(--cor-azul-medio)"
            color="var(--cor-creme)"
          />

          <InfoCard
            icon={<img src={crecheIcon} alt="Creche" />}
            title="Creche"
            description="Atendimento em Educação Infantil para filhos de estudantes e servidores da UFBA (crianças de 3 anos a 11 meses)."
            backgroundColor="var(--cor-dourado)"
            color="var(--cor-azul-escuro)"
          />

          <InfoCard
            icon={<img src={buzufbaIcon} alt="BUZUFBA" />}
            title="BUZUFBA"
            description="Transporte gratuito em roteiros específicos para estudantes da UFBA em Salvador."
            backgroundColor="var(--cor-azul-medio)"
            color="var(--cor-creme)"
          />

          <InfoCard
            icon={<img src={residenciaIcon} alt="Residência Universitária" />}
            title="Residências Universitárias"
            description="Moradia para estudantes de graduação da UFBA em Salvador, prioritariamente de baixa renda e de fora de Salvador."
            backgroundColor="var(--cor-dourado)"
            color="var(--cor-azul-escuro)"
          />

          <InfoCard
            icon={<img src={renovacaoIcon} alt="Renovação de Benefícios" />}
            title="Renovação de Benefícios"
            description="Processo semestral de renovação de auxílios PROAE."
            backgroundColor="var(--cor-azul-medio)"
            color="var(--cor-creme)"
          />
        </div>
      </div>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>Pró-Reitoria de Ações Afirmativas e Assistência Estudantil | UFBA - Universidade Federal da Bahia</h3>
            <p>Rua Caetano Moura nº 140 - Federação, Salvador - Bahia - Brasil - CEP: 40210-905</p>
            <p>Tel: 3283-5700 - 3283-5704 | E-mail: proae@ufba.br</p>
          </div>
          <div className="footer-links">
            <Button
              radius="full"
              className="footer-button primary-button"
              as="a"
              href="https://proae.ufba.br"
              target="_blank"
              rel="noopener noreferrer"
            >
              Site Oficial
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
