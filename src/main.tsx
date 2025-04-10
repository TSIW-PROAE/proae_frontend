import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import ProtectedRouteAluno, {ProtectedRouteProae} from "./features/Auth/ProtectRoute.tsx";
import pgcompLogo from "./assets/204805776.png";
import App from "./App.tsx";

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
            {path: "login-aluno", element: <div>Login Aluno</div>},
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
    routes.push({path: "design-system", element: <div>Design System</div>});
}

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={router}/>
  </StrictMode>,
)