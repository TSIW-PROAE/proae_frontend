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
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { resolveTituloCardExibicao } from "@/utils/editalDisplay";
import { resolvePrimeiroLinkDocumentoEdital } from "@/utils/utils";
import { isInscricaoDisponivelEdital } from "@/utils/editalDisponibilidade";
import {
  classificarStatusEdital,
  type EditalStatusCategoria,
} from "@/utils/editalStatus";
import type { DocumentoEdital } from "@/types/edital";
import { isCgVigente, formatarSituacaoCadastroGeral } from "@/utils/cgSemestre";

interface Edital {
  id: string;
  tipo_edital?: string;
  is_formulario_renovacao?: boolean;
  is_cadastro_geral?: boolean;
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
  /** CG apto e vigente — requisito para editais de benefícios comuns. */
  cgApto?: boolean;
  /** PCD registrada no CG — até 2 benefícios no mesmo edital. */
  cgPcd?: boolean;
  cgSituacao?: string;
  cgValidoAte?: string | null;
  /** Banner de renovação — só quando elegível e ação/contexto necessário. */
  renovacaoBanner?: { situacao: string; detalhe?: string } | null;
  /** Título do painel (ex.: Editais de benefícios / Renovação). */
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Oculta contadores quando o painel está vazio e sem lista. */
  compactHeader?: boolean;
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
    inscricoesNesteEdital?: number;
    beneficiosAtivos?: string[];
    cgApto?: boolean;
    cgPcd?: boolean;
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
  is_cadastro_geral,
  inscricoes_abertas,
  etapas,
  etapa_edital,
  inscricoesNesteEdital = 0,
  beneficiosAtivos = [],
  cgApto = true,
  cgPcd = false,
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
  const limiteInscricoesEdital = cgPcd ? 2 : 1;
  const jaSolicitouCg = Boolean(is_cadastro_geral) && inscricoesNesteEdital >= 1;
  const atingiuLimiteEdital = is_cadastro_geral
    ? jaSolicitouCg
    : !is_formulario_renovacao && inscricoesNesteEdital >= limiteInscricoesEdital;
  const exigeCg =
    !is_formulario_renovacao && !is_cadastro_geral && !cgApto;
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
      {is_cadastro_geral ? (
        <div className="mb-2">
          <span className="text-xs font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 rounded px-2 py-1">
            Chamada Cadastro Geral
          </span>
        </div>
      ) : null}
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
        {!is_cadastro_geral ? (
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
        ) : null}
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
                  if (semElegibilidadeRenovacao || exigeCg || atingiuLimiteEdital) return;
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
                  semElegibilidadeRenovacao || exigeCg || atingiuLimiteEdital ? " disabled" : ""
                }`}
                disabled={semElegibilidadeRenovacao || exigeCg || atingiuLimiteEdital}
                title={
                  exigeCg
                    ? "Cadastro Geral apto e vigente é requisito"
                    : atingiuLimiteEdital
                    ? cgPcd
                      ? "Limite de 2 modalidades neste edital"
                      : "Limite de 1 modalidade neste edital"
                    : is_formulario_renovacao
                    ? semElegibilidadeRenovacao
                      ? "Sem benefício elegível para renovar"
                      : "Realizar solicitação de renovação"
                    : inscricoesNesteEdital > 0
                    ? "Inscrever em outro benefício deste mesmo processo"
                    : "Realizar inscrição"
                }
              >
                <span>
                  {is_cadastro_geral
                    ? jaSolicitouCg
                      ? "Solicitação enviada"
                      : "Solicitar Cadastro Geral"
                    : exigeCg
                    ? "CG apto necessário"
                    : atingiuLimiteEdital
                    ? "Limite de inscrições atingido"
                    : is_formulario_renovacao
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

const ordenarEditais = (a: Edital, b: Edital) => {
  const peso = (e: Edital) =>
    e.is_cadastro_geral ? 0 : e.is_formulario_renovacao ? 2 : 1;
  return peso(a) - peso(b);
};

const OpenSelections: React.FC<OpenSelectionsProps> = ({
  editais,
  inscricoesAluno = [],
  beneficiosAtivos = [],
  cgApto = true,
  cgPcd = false,
  cgSituacao,
  cgValidoAte,
  renovacaoBanner = null,
  title = "Editais",
  emptyTitle = "Nenhum edital disponível",
  emptyDescription = "Aguarde novas oportunidades",
  compactHeader = false,
}) => {
  const contagemInscricoesPorEdital = (editalId: string | number): number => {
    const alvo = String(editalId);
    return (inscricoesAluno || []).filter(
      (insc) => String(insc.edital_id ?? "") === alvo,
    ).length;
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const situacaoCg = String(cgSituacao ?? "Nao cadastrado");
  const aptoCg = situacaoCg.toLowerCase().includes("apto");
  const cgVigente = isCgVigente({
    cgSituacao,
    cgValidoAteSemestre: cgValidoAte,
  });

  const lista = (editais ?? []).filter((e) => {
    if (e?.is_cadastro_geral !== true) return true;
    if (!cgVigente) return true;
    return inscricoesAluno.some(
      (i) => String(i.edital_id ?? "") === String(e.id),
    );
  });

  const openEditais = lista
    .filter((edital) => {
      if (classificarStatus(edital.status_edital) !== "ABERTO") return false;
      if (edital.data_fim_vigencia) {
        const fim = new Date(edital.data_fim_vigencia + "T23:59:59");
        if (fim < hoje) return false;
      }
      return true;
    })
    .sort(ordenarEditais);

  const emAndamentoEditais = lista
    .filter(
      (edital) => classificarStatus(edital.status_edital) === "EM_ANDAMENTO",
    )
    .sort(ordenarEditais);

  const closedEditais = lista
    .filter(
      (edital) => classificarStatus(edital.status_edital) === "ENCERRADO",
    )
    .sort(ordenarEditais);

  const totalListado =
    openEditais.length + emAndamentoEditais.length + closedEditais.length;

  return (
    <div className="open-selections-panel bg-white border-2 p-[1.25rem] shadow-md border-solid rounded-[1.25rem] flex flex-col h-full min-h-[380px] overflow-hidden">
      <div className="open-selections-fixed flex-shrink-0">
      <div
        className={`rounded-lg border px-3 py-2 mb-3 text-sm ${
          aptoCg && cgVigente
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-indigo-50 border-indigo-200 text-indigo-900"
        }`}
      >
        <p className="m-0 font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden />
          Cadastro Geral (CG)
        </p>
        <p className="m-0 mt-1">
          Situação: <strong>{formatarSituacaoCadastroGeral(situacaoCg)}</strong>
          {aptoCg && cgValidoAte ? (
            <>
              {" "}
              — vigente até o semestre <strong>{cgValidoAte}</strong>
            </>
          ) : null}
        </p>
        {!aptoCg ? (
          <p className="m-0 mt-1 text-xs opacity-90">
            O CG é requisito para editais de benefícios. Solicite na chamada
            abaixo, quando disponível.
          </p>
        ) : cgVigente ? (
          <p className="m-0 mt-1 text-xs opacity-90">
            Não é necessário solicitar novamente enquanto o CG estiver vigente.
          </p>
        ) : null}
      </div>

      {renovacaoBanner ? (
        <div className="rounded-lg border px-3 py-2 mb-3 text-sm bg-amber-50 border-amber-200 text-amber-900">
          <p className="m-0 font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 shrink-0" aria-hidden />
            Renovação de benefícios
          </p>
          <p className="m-0 mt-1">
            Situação: <strong>{renovacaoBanner.situacao}</strong>
          </p>
          {renovacaoBanner.detalhe ? (
            <p className="m-0 mt-1 text-xs opacity-90">{renovacaoBanner.detalhe}</p>
          ) : null}
        </div>
      ) : null}

      <div className="portal-editais-header">
        <div className="portal-editais-header-title">
          <BookOpen className="w-5 h-5 text-blue-600 shrink-0" aria-hidden />
          <h2 className="text-2xl font-semibold text-gray-900 m-0">{title}</h2>
        </div>
        {!compactHeader || totalListado > 0 ? (
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
        ) : null}
      </div>
      </div>

      <div className="open-selections-scroll flex-1 min-h-0 overflow-y-auto">
      {totalListado === 0 ? (
        <div className="empty-selections">
          <div className="empty-icon">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="empty-title">{emptyTitle}</h3>
          <p className="empty-description">{emptyDescription}</p>
        </div>
      ) : (
        <div className="selections-grid">
          {openEditais.map((edital) => (
            <OpenSelectionCard
              key={`open-${edital.id}`}
              {...edital}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
              beneficiosAtivos={beneficiosAtivos}
              cgApto={cgApto}
              cgPcd={cgPcd}
            />
          ))}

          {emAndamentoEditais.map((edital) => (
            <OpenSelectionCard
              key={`em-andamento-${edital.id}`}
              {...edital}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
              beneficiosAtivos={beneficiosAtivos}
              cgApto={cgApto}
              cgPcd={cgPcd}
            />
          ))}

          {closedEditais.map((edital) => (
            <OpenSelectionCard
              key={`encerrado-${edital.id}`}
              {...edital}
              inscricoesNesteEdital={contagemInscricoesPorEdital(edital.id)}
              beneficiosAtivos={beneficiosAtivos}
              cgApto={cgApto}
              cgPcd={cgPcd}
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
    </div>
  );
};

export default OpenSelections;
