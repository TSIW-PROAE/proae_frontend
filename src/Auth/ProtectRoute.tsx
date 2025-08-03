import { AuthContext } from "@/context/AuthContext.ts";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRouteAluno from "@/layouts/ProtectedAluno.tsx";
import ProtectedRouteProae from "@/layouts/ProtectedProae.tsx";

export default function ProtectedRoute(){
  const {isAuthenticated, userInfo}  = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login-aluno" replace />;
  }

  if (userInfo?.role === "aluno") {
    return <ProtectedRouteAluno />;
  }

  if (userInfo?.role === "proae") {
    return <ProtectedRouteProae />;
  }

  return <Navigate to="/login-aluno" replace />;
}


