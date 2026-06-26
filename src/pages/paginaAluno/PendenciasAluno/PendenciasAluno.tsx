import PendenciaItem from "@/components/PendenciaItem/PendenciaItem";
import PageLayout from "@/pages/PageLayout/PageLayout";
import { FetchAdapter } from "@/services/api";
import PendenciasAlunoService from "@/services/PendenciasAluno.service/pendenciasAluno.service";
import { Pendencia } from "@/types/pendencias";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PendenciasAluno: React.FC = () => {
  const navigate = useNavigate();
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendencias = async () => {
    setLoading(true);
    try {
      const httpClient = new FetchAdapter();
      const pendenciasAlunoService = new PendenciasAlunoService(httpClient);
      const response = await pendenciasAlunoService.getPendenciasAluno();
      if (!response?.success) {
        setPendencias([]);
        throw new Error("Erro ao buscar pendências");
      }
      setPendencias(response.pendencias || []);
    } catch (error) {
      setPendencias([]);
      toast.error(
        "Erro ao buscar pendências." +
          (error && (error as Error).message
            ? ` Detalhes: ${(error as Error).message}`
            : "")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPendencias();
  }, []);

  const totalPendencias = pendencias.reduce(
    (acc, pendencia) => acc + pendencia.documentos.length,
    0
  );
  const totalAjustesResposta = pendencias.reduce(
    (acc, pendencia) => acc + (pendencia.ajustes_resposta?.length ?? 0),
    0
  );
  const totalItensPendentes = totalPendencias + totalAjustesResposta;
  const inscricoesComAjuste = pendencias.filter(
    (p) => (p.ajustes_resposta?.length ?? 0) > 0
  );
  const inscricoesComAjusteAbertas = inscricoesComAjuste.filter(
    (p) => p.ajustes_abertos === true
  );

  const buildAjusteUrl = (
    pendencia: Pendencia,
    stepId?: number | null,
    perguntaId?: number | null
  ) => {
    const query = new URLSearchParams();
    query.set("corrigir", "1");
    if (stepId != null) query.set("step_id", String(stepId));
    if (perguntaId != null) query.set("pergunta_id", String(perguntaId));
    if (pendencia.vaga_id != null) query.set("vaga_id", String(pendencia.vaga_id));
    if (pendencia.inscricao_id != null) {
      query.set("inscricao_id", String(pendencia.inscricao_id));
    }
    const suffix = `?${query.toString()}`;

    if (pendencia.edital_id != null) {
      return `/questionario/${pendencia.edital_id}${suffix}`;
    }
    return "/portal-aluno";
  };

  const firstAjustePendencia = inscricoesComAjusteAbertas[0];
  const firstAjusteStepId =
    firstAjustePendencia?.ajustes_resposta?.[0]?.step_id ?? null;
  const firstAjustePerguntaId =
    firstAjustePendencia?.ajustes_resposta?.[0]?.pergunta_id ?? null;

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#183b4e] leading-tight">
              Pendências
            </h1>
            {!loading && pendencias.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {totalItensPendentes}{" "}
                {totalItensPendentes === 1
                  ? "item pendente"
                  : "itens pendentes"}{" "}
                em {pendencias.length}{" "}
                {pendencias.length === 1 ? "edital" : "editais"}
              </p>
            )}
          </div>
        </div>

        {!loading && totalPendencias > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Você possui documentos pendentes ou reprovados
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Revise os pareceres e reenvie os documentos necessários para
                continuar com sua inscrição.
              </p>
            </div>
          </div>
        )}

        {!loading && totalAjustesResposta > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 m-0 mb-1">
              Você possui ajustes pendentes na análise da inscrição
            </p>
            <p className="text-sm text-amber-800 m-0 mb-3">
              A PROAE solicitou revisão em uma ou mais inscrições. Conclua os
              ajustes para que a análise da inscrição continue.
            </p>
            <ul className="mb-3 list-disc pl-5 text-sm text-amber-900">
              {inscricoesComAjuste.map((ins) => (
                <li key={String(ins.inscricao_id)}>
                  {ins.titulo_edital || "Edital"}{ins.vaga_beneficio ? ` (${ins.vaga_beneficio})` : ""} -{" "}
                  {(ins.ajustes_resposta?.length ?? 0)} ajuste(s)
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                firstAjustePendencia &&
                navigate(
                  buildAjusteUrl(
                    firstAjustePendencia,
                    firstAjusteStepId,
                    firstAjustePerguntaId
                  )
                )
              }
              disabled={!firstAjustePendencia}
              title={
                !firstAjustePendencia
                  ? "Ajustes fechados pela PROAE para os editais com pendência."
                  : undefined
              }
              className="px-4 py-2 rounded-lg bg-amber-800 text-white text-sm font-medium hover:bg-amber-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {firstAjustePendencia ? "Corrigir agora" : "Ajustes fechados"}
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-[#183b4e] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">
              Carregando pendências...
            </p>
          </div>
        )}

        {!loading && pendencias.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhuma pendência encontrada
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Você não possui pendências de documentos nem ajustes de resposta
              no momento.
            </p>
          </div>
        )}

        {!loading && pendencias.length > 0 && (
          <div className="space-y-4">
            {pendencias.map((pendencia) => (
              <PendenciaItem
                key={pendencia.inscricao_id}
                titulo_edital={pendencia.titulo_edital}
                vaga_beneficio={pendencia.vaga_beneficio}
                documentos={pendencia.documentos}
                ajustes_resposta={pendencia.ajustes_resposta}
                ajustes_abertos={pendencia.ajustes_abertos}
                onGoToAjuste={(stepId, perguntaId) =>
                  navigate(buildAjusteUrl(pendencia, stepId, perguntaId))
                }
                onUpdated={fetchPendencias}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PendenciasAluno;
