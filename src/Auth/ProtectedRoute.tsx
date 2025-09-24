import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedProae from "@/layouts/ProtectedProae";
import ProtectedAluno from "@/layouts/ProtectedAluno";


export default function ProtectedRouteHandler() {
const { loading, isAuthenticated, userInfo } = useContext(AuthContext);

if (loading) {
    return <div>Loading...</div>;
}

if (!isAuthenticated) {
    return <Navigate to="/" replace />;
}

console.log(userInfo);
return userInfo?.roles.includes('admin') ? <ProtectedProae /> : <ProtectedAluno />;

}
