import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";

import { Provider } from "./provider.tsx";
import "@/styles/variables.css";
import "@/styles/globals.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./keycloak.ts";

//TODO: Criar um componente de loading para ser exibido durante o carregamento do keycloak
ReactDOM.createRoot(document.getElementById("root")!).render(
    <ReactKeycloakProvider
     authClient={keycloak}
      initOptions={{onload: 'check-sso'}}
      LoadingComponent={<div>Loading...</div>}
     >
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </ReactKeycloakProvider>
);
