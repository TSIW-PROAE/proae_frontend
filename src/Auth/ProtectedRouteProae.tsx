import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedProae from "@/layouts/ProtectedProae";

export default function ProtectedRouteProae() {
  const { isAuthenticated, userInfo, loading } = useContext(AuthContext);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userInfo?.role !== "proae") {
    return <Navigate to="/" replace />;
  }

  return <ProtectedProae />;
}
