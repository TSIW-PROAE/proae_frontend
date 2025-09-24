import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo, UserLogin, UserSignup } from '@/types/auth'
import  {FetchAdapter} from '@/services/BaseRequestService/HttpClient'
import CadastroAlunoService from '@/services/CadastroAluno.service/cadastroAluno.service'

function AuthProvider({children}: {children: React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const client = new FetchAdapter();
  const cadastroAlunoService = new CadastroAlunoService(client);

  const login = useCallback(async (data: UserLogin) => {
    try {
      const response = await cadastroAlunoService.LoginAluno(data);
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
    cadastroAlunoService.LogoutAluno();
    setIsAuthenticated(false);
    setUserInfo(null);
  }, []);

  const register = useCallback(async (data: UserSignup) => {
    try {
      const response = await cadastroAlunoService.createAlunoUser(data);
      return response;
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  }, [])

  useEffect(() => {

      const checkAuth = async () => {

        try {
            const response: any = await cadastroAlunoService.validateToken();
            if (!response.valid) {
              throw new Error("Token inválido");
            }
             const fillUserInfo: UserInfo = {
                email: response.user.email,
                id: response.user.usuario_id,
                nome: response.user.nome,
                roles: response.user.roles
              }
            setUserInfo(fillUserInfo);
            setIsAuthenticated(true);

        } catch (error) {
          setIsAuthenticated(false);
          setUserInfo(null);
          cadastroAlunoService.LogoutAluno();
        } finally {
          setLoading(false);
        }
        return;
      }
      checkAuth();
  }, []);





  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userInfo,
      login,
      logout,
      register,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )

}

export default AuthProvider;
