import { CreateOrderService } from '../CreateOrderService';
import prismaClient from '../../../prisma';
import { OrderStatus } from '../../../utils/constants';

// Mock do Prisma Client
jest.mock('../../../prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('CreateOrderService', () => {
  let createOrderService: CreateOrderService;

  beforeEach(() => {
    createOrderService = new CreateOrderService();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockUserId = 'user-123';
    const mockProduct = {
      id: 1,
      name: 'Xis Churrasco',
      price: 25.0,
      stock: 10,
      available: true,
      canBeUsedInSandwich: false,
    };

    it('deve criar um pedido vazio com sucesso', async () => {
      const mockOrder = {
        id: 'order-123',
        table: 1,
        name: 'Cliente Teste',
        status: OrderStatus.DRAFT,
        draft: true,
        userId: mockUserId,
        items: [],
      };

      (prismaClient.$transaction as jest.Mock).mockResolvedValue(mockOrder);

      const result = await createOrderService.execute({
        table: 1,
        name: 'Cliente Teste',
        userId: mockUserId,
      });

      expect(result).toEqual(mockOrder);
      expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve validar se o produto existe antes de criar pedido', async () => {
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        createOrderService.execute({
          userId: mockUserId,
          items: [
            {
              productId: 999,
              amount: 1,
            },
          ],
        })
      ).rejects.toThrow('Produto com ID 999 não encontrado');
    });

    it('deve validar se o produto está disponível', async () => {
      const unavailableProduct = {
        ...mockProduct,
        available: false,
      };

      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        unavailableProduct,
      ]);

      await expect(
        createOrderService.execute({
          userId: mockUserId,
          items: [
            {
              productId: 1,
              amount: 1,
            },
          ],
        })
      ).rejects.toThrow('não está disponível');
    });

    it('deve validar estoque suficiente antes de criar pedido', async () => {
      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);

      await expect(
        createOrderService.execute({
          userId: mockUserId,
          items: [
            {
              productId: 1,
              amount: 100, // Mais que o estoque disponível (10)
            },
          ],
        })
      ).rejects.toThrow('Estoque insuficiente');
    });

    it('deve criar pedido com itens quando estoque é suficiente', async () => {
      const mockOrder = {
        id: 'order-123',
        table: 1,
        name: 'Cliente Teste',
        status: OrderStatus.DRAFT,
        draft: true,
        userId: mockUserId,
        items: [
          {
            id: 'item-1',
            productId: 1,
            amount: 2,
            product: mockProduct,
          },
        ],
      };

      (prismaClient.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);
      (prismaClient.$transaction as jest.Mock).mockResolvedValue(mockOrder);

      const result = await createOrderService.execute({
        table: 1,
        name: 'Cliente Teste',
        userId: mockUserId,
        items: [
          {
            productId: 1,
            amount: 2,
          },
        ],
      });

      expect(result).toEqual(mockOrder);
      expect(prismaClient.product.findMany).toHaveBeenCalled();
      expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});

