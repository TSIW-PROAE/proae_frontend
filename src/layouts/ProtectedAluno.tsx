import SideBar from "@/components/SideBar/SideBar";
import { useLocation, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function ProtectedRouteAluno() {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const routesToNotRenderSideBar = ["/portal-aluno/candidatura"];
  const shouldShowSideBar = !routesToNotRenderSideBar.includes(
    location.pathname
  );

  return (
    <div className="app-layout">
      {shouldShowSideBar && (
        <SideBar
          homeIconRedirect={"/portal-aluno"}
          processIconRedirect={""}
          configIconRedirect={"/portal-aluno/configuracao"}
          pendenciasIconRedirect={"/portal-aluno/pendencias"}
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
