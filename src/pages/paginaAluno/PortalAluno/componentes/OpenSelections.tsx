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
  FileText,
} from "lucide-react";
import { resolveTituloCardExibicao } from "@/utils/editalDisplay";
import { resolvePrimeiroLinkDocumentoEdital } from "@/utils/utils";
import { isInscricaoDisponivelEdital } from "@/utils/editalDisponibilidade";
import {
  classificarStatusEdital,
  type EditalStatusCategoria,
} from "@/utils/editalStatus";
import type { DocumentoEdital } from "@/types/edital";

interface Edital {
  id: string;
  tipo_edital?: string;
  is_formulario_renovacao?: boolean;
  inscricoes_abertas?: boolean;
  descricao: string;
  /** API: `{ titulo_documento, url_documento }[]` */
  edital_url?: DocumentoEdital[] | string[];
  titulo_edital: string;
  /** Soma de vagas por benefício (vem do backend a partir das linhas de vaga). */
  quantidade_bolsas?: number;
  /** Quantidade de benefícios/vagas cadastrados no edital. */
  numero_beneficios?: number;
  status_edital: string;
  etapas?: any[];
  etapa_edital?: any[];
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
  beneficiosAtivos?: string[];
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
type Categoria = EditalStatusCategoria;
const classificarStatus = classificarStatusEdital;

const OpenSelectionCard: React.FC<
  Edital & {
    /** Quantas inscrições o aluno já tem neste edital (podem ser benefícios diferentes). */
    inscricoesNesteEdital?: number;
    /** Benefícios homologados/ativos para ajudar no fluxo de renovação. */
    beneficiosAtivos?: string[];
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
  is_formulario_renovacao,
  inscricoes_abertas,
  etapas,
  etapa_edital,
  inscricoesNesteEdital = 0,
  beneficiosAtivos = [],
}) => {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const encontrarBeneficioAtivoCompativel = () => {
    if (!is_formulario_renovacao) return null;
    if (!beneficiosAtivos.length) return null;
    const descricaoFonte = `${titulo_edital} ${descricao ?? ""}`;
    const base = normalize(descricaoFonte);
    const compat = beneficiosAtivos.find((beneficio) => {
      const b = normalize(beneficio);
      return b.length > 0 && (base.includes(b) || b.includes(base));
    });
    return compat ?? beneficiosAtivos[0] ?? null;
  };

  const beneficioPreSelecionado = encontrarBeneficioAtivoCompativel();
  const semElegibilidadeRenovacao =
    Boolean(is_formulario_renovacao) && beneficiosAtivos.length === 0;
  const beneficiosElegiveisPreview = beneficiosAtivos.slice(0, 3);

  const navigate = useNavigate();
  const categoria = classificarStatus(status_edital);
  const isOpen = categoria === "ABERTO";
  const isEmAndamento = categoria === "EM_ANDAMENTO";
  const isEncerrado = categoria === "ENCERRADO";
  const podeInscrever = isInscricaoDisponivelEdital({
    inscricoes_abertas,
    etapa_edital: etapa_edital ?? etapas,
  });

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

  const linkDocumento = resolvePrimeiroLinkDocumentoEdital(edital_url);
  const { titulo: tituloExibicao, descricao: descricaoCard } = resolveTituloCardExibicao(
    titulo_edital,
    descricao,
  );
  const descricaoTexto = (descricaoCard ?? "").trim();
  const exibirDescricao = descricaoTexto.length > 0;
  const totalVagas = quantidade_bolsas ?? 0;
  const semVagasConfiguradas = isOpen && totalVagas === 0 && (numero_beneficios ?? 0) === 0;

  const linkVisualizarEdital = linkDocumento ? (
    <a
      href={linkDocumento}
      target="_blank"
      rel="noopener noreferrer"
      className="selection-action-button secondary"
      title="Abrir documento do edital em nova aba"
    >
      <FileText className="w-3 h-3 shrink-0" aria-hidden />
      <span>Ver edital</span>
    </a>
  ) : null;

  const temDuasAcoes = isOpen && !!linkDocumento;

  return (
    <div
      className={`selection-card${temDuasAcoes ? " selection-card--dual-actions" : ""}`}
    >
      <h3 className="selection-card-name" title={tituloExibicao}>
        {tituloExibicao}
      </h3>
      {is_formulario_renovacao ? (
        <div className="mb-2 space-y-1">
          <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            Renovação de benefícios
          </p>
          {beneficiosAtivos.length > 0 ? (
            <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
              Benefícios elegíveis:{" "}
              <strong>
                {beneficiosElegiveisPreview.join(", ")}
                {beneficiosAtivos.length > beneficiosElegiveisPreview.length
                  ? "..."
                  : ""}
              </strong>
            </p>
          ) : (
            <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded px-2 py-1">
              Você não possui benefício ativo elegível para renovação neste
              momento.
            </p>
          )}
        </div>
      ) : null}

      <div className="selection-card-header">
        <div className="card-status-indicator">
          {getStatusIcon()}
          <span className={`status-badge-small ${getBadgeStyles()}`}>
            {getBadgeLabel()}
          </span>
        </div>
        <div className="selection-card-meta selection-card-meta--inline">
          <div className="meta-item">
            <Users className="w-3 h-3 shrink-0" aria-hidden />
            <span>
              {totalVagas} vaga{totalVagas !== 1 ? "s" : ""}
              {semVagasConfiguradas ? (
                <span className="meta-vagas-note"> (benefícios em configuração)</span>
              ) : null}
              {!semVagasConfiguradas && (numero_beneficios ?? 0) > 1 ? (
                <span className="text-gray-500 font-normal">
                  {" "}
                  · {numero_beneficios} benefícios
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      <div className="selection-card-body">
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
        {exibirDescricao && (
          <p className="selection-card-description">
            {descricaoTexto.length > 120
              ? `${descricaoTexto.substring(0, 120)}…`
              : descricaoTexto}
          </p>
        )}
      </div>

      <div className="selection-card-footer">
        <div
          className={`selection-card-footer-actions${temDuasAcoes ? " selection-card-footer-actions--dual" : ""}`}
        >
          {podeInscrever ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (semElegibilidadeRenovacao) return;
                  const qs = new URLSearchParams();
                  if (is_formulario_renovacao && beneficioPreSelecionado) {
                    qs.set("beneficio", beneficioPreSelecionado);
                  }
                  const suffix = qs.toString();
                  navigate(
                    suffix
                      ? `/questionario/${id}?${suffix}`
                      : `/questionario/${id}`,
                  );
                }}
                className={`selection-action-button primary${
                  semElegibilidadeRenovacao ? " disabled" : ""
                }`}
                disabled={semElegibilidadeRenovacao}
                title={
                  is_formulario_renovacao
                    ? semElegibilidadeRenovacao
                      ? "Sem benefício elegível para renovar"
                      : "Realizar solicitação de renovação"
                    : inscricoesNesteEdital > 0
                    ? "Inscrever em outro benefício deste mesmo processo"
                    : "Realizar inscrição"
                }
              >
                <span>
                  {is_formulario_renovacao
                    ? semElegibilidadeRenovacao
                      ? "Sem elegibilidade para renovar"
                      : beneficioPreSelecionado
                      ? `Renovar ${beneficioPreSelecionado}`
                      : "Solicitar renovação"
                    : inscricoesNesteEdital > 0
                    ? "Inscrever em outro benefício"
                    : "Inscrever-se"}
                </span>
                <ArrowRight className="w-3 h-3 shrink-0" aria-hidden />
              </button>
              {linkVisualizarEdital}
            </>
          ) : linkDocumento ? (
            <a
              href={linkDocumento}
              target="_blank"
              rel="noopener noreferrer"
              className="selection-action-button primary"
              title="Abrir documento do edital em nova aba"
            >
              <FileText className="w-3 h-3 shrink-0" aria-hidden />
              <span>Ver edital</span>
              <ArrowRight className="w-3 h-3 shrink-0" aria-hidden />
            </a>
          ) : (
            <button
              type="button"
              className="selection-action-button disabled"
              disabled
              title={
                isEmAndamento
                  ? "Inscrições encerradas — acompanhe o processo"
                  : isEncerrado
                    ? "Edital encerrado"
                    : "Inscrições fechadas para este edital"
              }
            >
              <span>
                {isEmAndamento
                  ? "Inscrições encerradas"
                  : isEncerrado
                    ? "Encerrado"
                    : "Inscrições fechadas"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const OpenSelections: React.FC<OpenSelectionsProps> = ({
  editais,
  inscricoesAluno = [],
  beneficiosAtivos = [],
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
      <div className="portal-editais-header">
        <div className="portal-editais-header-title">
          <BookOpen className="w-5 h-5 text-blue-600 shrink-0" aria-hidden />
          <h2 className="text-2xl font-semibold text-gray-900 m-0">Editais</h2>
        </div>
        <ul className="portal-editais-stats" aria-label="Resumo por situação do edital">
          <li className="portal-editais-stat portal-editais-stat--open">
            <span className="portal-editais-stat-dot" aria-hidden />
            <span className="portal-editais-stat-count">{openEditais.length}</span>
            <span className="portal-editais-stat-label">Aberto(s)</span>
          </li>
          <li className="portal-editais-stat portal-editais-stat--progress">
            <span className="portal-editais-stat-dot" aria-hidden />
            <span className="portal-editais-stat-count">{emAndamentoEditais.length}</span>
            <span className="portal-editais-stat-label">Em andamento</span>
          </li>
          <li className="portal-editais-stat portal-editais-stat--closed">
            <span className="portal-editais-stat-dot" aria-hidden />
            <span className="portal-editais-stat-count">{closedEditais.length}</span>
            <span className="portal-editais-stat-label">Encerrado(s)</span>
          </li>
        </ul>
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
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
              beneficiosAtivos={beneficiosAtivos}
            />
          ))}

          {emAndamentoEditais.map((edital) => (
            <OpenSelectionCard
              key={`em-andamento-${edital.id}`}
              {...edital}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
              beneficiosAtivos={beneficiosAtivos}
            />
          ))}

          {closedEditais.map((edital) => (
            <OpenSelectionCard
              key={`encerrado-${edital.id}`}
              {...edital}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
              beneficiosAtivos={beneficiosAtivos}
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
