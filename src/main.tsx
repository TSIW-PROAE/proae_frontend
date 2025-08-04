import ReactDOM from "react-dom/client";

import "@/styles/variables.css";
import "@/styles/globals.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./keycloak.ts";
import AuthProvider from './providers/AuthProvider';

//TODO: Criar um componente de loading para ser exibido durante o carregamento do keycloak
ReactDOM.createRoot(document.getElementById("root")!).render(
    <ReactKeycloakProvider
     authClient={keycloak}
      initOptions={{onload: 'check-sso'}}
      LoadingComponent={<div>Loading...</div>}
     >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ReactKeycloakProvider>
);
