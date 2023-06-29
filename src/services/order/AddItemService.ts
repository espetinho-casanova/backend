import prismaClient from "../../prisma";

interface ItemRequest {
  amount: number;
  orderId: string;
  productId: string;
  client: string;
}

class AddItemService {
  async execute({ amount, orderId, productId, client }: ItemRequest) {
    const order = await prismaClient.orderItem.create({
      data: {
        orderId: orderId,
        productId: productId,
        amount: amount,
        client: client,
      },
    });

    return order;
  }
}

export { AddItemService };
