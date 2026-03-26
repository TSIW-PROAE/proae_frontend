import Inscricao from "@/pages/Enrollment/Inscricao.tsx";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import DesignSystem from "../pages/DesignSystem/DesignSystem";
import Home from "../pages/Home/Home";
import NotFound from "../pages/NotFound/NotFound";

// Aluno
import ConfiguracaoAluno from "../pages/paginaAluno/ConfiguracaoAluno/ConfiguracaoAluno";
import PortalAluno from "../pages/paginaAluno/PortalAluno/PortalAluno";
import FormularioGeralAluno from "@/pages/paginaAluno/FormularioGeral/FormularioGeralAluno";
import FormularioRenovacaoAluno from "@/pages/paginaAluno/FormularioRenovacao/FormularioRenovacaoAluno";

// PROAE
import CadastroEdital from "@/pages/paginaProae/CadastroEdital/CadastroEdital.tsx";
import ConfiguracaoProae from "../pages/paginaProae/ConfiguracaoProae/ConfiguracaoProae";
import InscricoesProae from "../pages/paginaProae/InscricoesProae/InscricoesProae";
import ProcessosProae from "../pages/paginaProae/ProcessosProae/ProcessosProae";
import ParecerQuestionarios from "../pages/paginaProae/ParecerQuestionarios/ParecerQuestionarios";
import CadastroProae from "@/pages/paginaProae/CadastroProae/CadastroProae.tsx";
import TelaDeEspera from "@/pages/paginaProae/TelaDeEspera/TelaDeEspera";
import FormularioGeralAdmin from "@/pages/paginaProae/FormularioGeral/FormularioGeralAdmin";
import FormularioRenovacaoAdmin from "@/pages/paginaProae/FormularioRenovacao/FormularioRenovacaoAdmin";
import ListaAlunos from "@/pages/paginaProae/ListaAlunos/ListaAlunos";
import GerenciarInscricoes from "@/pages/paginaProae/GerenciarInscricoes/GerenciarInscricoes";
import RanqueamentoProae from "@/pages/paginaProae/RanqueamentoProae/RanqueamentoProae";
import AdminAprovado from "@/pages/paginaProae/AdminAprovado/AdminAprovado";

// Auth
import CadastroAluno from "@/pages/paginaAluno/CadastroAluno/CadastroAluno";
import AlunoCadastroConfirmado from "@/pages/paginaAluno/AlunoCadastroConfirmado/AlunoCadastroConfirmado";
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
      { path: "login", element: <Login /> },
      { path: "cadastro-aluno", element: <CadastroAluno /> },
      { path: "aluno/cadastro-confirmado", element: <AlunoCadastroConfirmado /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      {
        element: <ProtectedRouteAluno />,
        children: [
          { path: "portal-aluno", element: <PortalAluno /> },
          { path: "portal-aluno/formulario-geral", element: <FormularioGeralAluno /> },
          { path: "portal-aluno/formulario-renovacao", element: <FormularioRenovacaoAluno /> },
          { path: "portal-aluno/configuracao", element: <ConfiguracaoAluno /> },
          { path: "portal-aluno/candidatura", element: <Inscricao /> },
          { path: "portal-aluno/pendencias/", element: <PendenciasAluno /> },
          { path: "questionario/:editalId", element: <Questionario /> },
        ],
      },
      { path: "cadastro-proae", element: <CadastroProae /> },
      { path: "tela-de-espera", element: <TelaDeEspera /> },
      { path: "admin/aprovado", element: <AdminAprovado /> },
      {
        element: <ProtectedProaeRoute />,
        children: [
          // { path: "portal-proae/inscricoes-gerenciar", element: <GerenciarInscricoes /> },
          { path: "portal-proae/inscricoes", element: <InscricoesProae /> },
          { path: "portal-proae/ranqueamento", element: <RanqueamentoProae /> },
          { path: "portal-proae/processos", element: <ProcessosProae /> },
          { path: "portal-proae/formulario-geral", element: <FormularioGeralAdmin /> },
          { path: "portal-proae/formulario-renovacao", element: <FormularioRenovacaoAdmin /> },
          { path: "portal-proae/pareceres", element: <ParecerQuestionarios /> },
          { path: "portal-proae/alunos", element: <ListaAlunos /> },
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
