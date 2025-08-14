import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo, UserLogin, UserSignup } from '@/types/auth'
import  {FetchAdapter} from '@/services/BaseRequestService/HttpClient'
import CadastroAlunoService from '@/services/CadastroAluno.service/cadastroAluno.service'
import { useLocation } from 'react-router-dom'


function AuthProvider({children}: {children: React.ReactNode}){
  const location = useLocation();
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
        id: response.user.aluno_id,
        nome: response.user.nome
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
    const publicRouter = ['/login-aluno', '/cadastro-aluno', '/login-proae'];

    if (publicRouter.includes(location.pathname)) {
      setIsAuthenticated(false);
      setUserInfo(null);
      setLoading(false);
      return;
    } else{
      const checkAuth = async () => {

        try {
            const response: any = await cadastroAlunoService.validateToken();
            const fillUserInfo: UserInfo = {
              email: response.user?.email || response.email,
              id: response.user?.id || response.user?.aluno_id || response.id,
              nome: response.user?.nome || response.nome,
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
    }
  }, []);


  const Oauth_login = useCallback(() => {}, [])
  const Oauth_logout = useCallback(() => {}, [])
  const Oauth_register = useCallback(() => {}, [])


  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userInfo,
      login,
      logout,
      register,
      loading,
      Oauth_login,
      Oauth_logout,
      Oauth_register
    }}>
      {children}
    </AuthContext.Provider>
  )

}

export default AuthProvider;
