import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedProae from "@/layouts/ProtectedProae";

export default function ProtectedProaeRoute() {
    const { userInfo, isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#183b4e]" />
                <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
        );
    }

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
