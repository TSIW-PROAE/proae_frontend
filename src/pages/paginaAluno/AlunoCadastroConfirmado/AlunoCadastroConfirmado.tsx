import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

/** Após clicar no link do email (backend redireciona para cá). */
export default function AlunoCadastroConfirmado() {
  const [searchParams] = useSearchParams();
  const sucesso = searchParams.get("sucesso") === "true";
  const erro = searchParams.get("erro");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6 text-center">
        {sucesso ? (
          <>
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Email confirmado</h1>
            <p className="text-gray-600">
              Seu cadastro de estudante está ativo. Você já pode entrar no portal com seu email e senha.
            </p>
            <Link
              to="/login"
              className="inline-block w-full rounded-lg bg-[#183b4e] px-4 py-3 text-base font-semibold text-white hover:bg-[#1a4a61] transition-colors"
            >
              Ir para o login
            </Link>
          </>
        ) : erro ? (
          <>
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Link inválido ou expirado</h1>
            <p className="text-gray-600 text-sm">
              Solicite um novo cadastro ou entre em contato com a PROAE se o problema continuar.
            </p>
            <Link
              to="/cadastro-aluno"
              className="inline-block w-full rounded-lg border-2 border-[#183b4e] px-4 py-3 text-base font-semibold text-[#183b4e] hover:bg-slate-50 transition-colors"
            >
              Voltar ao cadastro
            </Link>
          </>
        ) : (
          <p className="text-gray-600">Redirecionando…</p>
        )}
      </div>
    </div>
  );
}
