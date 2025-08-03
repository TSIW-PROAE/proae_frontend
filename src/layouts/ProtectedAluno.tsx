import SideBar from "@/components/SideBar/SideBar";
import { useLocation, Outlet } from "react-router-dom";

export default function ProtectedRouteAluno() {
  const location = useLocation();

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
