import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// Tipos baseados no formato da API
interface Etapa {
  id: number;
  nome: string;
  ordem: number;
  data_inicio: string;
  data_fim: string;
}

interface EditalAPI {
  inscricao_id: number;
  edital_id: number;
  titulo_edital: string;
  status_edital: string;
  status_inscricao: string;
  possui_pendencias: boolean;
  etapas_edital: Etapa[];
}

interface CandidateStatusProps {
  edital: EditalAPI | null;
}

const CandidateStatus: React.FC<CandidateStatusProps> = ({ edital }) => {
  const navigate = useNavigate();

  if (!edital) return null;

  const {
    titulo_edital,
    status_inscricao,
    possui_pendencias,
    etapas_edital,
    inscricao_id,
  } = edital;

  const etapasOrdenadas = etapas_edital.sort((a, b) => a.ordem - b.ordem);
  const nomesEtapas = etapasOrdenadas.map((etapa) => etapa.nome);

  const hoje = new Date();
  const indiceEtapaAtual =
    etapasOrdenadas.findIndex((etapa) => new Date(etapa.data_fim) >= hoje) !==
    -1
      ? etapasOrdenadas.findIndex((etapa) => new Date(etapa.data_fim) >= hoje)
      : etapasOrdenadas.length - 1;

  const etapaAtualNome = nomesEtapas[indiceEtapaAtual];
  const progresso = ((indiceEtapaAtual + 1) / nomesEtapas.length) * 100;

  const getStatusInfo = () => {
    const statusLower = status_inscricao.toLowerCase();

    if (statusLower.includes("aprovada")) {
      return {
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        label: "Aprovada",
      };
    } else if (statusLower.includes("reprovada")) {
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        label: "Reprovada",
      };
    } else if (statusLower.includes("pendente")) {
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        label: "Em Análise",
      };
    } else {
      return {
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: status_inscricao,
      };
    }
  };

  const statusInfo = getStatusInfo();

  const handleViewForm = () => {
    alert("Abrir ficha de inscrição");
  };

  const handleCheckPendingItems = () => {
    navigate(`/portal-aluno/pendencias/${inscricao_id}`);
  };

  return (
    <div className="candidate-status-card">
      <div className="status-header">
        <div className="status-title-section">
          <h3 className="status-title">{titulo_edital}</h3>
          <div className="status-subtitle">
            <Calendar className="w-4 h-4" />
            <span>Inscrição #{inscricao_id}</span>
          </div>
        </div>

        <div
          className={`status-badge ${statusInfo.bgColor} ${statusInfo.borderColor}`}
        >
          <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
          <span className={statusInfo.color}>{statusInfo.label}</span>
        </div>
      </div>

      <div className="status-content">
        {/* Informações de Pendências */}
        {possui_pendencias ? (
          <div className="alert alert-warning">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="alert-content">
              <h4 className="alert-title">Pendências de Documentação</h4>
              <p className="alert-description">
                Você possui documentos pendentes que precisam ser enviados ou
                corrigidos.
              </p>
            </div>
          </div>
        ) : (
          <div className="alert alert-success">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div className="alert-content">
              <h4 className="alert-title">Documentação Completa</h4>
              <p className="alert-description">
                Todos os documentos foram enviados com sucesso.
              </p>
            </div>
          </div>
        )}

        {/* Progresso das Etapas */}
        <div className="progress-section">
          <div className="progress-header">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div className="progress-info">
              <h4 className="progress-title">Progresso do Processo</h4>
              <p className="progress-description">
                Etapa atual: <strong>{etapaAtualNome}</strong>
              </p>
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <div className="progress-text">
              {indiceEtapaAtual + 1} de {nomesEtapas.length} etapas concluídas
            </div>
          </div>
        </div>

        {/* Etapas Detalhadas */}
        <div className="stages-section">
          <h4 className="stages-title">Etapas do Processo</h4>
          <div className="stages-list">
            {etapasOrdenadas.map((etapa, index) => {
              const isCompleted = index < indiceEtapaAtual;
              const isCurrent = index === indiceEtapaAtual;

              return (
                <div
                  key={etapa.id}
                  className={`stage-item ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                >
                  <div className="stage-indicator">
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : (
                      <div className="stage-dot" />
                    )}
                  </div>
                  <div className="stage-content">
                    <div className="stage-name">{etapa.nome}</div>
                    <div className="stage-date">
                      {new Date(etapa.data_inicio).toLocaleDateString()} -{" "}
                      {new Date(etapa.data_fim).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="status-actions">
        <button onClick={handleViewForm} className="action-button secondary">
          <FileText className="w-4 h-4" />
          <span>Ver Ficha de Inscrição</span>
        </button>

        {possui_pendencias && (
          <button
            onClick={handleCheckPendingItems}
            className="action-button primary"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Resolver Pendências</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CandidateStatus;
