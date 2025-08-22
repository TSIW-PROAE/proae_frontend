import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedProae from "@/layouts/ProtectedProae";

export default function ProtectedRouteProae() {
  const { loading } = useContext(AuthContext);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  // Rotas protegidas da PROAE podem ter lógica de auth aqui quando disponível
  // if (!isAuthenticated) return <Navigate to="/login-proae" replace />
  if (false) {
    return <Navigate to="/login-proae" replace />;
  }


  return <ProtectedProae />;
}
