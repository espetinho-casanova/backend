import prismaClient from "../../prisma";

class ListOrdersService {
  async execute() {
    const orders = await prismaClient.order.findMany({
      where: {
        draft: false,
        status: 1,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return orders;
  }
}

export { ListOrdersService };
