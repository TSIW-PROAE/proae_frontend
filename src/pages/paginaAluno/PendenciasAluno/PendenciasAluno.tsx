import PendenciaItem from "@/components/PendenciaItem/PendenciaItem";
import PageLayout from "@/pages/PageLayout/PageLayout";
import "@/pages/paginaAluno/PendenciasAluno/PendenciasAluno.css";
import { FetchAdapter } from "@/services/BaseRequestService/HttpClient";
import PendenciasAlunoService from "@/services/PendenciasAluno.service/pendenciasAluno.service";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const { inscricaoId } = useParams<{ inscricaoId: string }>();
  const navigate = useNavigate();
  const [pendencias, setPendencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tituloEdital, setTituloEdital] = useState<string>("");

  useEffect(() => {
    const fetchPendencias = async () => {
      setLoading(true);
      try {
        const httpClient = new FetchAdapter();
        const pendenciasService = new PendenciasAlunoService(httpClient);

        // Busca todas as inscrições do aluno
        const inscricoesRaw = await pendenciasService.getInscriptions();
        const inscricoes = Array.isArray(inscricoesRaw) ? inscricoesRaw : [];

        // Encontra a inscrição selecionada
        const inscricaoSelecionada = inscricoes.find(
          (inscricao: any) =>
            inscricao.inscricao_id?.toString() === inscricaoId?.toString() ||
            inscricao.id?.toString() === inscricaoId?.toString()
        );
        setTituloEdital(inscricaoSelecionada?.titulo_edital || "Edital");

        // Busca todos os documentos reprovados
        const reprovadosResp = await pendenciasService.getDocsReprovados();
        const docsReprovados = Array.isArray(reprovadosResp)
          ? reprovadosResp
          : (typeof reprovadosResp === "object" && reprovadosResp !== null && Array.isArray((reprovadosResp as any).documentos)
              ? (reprovadosResp as { documentos: any[] }).documentos
              : []);

        // Cria um Set com os IDs dos documentos reprovados
        const idsDocsReprovados = new Set(docsReprovados.map((doc: any) => doc.documento_id));

        // Busca os documentos da inscrição selecionada
        const resp = await pendenciasService.getInscriptionsDocs(inscricaoId!) as { documentos?: any[] };
        const documentosReprovados = (resp.documentos || []).filter((doc: any) =>
          idsDocsReprovados.has(doc.documento_id)
        );



        setPendencias(documentosReprovados);
      } catch (error) {
        setPendencias([]);
        setTituloEdital("Edital");
      } finally {
        setLoading(false);
      }
    };

    if (inscricaoId) fetchPendencias();
  }, [inscricaoId]);

  //console.log("pendencias:", pendencias);

  return (
    <PageLayout>
      <div className="titulo-pagina">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="flex items-center justify-center p-0 m-0 rounded-full border border-transparent hover:bg-gray-100 transition"
          style={{
            height: '100%',
          }}
        >
          <SetaEsquerda />
        </button>
        <h3 className="text-2xl font-medium mb-1 leading-none">Pendências</h3>
      </div>
      <div className="space-y-6">
        {loading && <div>Carregando pendências...</div>}
        {!loading && pendencias.length === 0 && (
          <div>Nenhuma pendência encontrada para esta inscrição.</div>
        )}
        {!loading && pendencias.length > 0 && (
          <PendenciaItem
            titulo_edital={tituloEdital}
            pendencias={pendencias.map((doc: any) => ({
              descricao: doc.tipo_documento,
              status: doc.status_documento,
            }))}
          />
        )}
      </div>
    </PageLayout>
  );
};



export default PendenciasAluno;
