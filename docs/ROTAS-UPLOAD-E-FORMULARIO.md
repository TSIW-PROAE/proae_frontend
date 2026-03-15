# Rotas: upload de arquivos e formulário (para bater com o front)

**Base URL:** `http://localhost:3000` (ou a do ambiente). **Não há prefixo `/api`** — as rotas são exatamente `/inscricoes`, `/documents/upload`, etc. No front, use `baseURL: 'http://localhost:3000'` e path `'/inscricoes'` (não `'/api/inscricoes'`).

Todas as rotas abaixo exigem **JWT** (Header `Authorization: Bearer <token>`), exceto as de auth e health.

---

## 404 em POST /inscricoes

Se **POST /inscricoes** retornar **404**, a API está respondendo com **Not Found** por causa da regra de negócio, não porque a rota não existe. O corpo da resposta vem com `message` explicando:

- **"Aluno não encontrado"** — o usuário logado (JWT) não tem registro de aluno. Só quem tem perfil aluno pode se inscrever. Confira se está logado com usuário que fez cadastro como aluno.
- **"Vaga não encontrada"** — o `vaga_id` enviado não existe no banco. Confira o ID da vaga do edital (ex.: da tela do formulário).

Confira no front a **URL exata** da requisição: deve ser `http://localhost:3000/inscricoes` (sem `/api` no meio).

---

## 1. Storage / Upload de arquivos (R2)

| Método | Rota | Descrição |
|--------|------|-----------|
| **POST** | `/documents/upload` | Upload de arquivos. **Body:** `multipart/form-data` com campo `files` (array) ou `file` (um arquivo). **Resposta:** `{ mensagem, arquivos: [{ nome_do_arquivo, tipo, url }] }`. Formatos: PDF, PNG, JPEG. |
| **GET** | `/documents/:filename` | Retorna URL assinada do arquivo do usuário. **Resposta:** `{ nome_do_arquivo, url }`. |

---

## 2. Documentos (vinculados à inscrição)

| Método | Rota | Descrição |
|--------|------|-----------|
| **POST** | `/documentos/upload` | Upload com inscrição e tipo. **Body:** `multipart/form-data` com `files`, `inscricao`, `tipo_documento`. |
| **GET** | `/documentos/inscricao/:inscricaoId` | Lista documentos de uma inscrição. |
| **GET** | `/documentos/:id` | Detalhe de um documento. |
| **PUT** | `/documentos/:id` | Atualizar documento. |
| **DELETE** | `/documentos/:id` | Remover documento. |
| **GET** | `/documentos/reprovados/meus` | Meus documentos reprovados. |
| **PUT** | `/documentos/resubmissao/:id` | Resubmeter documento. |
| **GET** | `/documentos/pendencias/meus` | Minhas pendências de documento. |

---

## 3. Inscrições (formulário e cache)

| Método | Rota | Descrição |
|--------|------|-----------|
| **POST** | `/inscricoes` | Criar inscrição (envio final do formulário com respostas). **Body:** `{ vaga_id, respostas: [...] }`. |
| **PATCH** | `/inscricoes/:id` | Atualizar inscrição. |
| **GET** | `/inscricoes` | Listar inscrições (do usuário ou admin). |
| **POST** | `/inscricoes/cache/save/respostas` | Salvar rascunho das respostas no cache (Redis). **Body:** mesmo formato de criação (vaga_id, respostas). |
| **GET** | `/inscricoes/cache/respostas/vaga/:vagaId` | Buscar respostas em cache para uma vaga. **Resposta:** `{ message, respostas }`. |
| **GET** | `/inscricoes/aprovados/pdf` | PDF dos aprovados (admin). Query opcional: `?editalId=`. |

---

## 4. Respostas (perguntas do formulário)

| Método | Rota | Descrição |
|--------|------|-----------|
| **POST** | `/respostas` | Criar resposta (inclui upload via arquivo; pode usar `urlArquivo` com nome ou URL). |
| **GET** | `/respostas` | Listar respostas. |
| **GET** | `/respostas/:id` | Uma resposta. |
| **PATCH** | `/respostas/:id` | Atualizar resposta. |
| **DELETE** | `/respostas/:id` | Remover resposta. |
| **GET** | `/respostas/aluno/:alunoId/edital/:editalId` | Respostas do aluno num edital. |
| **GET** | `/respostas/aluno/:alunoId/edital/:editalId/step/:stepId` | Respostas do aluno num step. |
| **GET** | `/respostas/aluno/:alunoId/edital/:editalId/step/:stepId/perguntas-com-respostas` | Perguntas com respostas preenchidas. |
| **GET** | `/respostas/pergunta/:perguntaId/edital/:editalId` | Respostas de uma pergunta num edital. |
| **PATCH** | `/respostas/:id/validate` | Validar resposta (admin). |

---

## 5. Estrutura do formulário (steps e perguntas)

| Método | Rota | Descrição |
|--------|------|-----------|
| **GET** | `/steps/edital/:id/with-perguntas` | Steps do edital com perguntas. |
| **GET** | `/steps/edital/:id` | Steps do edital (sem perguntas). |
| **POST** | `/steps` | Criar step. |
| **PATCH** | `/steps/:id` | Atualizar step. |
| **DELETE** | `/steps/:id` | Remover step. |
| **POST** | `/perguntas` | Criar pergunta. |
| **GET** | `/perguntas/step/:stepId` | Perguntas de um step. |
| **PATCH** | `/perguntas/:id` | Atualizar pergunta. |
| **DELETE** | `/perguntas/:id` | Remover pergunta. |

---

## 6. Editais e vagas

| Método | Rota | Descrição |
|--------|------|-----------|
| **GET** | `/editais` | Listar editais. |
| **GET** | `/editais/abertos` | Editais abertos. |
| **GET** | `/editais/:id` | Detalhe do edital. |
| **GET** | `/editais/:id/inscritos` | Inscritos no edital (admin). |
| **POST** | `/editais` | Criar edital (admin). |
| **PATCH** | `/editais/:id` | Atualizar edital. |
| **PATCH** | `/editais/:id/status/:status` | Alterar status do edital. |
| **DELETE** | `/editais/:id` | Remover edital. |
| **GET** | `/vagas/edital/:editalId` | Vagas do edital. |
| **POST** | `/vagas` | Criar vaga. |
| **PATCH** | `/vagas/:id` | Atualizar vaga. |
| **DELETE** | `/vagas/:id` | Remover vaga. |

---

## 7. Formulário geral

| Método | Rota | Descrição |
|--------|------|-----------|
| **GET** | `/formulario-geral` | Dados do formulário geral (e status do aluno se logado). |
| **POST** | `/formulario-geral` | Criar formulário geral (admin). |
| **PATCH** | `/formulario-geral/:id` | Atualizar formulário geral (admin). |
| **DELETE** | `/formulario-geral/:id` | Desativar formulário geral (admin). |

---

## 8. Perfil (aluno e admin)

| Método | Rota | Descrição |
|--------|------|-----------|
| **GET** | `/aluno/me` | Dados do aluno logado. 404 se o usuário não tiver perfil de aluno. |
| **PATCH** | `/aluno/update` | Atualizar dados do aluno. |
| **GET** | `/admin` | Dados do admin logado (ou equivalente no back). 404 se não houver perfil. |
| **PATCH** | `/admin/update` | Atualizar dados do admin. |

Quando o back retorna 404 em GET perfil, o front não deve exibir o formulário de edição; deve exibir mensagem "Perfil não encontrado".

---

## 9. Auth (para contexto)

| Método | Rota | Descrição |
|--------|------|-----------|
| **POST** | `/auth/signup` | Cadastro aluno. |
| **POST** | `/auth/login` | Login. |
| **POST** | `/auth/validate-token` | Validar JWT. |
| **POST** | `/auth/signup-admin` | Pedido de cadastro admin. |
| **GET** | `/auth/approve-admin/:token` | Aprovar admin (link do email). |
| **GET** | `/auth/reject-admin/:token` | Rejeitar admin. |

---

## Resposta do upload (`POST /documents/upload`)

Exemplo de sucesso (R2 retorna URL):

```json
{
  "mensagem": "Upload feito com sucesso!",
  "arquivos": [
    {
      "nome_do_arquivo": "documento.pdf",
      "tipo": "application/pdf",
      "url": "https://..."
    }
  ]
}
```

O front pode usar `arquivos[0].url` (ou o índice do arquivo enviado) para exibir ou guardar na resposta do formulário (`urlArquivo`).
