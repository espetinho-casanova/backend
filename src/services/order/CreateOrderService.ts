import prismaClient from "../../prisma";

interface OrderRequest {
  table: number;
  name: string;
  status: number;
  draft: boolean;
  userId: string;
}

class CreateOrderService {
  async execute({ table, name, status, draft, userId }: OrderRequest) {
    const order = await prismaClient.order.create({
      data: {
        table: table,
        name: name,
        status: status,
        draft: draft,
        userId: userId,
      },
    });

    return order;
  }
}

export { CreateOrderService };
