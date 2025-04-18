import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home/Home";
import LoginAluno from "../pages/paginaAluno/LoginAluno/LoginAluno";
import LoginProae from "../pages/paginaProae/LoginProae/LoginProae";
import NotFound from "../pages/NotFound/NotFound";
import DesignSystem from "../pages/DesignSystem/DesignSystem";

// Aluno
import PortalAluno from "../pages/paginaAluno/PortalAluno/PortalAluno";
import ProcessosAluno from "../pages/paginaAluno/ProcessosAluno/ProcessosAluno";
import DocumentacaoAluno from "../pages/paginaAluno/DocumentacaoAluno/DocumentacaoAluno";
import ConfiguracaoAluno from "../pages/paginaAluno/ConfiguracaoAluno/ConfiguracaoAluno";
import CandidaturaAluno from "../pages/paginaAluno/CandidaturaAluno/CandidaturaAluno";

// PROAE
import ProcessosProae from "../pages/paginaProae/ProcessosProae/ProcessosProae";
import ConfiguracaoProae from "../pages/paginaProae/ConfiguracaoProae/ConfiguracaoProae";
import InscricoesProae from "../pages/paginaProae/InscricoesProae/InscricoesProae";

// Auth
import ProtectedRouteAluno, { ProtectedRouteProae } from "../Auth/ProtectRoute";

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      { path: "login-aluno", element: <LoginAluno /> },
      {
        element: <ProtectedRouteAluno />,
        children: [
          { path: "portal-aluno", element: <PortalAluno /> },
          { path: "portal-aluno/processos", element: <ProcessosAluno /> },
          { path: "portal-aluno/documentacao", element: <DocumentacaoAluno /> },
          { path: "portal-aluno/configuracao", element: <ConfiguracaoAluno /> },
          { path: "portal-aluno/candidatura", element: <CandidaturaAluno /> },
        ],
      },
      { path: "login-proae", element: <LoginProae /> },
      {
        element: <ProtectedRouteProae />,
        children: [
          { path: "portal-proae/inscricoes", element: <InscricoesProae /> },
          { path: "portal-proae/processos", element: <ProcessosProae /> },
          { path: "portal-proae/configuracao", element: <ConfiguracaoProae /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];

// Adiciona a rota de design system apenas em ambiente de desenvolvimento
if (import.meta.env.MODE === "development") {
  console.log("Design system page is available at /design-system");
  routes.push({ path: "design-system", element: <DesignSystem /> });
}

export const router = createBrowserRouter(routes);
