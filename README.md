# Chat-BotJS

Chatbot com IA (Google Gemini), com autenticação de usuários, histórico de
conversas por usuário (estilo ChatGPT) e suporte a anexar arquivos.

## Estrutura do projeto

```
Chat-BotJS/
├── Back-End/                 # API (Node + Express)
│   ├── server.js              # ponto de entrada: monta tudo e sobe o servidor
│   ├── src/
│   │   ├── config/            # env, conexão com o banco (SQLite), caminhos
│   │   ├── middleware/         # autenticação (JWT) e tratamento de erros
│   │   ├── controllers/        # regras de cada rota (auth, conversas, chat, upload)
│   │   ├── routes/             # definição das rotas Express
│   │   ├── services/           # acesso a dados (users/conversations/messages) e Gemini
│   │   └── utils/              # hash de senha e geração/verificação de JWT
│   ├── data/                  # banco SQLite (gerado automaticamente, não versionado)
│   └── uploads/                # arquivos anexados pelos usuários (não versionado)
└── Front-End/                 # HTML/CSS/JS puro (sem framework/build step)
    ├── login.html              # tela de login/cadastro
    ├── index.html              # chat com a sidebar de conversas
    ├── style.css
    └── js/
        ├── api.js               # cliente HTTP central (fetch com cookies)
        ├── auth.js              # lógica da tela de login/cadastro
        ├── sidebar.js           # lista de conversas (criar, abrir, renomear, excluir)
        ├── chat.js              # renderização das mensagens
        └── app.js               # orquestra tudo na página do chat
```

## Como rodar

### 1. Configurar o back-end

```bash
cd Back-End
npm install
cp .env.example .env
```

Edite o `.env` e preencha pelo menos:

- `GEMINI_API_KEY`: sua chave da API do Google Gemini
- `JWT_SECRET`: uma string longa e aleatória (usada para assinar os tokens de login)

> ⚠️ O `.env` nunca deve ser commitado — ele já está no `.gitignore`.

### 2. Subir o servidor

```bash
npm start
```

O servidor sobe em `http://localhost:3000` e **já serve o Front-End
automaticamente** (arquivos estáticos de `../Front-End`). Basta abrir
`http://localhost:3000` no navegador — não é mais necessário usar o Live
Server, já que rodar tudo na mesma origem evita problemas de cookies entre
domínios diferentes.

Se preferir continuar abrindo o Front-End por outra origem (ex: Live Server
do VS Code), ajuste `CORS_ORIGIN` no `.env` com a URL usada.

Na primeira execução o banco SQLite (`Back-End/data/chatbot.sqlite`) e as
tabelas são criados automaticamente.

## Autenticação

- Cadastro e login criam um cookie `httpOnly` com um JWT (7 dias de validade
  por padrão, configurável em `JWT_EXPIRES_IN`).
- Senhas nunca são salvas em texto puro — são hasheadas com `bcryptjs` antes
  de ir para o banco.
- Todas as rotas de conversas, mensagens e upload exigem estar autenticado.

## Conversas e histórico

- Cada conversa pertence a um único usuário (não é possível acessar/editar
  conversas de outra pessoa).
- Todo o histórico de mensagens de uma conversa fica salvo no banco e é
  reenviado à IA como contexto a cada nova mensagem — o cliente não precisa
  (e não consegue) manipular esse histórico.
- Pela sidebar dá pra criar uma nova conversa, abrir uma antiga, renomear
  (✏️) e excluir (🗑️). O título é definido automaticamente a partir da
  primeira mensagem, mas pode ser renomeado a qualquer momento.

## Desenvolvimento

Pull requests devem incluir um resumo da mudança e as verificações realizadas.
O GitHub Actions instala as dependências do back-end e verifica a sintaxe dos
arquivos JavaScript a cada push e pull request.
