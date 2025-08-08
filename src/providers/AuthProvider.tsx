import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo, UserLogin, UserSignup } from '@/types/auth'
import  {FetchAdapter} from '@/services/BaseRequestService/HttpClient'
import CadastroAlunoService from '@/services/CadastroAluno.service/cadastroAluno.service'
import { getCookie } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'


function AuthProvider({children}: {children: React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  const acess_token = getCookie("token");

  const client = new FetchAdapter();
  const cadastroAlunoService = new CadastroAlunoService(client);

  const login = useCallback((data: UserLogin) => {cadastroAlunoService.LoginAluno(data)}, [])
  const logout = useCallback(() => {
    cadastroAlunoService.LogoutAluno();
    setIsAuthenticated(false);
    setUserInfo(null);
    navigate("/");
  }, []);

  const register = useCallback((data: UserSignup) => {cadastroAlunoService.createAlunoUser(data)}, [])

  useEffect(() => {
    const checkAuth = async () => {
      if (acess_token) {
        try {
          const response = await cadastroAlunoService.validateToken();
          setUserInfo(response.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Authentication failed", error);
          setIsAuthenticated(false);
          setUserInfo(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, [acess_token, cadastroAlunoService]);


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
