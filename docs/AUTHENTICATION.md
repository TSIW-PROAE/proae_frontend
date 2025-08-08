# Autenticação com Keycloak - PROAE Frontend

## Arquitetura

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant User as Usuário
    participant App as Frontend
    participant KC as Keycloak

    User->>App: Clica "Entrar"
    App->>KC: Redireciona para login
    KC->>User: Exibe tela de login
    User->>KC: Fornece credenciais
    KC->>App: Retorna com código de autorização
    App->>KC: Troca código por tokens (PKCE)
    KC->>App: Access Token + Refresh Token
    App->>KC: Carrega informações do usuário
    KC->>App: UserInfo (email, role, etc.)
```

### Componentes Principais

#### 1. **AuthProvider** (`src/providers/AuthProvider.tsx`)

- Gerencia estado global de autenticação
- Integra com `@react-keycloak/web`
- Carrega informações do usuário automaticamente
- Valida tokens e gerencia expiração

#### 2. **AuthContext** (`src/context/AuthContext.ts`)

- Context API para compartilhar estado de auth
- Fornece hooks typados e seguros

#### 3. **ProtectedRoutes** (`src/Auth/`)

- `ProtectedRouteAluno`: Rotas exclusivas para alunos
- `ProtectedRouteProae`: Rotas exclusivas para PROAE
- Validação automática de role e token

## Configuração

### Variáveis de Ambiente (.env)

```bash
VITE_KEYCLOAK_SERVICE_URL=http://localhost:8080/
VITE_KEYCLOAK_REALM=proae-realm
VITE_KEYCLOAK_CLIENT_ID=proae-frontend
```

### Configuração do Keycloak (`src/keycloak.ts`)

```typescript
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_SERVICE_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
```

### Inicialização (`src/main.tsx`)

```typescript
<ReactKeycloakProvider
  authClient={keycloak}
  initOptions={{onload: 'check-sso'}}
  LoadingComponent={<div>Loading...</div>}
>
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
</ReactKeycloakProvider>
```

## Funcionalidades Implementadas

### Autenticação

- **Login**: Redirecionamento automático para Keycloak
- **Logout**: Invalidação de sessão completa
- **Auto-check**: Verificação automática de sessão existente

### Autorização

- **Roles**: Diferenciação entre 'aluno' e 'proae'
- **Rotas Protegidas**: Acesso baseado em role
- **Validação**: Verificação contínua de token válido

### Gerenciamento de Estado

- **Context API**: Estado global acessível
- **Token Management**: Automático via Keycloak
- **User Info**: Carregamento automático após login

### Proteção de Rotas

```typescript
// Rotas protegidas para alunos
{
  element: <ProtectedRouteAluno />,
  children: [
    { path: "portal-aluno", element: <PortalAluno /> },
    // ... outras rotas de aluno
  ],

}

// Rotas protegidas para PROAE
{
  element: <ProtectedRouteProae />,
  children: [
    { path: "portal-proae/inscricoes", element: <InscricoesProae /> },
    // ... outras rotas de PROAE
  ],
}
```

## Segurança

### PKCE (Proof Key for Code Exchange)

- **Automático**: Implementado pelo `keycloak-js`
- **Seguro**: Previne ataques de interceptação de código
- **Padrão**: Recomendado para SPAs

### Validação de Tokens

- **Automática**: Verificação contínua de expiração
- **Logout automático**: Em caso de token inválido
- **Renovação**: Gerenciada pelo Keycloak

### Controle de Acesso

- **Role-based**: Acesso baseado no papel do usuário
- **Token validation**: Verificação de autenticação
- **Redirecionamento**: Para home se não autorizado

## Configuração do Cliente Keycloak

### Configurações Obrigatórias

#### **Client Settings:**

- **Client Type**: `Public` (para SPAs)
- **Valid Redirect URIs**: `http://localhost:5173/*`
- **Valid Post Logout Redirect URIs**: `http://localhost:5173`
- **Web Origins**: `http://localhost:5173`

## Estrutura de Dados do Usuário

```typescript
interface UserInfo {
  username: string;           // preferred_username do Keycloak
  email: string;             // Email do usuário
  role: "aluno" | "proae";   // Role baseada no username
  sub?: string;              // ID único do usuário
  name?: string;             // Nome completo
  given_name?: string;       // Primeiro nome
  family_name?: string;      // Sobrenome
  email_verified?: boolean;  // Status de verificação do email
}
```
