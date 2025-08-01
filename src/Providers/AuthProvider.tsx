import { AuthContext } from "@/Context/AuthContext";
import { useEffect, useState } from "react";

function AuthProvider({children}: {children: React.ReactNode}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<object | null>(null);
  const [role, setRole] = useState<"aluno" | "proae">("aluno");
  const [loading, setLoading] = useState(true);


    useEffect(() => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      if (token) {
        setIsAuthenticated(true);
        setRole(userRole as "aluno" | "proae");
      }
      setLoading(false);
    }, [])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
       user,
      role,
      loading
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
