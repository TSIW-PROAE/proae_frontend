import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import {
  canAnalyzeInscricoes,
  canManageEditais,
} from "@/utils/authRoles";

interface Props {
  /** Quais perfis podem acessar. Default: apenas `gerencial`. */
  requires?: "gerencial" | "tecnicoOrGerencial";
  /** Para onde redirecionar quando barrado. */
  redirectTo?: string;
}

/**
 * Guarda interna ao painel PROAE que restringe rotas com base no perfil
 * administrativo. Use após `ProtectedProaeRoute` (que já garante role admin).
 *
 * Exemplo de uso (somente gerencial):
 *   <Route element={<ProtectedAdminPerfilRoute />}>
 *     <Route path="cadastro-edital" element={<CadastroEdital />} />
 *   </Route>
 */
export default function ProtectedAdminPerfilRoute({
  requires = "gerencial",
  redirectTo = "/portal-proae/inscricoes",
}: Props) {
  const { userInfo } = useContext(AuthContext);
  const perfil = userInfo?.adminPerfil ?? null;

  const allowed =
    requires === "gerencial"
      ? canManageEditais(perfil)
      : canAnalyzeInscricoes(perfil);

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
