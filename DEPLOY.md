# Guia de Deploy - Backend (Render + Neon Postgres)

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no Render:

### Obrigatórias:
- `DATABASE_URL`: Connection string do Neon Postgres (já inclui SSL)
  - Exemplo: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
- `JWT_SECRET`: Chave secreta para JWT (mínimo 8 caracteres)
- `PORT`: Definida automaticamente pelo Render (não precisa configurar manualmente)

### Opcionais:
- `CORS_ORIGIN`: URL(s) do frontend separadas por vírgula
  - Exemplo: `https://seu-app.vercel.app,https://www.seudominio.com`
  - Se não definida, usa `http://localhost:3000` como padrão
- `ADMIN_LOGIN`: Login do usuário admin criado pela seed
  - Se não definida, usa `admin` como padrão
  - **IMPORTANTE:** Em produção, defina um login personalizado para maior segurança
- `ADMIN_PASSWORD`: Senha do usuário admin criado pela seed
  - Se não definida, usa `123` como padrão (apenas para desenvolvimento)
  - **IMPORTANTE:** Em produção, defina uma senha forte e altere após o primeiro login
- `NODE_ENV`: `production` (definido automaticamente pelo Render)

## Configuração no Render

### Build Command:
```bash
NODE_ENV=development npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Importante:** O `NODE_ENV=development` força a instalação de `devDependencies` (TypeScript e @types/node), que são necessárias para o build. Sem isso, o Render pode pular devDependencies se `NODE_ENV=production` estiver definido.

### Start Command:
```bash
npm start
```

### Healthcheck:
O endpoint `/health` está disponível para verificação de saúde do serviço.

## Configuração do Neon Postgres

O Neon já fornece a connection string com SSL habilitado. Certifique-se de:
1. Copiar a connection string completa do dashboard do Neon
2. Adicionar `?sslmode=require` se não estiver presente (geralmente já vem)
3. Configurar no Render como variável de ambiente `DATABASE_URL`

## Migrations e Seed

### 1. Migrations

Após o primeiro deploy, execute as migrations:
```bash
npx prisma migrate deploy
```

Ou configure no Render para executar automaticamente no build:
```bash
NODE_ENV=development npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

### 2. Seed (Popular banco com dados iniciais)

A seed cria:
- Usuário admin (login: `admin`, senha: `123`)
- Cargos e permissões
- Categorias e produtos (Espetinhos, Lanches, Bebidas)
- Ingredientes e adicionais

**Opção A: Via SSH no Render (Recomendado)**

1. No painel do Render, acesse seu serviço
2. Clique em "Shell" ou "SSH" para abrir o terminal
3. Execute:
```bash
npx prisma db seed
```

**Opção B: Via Build Command (Automático)**

Configure o Build Command para executar a seed automaticamente após as migrations:
```bash
NODE_ENV=development npm ci && npx prisma generate && npx prisma migrate deploy && npm run build && npx prisma db seed
```

⚠️ **Atenção:** Esta opção executará a seed a cada deploy, limpando e recriando todos os dados. Use apenas no primeiro deploy ou quando quiser resetar o banco.

**Opção C: Via Script Local (Conectando ao Neon)**

Se preferir executar localmente conectando ao banco Neon:

1. Configure a `DATABASE_URL` no seu `.env` local com a connection string do Neon
2. Execute:
```bash
cd backend
npx prisma db seed
```

**Verificação:**

Após executar a seed, verifique se os dados foram criados:
- Acesse o endpoint de categorias: `GET /categories` (requer autenticação)
- Faça login com:
  - Login: valor de `ADMIN_LOGIN` ou `admin` (padrão)
  - Senha: valor de `ADMIN_PASSWORD` ou `123` (padrão)
  
⚠️ **SEGURANÇA:** Após o primeiro login em produção, altere imediatamente a senha do usuário admin através do sistema!

## Imagens

As imagens dos produtos são armazenadas no diretório `tmp/` e servidas via `/files/`.

**Importante:** O diretório `tmp/` é **criado automaticamente** quando o servidor inicia. Não é necessário criá-lo manualmente.

**Nota:** A seed cria os produtos **sem imagens**. Após executar a seed e fazer o deploy:

1. Acesse o sistema e edite cada produto
2. Faça upload das imagens através da interface de edição
3. As imagens serão salvas automaticamente no diretório `tmp/` do servidor (criado automaticamente se não existir)

Alternativamente, você pode fazer upload das imagens manualmente via SSH no Render, copiando os arquivos para o diretório `tmp/` do servidor.

## Logs

Em produção (`NODE_ENV=production`):
- Logs de erro apenas (sem queries do Prisma)
- Mensagens de erro genéricas para o cliente
- Stack traces apenas em desenvolvimento

## CORS

O CORS está configurado para aceitar:
- Origens definidas em `CORS_ORIGIN`
- Em desenvolvimento: localhost e IPs locais automaticamente
- Credenciais habilitadas para cookies/tokens

