import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedProae from "@/layouts/ProtectedProae";

export default function ProtectedRouteProae() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (false) {
    return <Navigate to="/login-proae" replace />;
  }


  return <ProtectedProae />;
}
