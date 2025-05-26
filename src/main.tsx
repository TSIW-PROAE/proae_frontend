import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";

import { Provider } from "./provider.tsx";
import "@/styles/variables.css";
import "@/styles/globals.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

const PUBLISHABLE_KEY =
  "pk_test_aWRlYWwtbWlkZ2UtNjkuY2xlcmsuYWNjb3VudHMuZGV2JA";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        layout: {
          socialButtonsVariant: "iconButton",
          logoPlacement: "inside",
          showOptionalFields: true,
        },
        variables: {
          colorPrimary: "#0070f3",
          colorText: "#000000",
          colorBackground: "#ffffff",
        },
      }}
      options={{
        allowedRedirectOrigins: [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:3000",
        ],
        signInUrl: "/login-aluno",
        signUpUrl: "/cadastro-aluno",
        afterSignInUrl: "/dashboard-aluno",
        afterSignUpUrl: "/dashboard-aluno",
        redirectUrl: "/dashboard-aluno",
        routing: "path",
        path: "/",
        basePath: "/",
        frontendApi: "https://ideal-midge-69.clerk.accounts.dev",
        apiUrl: "https://api.clerk.dev",
        apiVersion: "v1",
      }}
    >
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </ClerkProvider>
  </React.StrictMode>
);
