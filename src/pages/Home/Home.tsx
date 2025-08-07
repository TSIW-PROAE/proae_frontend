import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import PortalAlunoService from "@/services/PortalAluno/PortalAlunoService";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InfoCard from "../../components/InfoCard/InfoCard";
import ProcessoSeletivo from "../../components/ProcessoSeletivo/ProcessoSeletivo";
import restauranteIcon from "../../assets/dashboard icons/alimentação.svg";
import bolsaIcon from "../../assets/dashboard icons/bolsa.svg";
import crecheIcon from "../../assets/dashboard icons/creche.svg";
import buzufbaIcon from "../../assets/dashboard icons/bus.svg";
import residenciaIcon from "../../assets/dashboard icons/apartamento.svg";
import renovacaoIcon from "../../assets/dashboard icons/renvação.svg";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [editais, setEditais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        const client = new FetchAdapter();
        const portalAlunoService = new PortalAlunoService(client);
        const response = await portalAlunoService.getEditals();
        setEditais(Array.isArray(response) ? response : []);
      } catch {
        setEditais([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEditais();
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
          <h1>PROAE</h1>
        </div>
        <div className="header-actions">
          <Button
            radius="full"
            as={Link}
            to="/login-aluno"
            className="login-button-dash"
          >
            Acesse Portal
          </Button>
        </div>
      </header>
      <main className="home-content">
        <div className="home-title-container">
          <h2 className="home-title">Seu Portal de Benefícios Estudantis</h2>
          <p className="home-subtitle">
            Acesse seus benefícios e acompanhe suas solicitações
          </p>
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
                          : edital.status_edital
                                ?.toLowerCase()
                                .includes("fechado")
                            ? "fechado"
                            : "default"
                      }
                      inscricoesAbertas={edital.status_edital
                        ?.toLowerCase()
                        .includes("aberto")}
                      tema={idx % 2 === 0 ? "dourado" : "azul"}
                      etapas={
                        Array.isArray(edital.etapas)
                          ? edital.etapas.map((etapa: any) => ({
                              titulo: etapa.nome,
                              dataInicio: etapa.data_inicio,
                              dataFim: etapa.data_fim,
                            }))
                          : []
                      }
                      documentos={
                        Array.isArray(edital.edital_url)
                          ? edital.edital_url.map((url: string, i: number) => ({
                              titulo: `Documento ${i + 1}`,
                              url,
                            }))
                          : []
                      }
                      onInscrever={() => navigate("/login-aluno")}
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
          O PROAE - Pró-Reitoria de Ações Afirmativas e Assistência Estudantil -
          tem como missão garantir a permanência e o sucesso dos estudantes da
          UFBA, por meio de auxílios financeiros, apoio pedagógico, ações
          afirmativas e acompanhamento individualizado. Acreditamos que todos
          merecem igualdade de oportunidades para alcançar seus sonhos
          acadêmicos.
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
            <h3>
              Pró-Reitoria de Ações Afirmativas e Assistência Estudantil | UFBA
              - Universidade Federal da Bahia
            </h3>
            <p>
              Rua Caetano Moura nº 140 - Federação, Salvador - Bahia - Brasil -
              CEP: 40210-905
            </p>
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
            <Button
              radius="full"
              className="footer-button secondary-button"
              as={Link}
              to="/login-funcionario"
            >
              Portal do Servidor
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
