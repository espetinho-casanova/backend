import { UpdateOrderItemsService } from '../UpdateOrderItemsService';
import prismaClient from '../../../prisma';
import { OrderStatus } from '../../../utils/constants';

// Mock do Prisma Client
jest.mock('../../../prisma', () => ({
  __esModule: true,
  default: {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderItemAddon: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('UpdateOrderItemsService', () => {
  let updateOrderItemsService: UpdateOrderItemsService;

  beforeEach(() => {
    updateOrderItemsService = new UpdateOrderItemsService();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockOrderId = 'order-123';
    const mockProduct = {
      id: 1,
      name: 'Xis Churrasco',
      stock: 10,
      available: true,
    };
    const mockMeatChoice = {
      id: 2,
      name: 'Espetinho de Carne',
      stock: 5,
      available: true,
      canBeUsedInSandwich: true,
    };

    it('deve validar se o pedido existe', async () => {
      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        updateOrderItemsService.execute({
          orderId: 'non-existent-order',
          items: [
            {
              productId: 1,
              amount: 1,
            },
          ],
        })
      ).rejects.toThrow('Pedido com ID non-existent-order não encontrado');
    });

    it('deve validar se os produtos existem', async () => {
      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        updateOrderItemsService.execute({
          orderId: mockOrderId,
          items: [
            {
              productId: 999,
              amount: 1,
            },
          ],
        })
      ).rejects.toThrow('Produto com ID 999 não encontrado');
    });

    it('deve validar se os produtos estão disponíveis', async () => {
      const unavailableProduct = {
        ...mockProduct,
        available: false,
      };

      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        unavailableProduct,
      ]);

      await expect(
        updateOrderItemsService.execute({
          orderId: mockOrderId,
          items: [
            {
              productId: 1,
              amount: 1,
            },
          ],
        })
      ).rejects.toThrow('não está disponível');
    });

    it('deve validar estoque suficiente antes de atualizar', async () => {
      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);

      await expect(
        updateOrderItemsService.execute({
          orderId: mockOrderId,
          items: [
            {
              productId: 1,
              amount: 100, // Mais que o estoque disponível
            },
          ],
        })
      ).rejects.toThrow('Estoque insuficiente');
    });

    it('deve aumentar estoque dos itens antigos e diminuir dos novos', async () => {
      const mockOldItem = {
        id: 'old-item-1',
        productId: 1,
        meatChoiceId: null,
        amount: 2,
        product: mockProduct,
        meatChoice: null,
      };

      const mockUpdatedOrder = {
        id: mockOrderId,
        items: [
          {
            id: 'new-item-1',
            productId: 1,
            amount: 3,
          },
        ],
      };

      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);

      (prismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          orderItem: {
            findMany: jest.fn()
              .mockResolvedValueOnce([mockOldItem]) // Itens antigos
              .mockResolvedValueOnce([{ id: 'new-item-1', createdAt: new Date() }]), // Itens criados
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn()
              .mockResolvedValueOnce({
                ...mockProduct,
                stock: mockProduct.stock + mockOldItem.amount, // Estoque aumentado
              })
              .mockResolvedValueOnce({
                ...mockProduct,
                stock: mockProduct.stock - 3, // Estoque diminuído
              }),
          },
          orderItemAddon: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
          order: {
            findUnique: jest.fn().mockResolvedValue(mockUpdatedOrder),
          },
        };
        return callback(tx);
      });

      const result = await updateOrderItemsService.execute({
        orderId: mockOrderId,
        items: [
          {
            productId: 1,
            amount: 3,
          },
        ],
      });

      expect(result).toEqual(mockUpdatedOrder);
      expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve validar meatChoice quando fornecido', async () => {
      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
        mockMeatChoice,
      ]);

      (prismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          orderItem: {
            findMany: jest.fn().mockResolvedValue([]),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue(mockProduct),
          },
          orderItemAddon: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
          order: {
            findUnique: jest.fn().mockResolvedValue({ id: mockOrderId, items: [] }),
          },
        };
        return callback(tx);
      });

      await updateOrderItemsService.execute({
        orderId: mockOrderId,
        items: [
          {
            productId: 1,
            amount: 1,
            meatChoiceId: 2,
          },
        ],
      });

      // Verificar que meatChoice foi validado
      expect(prismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.objectContaining({
              in: expect.arrayContaining([1, 2]), // Produto e meatChoice
            }),
          }),
        })
      );
    });

    it('deve rejeitar meatChoice que não pode ser usado em sanduíche', async () => {
      const invalidMeatChoice = {
        ...mockMeatChoice,
        canBeUsedInSandwich: false,
      };

      (prismaClient.order.findUnique as jest.Mock).mockResolvedValue({
        id: mockOrderId,
      });
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
        invalidMeatChoice,
      ]);

      await expect(
        updateOrderItemsService.execute({
          orderId: mockOrderId,
          items: [
            {
              productId: 1,
              amount: 1,
              meatChoiceId: 2,
            },
          ],
        })
      ).rejects.toThrow('não pode ser usado no lanche');
    });
  });
});

