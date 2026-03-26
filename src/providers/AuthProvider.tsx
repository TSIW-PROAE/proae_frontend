import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo, UserLogin, UserSignup } from '@/types/auth'
import AuthService from '@/services/AuthService/auth.service'
import { CadastroFormData } from '@/pages/paginaProae/CadastroProae/CadastroProae';
import { hasAdminRole, normalizeRoles } from '@/utils/authRoles';

function AuthProvider({children}: {children: React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const authService = new AuthService();

  const login = useCallback(async (data: UserLogin) => {
    try {
      const response = await authService.login(data);
      const aprovado = response.user?.aprovado ?? response.user?.adminAprovado ?? response.adminAprovado;
      // API / TypeORM podem mandar roles como string "aluno,admin" — não descartar com Array.isArray
      const roles = normalizeRoles(response.user?.roles);
      const fillUserInfo: UserInfo = {
        email: response.user.email,
        id: String(response.user.usuario_id),
        nome: response.user.nome,
        roles,
        aprovado: hasAdminRole(roles) ? Boolean(aprovado) : undefined
      }
      setUserInfo(fillUserInfo);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
  }, []);

  const registerAdmin = useCallback(async (data: CadastroFormData) => {
    try {
      const {confirmarSenha, ...dataWithoutConfirmPass} = data;
      const response = await authService.signupAdmin(dataWithoutConfirmPass);
      return response;
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  }, [])

  const registerAluno = useCallback(async (data: UserSignup) => {
    try {
      const response = await authService.signupAluno(data);
      return response;
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
            const response: any = await authService.validateToken();
            if (!response.valid) {
              throw new Error("Token inválido");
            }
            const aprovado = response.user?.aprovado ?? response.user?.adminAprovado ?? response.adminAprovado;
            const roles = normalizeRoles(response.user?.roles);
             const fillUserInfo: UserInfo = {
                email: response.user.email,
                id: String(response.user.usuario_id),
                nome: response.user.nome,
                roles,
                aprovado: hasAdminRole(roles) ? Boolean(aprovado) : undefined
              }
            setUserInfo(fillUserInfo);
            setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          setIsAuthenticated(false);
          setUserInfo(null);
          void authService.logout();
        } finally {
          setLoading(false);
        }
        return;
      }
  , [])

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userInfo,
      login,
      logout,
      registerAdmin,
      registerAluno,
      checkAuth,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )

}

export default AuthProvider;
