import { Navigate, Outlet } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

const isAuthenticatedAluno = () => {
  const { session } = useClerk();
  return session ? true : false;
};

const isAuthenticatedProae = () => {
  return false;
};

export default function ProtectedRouteAluno() {
  return isAuthenticatedAluno() ? (
    <Outlet />
  ) : (
    <Navigate to="/login-aluno" replace />
  );
}

export function ProtectedRouteProae() {
  return isAuthenticatedProae() ? (
    <Outlet />
  ) : (
    <Navigate to="/login-proae" replace />
  );
}
