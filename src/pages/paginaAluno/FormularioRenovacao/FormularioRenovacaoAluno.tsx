import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import FormularioDinamico from "@/components/FormularioDinamico/FormularioDinamico";
import {
  formularioRenovacaoService,
  type FormularioRenovacaoResponse,
} from "@/services/FormularioRenovacaoService/formularioRenovacao.service";
import { mapFormularioGeralStepsToPaginas } from "@/utils/formAdapter";

const STATUS_APROVADA = "Inscrição Aprovada";
const STATUS_NEGADA = "Inscrição Negada";
const STATUS_EM_AJUSTE = "Ajuste Necessário";

export default function FormularioRenovacaoAluno() {
  const navigate = useNavigate();
  const [data, setData] = useState<FormularioRenovacaoResponse | null | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [corrigindo, setCorrigindo] = useState(false);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const res = await formularioRenovacaoService.getFormularioRenovacao();
      setData(res);
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.mensagem ||
        (typeof e === "string" ? e : "Erro ao carregar formulário de renovação.");
      setError(msg);
      setData(null);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const paginasFromFR = useMemo(
    () =>
      data && Array.isArray(data.steps)
        ? mapFormularioGeralStepsToPaginas(data.steps)
        : [],
    [data?.steps]
  );

  if (data === undefined && !error) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#183b4e]" />
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  if (error || data === null) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Formulário de renovação não configurado
          </h2>
          <p className="text-gray-600 mb-6">
            O formulário de renovação ainda não está disponível. Entre em contato com a
            equipe PROAE se precisar de ajuda.
          </p>
          <Button
            color="primary"
            variant="flat"
            onPress={() => navigate("/portal-aluno")}
          >
            Voltar ao portal
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { minha_inscricao, elegivel_renovacao, renovacao_aprovada } = data;

  if (elegivel_renovacao === false) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Formulário de renovação não se aplica ao seu caso
          </h2>
          <p className="text-gray-600 text-center mb-6">
            A renovação é para estudantes que já tiveram inscrição <strong>aprovada</strong> em algum edital.
            Se você ainda não foi aprovado ou precisa do cadastro inicial, utilize o <strong>Formulário Geral</strong>
            no menu do portal.
          </p>
          <div className="flex justify-center gap-3">
            <Button color="primary" onPress={() => navigate("/portal-aluno/formulario-geral")}>
              Ir ao Formulário Geral
            </Button>
            <Button variant="flat" onPress={() => navigate("/portal-aluno")}>
              Voltar ao portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusLower = minha_inscricao?.status_inscricao?.toLowerCase() ?? "";
  const aprovada = statusLower === STATUS_APROVADA.toLowerCase();
  const emAjuste = minha_inscricao?.status_inscricao === STATUS_EM_AJUSTE;
  const negada = minha_inscricao?.status_inscricao === STATUS_NEGADA;

  if (renovacao_aprovada) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Renovação concluída
          </h2>
          <p className="text-gray-600 text-center">
            Seu formulário de renovação foi aprovado. Você pode seguir participando dos editais conforme as regras vigentes.
          </p>
          <div className="flex justify-center mt-6">
            <Button
              color="primary"
              onPress={() => navigate("/portal-aluno")}
            >
              Ir para o portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Ajuste Necessário: show form if student clicked "Corrigir" ── */
  if (emAjuste && corrigindo && data.vagas?.length) {
    return (
      <FormularioDinamico
        editalId={String(data.id)}
        titulo={data.titulo_edital || "Renovação — Correção"}
        subtitulo="Preencha novamente as informações solicitadas e reenvie o formulário."
        botaoFinal="Reenviar correção"
        successRedirectUrl="/portal-aluno"
        initialPaginas={paginasFromFR.length > 0 ? paginasFromFR : undefined}
        initialVagas={data.vagas}
        onError={(msg) => {
          console.error(msg);
        }}
      />
    );
  }

  /* ── Ajuste Necessário: feedback screen ── */
  if (emAjuste && minha_inscricao) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Ajustes solicitados na renovação
          </h2>
          <p className="text-gray-600 text-center mb-4">
            A equipe PROAE analisou seu formulário e solicitou correções antes de aprová-lo.
            Leia o feedback abaixo e reenvie o formulário com as correções.
          </p>

          {minha_inscricao.observacao_admin && (
            <div className="bg-white border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Feedback da PROAE:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {minha_inscricao.observacao_admin}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <Button
              color="warning"
              onPress={() => setCorrigindo(true)}
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              Corrigir e reenviar
            </Button>
            <Button
              variant="flat"
              onPress={() => navigate("/portal-aluno")}
            >
              Voltar ao portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Negada ── */
  if (negada && minha_inscricao) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Renovação negada
          </h2>
          <p className="text-gray-600 text-center mb-4">
            Sua inscrição no formulário de renovação foi negada. Entre em contato com a equipe PROAE
            para mais informações.
          </p>

          {minha_inscricao.observacao_admin && (
            <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Motivo:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {minha_inscricao.observacao_admin}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Button
              color="primary"
              variant="flat"
              onPress={() => navigate("/portal-aluno")}
            >
              Voltar ao portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Pendente / Em análise ── */
  if (minha_inscricao && !aprovada) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Renovação em análise
          </h2>
          <p className="text-gray-600 text-center mb-2">
            Sua inscrição no formulário de renovação está em análise pela PROAE.
          </p>
          <div className="flex justify-center mt-6">
            <Button
              color="primary"
              variant="flat"
              onPress={() => navigate("/portal-aluno")}
            >
              Voltar ao portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const editalAberto = data.status_edital?.toLowerCase().includes("aberto");

  if (!editalAberto) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Renovação não disponível para inscrições
          </h2>
          <p className="text-gray-600 mb-6">
            O formulário de renovação está com status <strong>{data.status_edital || "desconhecido"}</strong> e não aceita inscrições no momento.
          </p>
          <Button
            color="primary"
            variant="flat"
            onPress={() => navigate("/portal-aluno")}
          >
            Voltar ao portal
          </Button>
        </div>
      </div>
    );
  }

  if (!data.vagas?.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600">Formulário de renovação sem vagas configuradas.</p>
        <Button
          className="mt-4"
          variant="flat"
          onPress={() => navigate("/portal-aluno")}
        >
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <FormularioDinamico
      editalId={String(data.id)}
      titulo={data.titulo_edital || "Formulário de Renovação"}
      subtitulo={data.descricao}
      botaoFinal="Enviar renovação"
      successRedirectUrl="/portal-aluno"
      initialPaginas={paginasFromFR.length > 0 ? paginasFromFR : undefined}
      initialVagas={data.vagas}
      onError={(msg) => {
        console.error(msg);
      }}
    />
  );
}
