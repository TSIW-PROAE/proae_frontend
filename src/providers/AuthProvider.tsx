import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { UserInfo } from '@/types/auth'
import { useKeycloak } from "@react-keycloak/web";


function AuthProvider({children}: {children: React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const { keycloak, initialized } = useKeycloak();

  const login = useCallback(async () => keycloak.login(), [keycloak]);
  const logout = useCallback(async () => keycloak.logout(), [keycloak]);
  const register = useCallback(async () => keycloak.register(), [keycloak]);

  useEffect(() => {
    if(initialized){
      if (keycloak.authenticated) {
        setIsAuthenticated(true);
        setAuthToken(keycloak?.token as string | null);

        keycloak.loadUserInfo().then((userInfo) => {
          console.log('Keycloak userInfo received:', userInfo);

          const keycloakUserInfo = userInfo as any; // Type assertion para acessar propriedades

          const fillUserInfo: UserInfo = {
            email: keycloakUserInfo.email || '',
            username: keycloakUserInfo.preferred_username || keycloakUserInfo.given_name || 'unknown',
            role: keycloakUserInfo.preferred_username === 'proae' ? 'proae' : 'aluno',
            sub: keycloakUserInfo.sub,
            name: keycloakUserInfo.name,
            given_name: keycloakUserInfo.given_name,
            family_name: keycloakUserInfo.family_name,
            email_verified: keycloakUserInfo.email_verified
          };

          console.log('Processed UserInfo:', fillUserInfo);
          setUserInfo(fillUserInfo);
        }).catch((error) => {
          console.error('Erro ao carregar userInfo:', error);
          setUserInfo(null);
        })

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
