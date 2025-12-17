# 🧪 Testes - Backend

## Estrutura de Testes

Os testes estão organizados seguindo a estrutura do código fonte:

```
src/
├── __tests__/
│   ├── setup.ts          # Configuração global dos testes
│   └── README.md         # Este arquivo
├── services/
│   └── order/
│       └── __tests__/
│           ├── CreateOrderService.test.ts
│           └── AddItemService.test.ts
└── utils/
    └── __tests__/
        └── priceCalculator.test.ts
```

## Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa quando arquivos mudam)
npm run test:watch

# Executar testes com cobertura de código
npm run test:coverage
```

## Testes Implementados

### ✅ CreateOrderService
- Criação de pedido vazio
- Validação de produto existente
- Validação de produto disponível
- Validação de estoque suficiente
- Criação de pedido com itens

### ✅ AddItemService
- Validação de pedido existente
- Validação de produto existente
- Validação de produto disponível
- Validação de estoque suficiente
- Adição de item quando validações passam

### ✅ PriceCalculator
- Cálculo de preço de item simples
- Cálculo com adicionais
- Cálculo com quantidade
- Verificação que meatChoice não é incluído no preço
- Cálculo de total do pedido
- Formatação de preço em reais

## Próximos Testes a Implementar

- [ ] RemoveItemService
- [ ] UpdateOrderItemsService
- [ ] UpdateOrderService
- [ ] AuthUserService
- [ ] Validações (orderValidation.ts)

## Notas

- Os testes usam mocks do Prisma Client para isolar as unidades
- Para testes de integração, será necessário configurar um banco de dados de teste
- O arquivo `setup.ts` configura variáveis de ambiente de teste

