import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo, UserLogin, UserSignup } from '@/types/auth'
import AuthService from '@/services/AuthService/auth.service'
import { CadastroFormData } from '@/pages/paginaProae/CadastroProae/CadastroProae';

function AuthProvider({children}: {children: React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const authService = new AuthService();

  const login = useCallback(async (data: UserLogin) => {
    try {
      const response = await authService.login(data);
      const fillUserInfo: UserInfo = {
        email: response.user.email,
        id: response.user.usuario_id,
        nome: response.user.nome,
        roles: response.user.roles
      }
      setUserInfo(fillUserInfo);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUserInfo(null);
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
             const fillUserInfo: UserInfo = {
                email: response.user.email,
                id: response.user.usuario_id,
                nome: response.user.nome,
                roles: response.user.roles,
                aprovado: response.user.admin.aprovado
              }
            setUserInfo(fillUserInfo);
            setIsAuthenticated(true);

        } catch (error) {
          setIsAuthenticated(false);
          setUserInfo(null);
          authService.logout();
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
