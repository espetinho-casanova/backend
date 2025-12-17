import prismaClient from "../../prisma";

interface ToggleItemTakenToTableRequest {
  itemId: string;
  takenToTable: boolean;
}

class ToggleItemTakenToTableService {
  async execute({ itemId, takenToTable }: ToggleItemTakenToTableRequest) {
    // Verificar se o item existe
    const item = await prismaClient.orderItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      throw new Error("Item não encontrado");
    }

    // Atualizar o status de entrega
    const updatedItem = await prismaClient.orderItem.update({
      where: {
        id: itemId,
      },
      data: {
        takenToTable,
      },
    });

    return updatedItem;
  }
}

export { ToggleItemTakenToTableService };

