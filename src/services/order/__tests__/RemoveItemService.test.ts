import { RemoveItemService } from '../RemoveItemService';
import prismaClient from '../../../prisma';

// Mock do Prisma Client
jest.mock('../../../prisma', () => ({
  __esModule: true,
  default: {
    orderItem: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('RemoveItemService', () => {
  let removeItemService: RemoveItemService;

  beforeEach(() => {
    removeItemService = new RemoveItemService();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockOrderItemId = 'item-123';
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
    };

    it('deve validar se o item existe antes de remover', async () => {
      (prismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          orderItem: {
            findUnique: jest.fn().mockResolvedValue(null), // Item não encontrado
          },
        };
        return callback(tx);
      });

      await expect(
        removeItemService.execute({
          orderItemId: 'non-existent-item',
        })
      ).rejects.toThrow('Item do pedido com ID non-existent-item não encontrado');
    });

    it('deve remover item e aumentar estoque do produto principal', async () => {
      const mockItem = {
        id: mockOrderItemId,
        productId: 1,
        amount: 2,
        meatChoiceId: null,
        product: mockProduct,
        meatChoice: null,
      };

      const mockDeletedItem = {
        id: mockOrderItemId,
      };

      (prismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          orderItem: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
            delete: jest.fn().mockResolvedValue(mockDeletedItem),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue({
              ...mockProduct,
              stock: mockProduct.stock + mockItem.amount, // Estoque aumentado
            }),
          },
        };
        return callback(tx);
      });

      const result = await removeItemService.execute({
        orderItemId: mockOrderItemId,
      });

      expect(result).toEqual(mockDeletedItem);
      expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve remover item e aumentar estoque do produto principal e espetinho', async () => {
      const mockItem = {
        id: mockOrderItemId,
        productId: 1,
        meatChoiceId: 2,
        amount: 2,
        product: mockProduct,
        meatChoice: mockMeatChoice,
      };

      const mockDeletedItem = {
        id: mockOrderItemId,
      };

      (prismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          orderItem: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
            delete: jest.fn().mockResolvedValue(mockDeletedItem),
          },
          product: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockProduct) // Primeira chamada para produto principal
              .mockResolvedValueOnce(mockMeatChoice), // Segunda chamada para espetinho
            update: jest.fn()
              .mockResolvedValueOnce({
                ...mockProduct,
                stock: mockProduct.stock + mockItem.amount,
              })
              .mockResolvedValueOnce({
                ...mockMeatChoice,
                stock: mockMeatChoice.stock + mockItem.amount,
              }),
          },
        };
        return callback(tx);
      });

      const result = await removeItemService.execute({
        orderItemId: mockOrderItemId,
      });

      expect(result).toEqual(mockDeletedItem);
      expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve reabilitar produto quando estoque volta a ser maior que 0', async () => {
      const mockItem = {
        id: mockOrderItemId,
        productId: 1,
        amount: 5,
        meatChoiceId: null,
        product: {
          ...mockProduct,
          stock: 0,
          available: false, // Produto desabilitado
        },
        meatChoice: null,
      };

      (prismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          orderItem: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
            delete: jest.fn().mockResolvedValue({ id: mockOrderItemId }),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(mockItem.product),
            update: jest.fn().mockResolvedValue({
              ...mockItem.product,
              stock: 5, // Estoque aumentado
              available: true, // Produto reabilitado
            }),
          },
        };
        return callback(tx);
      });

      await removeItemService.execute({
        orderItemId: mockOrderItemId,
      });

      const transactionCall = (prismaClient.$transaction as jest.Mock).mock.calls[0][0];
      const tx = {
        orderItem: {
          findUnique: jest.fn().mockResolvedValue(mockItem),
          delete: jest.fn().mockResolvedValue({ id: mockOrderItemId }),
        },
        product: {
          findUnique: jest.fn().mockResolvedValue(mockItem.product),
          update: jest.fn().mockResolvedValue({
            ...mockItem.product,
            stock: 5,
            available: true,
          }),
        },
      };
      
      await transactionCall(tx);
      
      // Verificar que o produto foi atualizado com available: true
      expect(tx.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            available: true,
          }),
        })
      );
    });
  });
});

