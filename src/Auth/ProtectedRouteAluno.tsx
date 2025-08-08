import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedAluno from "@/layouts/ProtectedAluno";
import LoadingScreen from "@/components/Loading/LoadingScreen";

export default function ProtectedRouteAluno() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen/>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login-aluno" replace />;
  }

  return <ProtectedAluno />;
}
