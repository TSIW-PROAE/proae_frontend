import ReactDOM from "react-dom/client";

import "@/styles/variables.css";
import "@/styles/globals.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import AuthProvider from './providers/AuthProvider';

//TODO: Criar um componente de loading para ser exibido durante o carregamento do keycloak
ReactDOM.createRoot(document.getElementById("root")!).render(

      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
);
