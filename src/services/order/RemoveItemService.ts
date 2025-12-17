import prismaClient from "../../prisma";

interface ItemRequest {
  orderItemId: string;
}

class RemoveItemService {
  async execute({ orderItemId }: ItemRequest) {
    // Usar transação atômica para remover item e aumentar estoque
    const deletedItem = await prismaClient.$transaction(async (tx) => {
      // Buscar o item antes de deletar para ter as informações de produto e quantidade
      const item = await tx.orderItem.findUnique({
        where: { id: orderItemId },
        include: {
          product: true,
          meatChoice: true,
        },
      });

      if (!item) {
        throw new Error(`Item do pedido com ID ${orderItemId} não encontrado`);
      }

      // Aumentar estoque do produto principal
      await this.increaseProductStock(item.productId, item.amount, tx);

      // Aumentar estoque do espetinho (se houver)
      if (item.meatChoiceId) {
        await this.increaseProductStock(item.meatChoiceId, item.amount, tx);
      }

      // Deletar o item do pedido
      // Os OrderItemAddon relacionados serão deletados automaticamente devido ao onDelete: Cascade
      const deleted = await tx.orderItem.delete({
        where: {
          id: orderItemId,
        },
      });

      return deleted;
    });

    return deletedItem;
  }

  // Aumenta o estoque de um produto e reabilita se necessário
  private async increaseProductStock(productId: number, quantity: number, tx?: any) {
    const prisma = tx || prismaClient;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return;
    }

    // Calcula novo estoque
    const newStock = product.stock + quantity;

    // Atualiza o estoque
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        // Reabilita o produto se o estoque voltou a ser maior que 0
        available: newStock > 0,
      },
    });
  }
}

export { RemoveItemService };
