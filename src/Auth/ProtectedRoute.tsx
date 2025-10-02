import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import ProtectedProae from "@/layouts/ProtectedProae";
import ProtectedAluno from "@/layouts/ProtectedAluno";


export default function ProtectedRouteHandler() {
const { loading, isAuthenticated, userInfo, checkAuth } = useContext(AuthContext);


useEffect(() => {
    async function handleCheckAuth(){
        await checkAuth();
    }
    handleCheckAuth();
}, [checkAuth]);

if (loading) {
    return <div>Loading...</div>;
}

if (!isAuthenticated) {
    return <Navigate to="/" replace />;
}

if(userInfo?.roles.includes('admin') && userInfo?.aprovado){
    return <ProtectedProae />;
} else if(userInfo?.aprovado === false){
    return <Navigate to="/tela-de-espera" replace />;
}

return <ProtectedAluno />;

}
