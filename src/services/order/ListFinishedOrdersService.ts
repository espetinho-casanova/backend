import prismaClient from "../../prisma";
import { PriceCalculator } from "../../utils/priceCalculator";
import { OrderStatus } from "../../utils/constants";

class ListFinishedOrdersService {
  async execute() {
    const orders = await prismaClient.order.findMany({
      where: {
        draft: false,
        status: OrderStatus.FINISHED,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true,
                  },
                },
                addons: {
                  include: {
                    addon: true,
                  },
                },
              },
            },
            meatChoice: true,
            additions: {
              include: {
                addon: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
    });

    const ordersWithDetails = orders.map((order) => {
      const orderItems = order.items.map((item) => {
        const itemTotal = PriceCalculator.calculateItemTotal(item);

        return {
          id: item.id,
          amount: item.amount,
          orderId: item.orderId,
          productId: item.productId,
          removals: item.removals,
          notes: item.notes,
          meatPoint: item.meatPoint,
          takenToTable: item.takenToTable,
          itemTotal: itemTotal,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            description: item.product.description,
            banner: item.product.banner,
            available: item.product.available,
            categoryId: item.product.categoryId,
            ingredients: item.product.ingredients.map((pi) => ({
              id: pi.ingredient.id,
              name: pi.ingredient.name,
              image: pi.ingredient.image,
              nonRemovable: pi.ingredient.nonRemovable,
            })),
            allowedAddons: item.product.addons.map((pa) => ({
              id: pa.addon.id,
              name: pa.addon.name,
              price: pa.addon.price,
              image: pa.addon.image,
            })),
          },
          meatChoice: item.meatChoice
            ? {
                id: item.meatChoice.id,
                name: item.meatChoice.name,
                price: item.meatChoice.price,
                banner: item.meatChoice.banner,
              }
            : null,
          additions: item.additions.map((orderAddon) => ({
            id: orderAddon.id,
            addon: {
              id: orderAddon.addon.id,
              name: orderAddon.addon.name,
              price: orderAddon.addon.price,
              image: orderAddon.addon.image,
            },
          })),
        };
      });

      const orderTotal = order.items.length > 0
        ? PriceCalculator.calculateOrderTotal(order.items)
        : 0;

      return {
        id: order.id,
        table: order.table,
        status: order.status,
        draft: order.draft,
        name: order.table,
        userId: order.userId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        details: {
          order: {
            id: order.id,
            table: order.table,
            status: order.status,
            draft: order.draft,
            name: order.table,
            userId: order.userId,
            orderTotal: orderTotal,
            orderTotalFormatted: PriceCalculator.formatPrice(orderTotal),
          },
          orderItems: orderItems,
        },
      };
    });

    return ordersWithDetails;
  }
}

export { ListFinishedOrdersService };

