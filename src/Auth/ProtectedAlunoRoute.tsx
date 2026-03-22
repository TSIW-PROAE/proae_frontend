import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedAluno from "@/layouts/ProtectedAluno";
import { FetchAdapter } from "@/services/api";
import EditarPerfilService from "@/services/EditarPerfil.service/editarPerfil.service";
import { API_BASE_URL } from "@/config/api";
import { toast, Toaster } from "react-hot-toast";
import {
  NIVEL_GRADUACAO,
  NIVEL_POS_GRADUACAO,
} from "@/constants/nivelAcademico";

const CAMPUS_OPTIONS = [
  { valor: "Salvador", label: "Salvador" },
  { valor: "Vitória da Conquista", label: "Vitória da Conquista" },
];

/**
 * Formulário inline exibido quando o usuário logado ainda não possui
 * registro de aluno no backend.
 * Chama POST /aluno/complete-cadastro para vincular o perfil.
 */
function CompletarCadastroAluno({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [matricula, setMatricula] = useState("");
  const [curso, setCurso] = useState("");
  const [campus, setCampus] = useState("");
  const [dataIngresso, setDataIngresso] = useState("");
  const [nivelAcademico, setNivelAcademico] = useState<string>(NIVEL_GRADUACAO);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula || !curso || !campus || !dataIngresso || !nivelAcademico) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    try {
      const httpClient = new FetchAdapter();
      const url = `${API_BASE_URL}/aluno/complete-cadastro`;
      const res = await httpClient.post(url, {
        matricula,
        curso,
        campus,
        data_ingresso: dataIngresso,
        nivel_academico: nivelAcademico,
      });
      const data = res.data as {
        aguardando_confirmacao_email?: boolean;
        mensagem?: string;
      };
      if (data.aguardando_confirmacao_email) {
        toast.success(
          data.mensagem ||
            "Enviamos um link de confirmação para seu email. Abra o link para liberar o portal."
        );
      } else {
        toast.success(
          data.mensagem || "Cadastro de aluno vinculado com sucesso!"
        );
      }
      onSuccess();
    } catch (err: any) {
      const msg = err?.message || err?.mensagem || "Erro ao completar cadastro.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 overflow-y-auto">
      <Toaster position="top-right" />
      <div className="max-w-lg w-full rounded-2xl border border-amber-200 bg-white p-8 shadow-sm my-auto">
        <h1 className="text-xl font-semibold text-amber-900 mb-2 text-center">
          Complete seu cadastro de aluno
        </h1>
        <p className="text-amber-800 text-sm mb-6 text-center">
          Sua conta ainda não possui perfil de estudante. Preencha os dados abaixo para vincular seu perfil de aluno e acessar editais.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="cc-matricula" className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
            <input
              id="cc-matricula"
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="Ex: 202301234"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="cc-curso" className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
            <input
              id="cc-curso"
              type="text"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              placeholder="Ex: Ciência da Computação"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="cc-nivel" className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
            <select
              id="cc-nivel"
              value={nivelAcademico}
              onChange={(e) => setNivelAcademico(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              required
            >
              <option value={NIVEL_GRADUACAO}>Graduação</option>
              <option value={NIVEL_POS_GRADUACAO}>Pós-graduação</option>
            </select>
          </div>

          <div>
            <label htmlFor="cc-campus" className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
            <select
              id="cc-campus"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              required
            >
              <option value="">Selecione o campus</option>
              {CAMPUS_OPTIONS.map((c) => (
                <option key={c.valor} value={c.valor}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cc-data-ingresso" className="block text-sm font-medium text-gray-700 mb-1">Data de ingresso</label>
            <input
              id="cc-data-ingresso"
              type="date"
              value={dataIngresso}
              onChange={(e) => setDataIngresso(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-[#183b4e] px-4 py-3 text-base font-semibold text-white hover:bg-[#1a4a61] transition-colors disabled:opacity-50 shadow-md"
          >
            {submitting ? "Salvando..." : "Vincular perfil de aluno"}
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    </div>
  );
}

function AguardandoConfirmacaoEmail() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 overflow-y-auto">
      <Toaster position="top-right" />
      <div className="max-w-lg w-full rounded-2xl border border-blue-200 bg-white p-8 shadow-sm my-auto text-center">
        <h1 className="text-xl font-semibold text-[#183b4e] mb-3">
          Confirme seu email
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Enviamos um link para seu email institucional. Clique no link para
          ativar seu cadastro de estudante e acessar editais e o portal.
          Verifique também a pasta de spam.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Depois de confirmar, atualize esta página ou faça login novamente.
        </p>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  );
}

export default function ProtectedAlunoRoute() {
  const { userInfo, isAuthenticated, loading, checkAuth } = useContext(AuthContext);
  const [loadingAlunoCheck, setLoadingAlunoCheck] = useState(true);
  const [alunoExiste, setAlunoExiste] = useState(false);
  const [aguardandoConfirmacaoEmail, setAguardandoConfirmacaoEmail] =
    useState(false);

  const verificarAluno = () => {
    if (!isAuthenticated) {
      setLoadingAlunoCheck(false);
      return;
    }
    setLoadingAlunoCheck(true);
    const httpClient = new FetchAdapter();
    const service = new EditarPerfilService();
    service
      .getAlunoPerfil(httpClient)
      .then(() => {
        setAlunoExiste(true);
        setAguardandoConfirmacaoEmail(false);
      })
      .catch((err: { statusCode?: number; message?: string }) => {
        if (err?.statusCode === 403) {
          setAguardandoConfirmacaoEmail(true);
          setAlunoExiste(false);
          return;
        }
        setAlunoExiste(false);
        setAguardandoConfirmacaoEmail(false);
      })
      .finally(() => setLoadingAlunoCheck(false));
  };

  useEffect(() => {
    verificarAluno();
  }, [isAuthenticated, userInfo?.roles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#183b4e]" />
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (loadingAlunoCheck) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#183b4e]" />
        <span className="ml-2 text-gray-600">Verificando cadastro...</span>
      </div>
    );
  }

  if (aguardandoConfirmacaoEmail) {
    return <AguardandoConfirmacaoEmail />;
  }

  if (!alunoExiste) {
    return (
      <CompletarCadastroAluno
        onSuccess={() => {
          checkAuth();
          verificarAluno();
        }}
      />
    );
  }

  return <ProtectedAluno />;
}
