import PendenciaItem from "@/components/PendenciaItem/PendenciaItem";
import PageLayout from "@/pages/PageLayout/PageLayout";
import "@/pages/paginaAluno/PendenciasAluno/PendenciasAluno.css";
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import PendenciasAlunoService from "@/services/PendenciasAluno.service/pendenciasAluno.service";
import React, { useEffect, useState } from "react";
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
  const [pendenciasPorEdital, setPendenciasPorEdital] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendencias = async () => {
      try {
        const httpClient = new FetchAdapter();
        const service = new PendenciasAlunoService();
        const data = await service.getPendenciasAluno(httpClient) as Record<string, any>;

        // Se o backend retorna um objeto com a chave "dados", acesse-a:
        const editais = data.dados?.editais || data.editais || data;

        const pendencias = (editais).map((edital: any) => ({
          edital: edital.nome_edital,
          tipo: Array.isArray(edital.tipo_beneficio)
            ? edital.tipo_beneficio.join(", ")
            : edital.tipo_beneficio,
          pendencias: (edital.documentos || []).map((doc: any) => ({
            descricao: doc.tipo_documento,
            status: doc.status_documento,
            // Adicione outros campos se necessário
          })),
        })).filter((edital: any) => edital.pendencias.length > 0);

        setPendenciasPorEdital(pendencias);
      } catch (error) {
        console.error("Erro ao buscar pendências:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendencias();
  }, []);

  return (
    <PageLayout>
      <div className="titulo-pagina">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="flex items-center justify-center p-0 m-0 rounded-full border border-transparent hover:bg-gray-100 transition"
          style={{ height: '100%' }}
        >
          <SetaEsquerda />
        </button>
        <h3 className="text-2xl font-medium mb-1 leading-none">Pendências</h3>
      </div>
      <div className="space-y-6">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          pendenciasPorEdital.map((edital, index) => (
            <PendenciaItem
              key={index}
              edital={edital.edital}
              tipo={edital.tipo}
              pendencias={edital.pendencias}
            />
          ))
        )}
      </div>
    </PageLayout>
  );
};

export default PendenciasAluno;
