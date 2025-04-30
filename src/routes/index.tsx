import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home/Home";
import LoginAluno from "../pages/paginaAluno/LoginAluno/LoginAluno";
import LoginProae from "../pages/paginaProae/LoginProae/LoginProae";
import NotFound from "../pages/NotFound/NotFound";
import DesignSystem from "../pages/DesignSystem/DesignSystem";
import Inscricao from "../pages/Inscricao/Inscricao";

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
import CadastroAluno from "@/pages/paginaAluno/CadastroAluno/CadastroAluno";
import CadastroEdital from "@/pages/paginaProae/CadastroEdital/CadastroEdital.tsx";

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
      { path: "inscricao", element: <Inscricao /> },
      { path: "cadastro-aluno", element: <CadastroAluno /> },
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
          { path: "portal-proae/cadastro-edital", element: <CadastroEdital /> },
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
