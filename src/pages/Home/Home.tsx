import { Button } from "@heroui/button";
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
                <ProcessoSeletivo
                  titulo="Seleção para benefícios PROAE- Campus Camaçari"
                  codigo="Edital PROAE nº 03/2023"
                  status="aberto"
                  inscricoesAbertas={true}
                  tema="dourado"
                  etapas={[
                    {
                      titulo: "Inscrições",
                      dataInicio: "2025-03-01",
                      dataFim: "2025-03-15",
                    },
                    {
                      titulo: "Análise Documental",
                      dataInicio: "2025-08-16",
                      dataFim: "2025-08-30",
                    },
                    {
                      titulo: "Resultado Preliminar",
                      dataInicio: "2025-09-01",
                      dataFim: "2025-09-05",
                    },
                    {
                      titulo: "Recursos",
                      dataInicio: "2025-09-06",
                      dataFim: "2025-09-10",
                    },
                    {
                      titulo: "Resultado Final",
                      dataInicio: "2025-09-15",
                      dataFim: "2025-09-15",
                    },
                  ]}
                  documentos={[
                    {
                      titulo: "Edital Completo",
                      url: "#",
                    },
                    {
                      titulo: "Manual do Candidato",
                      url: "#",
                    },
                    {
                      titulo: "Formulário de Recurso",
                      url: "#",
                    },
                  ]}
                  onInscrever={() => navigate("/login-aluno")}
                />

                <ProcessoSeletivo
                  titulo="Bolsa Permanência 2023.2"
                  codigo="Edital PROAE nº 04/2023"
                  status="fechado"
                  inscricoesAbertas={false}
                  tema="azul"
                  etapas={[
                    {
                      titulo: "Inscrições",
                      dataInicio: "2023-07-10",
                      dataFim: "2023-07-24",
                    },
                    {
                      titulo: "Análise Documental",
                      dataInicio: "2023-07-25",
                      dataFim: "2023-08-08",
                    },
                    {
                      titulo: "Resultado Preliminar",
                      dataInicio: "2023-08-10",
                      dataFim: "2023-08-10",
                    },
                    {
                      titulo: "Recursos",
                      dataInicio: "2023-08-11",
                      dataFim: "2023-08-15",
                    },
                    {
                      titulo: "Resultado Final",
                      dataInicio: "2023-08-20",
                      dataFim: "2023-08-20",
                    },
                  ]}
                  documentos={[
                    {
                      titulo: "Edital Completo",
                      url: "#",
                    },
                    {
                      titulo: "Relação de Contemplados",
                      url: "#",
                    },
                  ]}
                />

                <ProcessoSeletivo
                  titulo="Auxílio Moradia 2023.1"
                  codigo="Edital PROAE nº 01/2023"
                  status="concluido"
                  inscricoesAbertas={false}
                  tema="dourado"
                  etapas={[
                    {
                      titulo: "Inscrições",
                      dataInicio: "2023-01-15",
                      dataFim: "2023-02-01",
                    },
                    {
                      titulo: "Análise Documental",
                      dataInicio: "2023-02-02",
                      dataFim: "2023-02-20",
                    },
                    {
                      titulo: "Resultado",
                      dataInicio: "2023-02-28",
                      dataFim: "2023-02-28",
                    },
                  ]}
                  documentos={[
                    {
                      titulo: "Edital Completo",
                      url: "#",
                    },
                    {
                      titulo: "Relação Final de Contemplados",
                      url: "#",
                    },
                  ]}
                />

                <ProcessoSeletivo
                  titulo="Renovação de Benefícios 2023.2"
                  codigo="Edital PROAE nº 05/2023"
                  status="default"
                  inscricoesAbertas={false}
                  tema="azul"
                  etapas={[
                    {
                      titulo: "Prazo para renovação",
                      dataInicio: "2023-09-10",
                      dataFim: "2023-09-30",
                    },
                    {
                      titulo: "Análise de renovações",
                      dataInicio: "2023-10-01",
                      dataFim: "2023-10-15",
                    },
                    {
                      titulo: "Resultado",
                      dataInicio: "2023-10-20",
                      dataFim: "2023-10-20",
                    },
                  ]}
                  documentos={[
                    {
                      titulo: "Edital de Renovação",
                      url: "#",
                    },
                    {
                      titulo: "Manual de Renovação",
                      url: "#",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="about-section">
        <h2 className="about-title">Sobre o PROAE</h2>
            <p className="about-text">
              O PROAE - Pró-Reitoria de Ações Afirmativas e Assistência
              Estudantil - tem como missão garantir a permanência e o sucesso
              dos estudantes da UFBA, por meio de auxílios financeiros, apoio
              pedagógico, ações afirmativas e acompanhamento individualizado.
              Acreditamos que todos merecem igualdade de oportunidades para
              alcançar seus sonhos acadêmicos.
            </p>

            <div className="info-cards-grid">
              <InfoCard
                icon={
                  <img src={restauranteIcon} alt="Restaurante Universitário" />
                }
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
                icon={
                  <img src={residenciaIcon} alt="Residência Universitária" />
                }
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
              to="/login-proae"
            >
              Portal do Servidor
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
