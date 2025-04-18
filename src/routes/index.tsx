import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import LoginAluno from "../pages/LoginAluno";
import LoginProae from "../pages/LoginProae";
import NotFound from "../pages/NotFound";
import DesignSystem from "../pages/DesignSystem";

// Aluno
import PortalAluno from "../pages/aluno/PortalAluno";
import ProcessosAluno from "../pages/aluno/ProcessosAluno";
import DocumentacaoAluno from "../pages/aluno/DocumentacaoAluno";
import ConfiguracaoAluno from "../pages/aluno/ConfiguracaoAluno";
import CandidaturaAluno from "../pages/aluno/CandidaturaAluno";

// PROAE
import ProcessosProae from "../pages/proae/ProcessosProae";
import ConfiguracaoProae from "../pages/proae/ConfiguracaoProae";
import InscricoesProae from "../pages/proae/InscricoesProae";

// Auth
import ProtectedRouteAluno, {
  ProtectedRouteProae,
} from "../features/Auth/ProtectRoute";

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
