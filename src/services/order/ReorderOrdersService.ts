import prismaClient from "../../prisma";

interface ReorderOrdersRequest {
  orderIds: string[]; // Array de IDs na ordem desejada
}

/**
 * Serviço para reordenar pedidos
 * 
 * @description
 * Atualiza o updatedAt dos pedidos na ordem especificada para manter a sequência.
 * O pedido que aparece primeiro no array terá o updatedAt mais antigo.
 */
class ReorderOrdersService {
  async execute({ orderIds }: ReorderOrdersRequest) {
    // Atualizar updatedAt de cada pedido na ordem especificada
    // Usamos um pequeno delay entre atualizações para garantir ordem correta
    for (let i = 0; i < orderIds.length; i++) {
      const orderId = orderIds[i];
      
      // Pequeno delay para garantir que os timestamps sejam diferentes
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      
      // Atualizar o pedido para triggerar updatedAt
      // Usamos uma atualização que sempre funciona (atualizar o próprio updatedAt via SQL)
      await prismaClient.$executeRaw`
        UPDATE orders 
        SET "updatedAt" = NOW() 
        WHERE id = ${orderId}
      `;
    }

    return { success: true };
  }
}

export { ReorderOrdersService };

