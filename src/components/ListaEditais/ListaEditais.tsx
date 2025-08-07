import { Edital } from "../../types/edital";
import "./ListaEditais.css";

interface ListaEditaisProps {
  editais: Edital[];
  onEdit: (edital: Edital) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function ListaEditais({
  editais,
  onEdit,
  onDelete,
  isLoading = false,
}: ListaEditaisProps) {
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Edital em aberto":
        return "status-aberto";
      case "Edital em andamento":
        return "status-andamento";
      case "Edital encerrado":
        return "status-encerrado";
      default:
        return "status-default";
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "Auxilio Transporte":
        return "🚌";
      case "Auxilio Alimentação":
        return "🍽️";
      case "Auxilio Moradia":
        return "🏠";
      case "Apoio à Inclusão Digital":
        return "💻";
      default:
        return "📄";
    }
  };

  if (isLoading) {
    return (
      <div className="lista-editais-loading">
        <div className="loading-spinner"></div>
        <p>Carregando editais...</p>
      </div>
    );
  }

  if (editais.length === 0) {
    return (
      <div className="lista-editais-empty">
        <div className="empty-icon">📄</div>
        <h3>Nenhum edital encontrado</h3>
        <p>Clique em &quot;Novo Edital&quot; para criar o primeiro edital.</p>
      </div>
    );
  }

  return (
    <div className="lista-editais">
      <div className="editais-grid">
        {editais.map((edital) => (
          <div key={edital.id} className="edital-card">
            <div className="edital-header">
              <div className="edital-tipo">
                <span className="tipo-icon">
                  {getTipoIcon(edital.tipo_edital)}
                </span>
                <span className="tipo-texto">{edital.tipo_edital}</span>
              </div>
              <div
                className={`edital-status ${getStatusColor(edital.status_edital)}`}
              >
                {edital.status_edital}
              </div>
            </div>

            <div className="edital-content">
              <h3 className="edital-titulo">{edital.titulo_edital}</h3>
              <p className="edital-descricao">{edital.descricao}</p>

              <div className="edital-info">
                <div className="info-item">
                  <span className="info-label">Bolsas:</span>
                  <span className="info-value">{edital.quantidade_bolsas}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Etapas:</span>
                  <span className="info-value">
                    {Array.isArray(edital.etapas) ? edital.etapas.length : 0}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Criado:</span>
                  <span className="info-value">
                    {edital.created_at
                      ? formatarData(edital.created_at)
                      : "N/A"}
                  </span>
                </div>
              </div>

              {edital.etapas && Array.isArray(edital.etapas) && edital.etapas.length > 0 && (
                <div className="edital-etapas">
                  <h4>Etapas do Processo:</h4>
                  <div className="etapas-list">
                    {edital.etapas
                      .sort((a, b) => a.ordem - b.ordem)
                      .map((etapa, index) => (
                        <div key={index} className="etapa-item">
                          <span className="etapa-ordem">{etapa.ordem}.</span>
                          <span className="etapa-nome">{etapa.nome}</span>
                          <span className="etapa-datas">
                            {formatarData(etapa.data_inicio)} -{" "}
                            {formatarData(etapa.data_fim)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {edital.edital_url &&
                Array.isArray(edital.edital_url) &&
                edital.edital_url.length > 0 && (
                  <div className="edital-urls">
                    <h4>Documentos:</h4>
                    <div className="urls-list">
                      {edital.edital_url.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="url-link"
                        >
                          📄 Documento {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="edital-actions">
              <button
                onClick={() => onEdit(edital)}
                className="btn-edit"
                title="Editar edital"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => edital.id && onDelete(edital.id)}
                className="btn-delete"
                title="Deletar edital"
              >
                🗑️ Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
