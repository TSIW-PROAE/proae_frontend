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
      signInUrl="/login-aluno"
      signUpUrl="/cadastro-aluno"
    >
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </ClerkProvider>
);
