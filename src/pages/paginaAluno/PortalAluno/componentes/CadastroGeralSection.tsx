import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldCheck,
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

interface EditalCg {
  id: string;
  descricao?: string;
  edital_url?: DocumentoEdital[] | string[];
  titulo_edital: string;
  status_edital: string;
  inscricoes_abertas?: boolean;
  etapas?: unknown[];
  etapa_edital?: unknown[];
}

interface InscricaoCg {
  edital_id?: string;
  status_inscricao?: string;
}

interface CadastroGeralSectionProps {
  editais: EditalCg[];
  inscricoesAluno?: InscricaoCg[];
  cgSituacao?: string;
  cgValidoAte?: string | null;
}

const classificarStatus = classificarStatusEdital;

const CadastroGeralCard: React.FC<
  EditalCg & { inscricaoExistente?: InscricaoCg | null }
> = ({
  id,
  titulo_edital,
  status_edital,
  edital_url,
  descricao,
  inscricoes_abertas,
  etapa_edital,
  etapas,
  inscricaoExistente,
}) => {
  const navigate = useNavigate();
  const categoria = classificarStatus(status_edital) as EditalStatusCategoria;
  const isOpen = categoria === "ABERTO";
  const podeSolicitar = isInscricaoDisponivelEdital({
    inscricoes_abertas,
    etapa_edital: etapa_edital ?? etapas,
  });
  const jaSolicitou = Boolean(inscricaoExistente);

  const { titulo: tituloExibicao, descricao: descricaoCard } =
    resolveTituloCardExibicao(titulo_edital, descricao);
  const linkDocumento = resolvePrimeiroLinkDocumentoEdital(edital_url);

  return (
    <div className="selection-card">
      <div className="mb-2">
        <span className="text-xs font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 rounded px-2 py-1">
          Chamada Cadastro Geral
        </span>
      </div>
      <h3 className="selection-card-name" title={tituloExibicao}>
        {tituloExibicao}
      </h3>
      {descricaoCard && (
        <p className="selection-card-description text-sm text-gray-600 mt-1">
          {descricaoCard.length > 140
            ? `${descricaoCard.substring(0, 140)}…`
            : descricaoCard}
        </p>
      )}
      <div className="selection-card-footer mt-3">
        <div className="selection-card-footer-actions">
          {podeSolicitar && !jaSolicitou ? (
            <button
              type="button"
              onClick={() => navigate(`/questionario/${id}`)}
              className="selection-action-button primary"
            >
              <span>Solicitar Cadastro Geral</span>
              <ArrowRight className="w-3 h-3 shrink-0" aria-hidden />
            </button>
          ) : jaSolicitou ? (
            <button
              type="button"
              className="selection-action-button disabled"
              disabled
              title="Você já enviou solicitação nesta chamada"
            >
              <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden />
              <span>Solicitação enviada</span>
            </button>
          ) : (
            <button type="button" className="selection-action-button disabled" disabled>
              <Clock className="w-3 h-3 shrink-0" aria-hidden />
              <span>Inscrições fechadas</span>
            </button>
          )}
          {linkDocumento && (
            <a
              href={linkDocumento}
              target="_blank"
              rel="noopener noreferrer"
              className="selection-action-button secondary"
            >
              <FileText className="w-3 h-3 shrink-0" aria-hidden />
              <span>Ver chamada</span>
            </a>
          )}
        </div>
      </div>
      {!isOpen && (
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {categoria === "ENCERRADO" ? "Chamada encerrada" : "Em andamento"}
        </p>
      )}
    </div>
  );
};

export default function CadastroGeralSection({
  editais,
  inscricoesAluno = [],
  cgSituacao,
  cgValidoAte,
}: CadastroGeralSectionProps) {
  const situacao = String(cgSituacao ?? "Nao cadastrado");
  const apto = situacao.toLowerCase().includes("apto");
  const cgVigente = isCgVigente({
    cgSituacao: cgSituacao,
    cgValidoAteSemestre: cgValidoAte,
  });

  const temInscricaoNaChamada = (editalId: string) =>
    inscricoesAluno.some(
      (i) => String(i.edital_id ?? "") === String(editalId),
    );

  const abertos = editais.filter((e) => classificarStatus(e.status_edital) === "ABERTO");
  const abertosVisiveis = cgVigente
    ? abertos.filter((e) => temInscricaoNaChamada(String(e.id)))
    : abertos;
  const outros = editais.filter((e) => classificarStatus(e.status_edital) !== "ABERTO");

  const renderGrupo = (lista: EditalCg[], titulo: string) => {
    if (!lista.length) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {titulo}
        </h4>
        <div className="selections-grid">
          {lista.map((edital) => {
            const insc = inscricoesAluno.find(
              (i) => String(i.edital_id ?? "") === String(edital.id),
            );
            return (
              <CadastroGeralCard
                key={edital.id}
                {...edital}
                inscricaoExistente={insc ?? null}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="cadastro-geral-section">
      <div
        className={`rounded-xl border px-4 py-3 mb-4 ${
          apto
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-indigo-50 border-indigo-200 text-indigo-900"
        }`}
      >
        <p className="m-0 text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Cadastro Geral (CG)
        </p>
        <p className="m-0 mt-1 text-sm">
          Situação: <strong>{formatarSituacaoCadastroGeral(situacao)}</strong>
          {apto && cgValidoAte ? (
            <>
              {" "}
              — vigente até o semestre <strong>{cgValidoAte}</strong>
            </>
          ) : null}
        </p>
        {!apto && (
          <p className="m-0 mt-1 text-xs opacity-90">
            O CG é requisito para participar de editais de benefícios. Solicite
            abaixo quando houver chamada aberta.
          </p>
        )}
        {apto && cgVigente && (
          <p className="m-0 mt-1 text-xs opacity-90">
            Não é necessário solicitar novamente enquanto o CG estiver vigente.
          </p>
        )}
      </div>

      {editais.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma chamada de Cadastro Geral disponível no momento.
        </p>
      ) : abertosVisiveis.length === 0 && outros.length === 0 ? (
        cgVigente ? null : (
          <p className="text-sm text-gray-500">
            Nenhuma chamada de Cadastro Geral disponível no momento.
          </p>
        )
      ) : (
        <>
          {renderGrupo(abertosVisiveis, "Chamadas abertas")}
          {renderGrupo(outros, "Histórico de chamadas")}
        </>
      )}
    </div>
  );
}
