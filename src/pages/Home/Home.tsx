import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import PortalAlunoService from "@/services/PortalAluno/PortalAlunoService";
import { Button } from "@heroui/button";
import { useEffect, useState, useContext } from "react";
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
import { AuthContext } from "@/context/AuthContext";

export default function Home() {
  const {isAuthenticated, userInfo, loading: authLoading } = useContext(AuthContext);
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
      } catch (error) {
        setEditais([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEditais();
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        navigate("/portal-aluno");
      } else {
        navigate("/")
      }
  }, [isAuthenticated, userInfo, authLoading, navigate]);

  const handleAccessPortal = () => {
    if (isAuthenticated) {
        navigate("/portal-aluno");
      } else {
        navigate("/login-aluno") ;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#183b4e] via-[#1e4a5d] to-[#183b4e]">
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#183b4e] tracking-wide">PROAE</h1>
              <span className="ml-2 text-sm text-gray-600 hidden sm:block">Portal de Benefícios</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                radius="lg"
                onPress={handleAccessPortal}
                className="bg-[#183b4e] hover:bg-[#14526d] text-white px-6 py-2 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isAuthenticated ? "Acessar Portal" : "Entrar"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="relative">
        {/* Hero Section */}
        <div className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Seu Portal de Benefícios Estudantis
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Acesse seus benefícios e acompanhe suas solicitações de forma simples e rápida
            </p>
          </div>
        </div>

        {/* Processos Seletivos Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#183b4e] mb-4">Processos Seletivos</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#183b4e] to-blue-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#183b4e]"></div>
                  <span className="ml-3 text-gray-600">Carregando editais...</span>
                </div>
              ) : editais.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">Nenhum edital encontrado no momento.</div>
                  <p className="text-gray-400 mt-2">Verifique novamente em breve.</p>
                </div>
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
      </main>
      {/* About Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#183b4e] mb-6">Sobre o PROAE</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#183b4e] to-blue-500 mx-auto rounded-full mb-8"></div>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              O PROAE - Pró-Reitoria de Ações Afirmativas e Assistência Estudantil -
              tem como missão garantir a permanência e o sucesso dos estudantes da
              UFBA, por meio de auxílios financeiros, apoio pedagógico, ações
              afirmativas e acompanhamento individualizado. Acreditamos que todos
              merecem igualdade de oportunidades para alcançar seus sonhos
              acadêmicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <InfoCard
              icon={<img src={restauranteIcon} alt="Restaurante Universitário" className="w-8 h-8 object-contain" />}
              title="Restaurantes Universitários"
              description="Receba refeições subsidiadas nos Restaurantes Universitários (RU) dos campi, garantindo sua permanência na UFBA."
              variant="dourado"
            />

            <InfoCard
              icon={<img src={bolsaIcon} alt="Bolsa Permanência" className="w-8 h-8 object-contain" />}
              title="Programa de Bolsa Permanência - PBP"
              description="Bolsa mensal do MEC para estudantes indígenas, quilombolas e em vulnerabilidade socioeconômica."
              variant="azul"
            />

            <InfoCard
              icon={<img src={crecheIcon} alt="Creche" className="w-8 h-8 object-contain" />}
              title="Creche"
              description="Atendimento em Educação Infantil para filhos de estudantes e servidores da UFBA (crianças de 3 anos a 11 meses)."
              variant="dourado"
            />

            <InfoCard
              icon={<img src={buzufbaIcon} alt="BUZUFBA" className="w-8 h-8 object-contain" />}
              title="BUZUFBA"
              description="Transporte gratuito em roteiros específicos para estudantes da UFBA em Salvador."
              variant="azul"
            />

            <InfoCard
              icon={<img src={residenciaIcon} alt="Residência Universitária" className="w-8 h-8 object-contain" />}
              title="Residências Universitárias"
              description="Moradia para estudantes de graduação da UFBA em Salvador, prioritariamente de baixa renda e de fora de Salvador."
              variant="dourado"
            />

            <InfoCard
              icon={<img src={renovacaoIcon} alt="Renovação de Benefícios" className="w-8 h-8 object-contain" />}
              title="Renovação de Benefícios"
              description="Processo semestral de renovação de auxílios PROAE."
              variant="azul"
            />
          </div>
        </div>
      </div>

      <footer className="bg-[#183b4e] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">
                Pró-Reitoria de Ações Afirmativas e Assistência Estudantil
              </h3>
              <p className="text-sm text-white/80">
                UFBA - Universidade Federal da Bahia
              </p>
              <div className="space-y-2 text-sm text-white/70">
                <p>Rua Caetano Moura nº 140 - Federação, Salvador - Bahia - Brasil</p>
                <p>CEP: 40210-905</p>
                <p>Tel: 3283-5700 - 3283-5704 | E-mail: proae@ufba.br</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <Button
                radius="lg"
                className="bg-white text-[#183b4e] hover:bg-gray-100 font-medium px-6 py-2 transition-all duration-200"
                as="a"
                href="https://proae.ufba.br"
                target="_blank"
                rel="noopener noreferrer"
              >
                Site Oficial
              </Button>
              <Button
                radius="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-[#183b4e] font-medium px-6 py-2 transition-all duration-200"
                as={Link}
                to="/login-funcionario"
              >
                Portal do Servidor
              </Button>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-sm text-white/60">
              © 2025 PROAE - UFBA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
