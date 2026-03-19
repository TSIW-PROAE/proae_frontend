import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedAluno from "@/layouts/ProtectedAluno";

export default function ProtectedAlunoRoute() {
    const { userInfo, isAuthenticated, loading } = useContext(AuthContext);

    // Wait for auth check to complete before making navigation decisions
    if (loading) {
        return null; // or a loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!userInfo?.roles.includes('aluno')) {
        return <Navigate to="/" replace />;
    }

    return <ProtectedAluno />;
}
