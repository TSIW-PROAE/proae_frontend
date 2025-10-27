# ModalEditarEdital - Estrutura Refatorada

## Visão Geral

O componente `ModalEditarEdital` foi refatorado e dividido em componentes menores para melhor organização, manutenibilidade e reutilização. A nova estrutura segue o princípio de responsabilidade única, onde cada componente tem uma função específica.

## Estrutura de Arquivos

```
ModalEditarEdital/
├── ModalEditarEdital.tsx          # Componente principal (orquestrador)
├── ModalEditarEdital.css          # Estilos do modal
├── types.ts                       # Tipos e interfaces compartilhadas
├── utils.ts                       # Funções utilitárias
└── components/                    # Componentes filhos
    ├── index.ts                   # Exportações dos componentes
    ├── StatusConfirmModal.tsx     # Modal de confirmação de mudança de status
    ├── StatusErrorModal.tsx       # Modal de erro de status
    ├── ModalHeader.tsx            # Header com título e status
    ├── DescricaoSection.tsx       # Seção de descrição do edital
    ├── VagasSection.tsx           # Seção de gerenciamento de vagas
    ├── QuestionariosSection.tsx   # Seção de questionários
    ├── CronogramaSection.tsx      # Seção de cronograma/timeline
    ├── DocumentosSection.tsx      # Seção de links e documentos
    ├── ModalFooter.tsx            # Footer com botões de ação
    ├── QuestionarioDrawer.tsx     # Drawer lateral para edição de questionários
    └── CelebrationOverlay.tsx     # Overlay de celebração (animação de balões)
```

## Componentes

### `ModalEditarEdital.tsx` (Componente Principal)

- **Responsabilidade**: Orquestrar todos os sub-componentes e gerenciar o estado global
- **Estado**: Gerencia todos os estados do modal (título, descrição, vagas, questionários, etc.)
- **Lógica**: Contém as funções de persistência, validação e comunicação com APIs

### `types.ts`

- **Responsabilidade**: Definir todas as interfaces e tipos utilizados pelos componentes
- **Conteúdo**:
  - `EditableDocumento`, `EditableEtapa`, `EditableVaga`
  - `StatusEdital`, `QuestionarioItem`, `EditableQuestionario`
  - `PerguntaEditorItem`, `statusLabelMap`

### `utils.ts`

- **Responsabilidade**: Funções utilitárias compartilhadas
- **Conteúdo**:
  - `toInternalStatus()`: Normaliza status de diferentes formatos
  - `makeSnapshot()`: Cria snapshot para controle de alterações

### Componentes de UI

#### `StatusConfirmModal.tsx`

- **Props**: Confirmação de texto, status, callbacks
- **Função**: Modal para confirmar mudanças críticas de status

#### `StatusErrorModal.tsx`

- **Props**: Mensagem de erro, callback de fechamento
- **Função**: Mostrar erros de validação de status

#### `ModalHeader.tsx`

- **Props**: Título, status, callbacks de edição
- **Função**: Header editável com dropdown de status

#### `DescricaoSection.tsx`

- **Props**: Descrição, estado de edição, callbacks
- **Função**: Seção colapsável para editar descrição

#### `VagasSection.tsx`

- **Props**: Array de vagas, callbacks de manipulação
- **Função**: CRUD completo de vagas com validação

#### `QuestionariosSection.tsx`

- **Props**: Array de questionários, callbacks
- **Função**: Listagem e prévia de questionários

#### `CronogramaSection.tsx`

- **Props**: Array de etapas, callbacks
- **Função**: Timeline visual para cronograma

#### `DocumentosSection.tsx`

- **Props**: Array de documentos, callbacks
- **Função**: Gerenciamento de links e documentos

#### `ModalFooter.tsx`

- **Props**: Estado de erro, loading, callbacks
- **Função**: Botões de ação (cancelar/salvar)

#### `QuestionarioDrawer.tsx`

- **Props**: Perguntas, título, estado de edição
- **Função**: Editor lateral completo de questionários

#### `CelebrationOverlay.tsx`

- **Props**: Visibilidade
- **Função**: Animação de celebração pós-ação

## Benefícios da Refatoração

### 1. **Separação de Responsabilidades**

- Cada componente tem uma função específica
- Facilita testes unitários
- Reduz complexidade cognitiva

### 2. **Reutilização**

- Componentes podem ser reutilizados em outros contextos
- Facilita manutenção e evolução

### 3. **Manutenibilidade**

- Arquivos menores e mais focados
- Bugs são mais fáceis de isolar
- Mudanças têm menor impacto

### 4. **Testabilidade**

- Cada componente pode ser testado independentemente
- Props bem definidas facilitam mocking
- Lógica isolada permite testes focados

### 5. **Performance**

- Componentes menores re-renderizam menos
- Possibilita otimizações futuras com React.memo
- Lazy loading de componentes específicos

## Padrões Utilizados

### 1. **Container/Presentational Pattern**

- `ModalEditarEdital`: Container (lógica)
- Componentes filhos: Presentational (UI)

### 2. **Props Interface Pattern**

- Cada componente tem interface bem definida
- Props tipadas com TypeScript
- Callbacks padronizados

### 3. **Composition Pattern**

- Componente principal compõe os menores
- Facilita customização e extensão

## Como Usar

```tsx
import ModalEditarEdital from "./ModalEditarEdital";

<ModalEditarEdital
  edital={edital}
  isOpen={isOpen}
  onClose={handleClose}
  onSave={handleSave}
  onStatusChanged={handleStatusChange}
/>;
```

## Próximos Passos

1. **Testes**: Implementar testes unitários para cada componente
2. **Storybook**: Documentar componentes com stories
3. **Performance**: Aplicar React.memo onde necessário
4. **Validação**: Implementar validação de formulários mais robusta
5. **Acessibilidade**: Melhorar suporte a screen readers e navegação por teclado
