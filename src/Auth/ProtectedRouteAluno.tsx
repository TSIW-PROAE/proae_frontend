import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedAluno from "@/layouts/ProtectedAluno";

export default function ProtectedRouteAluno() {
  const { isAuthenticated, userInfo, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userInfo?.role !== "aluno") {
    return <Navigate to="/" replace />;
  }

  return <ProtectedAluno />;
}
