import prismaClient from "../../prisma";

interface CreateWaitingQueueRequest {
  name: string;
  userId: string;
}

class CreateWaitingQueueService {
  async execute({ name, userId }: CreateWaitingQueueRequest) {
    if (!name || name.trim().length === 0) {
      throw new Error("Nome é obrigatório");
    }

    const waitingQueue = await prismaClient.waitingQueue.create({
      data: {
        name: name.trim(),
        userId,
      },
    });

    return waitingQueue;
  }
}

export { CreateWaitingQueueService };

