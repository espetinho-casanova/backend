# Backend - Espetinho Casanova

API REST para sistema de gestão de pedidos de espetinhos e lanches.

## 🚀 Tecnologias

- **Node.js** com **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Zod** - Validação de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL (ou Neon Postgres para produção)
- npm ou yarn

## ⚙️ Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

3. Execute as migrations:
```bash
npx prisma migrate dev
```

4. Execute a seed (opcional):
```bash
npx prisma db seed
```

## 🏃 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 Documentação

- **Deploy:** Veja `DEPLOY.md` para instruções de deploy no Render
- **Testes:** Veja `src/__tests__/README.md` para informações sobre testes

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia servidor em produção
- `npm test` - Executa testes
- `npm run reset-stock` - Reseta estoque de produtos

## 📝 Variáveis de Ambiente

Veja `.env.example` para lista completa de variáveis necessárias.

## 🔐 Segurança

- JWT para autenticação
- Sistema de permissões por cargo
- Validação de dados com Zod
- CORS configurável

