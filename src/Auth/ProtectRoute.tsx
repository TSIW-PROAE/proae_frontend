import { Navigate, Outlet, useLocation } from "react-router-dom";
import SideBar from "@/components/SideBar/SideBar.tsx";
import { useClerk } from "@clerk/clerk-react";

export default function ProtectedRouteAluno() {
  const location = useLocation();
  const { session } = useClerk();

  const routesToNotRenderSideBar = ["/portal-aluno/candidatura"];
  const shouldShowSideBar = !routesToNotRenderSideBar.includes(
    location.pathname
  );

  if (!session) {
    return <Navigate to="/login-aluno" replace />;
  }

  return (
    <div className="app-layout">
      {shouldShowSideBar && (
        <SideBar
          homeIconRedirect={"/portal-aluno"}
          processIconRedirect={""}
          configIconRedirect={"/portal-aluno/configuracao"}
          docsIconRedirect={""}
          logoutIconRedirect={"/"}
          logoutOnClick={() => {
            // Limpa localStorage
            localStorage.clear();
            // Limpa todos os cookies
            document.cookie.split(";").forEach(function (c) {
              document.cookie = c
                .replace(/^ +/, "")
                .replace(
                  /=.*/,
                  "=;expires=" + new Date(0).toUTCString() + ";path=/"
                );
            });
            // Recarrega a página
            window.location.reload();
          }}
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

export function ProtectedRouteProae() {
  const location = useLocation();
  // const { session } = useClerk();
  // return session ? true : false;
  const isAuthenticated = true; // dados mockados por enquanto

  const routesToNotRenderSideBar = ["/portal-proae/cadastro-edital"];
  const shouldShowSideBar = !routesToNotRenderSideBar.includes(
    location.pathname
  );

  if (!isAuthenticated) {
    return <Navigate to="/login-proae" replace />;
  }

  return (
    <div className="app-layout">
      {shouldShowSideBar && (
        <SideBar
          homeIconRedirect={"/portal-proae/inscricoes"}
          processIconRedirect={"/portal-proae/processos"}
          docsIconRedirect={""}
          configIconRedirect={"/portal-proae/configuracao"}
          logoutIconRedirect={"/"}
          logoutOnClick={() => {
            console.log("logout logic for proae");
          }}
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
