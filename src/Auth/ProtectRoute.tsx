import { Navigate, Outlet, useLocation } from "react-router-dom";
import SideBar from "@/components/SideBar/SideBar.tsx";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/Context/AuthContext.ts";
import { useNavigate } from "react-router-dom";




export default function ProtectedRouteAluno() {
  const { isAuthenticated, role, loading } = useContext(AuthContext);
  const [showSideBar, setShowSideBar] = useState(true);

  const navigate = useNavigate();

useEffect(() => {
  if(loading){
    return;
  }

  const location = useLocation();

  const routesToNotRenderSideBar = ["/portal-aluno/candidatura"];
  const shouldShowSideBar = !routesToNotRenderSideBar.includes(
    location.pathname
  );
  setShowSideBar(shouldShowSideBar);

  if (!isAuthenticated && role !== "aluno") {
    navigate("/login-aluno", { replace: true });
  }
  }, [])

  if(loading){
    return <div>Loading...</div>;
  }

  return (
    <div className="app-layout">
      {showSideBar && (
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
        className={`main-content ${showSideBar ? "with-sidebar" : "without-sidebar"}`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export function ProtectedRouteProae() {
const { isAuthenticated, role } = useContext(AuthContext);


  const location = useLocation();

  const routesToNotRenderSideBar = ["/portal-proae/cadastro-edital"];
  const shouldShowSideBar = !routesToNotRenderSideBar.includes(
    location.pathname
  );

  if (!isAuthenticated && role !== "proae") {
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
