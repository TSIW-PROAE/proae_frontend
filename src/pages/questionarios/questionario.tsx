import React, { useEffect, useMemo, useState } from "react";
import { FormularioDinamico } from "../../components/FormularioDinamico/FormularioDinamico";
import { useParams, useSearchParams } from "react-router-dom";
import { EditalService } from "@/services/EditalService/editalService";
import PendenciasAlunoService from "@/services/PendenciasAluno.service/pendenciasAluno.service";
import { FetchAdapter } from "@/services/api";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export const Questionario: React.FC = () => {
  const { editalId } = useParams<{ editalId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [editalData, setEditalData] = useState<any>(null);

  const stepIdParam = searchParams.get("step_id");
  const perguntaIdParam = searchParams.get("pergunta_id");
  const vagaIdParam = searchParams.get("vaga_id");
  const inscricaoIdParam = searchParams.get("inscricao_id");
  const corrigir = searchParams.get("corrigir") === "1";

  const needsCorrectionContext =
    corrigir || !!stepIdParam || !!perguntaIdParam;

  const [resolvedInscricaoId, setResolvedInscricaoId] = useState<string | null>(
    () => inscricaoIdParam,
  );
  const [loadingInscricao, setLoadingInscricao] = useState(
    () => needsCorrectionContext && !inscricaoIdParam,
  );
  const editalService = new EditalService();

  const correcaoFinalId = useMemo(
    () => resolvedInscricaoId ?? inscricaoIdParam ?? undefined,
    [resolvedInscricaoId, inscricaoIdParam],
  );

  useEffect(() => {
    const edital = async () => {
      const response = await editalService.buscarEditalPorId(editalId!);
      setEditalData(response);
    };
    edital();
  }, [editalId]);

  /** Resolve inscrição quando o link veio sem `inscricao_id` (links antigos / bookmarks). */
  useEffect(() => {
    if (!editalId || !needsCorrectionContext) {
      setLoadingInscricao(false);
      return;
    }
    if (inscricaoIdParam) {
      setResolvedInscricaoId(inscricaoIdParam);
      setLoadingInscricao(false);
      return;
    }

    let cancelled = false;
    setLoadingInscricao(true);

    (async () => {
      try {
        const svc = new PendenciasAlunoService(new FetchAdapter());
        const res = await svc.getPendenciasAluno();
        const list = res?.pendencias ?? [];
        const editalNum = Number(editalId);
        const vid = String(vagaIdParam ?? "").trim();

        let candidates = list.filter(
          (p) => p.edital_id != null && Number(p.edital_id) === editalNum,
        );
        if (vid) {
          candidates = candidates.filter(
            (p) => p.vaga_id != null && String(p.vaga_id) === vid,
          );
        }
        const withAjustes = candidates.filter(
          (p) => (p.ajustes_resposta?.length ?? 0) > 0,
        );
        const picked = withAjustes[0] ?? candidates[0];
        if (!cancelled && picked?.inscricao_id != null) {
          setResolvedInscricaoId(String(picked.inscricao_id));
        }
      } catch {
        /* mantém resolvedInscricaoId null → tela de ajuda */
      } finally {
        if (!cancelled) setLoadingInscricao(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    editalId,
    needsCorrectionContext,
    inscricaoIdParam,
    vagaIdParam,
    stepIdParam,
    perguntaIdParam,
    corrigir,
  ]);

  const handleError = (error: string) => {
    console.error("Erro ao enviar formulário:", error);
  };

  if (loadingInscricao) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] flex-col gap-2">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm text-gray-600">Carregando dados da inscrição…</p>
      </div>
    );
  }

  if (needsCorrectionContext && !correcaoFinalId) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <p className="text-gray-800 font-medium mb-2">
          Não foi possível identificar sua inscrição para enviar a correção.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Abra o formulário a partir de <strong>Pendências</strong> ou{" "}
          <strong>Portal do aluno</strong>, ou use um link que inclua{" "}
          <code className="bg-gray-100 px-1 rounded">inscricao_id</code> na URL.
        </p>
        <Button color="primary" onPress={() => navigate("/portal-aluno/pendencias")}>
          Ir para Pendências
        </Button>
      </div>
    );
  }

  return (
    <FormularioDinamico
      editalId={editalId}
      titulo={`Formulário ${editalData ? editalData.titulo_edital : ""}`}
      subtitulo={`${editalData ? editalData.descricao : ""}`}
      botaoFinal="Enviar Formulário"
      successRedirectUrl="/portal-aluno"
      focusStepId={stepIdParam}
      focusQuestionId={perguntaIdParam}
      focusVagaId={vagaIdParam}
      correcaoInscricaoId={correcaoFinalId}
      onError={handleError}
    />
  );
};

export default Questionario;
