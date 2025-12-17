// Configuração global para os testes
// Este arquivo é executado antes de cada teste

// Mock do Prisma Client para testes
// Em testes reais, você pode usar Prisma Client com um banco de teste
// ou usar mocks para isolar os testes

// Exemplo: definir variáveis de ambiente de teste
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

