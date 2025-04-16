import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import ProtectedRouteAluno, {ProtectedRouteProae} from "./features/Auth/ProtectRoute.tsx";
import pgcompLogo from "./assets/204805776.png";
import App from "./App.tsx";
import "./styles/global.css"
import Login from './pages/login/Login.tsx';
import Status from './components/Status/Status.tsx';
import Alert from './components/Alert/Alert.tsx';


const routes = [
    {path: '/', element: <App/>,
        children: [
            { path: "",
                element: (
                    <div>
                        <div>
                            <a href="https://github.com/TSIW-PROAE" target="_blank">
                                <img src={pgcompLogo} className="logo react" alt="Pgcomp logo" />
                            </a>
                        </div>
                        <h1>Bem-vindo ao Sistema PROAE</h1>
                        <div className="card">
                            <p>Estamos em construção...</p>
                        </div>
                    </div>
                )
            },
            {path: "login", element: <Login></Login>},
            {
                element: <ProtectedRouteAluno/>, children: [
                    {path: "portal-aluno", element: <div>Portal do Aluno</div>},
                    {path: "portal-aluno/processos", element: <div>Processos Aluno</div>},
                    {path: "portal-aluno/documentacao", element: <div>Documentações Aluno</div>},
                    {path: "portal-aluno/configuracao", element: <div>Configurações Aluno</div>},
                    {path: "portal-aluno/candidatura", element: <div>Candidatura Aluno</div>}
                ]
            },
            {path: "login-proae", element: <div>Login Proae</div>},
            {
                element: <ProtectedRouteProae/>, children: [
                    {path: "portal-proae/inscricoes", element: <div>Inscrições Proae</div>},
                    {path: "portal-proae/processos", element: <div>Processos Proae</div>},
                    {path: "portal-proae/configuracao", element: <div>Configurações Proae</div>},
                    {path: "portal-proae/inscricoes", element: <div>Inscrições Proae</div>}
                ]
            }
        ]
    },
    {path: '*', element: <div>404 not found</div>}
];

if(import.meta.env.MODE == 'development') {
    console.log("design system page is available go to /design-system");
    routes.push({path: "design-system", element:
        <div>
            Design System
            <Status titulo="APROVADO" />
            <Status titulo="REPROVADO" />
            <Status titulo="PENDENTE" />
            <Status titulo="EM ANÁLISE" />
            <Alert titulo='Inscrição Confirmada' descricao='Inscrição realizada.' data='03/04'/>
            <Alert titulo='Documentação Negada' descricao='Caro aluno, por favor faça o reenvio do documento de matricula devidamente atualizado, conforme o especificado no item 2.3 do edital.' data='04/04'/>
            <Alert titulo='Documentação Pendente' descricao='Caro aluno, por favor faça o envio do CAD Único.' data='04/04'/>
        </div>
    });
}

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={router}/>
  </StrictMode>,
)