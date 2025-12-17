import { validateMeatChoice, validateMeatChoicesBatch } from '../orderValidation';
import prismaClient from '../../prisma';

// Mock do Prisma Client
jest.mock('../../prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('orderValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMeatChoice', () => {
    const mockMeatChoice = {
      id: 1,
      name: 'Espetinho de Carne',
      stock: 10,
      available: true,
      canBeUsedInSandwich: true,
    };

    it('deve validar meatChoice existente e disponível', async () => {
      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(mockMeatChoice);

      const result = await validateMeatChoice({
        meatChoiceId: 1,
        amount: 2,
      });

      expect(result).toEqual(mockMeatChoice);
      expect(prismaClient.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve rejeitar meatChoice que não existe', async () => {
      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        validateMeatChoice({
          meatChoiceId: 999,
          amount: 1,
        })
      ).rejects.toThrow('Espetinho com ID 999 não encontrado');
    });

    it('deve rejeitar meatChoice que não pode ser usado em sanduíche', async () => {
      const invalidMeatChoice = {
        ...mockMeatChoice,
        canBeUsedInSandwich: false,
      };

      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(invalidMeatChoice);

      await expect(
        validateMeatChoice({
          meatChoiceId: 1,
          amount: 1,
        })
      ).rejects.toThrow('não pode ser usado no lanche');
    });

    it('deve rejeitar meatChoice que não está disponível', async () => {
      const unavailableMeatChoice = {
        ...mockMeatChoice,
        available: false,
      };

      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(unavailableMeatChoice);

      await expect(
        validateMeatChoice({
          meatChoiceId: 1,
          amount: 1,
        })
      ).rejects.toThrow('não está disponível');
    });

    it('deve rejeitar meatChoice com estoque insuficiente', async () => {
      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(mockMeatChoice);

      await expect(
        validateMeatChoice({
          meatChoiceId: 1,
          amount: 100, // Mais que o estoque disponível
        })
      ).rejects.toThrow('Estoque insuficiente');
    });
  });

  describe('validateMeatChoicesBatch', () => {
    const mockMeatChoice1 = {
      id: 1,
      name: 'Espetinho de Carne',
      stock: 10,
      available: true,
      canBeUsedInSandwich: true,
    };

    const mockMeatChoice2 = {
      id: 2,
      name: 'Espetinho de Frango',
      stock: 5,
      available: true,
      canBeUsedInSandwich: true,
    };

    it('deve validar múltiplos meatChoices válidos', async () => {
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockMeatChoice1,
        mockMeatChoice2,
      ]);

      const meatChoiceIds = [1, 2];
      const amounts = new Map([
        [1, 2],
        [2, 1],
      ]);

      const result = await validateMeatChoicesBatch(meatChoiceIds, amounts);

      expect(result.size).toBe(2);
      expect(result.get(1)).toEqual(mockMeatChoice1);
      expect(result.get(2)).toEqual(mockMeatChoice2);
    });

    it('deve retornar Map vazio quando não há meatChoices', async () => {
      const result = await validateMeatChoicesBatch([], new Map());

      expect(result.size).toBe(0);
      expect(prismaClient.product.findMany).not.toHaveBeenCalled();
    });

    it('deve rejeitar se algum meatChoice não existe', async () => {
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockMeatChoice1,
        // mockMeatChoice2 não está no resultado
      ]);

      const meatChoiceIds = [1, 2];
      const amounts = new Map([
        [1, 2],
        [2, 1],
      ]);

      await expect(
        validateMeatChoicesBatch(meatChoiceIds, amounts)
      ).rejects.toThrow('Espetinho com ID 2 não encontrado');
    });

    it('deve rejeitar se algum meatChoice não pode ser usado em sanduíche', async () => {
      const invalidMeatChoice = {
        ...mockMeatChoice2,
        canBeUsedInSandwich: false,
      };

      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockMeatChoice1,
        invalidMeatChoice,
      ]);

      const meatChoiceIds = [1, 2];
      const amounts = new Map([
        [1, 2],
        [2, 1],
      ]);

      await expect(
        validateMeatChoicesBatch(meatChoiceIds, amounts)
      ).rejects.toThrow('não pode ser usado no lanche');
    });

    it('deve rejeitar se algum meatChoice não está disponível', async () => {
      const unavailableMeatChoice = {
        ...mockMeatChoice2,
        available: false,
      };

      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockMeatChoice1,
        unavailableMeatChoice,
      ]);

      const meatChoiceIds = [1, 2];
      const amounts = new Map([
        [1, 2],
        [2, 1],
      ]);

      await expect(
        validateMeatChoicesBatch(meatChoiceIds, amounts)
      ).rejects.toThrow('não está disponível');
    });

    it('deve rejeitar se algum meatChoice tem estoque insuficiente', async () => {
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockMeatChoice1,
        mockMeatChoice2,
      ]);

      const meatChoiceIds = [1, 2];
      const amounts = new Map([
        [1, 2],
        [2, 100], // Mais que o estoque disponível (5)
      ]);

      await expect(
        validateMeatChoicesBatch(meatChoiceIds, amounts)
      ).rejects.toThrow('Estoque insuficiente');
    });
  });
});

