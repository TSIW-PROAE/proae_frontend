import { Navigate, Outlet } from "react-router-dom";


const isAuthenticatedAluno = () => {
    return true;
};

const isAuthenticatedProae = () => {
    return true;
};


export default function ProtectedRouteAluno() {
    return isAuthenticatedAluno() ? <Outlet /> : <Navigate to="/login-aluno" replace />;
}


export function ProtectedRouteProae() {
    return isAuthenticatedProae() ? <Outlet /> : <Navigate to="/login-proae" replace />;
}