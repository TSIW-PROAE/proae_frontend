# Pipeline de CI/CD - PROAE Frontend

## Visão Geral

O projeto utiliza **GitHub Actions** para automatização de CI/CD com duas pipelines principais que garantem qualidade, segurança e funcionalidade do código.

## Pipelines Configuradas

### 🚀 **1. Node.js CI**
**Arquivo:** `.github/workflows/node.js.yml`

**Objetivo:** Build, teste e validação do projeto React/TypeScript

#### **Triggers:**
- Push para branch `main`
- Pull Requests para branch `main`

#### **Matriz de Execução:**
- Node.js 18.x
- Node.js 20.x
- SO: Ubuntu Latest

#### **Etapas:**
1. **Checkout** do código
2. **Setup Node.js** com cache npm
3. **Cache** de node_modules para otimização
4. **Instalação** de dependências (`npm ci`)
5. **Verificações de qualidade** (`npm run check-all`)
   - TypeScript type-check (`tsc --noEmit`)
   - ESLint análise de código (`eslint src`)
6. **Build** do projeto (`npm run build`)
7. **Execução** de testes (`npm test`)

#### **Duração Estimada:** 3-5 minutos

---

### 🔒 **2. CodeQL Security Analysis**
**Arquivo:** `.github/workflows/codeql.yml`

**Objetivo:** Análise estática de segurança e qualidade de código

#### **Triggers:**
- Push para branch `main`
- Pull Requests para branch `main`
- **Agendado:** Sábados às 14:28 UTC (análise preventiva)

#### **Linguagem Analisada:**
- JavaScript/TypeScript

#### **Queries Ativas:**
- `security-extended`: Vulnerabilidades de segurança avançadas
- `security-and-quality`: Problemas de qualidade de código

#### **Tipos de Problemas Detectados:**
- 🛡️ Vulnerabilidades de segurança (XSS, Injection, etc.)
- 🔍 Code smells e anti-patterns
- ⚡ Problemas de performance
- 🧹 Código não utilizado
- 🔄 Código duplicado
- 📊 Complexidade excessiva

#### **Duração Estimada:** 3-5 minutos

---

## Como Usar

### **Para Desenvolvedores:**

#### **1. Workflow Normal:**
```bash
git checkout -b feature/nova-funcionalidade
# Desenvolver...
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

#### **2. Criar Pull Request:**
- As pipelines executam **automaticamente**
- Aguarde os ✅ checks passarem
- Verifique relatórios de segurança se houver alertas

#### **3. Após Merge:**
- Pipeline executa novamente na `main`
- Análise de segurança é atualizada

### **Para Revisores:**

#### **1. Verificar Status das Pipelines:**
- ✅ **Node.js CI**: Qualidade, build e testes passaram
- ✅ **CodeQL**: Sem vulnerabilidades críticas

#### **2. Analisar Relatórios:**
- **Logs das pipelines:** Na aba "Actions"
- **Alertas de segurança:** Na aba "Security" → "Code scanning"

---

## Interpretando Resultados

### **Node.js CI - Status:**
| Status | Significado | Ação |
|--------|-------------|------|
| ✅ **Success** | Qualidade, build e testes OK | Pode mergear |
| ❌ **Failure** | Falha em qualidade/build/teste | Corrigir erros |
| 🟡 **In Progress** | Executando | Aguardar |

### **Detalhes das Verificações:**
| Step | O que verifica | Falha comum |
|------|---------------|-------------|
| **Quality checks** | TypeScript + ESLint | Erros de tipo, código mal formatado |
| **Build** | Compilação do projeto | Erros de sintaxe, imports |
| **Tests** | Testes automatizados | Falhas nos testes unitários |

### **CodeQL - Alertas:**
| Severidade | Cor | Ação Recomendada |
|------------|-----|------------------|
| 🔴 **Critical** | Vermelho | **Bloquear merge** |
| 🟠 **High** | Laranja | Corrigir antes do merge |
| 🟡 **Medium** | Amarelo | Corrigir em próxima iteração |
| 🔵 **Low** | Azul | Opcional |

---

## Localização dos Resultados

### **1. Pipeline Logs:**
```
GitHub → Actions → Workflow → Run específico
```

### **2. Alertas de Segurança:**
```
GitHub → Security → Code scanning alerts
```

### **3. Status em PRs:**
```
Pull Request → Checks (na parte inferior)
```

---

## Configurações de Notificação

### **Receber Alertas Automáticos:**

1. **Pessoal:**
   - GitHub → Settings → Notifications
   - Marcar: "Actions" e "Security alerts"

2. **Repositório:**
   - Repositório → Watch → Custom
   - Marcar: "Issues", "Pull requests", "Actions"

### **Alertas Críticos:**
- Vulnerabilidades críticas aparecem na aba **Security**
- Falhas de pipeline são visíveis em PRs e aba Actions

---

## Troubleshooting

### **❌ Node.js CI Falhou:**

#### **1. Erro de Verificação de Qualidade:**
```bash
# Testar localmente
npm run check-all
# ou separadamente:
npm run type-check    # Verificar erros TypeScript
npm run lint          # Verificar problemas ESLint
npm run lint:fix      # Corrigir automaticamente
```

#### **2. Erro de Build:**
```bash
# Testar localmente
npm ci
npm run build
```

#### **3. Erro de Teste:**
```bash
# Executar testes localmente
npm test
```

#### **4. Cache Issues:**
- Re-executar pipeline (botão "Re-run jobs")
- Ou fazer pequeno commit para invalidar cache

### **❌ CodeQL Detectou Vulnerabilidades:**

#### **1. Ver Detalhes:**
- Security → Code scanning alerts
- Clicar no alerta específico

#### **2. Corrigir:**
- Seguir recomendações do CodeQL
- Fazer commit com correção

#### **3. Confirmar Correção:**
- Pipeline executa automaticamente
- Verificar se alerta foi resolvido

---

## Manutenção

### **Atualizações Regulares:**

#### **1. Actions (Mensalmente):**
```yaml
# Verificar versões em:
uses: actions/checkout@v4        # Manter atualizado
uses: actions/setup-node@v4      # Manter atualizado
uses: github/codeql-action@v3    # Manter atualizado
```

#### **2. Node.js Versions (Semestralmente):**
```yaml
node-version: [18.x, 20.x]  # Adicionar/remover conforme necessário
```

### **Monitoramento:**
- **Duração:** Pipelines não devem passar de 10 minutos
- **Taxa de Sucesso:** Manter acima de 95%
- **Alertas de Segurança:** Revisar semanalmente
- **Qualidade de Código:** Manter warnings ESLint baixo (< 10)

---

## Métricas e KPIs

### **Indicadores de Sucesso:**
- ✅ **100%** dos PRs passam pelas pipelines
- ✅ **< 6 minutos** de duração média (incluindo verificações de qualidade)
- ✅ **Zero** vulnerabilidades críticas em produção
- ✅ **95%+** de taxa de sucesso das pipelines
- ✅ **< 10 warnings** ESLint por pipeline

### **Relatórios Disponíveis:**
- **GitHub Insights:** Actions → View workflow runs
- **Security Overview:** Security → Overview
- **Dependency Alerts:** Security → Dependabot

---

**Última Atualização:** Agosto 2025  
**Versão da Documentação:** 1.0