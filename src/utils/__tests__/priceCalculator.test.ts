import { PriceCalculator } from '../priceCalculator';

describe('PriceCalculator', () => {
  describe('calculateItemTotal', () => {
    it('deve calcular o preço total de um item simples', () => {
      const item = {
        amount: 2,
        product: {
          price: 25.0,
        },
        additions: [],
      };

      const total = PriceCalculator.calculateItemTotal(item);
      expect(total).toBe(50.0); // 25.0 * 2
    });

    it('deve incluir o preço dos adicionais no cálculo', () => {
      const item = {
        amount: 1,
        product: {
          price: 25.0,
        },
        additions: [
          {
            addon: {
              price: 3.0,
            },
          },
          {
            addon: {
              price: 5.0,
            },
          },
        ],
      };

      const total = PriceCalculator.calculateItemTotal(item);
      // (25.0 + 3.0 + 5.0) * 1 = 33.0
      expect(total).toBe(33.0);
    });

    it('deve calcular corretamente com quantidade e adicionais', () => {
      const item = {
        amount: 3,
        product: {
          price: 20.0,
        },
        additions: [
          {
            addon: {
              price: 2.0,
            },
          },
        ],
      };

      const total = PriceCalculator.calculateItemTotal(item);
      // (20.0 + 2.0) * 3 = 66.0
      expect(total).toBe(66.0);
    });

    it('não deve incluir o preço do meatChoice no cálculo', () => {
      const item = {
        amount: 1,
        product: {
          price: 25.0,
        },
        meatChoice: {
          price: 15.0, // Este preço NÃO deve ser incluído
        },
        additions: [],
      };

      const total = PriceCalculator.calculateItemTotal(item);
      // Apenas o preço do produto principal (25.0)
      expect(total).toBe(25.0);
    });
  });

  describe('calculateOrderTotal', () => {
    it('deve calcular o total de um pedido com múltiplos itens', () => {
      const items = [
        {
          amount: 2,
          product: { price: 25.0 },
          additions: [],
        },
        {
          amount: 1,
          product: { price: 20.0 },
          additions: [
            { addon: { price: 3.0 } },
          ],
        },
      ];

      const total = PriceCalculator.calculateOrderTotal(items);
      // (25.0 * 2) + (20.0 + 3.0) = 50.0 + 23.0 = 73.0
      expect(total).toBe(73.0);
    });

    it('deve retornar 0 para pedido vazio', () => {
      const total = PriceCalculator.calculateOrderTotal([]);
      expect(total).toBe(0);
    });
  });

  describe('formatPrice', () => {
    it('deve formatar preço em reais brasileiros', () => {
      const formatted = PriceCalculator.formatPrice(25.5);
      // O Intl.NumberFormat pode usar espaço não quebrável, então verificamos se contém os valores
      expect(formatted).toContain('R$');
      expect(formatted).toContain('25,50');
    });

    it('deve formatar preços com centavos corretamente', () => {
      const formatted = PriceCalculator.formatPrice(99.99);
      // O Intl.NumberFormat pode usar espaço não quebrável, então verificamos se contém os valores
      expect(formatted).toContain('R$');
      expect(formatted).toContain('99,99');
    });
  });
});

