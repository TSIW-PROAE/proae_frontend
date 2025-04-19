import { Button } from "@heroui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatCPF } from "../../utils/utils";
import InfoCard from "../../components/InfoCard/InfoCard";
import restauranteIcon from "../../assets/dashboard icons/alimentação.svg";
import bolsaIcon from "../../assets/dashboard icons/bolsa.svg";
import crecheIcon from "../../assets/dashboard icons/creche.svg";
import buzufbaIcon from "../../assets/dashboard icons/bus.svg";
import residenciaIcon from "../../assets/dashboard icons/apartamento.svg";
import renovacaoIcon from "../../assets/dashboard icons/renvação.svg";
import "./Home.css";

export default function Home() {
  const [cpf, setCpf] = useState("");
  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleLogin = () => {
    if (cpf) {
      navigate(`/login-aluno?cpf=${cpf}`);
    }
  };

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

          <div className="cpf-input-container">
            <input
              type="text"
              placeholder="Digite seu CPF"
              value={cpf}
              onChange={handleCpfChange}
              className="cpf-input"
            />
            <button onClick={handleLogin} className="cpf-login-button">
              Fazer Login
            </button>
          </div>

          <div className="home-slogan-container">
            <p className="home-slogan">
              Conecte-se aos seus benefícios e cada etapa da sua jornada.
            </p>
          </div>

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
                secondaryColor="var(--cor-azul-escuro)"
              />

              <InfoCard
                icon={<img src={bolsaIcon} alt="Bolsa Permanência" />}
                title="Programa de Bolsa Permanência - PBP"
                description="Bolsa mensal do MEC para estudantes indígenas, quilombolas e em vulnerabilidade socioeconômica."
                backgroundColor="var(--cor-azul-escuro)"
                secondaryColor="var(--cor-creme)"
              />

              <InfoCard
                icon={<img src={crecheIcon} alt="Creche" />}
                title="Creche"
                description="Atendimento em Educação Infantil para filhos de estudantes e servidores da UFBA (crianças de 3 anos a 11 meses)."
                backgroundColor="var(--cor-dourado)"
                secondaryColor="var(--cor-azul-escuro)"
              />

              <InfoCard
                icon={<img src={buzufbaIcon} alt="BUZUFBA" />}
                title="BUZUFBA"
                description="Transporte gratuito em roteiros específicos para estudantes da UFBA em Salvador."
                backgroundColor="var(--cor-azul-escuro)"
                secondaryColor="var(--cor-azul-claro)"
              />

              <InfoCard
                icon={
                  <img src={residenciaIcon} alt="Residência Universitária" />
                }
                title="Residências Universitárias"
                description="Moradia para estudantes de graduação da UFBA em Salvador, prioritariamente de baixa renda e de fora de Salvador."
                backgroundColor="var(--cor-dourado)"
                secondaryColor="var(--cor-azul-escuro)"
              />

              <InfoCard
                icon={<img src={renovacaoIcon} alt="Renovação de Benefícios" />}
                title="Renovação de Benefícios"
                description="Processo semestral de renovação de auxílios PROAE."
                backgroundColor="var(--cor-azul-escuro)"
                secondaryColor="var(--cor-creme)"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
