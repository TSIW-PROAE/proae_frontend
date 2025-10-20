import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedAluno from "@/layouts/ProtectedAluno";

export default function ProtectedAlunoRoute() {
    const { userInfo, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!userInfo?.roles.includes('aluno')) {
        return <Navigate to="/" replace />;
    }

    return <ProtectedAluno />;
}
