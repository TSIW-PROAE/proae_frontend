import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface Edital {
  id: string;
  tipo_edital?: string;
  descricao: string;
  edital_url: string[];
  titulo_edital: string;
  /** Soma de vagas por benefício (vem do backend a partir das linhas de vaga). */
  quantidade_bolsas?: number;
  /** Quantidade de benefícios/vagas cadastrados no edital. */
  numero_beneficios?: number;
  status_edital: string;
  etapas?: any[];
  /** ISO date (YYYY-MM-DD) — após esta data o vínculo com o edital não está mais ativo */
  data_fim_vigencia?: string | null;
}

interface InscricaoAluno {
  id: string;
  edital_id?: string;
  [key: string]: any;
}

interface OpenSelectionsProps {
  editais: Edital[];
  inscricoesAluno?: InscricaoAluno[];
  /** Se false, desabilita "Inscrever-se" e exibe mensagem sobre Formulário Geral */
  podeSeInscreverEmOutros?: boolean;
}

/**
 * Categoria visual derivada do `status_edital` retornado pela API. O backend
 * envia o código de domínio (`ABERTO` / `EM_ANDAMENTO` / `ENCERRADO`); aqui
 * normalizamos para tolerar também o label completo (`"Edital em aberto"`).
 *
 *  - ABERTO       → inscrições liberadas (botão "Inscrever-se").
 *  - EM_ANDAMENTO → seleção rolando, inscrições já fechadas: visualização.
 *  - ENCERRADO    → resultado/histórico: visualização.
 *  - DESCONHECIDO → fallback (não deveria ocorrer pelo endpoint do aluno).
 */
type Categoria = "ABERTO" | "EM_ANDAMENTO" | "ENCERRADO" | "DESCONHECIDO";

function classificarStatus(status: string | undefined | null): Categoria {
  const s = (status ?? "").toString().trim().toLowerCase();
  if (!s) return "DESCONHECIDO";
  if (s === "aberto" || s.includes("em aberto")) return "ABERTO";
  if (s === "em_andamento" || s.includes("andamento")) return "EM_ANDAMENTO";
  if (s === "encerrado" || s.includes("encerrado")) return "ENCERRADO";
  return "DESCONHECIDO";
}

const OpenSelectionCard: React.FC<
  Edital & {
    podeSeInscreverEmOutros?: boolean;
    /** Quantas inscrições o aluno já tem neste edital (podem ser benefícios diferentes). */
    inscricoesNesteEdital?: number;
  }
> = ({
  id,
  titulo_edital,
  status_edital,
  edital_url,
  descricao,
  quantidade_bolsas,
  numero_beneficios,
  data_fim_vigencia,
  podeSeInscreverEmOutros = true,
  inscricoesNesteEdital = 0,
}) => {
  const navigate = useNavigate();
  const categoria = classificarStatus(status_edital);
  const isOpen = categoria === "ABERTO";
  const isEmAndamento = categoria === "EM_ANDAMENTO";
  const isEncerrado = categoria === "ENCERRADO";

  const getBadgeStyles = () => {
    if (isOpen) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (isEmAndamento) return "bg-amber-100 text-amber-800 border-amber-200";
    if (isEncerrado) return "bg-red-100 text-red-800 border-red-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getStatusIcon = () => {
    if (isOpen) return <Clock className="w-3 h-3 text-emerald-600" />;
    if (isEmAndamento)
      return <AlertCircle className="w-3 h-3 text-amber-600" />;
    if (isEncerrado)
      return <CheckCircle2 className="w-3 h-3 text-red-600" />;
    return <Clock className="w-3 h-3 text-blue-600" />;
  };

  const getBadgeLabel = () => {
    if (isOpen) return "Aberto";
    if (isEmAndamento) return "Em andamento";
    if (isEncerrado) return "Encerrado";
    return "Em Breve";
  };

  // Link "Visualizar edital": pega o primeiro PDF disponível, se houver.
  const primeiroLinkPdf =
    Array.isArray(edital_url) && edital_url.length > 0
      ? edital_url[0]
      : null;

  return (
    <div className="selection-card">
      <div className="selection-card-header">
        <div className="card-status-indicator">
          {getStatusIcon()}
          <span className={`status-badge-small ${getBadgeStyles()}`}>
            {getBadgeLabel()}
          </span>
        </div>
      </div>

      <div className="selection-card-body">
        <div className="selection-card-meta">
          <div className="meta-item">
            <Users className="w-3 h-3" />
            <span>
              {quantidade_bolsas ?? 0} vagas
              {(numero_beneficios ?? 0) > 1 ? (
                <span className="text-gray-500 font-normal">
                  {" "}
                  · {numero_beneficios} benefícios
                </span>
              ) : null}
            </span>
          </div>
        </div>

        <h3 className="selection-card-title">
          {titulo_edital || "Título não informado"}
        </h3>
        {data_fim_vigencia && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
            Vigência até{" "}
            <strong>
              {new Date(data_fim_vigencia + "T12:00:00").toLocaleDateString(
                "pt-BR",
              )}
            </strong>
            . Após essa data você não participa mais deste edital.
          </p>
        )}
        {isEmAndamento && (
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
            As inscrições deste edital já estão encerradas. O processo de
            seleção está em andamento — acompanhe o resultado em "Minhas
            Inscrições".
          </p>
        )}
        {isEncerrado && (
          <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded px-2 py-1 mb-2">
            Este edital já foi encerrado. Você pode consultar o conteúdo
            apenas como histórico.
          </p>
        )}
        <p className="selection-card-description">
          {descricao && descricao.length > 90
            ? `${descricao.substring(0, 90)}...`
            : descricao || "Descrição não disponível"}
        </p>
      </div>

      <div className="selection-card-footer">
        {isOpen ? (
          podeSeInscreverEmOutros ? (
            <button
              onClick={() => navigate(`/questionario/${id}`)}
              className="selection-action-button primary"
              title={
                inscricoesNesteEdital > 0
                  ? "Inscrever em outro benefício deste mesmo processo"
                  : "Realizar inscrição"
              }
            >
              <span>
                {inscricoesNesteEdital > 0
                  ? "Inscrever em outro benefício"
                  : "Inscrever-se"}
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              className="selection-action-button disabled"
              disabled
              title="Para se inscrever neste edital, conclua primeiro o Formulário Geral (cadastro anual na PROAE) e aguarde a análise e aprovação da equipe. A liberação das inscrições nos editais ocorre após essa etapa — não indica falha no cadastro do novo edital."
            >
              <span>Inscrição após cadastro na PROAE</span>
            </button>
          )
        ) : primeiroLinkPdf ? (
          <a
            href={primeiroLinkPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="selection-action-button"
            title="Abrir PDF do edital"
          >
            <span>Visualizar edital</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        ) : (
          <button
            className="selection-action-button disabled"
            disabled
            title={
              isEmAndamento
                ? "Inscrições encerradas — acompanhe o processo"
                : isEncerrado
                  ? "Edital encerrado"
                  : "Inscrições não disponíveis"
            }
          >
            <span>
              {isEmAndamento
                ? "Inscrições encerradas"
                : isEncerrado
                  ? "Encerrado"
                  : "Indisponível"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

const OpenSelections: React.FC<OpenSelectionsProps> = ({
  editais,
  inscricoesAluno = [],
  podeSeInscreverEmOutros = true,
}) => {
  const contagemInscricoesPorEdital = (editalId: string | number): number => {
    const alvo = String(editalId);
    return (inscricoesAluno || []).filter(
      (insc) => String(insc.edital_id ?? "") === alvo,
    ).length;
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const lista = editais ?? [];

  const openEditais = lista.filter((edital) => {
    if (classificarStatus(edital.status_edital) !== "ABERTO") return false;
    if (edital.data_fim_vigencia) {
      const fim = new Date(edital.data_fim_vigencia + "T23:59:59");
      if (fim < hoje) return false;
    }
    return true;
  });

  const emAndamentoEditais = lista.filter(
    (edital) => classificarStatus(edital.status_edital) === "EM_ANDAMENTO",
  );

  const closedEditais = lista.filter(
    (edital) => classificarStatus(edital.status_edital) === "ENCERRADO",
  );

  const totalListado =
    openEditais.length + emAndamentoEditais.length + closedEditais.length;

  return (
    <div className="bg-white border-2 p-[1.25rem] shadow-md border-solid rounded-[1.25rem] flex flex-col h-full overflow-hidden overflow-y-auto">
      {!podeSeInscreverEmOutros && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Os editais podem aparecer no portal, mas a <strong>inscrição</strong>{" "}
          só é liberada depois que você concluir o <strong>Formulário Geral</strong>{" "}
          (cadastro anual na PROAE) e a equipe aprovar sua inscrição nesse
          formulário. Acesse o item <strong>Formulário Geral</strong> no menu.
        </div>
      )}

      <div className="selections-header">
        <div className="flex justify-start items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900 m-0">
            Editais
          </h2>
        </div>
        <div className="selections-stats">
          <div className="stat-item">
            <div className="stat-dot open"></div>
            <span>{openEditais.length} Aberto(s)</span>
          </div>
          <div className="stat-item">
            <div
              className="stat-dot"
              style={{ backgroundColor: "#f59e0b" }}
            ></div>
            <span>{emAndamentoEditais.length} Em andamento</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot closed"></div>
            <span>{closedEditais.length} Encerrado(s)</span>
          </div>
        </div>
      </div>

      {totalListado === 0 ? (
        <div className="empty-selections">
          <div className="empty-icon">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="empty-title">Nenhum edital disponível</h3>
          <p className="empty-description">Aguarde novas oportunidades</p>
        </div>
      ) : (
        <div className="selections-grid">
          {openEditais.map((edital) => (
            <OpenSelectionCard
              key={`open-${edital.id}`}
              {...edital}
              podeSeInscreverEmOutros={podeSeInscreverEmOutros}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
            />
          ))}

          {emAndamentoEditais.map((edital) => (
            <OpenSelectionCard
              key={`em-andamento-${edital.id}`}
              {...edital}
              podeSeInscreverEmOutros={podeSeInscreverEmOutros}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
            />
          ))}

          {closedEditais.map((edital) => (
            <OpenSelectionCard
              key={`encerrado-${edital.id}`}
              {...edital}
              podeSeInscreverEmOutros={podeSeInscreverEmOutros}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
            />
          ))}
        </div>
      )}

      {totalListado > 0 && (
        <div className="selections-footer">
          <div className="footer-info">
            <span className="total-count">
              {totalListado} edital{totalListado !== 1 ? "s" : ""} total
            </span>
            <span className="last-updated">Atualizado agora</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenSelections;
