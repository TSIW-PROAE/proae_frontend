import SideBar from "@/components/SideBar/SideBar";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { canManageEditais } from "@/utils/authRoles";

export default function ProtectedRouteProae() {
  const location = useLocation();
  const { logout, userInfo } = useContext(AuthContext);

  const routesToNotRenderSideBar = ["/portal-proae/cadastro-edital"];
  const shouldShowSideBar = !routesToNotRenderSideBar.includes(location.pathname);

  // Apenas perfil "gerencial" pode acessar a tela de Processos (criação/gestão de editais)
  // e a configuração dos formulários (que envolve criação/edição). Os demais perfis veem
  // a Sidebar sem esses ícones para evitar telas que dependem dessas permissões.
  const podeGerenciar = canManageEditais(userInfo?.adminPerfil ?? null);

  return (
    <div className="app-layout">
      {shouldShowSideBar && (
        <SideBar
          homeIconRedirect={"/portal-proae/inscricoes"}
          processIconRedirect={podeGerenciar ? "/portal-proae/processos" : ""}
          inscricoesIconRedirect={"/portal-proae/inscricoes-gerenciar"}
          alunosIconRedirect={"/portal-proae/alunos"}
          docsIconRedirect={""}
          configIconRedirect={"/portal-proae/configuracao"}
          pendenciasIconRedirect={""}
          formularioGeralRedirect={"/portal-proae/formulario-geral"}
          formularioRenovacaoRedirect={"/portal-proae/formulario-renovacao"}
          equipeIconRedirect={podeGerenciar ? "/portal-proae/equipe" : ""}
          logoutIconRedirect={"/"}
          logoutOnClick={logout}
        />
      )}

      <main className={`main-content ${shouldShowSideBar ? "with-sidebar" : "without-sidebar"}`}>
        <Outlet />
      </main>
    </div>
  );
}
