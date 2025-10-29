# NexusAI Frontend

Interface web para a NexusAI API, permitindo autenticação por usuário, gerenciamento de conversas e interação com os modelos de IA via chat.

## Principais Recursos

- Login rápido com geração de token JWT (`POST /v1/auth/token`)
- Listagem das conversas do usuário autenticado (`GET /v1/conversations`)
- Visualização do histórico completo de uma conversa (`GET /v1/conversations/{conversation_id}`)
- Criação de novas conversas (`POST /v1/conversations`)
- Envio de mensagens e respostas da IA em tempo real (`POST /v1/chat/completions`)
- Layout responsivo (desktop/tablet) com tema escuro

## Pré-requisitos

- Node.js 18+ e npm (ou pnpm/yarn) instalados localmente
- Backend da NexusAI API rodando em `http://127.0.0.1:8000` (padrão do projeto)

## Como executar

```bash
cd frontend
npm install
npm run dev
```

O Vite abrirá a aplicação em `http://127.0.0.1:5173`. O frontend já aponta para o backend em `http://127.0.0.1:8000`, então não é necessário configurar variáveis de ambiente adicionais.

## Estrutura principal

- `src/api`: wrappers para chamadas HTTP
- `src/context`: contexto de autenticação (token + userId)
- `src/pages`: páginas de alto nível (Login, Conversas, Chat)
- `src/components`: componentes reutilizáveis (lista, mensagens, formulários)

## Fluxo resumido

1. Informe o `user_id` no login e gere um token de teste.
2. Crie uma conversa ou selecione uma existente.
3. Envie mensagens para o modelo escolhido e acompanhe o histórico salvo no MongoDB.

## Build de produção

```bash
npm run build
npm run preview
```

O build ficará dentro da pasta `dist/`. Utilize sua ferramenta favorita (Nginx, Vercel, etc.) para servir os arquivos estáticos.
