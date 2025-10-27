import PendenciaItem from "@/components/PendenciaItem/PendenciaItem";
import PageLayout from "@/pages/PageLayout/PageLayout";
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import PendenciasAlunoService from "@/services/PendenciasAluno.service/pendenciasAluno.service";
import { Pendencia } from "@/types/pendencias";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function SetaEsquerda() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={3}
      stroke="currentColor"
      className="w-6 h-6 text-gray-700"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

const PendenciasAluno: React.FC = () => {
  const navigate = useNavigate();
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        toast.error("Erro ao buscar pendências.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendencias();
  }, []);

  const totalPendencias = pendencias.reduce(
    (acc, pendencia) => acc + pendencia.documentos.length,
    0
  );

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
                {totalPendencias}{" "}
                {totalPendencias === 1
                  ? "documento pendente"
                  : "documentos pendentes"}{" "}
                em {pendencias.length}{" "}
                {pendencias.length === 1 ? "edital" : "editais"}
              </p>
            )}
          </div>
        </div>

        {!loading && pendencias.length > 0 && (
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
              Parabéns! Você não possui documentos pendentes ou reprovados no
              momento.
            </p>
          </div>
        )}

        {!loading && pendencias.length > 0 && (
          <div className="space-y-4">
            {pendencias.map((pendencia) => (
              <PendenciaItem
                key={pendencia.inscricao_id}
                titulo_edital={pendencia.titulo_edital}
                documentos={pendencia.documentos}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PendenciasAluno;
