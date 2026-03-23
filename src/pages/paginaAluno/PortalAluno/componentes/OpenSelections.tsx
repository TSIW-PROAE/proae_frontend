import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  ArrowRight,
  AlertCircle,
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
  edital_url: _edital_url,
  descricao,
  quantidade_bolsas,
  numero_beneficios,
  data_fim_vigencia,
  podeSeInscreverEmOutros = true,
  inscricoesNesteEdital = 0,
}) => {
  const navigate = useNavigate();
  const statusLower = status_edital ? status_edital.toLowerCase() : "";
  const isOpen = statusLower.includes("aberto");
  const isClosed = statusLower.includes("fechado");

  const getBadgeStyles = () => {
    if (isOpen) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (isClosed) return "bg-red-100 text-red-800 border-red-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getStatusIcon = () => {
    if (isOpen) return <Clock className="w-3 h-3 text-emerald-600" />;
    if (isClosed) return <AlertCircle className="w-3 h-3 text-red-600" />;
    return <Clock className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className="selection-card">
      <div className="selection-card-header">
        <div className="card-status-indicator">
          {getStatusIcon()}
          <span className={`status-badge-small ${getBadgeStyles()}`}>
            {isOpen ? "Aberto" : isClosed ? "Fechado" : "Em Breve"}
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
              {new Date(data_fim_vigencia + "T12:00:00").toLocaleDateString("pt-BR")}
            </strong>
            . Após essa data você não participa mais deste edital.
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
              title="É necessário ter o Formulário Geral aprovado"
            >
              <span>Inscrever-se (bloqueado)</span>
            </button>
          )
        ) : (
          <button
            className="selection-action-button disabled"
            disabled
            title="Inscrições não disponíveis"
          >
            <span>Indisponível</span>
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

  const openEditais =
    editais?.filter((edital) => {
      if (!edital.status_edital?.toLowerCase().includes("aberto")) return false;
      if (edital.data_fim_vigencia) {
        const fim = new Date(edital.data_fim_vigencia + "T23:59:59");
        if (fim < hoje) return false;
      }
      return true;
    }) || [];

  const closedEditais =
    editais?.filter((edital) =>
      edital.status_edital?.toLowerCase().includes("fechado"),
    ) || [];

  return (
    <div className="bg-white border-2 p-[1.25rem] shadow-md border-solid rounded-[1.25rem] flex flex-col h-full overflow-hidden overflow-y-auto">
      {!podeSeInscreverEmOutros && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          É necessário preencher e ter o Formulário Geral aprovado para se
          inscrever em outros editais e benefícios. Acesse a aba &quot;Formulário
          Geral&quot; no menu.
        </div>
      )}

      <div className="selections-header">
        <div className="flex justify-start items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900 m-0">
            Seleções Abertas
          </h2>
        </div>
        <div className="selections-stats">
          <div className="stat-item">
            <div className="stat-dot open"></div>
            <span>{openEditais.length} Abertos</span>
          </div>
          <div className="stat-item">
            <div className="stat-dot closed"></div>
            <span>{closedEditais.length} Fechados</span>
          </div>
        </div>
      </div>

      {(editais && editais.length === 0) || !editais ? (
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

          {closedEditais.map((edital) => (
            <OpenSelectionCard
              key={`closed-${edital.id}`}
              {...edital}
              podeSeInscreverEmOutros={podeSeInscreverEmOutros}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
            />
          ))}
        </div>
      )}

      {editais && editais.length > 0 && (
        <div className="selections-footer">
          <div className="footer-info">
            <span className="total-count">
              {editais?.length || 0} edital{(editais?.length || 0) !== 1 ? "s" : ""}{" "}
              total
            </span>
            <span className="last-updated">Atualizado agora</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenSelections;

