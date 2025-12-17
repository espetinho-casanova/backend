import prismaClient from "../../prisma";

interface DeleteWaitingQueueRequest {
  id: string;
}

class DeleteWaitingQueueService {
  async execute({ id }: DeleteWaitingQueueRequest) {
    const waitingQueue = await prismaClient.waitingQueue.findUnique({
      where: {
        id,
      },
    });

    if (!waitingQueue) {
      throw new Error("Pessoa não encontrada na fila");
    }

    await prismaClient.waitingQueue.delete({
      where: {
        id,
      },
    });

    return { success: true };
  }
}

export { DeleteWaitingQueueService };

