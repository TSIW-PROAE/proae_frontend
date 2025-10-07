import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedProae from "@/layouts/ProtectedProae";

export default function ProtectedProaeRoute() {
    const { userInfo, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!userInfo?.roles.includes('admin')) {
        return <Navigate to="/" replace />;
    }

    if (!userInfo?.aprovado && userInfo?.roles.includes('admin')) {
        return <Navigate to="/tela-de-espera" replace />;
    }

    return <ProtectedProae />;
}
