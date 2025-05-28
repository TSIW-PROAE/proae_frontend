import {Navigate, Outlet, useLocation} from "react-router-dom";
import SideBar from "@/components/SideBar/SideBar.tsx";
import { useClerk } from "@clerk/clerk-react";

const isAuthenticatedAluno = () => {
  const { session } = useClerk();
  return session ? true : false;
};

const isAuthenticatedProae = () => {
  return false;
};

export default function ProtectedRouteAluno() {
    const location = useLocation();
    const routesToNotRenderSideBar = ["/portal-aluno/candidatura"];
    const shouldShowSideBar = !(routesToNotRenderSideBar.includes(location.pathname));
    return isAuthenticatedAluno() ?
        <div style={shouldShowSideBar ? { display: 'flex', minHeight: '100vh' }: {}}>
            {shouldShowSideBar && (
                <SideBar homeIconRedirect={"/portal-aluno"} processIconRedirect={"/portal-aluno/processos"}
                         configIconRedirect={"/portal-aluno/configuracao"} docsIconRedirect={"/portal-aluno/documentacao"}
                         shouldShowDocsIcon={true} logoutIconRedirect={"/"}
                         logoutOnClick={() => console.log("logout logic for aluno")}/>
            )}
            <main style={shouldShowSideBar ? {flexGrow: 1, marginLeft: '95px', padding: '20px'}: {}}>
                <Outlet/>
            </main>
        </div> : <Navigate to="/login-aluno" replace/>;
}

export function ProtectedRouteProae() {
    const location = useLocation();
    const routesToNotRenderSideBar = ["/portal-proae/cadastro-edital"];
    const shouldShowSideBar = !(routesToNotRenderSideBar.includes(location.pathname));
    return isAuthenticatedProae() ?
        <div style={shouldShowSideBar ? { display: 'flex', minHeight: '100vh' }: {}}>
            {shouldShowSideBar && (
                <SideBar homeIconRedirect={"/portal-proae/inscricoes"} processIconRedirect={"/portal-proae/processos"}
                         configIconRedirect={"/portal-proae/configuracao"} logoutIconRedirect={"/"}
                         logoutOnClick={() => console.log("logout logic for proae")}/>
            )}
            <main style={shouldShowSideBar ? {flexGrow: 1, marginLeft: '95px', padding: '20px'}: {}}>
                <Outlet/>
            </main>
        </div> : <Navigate to="/login-proae" replace/>;
}