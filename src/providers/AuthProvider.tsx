import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo } from '@/types/auth'
import { useKeycloak } from "@react-keycloak/web";


function AuthProvider({children}: {children: React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const { keycloak, initialized } = useKeycloak();

  const login = useCallback(async () => keycloak.login(), [keycloak]);
  const logout = useCallback(async () => keycloak.logout(), [keycloak]);
  const register = useCallback(async () => keycloak.register(), [keycloak]);

  useEffect(() => {
    if(initialized){
      setLoading(true);
      if (keycloak.authenticated) {
        setIsAuthenticated(true);
        setAuthToken(keycloak?.token as string | null);
        setUserInfo(keycloak?.userInfo as UserInfo);
      } else {
        setIsAuthenticated(false);
        setAuthToken(null);
        setUserInfo(null);
      }
      setLoading(false);
    }
  } , [keycloak])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      authToken,
      userInfo,
      login,
      logout,
      register,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )

}

export default AuthProvider;
