import Inscricao from "@/pages/Enrollment/Inscricao.tsx";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import DesignSystem from "../pages/DesignSystem/DesignSystem";
import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";

// Aluno
import ConfiguracaoAluno from "../pages/paginaAluno/ConfiguracaoAluno/ConfiguracaoAluno";
import PortalAluno from "../pages/paginaAluno/PortalAluno/PortalAluno";

// PROAE
import CadastroEdital from "@/pages/paginaProae/CadastroEdital/CadastroEdital.tsx";
import ConfiguracaoProae from "../pages/paginaProae/ConfiguracaoProae/ConfiguracaoProae";
import InscricoesProae from "../pages/paginaProae/InscricoesProae/InscricoesProae";
import ProcessosProae from "../pages/paginaProae/ProcessosProae/ProcessosProae";

// Auth
import CadastroAluno from "@/pages/paginaAluno/CadastroAluno/CadastroAluno";
import PendenciasAluno from "@/pages/paginaAluno/PendenciasAluno/PendenciasAluno";
import ProtectedRouteAluno from "@/Auth/ProtectedRouteAluno";
import ProtectedRouteProae from "@/Auth/ProtectedRouteProae";
import LoginAluno from "@/pages/paginaAluno/LoginAluno/LoginAluno";
import LoginProae from "@/pages/paginaProae/LoginProae/LoginProae";

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      { path: "cadastro-aluno", element: <CadastroAluno /> },
      {path: "login-aluno", element: <LoginAluno />},
      {
        element: <ProtectedRouteAluno />,
        children: [
          {path: "cadastro-aluno", element: <CadastroAluno />},
          { path: "portal-aluno", element: <PortalAluno /> },
          { path: "portal-aluno/configuracao", element: <ConfiguracaoAluno /> },
          { path: "portal-aluno/candidatura", element: <Inscricao /> },
          { path: "portal-aluno/pendencias/:inscricaoId", element: <PendenciasAluno /> },
        ],
      },
      {path: "login-proae", element: <LoginProae />},
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
