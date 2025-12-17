import prismaClient from "../../prisma";

class ListWaitingQueueService {
  async execute() {
    const waitingQueue = await prismaClient.waitingQueue.findMany({
      orderBy: {
        createdAt: "asc", // Mais antiga primeiro
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return waitingQueue;
  }
}

export { ListWaitingQueueService };

