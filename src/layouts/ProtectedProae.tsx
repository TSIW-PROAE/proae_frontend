import SideBar from "@/components/SideBar/SideBar";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function ProtectedRouteProae() {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const routesToNotRenderSideBar = ["/portal-proae/cadastro-edital"];
  const shouldShowSideBar = !routesToNotRenderSideBar.includes(
    location.pathname
  );

  return (
    <div className="app-layout">
      {shouldShowSideBar && (
        <SideBar
          homeIconRedirect={"/portal-proae/inscricoes"}
          processIconRedirect={"/portal-proae/processos"}
          docsIconRedirect={""}
          studentsIconRedirect={"/portal-proae/gerenciamento-alunos"}
          studentsIconLabel="Alunos"
          configIconRedirect={"/portal-proae/configuracao"}
          logoutIconRedirect={"/"}
          logoutOnClick={logout}
        />
      )}

      <main
        className={`main-content ${shouldShowSideBar ? "with-sidebar" : "without-sidebar"}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
