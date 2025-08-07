import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo } from '@/types/auth'


function AuthProvider({children}: {children: React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const login = useCallback(() => {}, [])
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserInfo(null);
  }, []);

  const register = useCallback(() => {}, [])
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
