import { AuthContext } from "@/context/AuthContext.ts";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedRouteAluno from "@/layouts/ProtectedAluno.tsx";
import ProtectedRouteProae from "@/layouts/ProtectedProae.tsx";

export default function ProtectedRoute() {
  const { isAuthenticated, userInfo, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userInfo?.role === "aluno" || userInfo?.role === undefined) {
    return <ProtectedRouteAluno />;
  }

  if (userInfo?.role === "proae") {
    return <ProtectedRouteProae />;
  }

  return null;
}
