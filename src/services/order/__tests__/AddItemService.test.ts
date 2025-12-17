import { AddItemService } from '../AddItemService';
import prismaClient from '../../../prisma';

// Mock do Prisma Client
jest.mock('../../../prisma', () => ({
  __esModule: true,
  default: {
    order: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock da função utilitária
jest.mock('../../../utils/orderValidation', () => ({
  validateMeatChoice: jest.fn(),
}));

describe('AddItemService', () => {
  let addItemService: AddItemService;

  beforeEach(() => {
    addItemService = new AddItemService();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockOrderId = 'order-123';
    const mockProduct = {
      id: 1,
      name: 'Xis Churrasco',
      price: 25.0,
      stock: 10,
      available: true,
    };

    it('deve validar se o pedido existe', async () => {
      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        addItemService.execute({
          orderId: 'non-existent-order',
          productId: 1,
          amount: 1,
        })
      ).rejects.toThrow('Pedido com ID non-existent-order não encontrado');
    });

    it('deve validar se o produto existe', async () => {
      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        addItemService.execute({
          orderId: mockOrderId,
          productId: 999,
          amount: 1,
        })
      ).rejects.toThrow('Produto com ID 999 não encontrado');
    });

    it('deve validar se o produto está disponível', async () => {
      const unavailableProduct = {
        ...mockProduct,
        available: false,
      };

      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(
        unavailableProduct
      );

      await expect(
        addItemService.execute({
          orderId: mockOrderId,
          productId: 1,
          amount: 1,
        })
      ).rejects.toThrow('não está disponível');
    });

    it('deve validar estoque suficiente', async () => {
      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct
      );

      await expect(
        addItemService.execute({
          orderId: mockOrderId,
          productId: 1,
          amount: 100, // Mais que o estoque disponível
        })
      ).rejects.toThrow('Estoque insuficiente');
    });

    it('deve adicionar item quando todas as validações passam', async () => {
      const mockOrderItem = {
        id: 'item-123',
        orderId: mockOrderId,
        productId: 1,
        amount: 2,
        product: mockProduct,
      };

      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct
      );
      (prismaClient.$transaction as jest.Mock).mockResolvedValue(mockOrderItem);

      const result = await addItemService.execute({
        orderId: mockOrderId,
        productId: 1,
        amount: 2,
      });

      expect(result).toEqual(mockOrderItem);
      expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});

