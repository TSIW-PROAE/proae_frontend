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
import CadastroProae from "@/pages/paginaProae/CadastroProae/CadastroProae.tsx";
import TelaDeEspera from "@/pages/paginaProae/TelaDeEspera/TelaDeEspera";

// Auth
import CadastroAluno from "@/pages/paginaAluno/CadastroAluno/CadastroAluno";
import PendenciasAluno from "@/pages/paginaAluno/PendenciasAluno/PendenciasAluno";
import ProtectedProaeRoute from "@/Auth/ProtectedProaeRoute";
import ProtectedRouteAluno from "@/Auth/ProtectedAlunoRoute";
import Login from "@/pages/Login/Login";
import ForgotPassword from "@/pages/forgotPassword/ForgotPassword";
import ResetPassword from "@/pages/resetPassword/ResetPassoword";
import Questionario from "@/pages/questionarios/questionario";

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {path: "login", element: <Login />},
      { path: "cadastro-aluno", element: <CadastroAluno /> },
      {path: "forgot-password", element: <ForgotPassword />},
      {path: "reset-password", element: <ResetPassword />},
      {
        element: <ProtectedRouteAluno />,
        children: [
          { path: "portal-aluno", element: <PortalAluno /> },
          { path: "portal-aluno/configuracao", element: <ConfiguracaoAluno /> },
          { path: "portal-aluno/candidatura", element: <Inscricao /> },
          { path: "portal-aluno/pendencias/:inscricaoId", element: <PendenciasAluno /> },
          { path: "questionario/:editalId", element: <Questionario /> },

        ],
      },
      {path: "cadastro-proae", element: <CadastroProae />},
      {path: "tela-de-espera", element: <TelaDeEspera />},
      {
        element: <ProtectedProaeRoute />,
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
