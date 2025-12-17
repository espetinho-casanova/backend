import prismaClient from "../../prisma";

interface UpdateOrderRequest {
  orderId: string;
  table?: string;
}

/**
 * Serviço para atualizar informações básicas de um pedido
 * 
 * @description
 * Atualiza apenas o campo table de um pedido existente.
 * Valida se o pedido existe antes de atualizar.
 */
class UpdateOrderService {
  /**
   * Atualiza informações básicas de um pedido
   * 
   * @param orderId - ID do pedido a ser atualizado
   * @param table - Nova mesa/nome (opcional)
   * @returns Pedido atualizado
   * @throws Error se o pedido não existir
   */
  async execute({ orderId, table }: UpdateOrderRequest) {
    // Validar se o pedido existe antes de atualizar
    const orderExists = await prismaClient.order.findUnique({
      where: { id: orderId },
    });

    if (!orderExists) {
      throw new Error(`Pedido com ID ${orderId} não encontrado`);
    }

    const updateData: { table?: string } = {};

    if (table !== undefined) {
      updateData.table = table;
    }

    const order = await prismaClient.order.update({
      where: {
        id: orderId,
      },
      data: updateData,
    });

    return order;
  }
}

export { UpdateOrderService };

