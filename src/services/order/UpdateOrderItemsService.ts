import prismaClient from "../../prisma";

interface OrderItemRequest {
    productId: number;
    amount: number;
    meatChoiceId?: number;
    meatPoint?: string;
    removals?: string[];
    additions?: number[];
    notes?: string;
}

interface UpdateOrderItemsRequest {
    orderId: string;
    items: OrderItemRequest[];
}

/**
 * Serviço para atualização de itens de um pedido
 * 
 * @description
 * Este serviço atualiza todos os itens de um pedido de forma atômica:
 * - Aumenta estoque dos itens antigos que serão removidos
 * - Valida estoque dos novos itens antes de adicionar
 * - Diminui estoque dos novos itens
 * - Tudo dentro de uma única transação
 */
class UpdateOrderItemsService {
    /**
     * Atualiza todos os itens de um pedido existente
     * 
     * @param orderId - ID do pedido a ser atualizado
     * @param items - Array de novos itens para o pedido
     * @returns Pedido atualizado com todos os relacionamentos
     * @throws Error se o pedido não existir ou houver problema de estoque
     */
    async execute({ orderId, items }: UpdateOrderItemsRequest) {
        // Validar se o pedido existe
        const orderExists = await prismaClient.order.findUnique({
            where: { id: orderId },
        });

        if (!orderExists) {
            throw new Error(`Pedido com ID ${orderId} não encontrado`);
        }

        // Validar produtos e estoque ANTES de atualizar
        if (items && items.length > 0) {
            // Coletar todos os IDs de produtos únicos para validação em batch
            const productIds = new Set<number>();
            const meatChoiceIds = new Set<number>();

            for (const item of items) {
                productIds.add(item.productId);
                if (item.meatChoiceId) {
                    meatChoiceIds.add(item.meatChoiceId);
                }
            }

            // Buscar todos os produtos de uma vez (otimização: 1 query ao invés de N)
            const allProductIds = Array.from(new Set([...productIds, ...meatChoiceIds]));
            const products = await prismaClient.product.findMany({
                where: { id: { in: allProductIds } },
            });

            // Criar mapa para acesso O(1) aos produtos
            const productsMap = new Map(products.map(p => [p.id, p]));

            // Validar cada item
            for (const item of items) {
                const product = productsMap.get(item.productId);

                if (!product) {
                    throw new Error(`Produto com ID ${item.productId} não encontrado`);
                }

                if (!product.available) {
                    throw new Error(`Produto "${product.name}" não está disponível`);
                }

                if (product.stock < item.amount) {
                    throw new Error(
                        `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, Solicitado: ${item.amount}`
                    );
                }

                if (item.meatChoiceId) {
                    const meatChoice = productsMap.get(item.meatChoiceId);

                    if (!meatChoice) {
                        throw new Error(`Espetinho com ID ${item.meatChoiceId} não encontrado`);
                    }

                    if (!meatChoice.canBeUsedInSandwich) {
                        throw new Error(
                            `O espetinho "${meatChoice.name}" não pode ser usado no lanche (Xis/Ká)`
                        );
                    }

                    if (!meatChoice.available) {
                        throw new Error(`Espetinho "${meatChoice.name}" não está disponível`);
                    }

                    if (meatChoice.stock < item.amount) {
                        throw new Error(
                            `Estoque insuficiente para espetinho "${meatChoice.name}". Disponível: ${meatChoice.stock}, Solicitado: ${item.amount}`
                        );
                    }
                }
            }
        }

        // Usar transação para garantir que tudo seja feito de forma atômica
        const order = await prismaClient.$transaction(async (tx) => {
            // 1. Buscar itens antigos ANTES de deletar para aumentar estoque
            const oldItems = await tx.orderItem.findMany({
                where: { orderId },
                include: {
                    product: true,
                    meatChoice: true,
                },
            });

            // 2. Aumentar estoque dos itens antigos que serão removidos
            for (const oldItem of oldItems) {
                await this.increaseProductStock(oldItem.productId, oldItem.amount, tx);
                if (oldItem.meatChoiceId) {
                    await this.increaseProductStock(oldItem.meatChoiceId, oldItem.amount, tx);
                }
            }

            // 3. Remover todos os itens antigos (os OrderItemAddon serão removidos automaticamente pelo cascade)
            await tx.orderItem.deleteMany({
                where: { orderId },
            });

            // 4. Criar novos itens
            if (items && items.length > 0) {
                await tx.orderItem.createMany({
                    data: items.map((item) => ({
                        orderId,
                        productId: item.productId,
                        amount: item.amount,
                        meatChoiceId: item.meatChoiceId,
                        meatPoint: item.meatPoint,
                        removals: item.removals ?? [],
                        notes: item.notes,
                    })),
                });

                // 5. Buscar os itens criados para adicionar os adicionais
                const createdItems = await tx.orderItem.findMany({
                    where: { orderId },
                    orderBy: { createdAt: "asc" },
                });

                // 6. Adicionar os adicionais para cada item
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const createdItem = createdItems[i];

                    if (item.additions && item.additions.length > 0 && createdItem) {
                        await tx.orderItemAddon.createMany({
                            data: item.additions.map((addonId) => ({
                                orderItemId: createdItem.id,
                                addonId: addonId,
                            })),
                        });
                    }
                }

                // 7. Diminuir estoque dos novos itens
                for (const item of items) {
                    await this.decreaseProductStock(item.productId, item.amount, tx);
                    if (item.meatChoiceId) {
                        await this.decreaseProductStock(item.meatChoiceId, item.amount, tx);
                    }
                }
            }

            // 8. Retornar o pedido atualizado com todos os relacionamentos
            return await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: {
                            product: true,
                            meatChoice: true,
                            additions: {
                                include: {
                                    addon: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        return order;
    }

    // Aumenta o estoque de um produto e reabilita se necessário
    private async increaseProductStock(productId: number, quantity: number, tx?: any) {
        const prisma = tx || prismaClient;

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return;
        }

        // Calcula novo estoque
        const newStock = product.stock + quantity;

        // Atualiza o estoque
        await prisma.product.update({
            where: { id: productId },
            data: {
                stock: newStock,
                // Reabilita o produto se o estoque voltou a ser maior que 0
                available: newStock > 0,
            },
        });
    }

    // Diminui o estoque de um produto e desabilita se chegar a 0
    private async decreaseProductStock(productId: number, quantity: number, tx?: any) {
        const prisma = tx || prismaClient;

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return;
        }

        // Validar estoque antes de diminuir
        if (product.stock < quantity) {
            throw new Error(`Estoque insuficiente para o produto ID ${productId}. Disponível: ${product.stock}, Solicitado: ${quantity}`);
        }

        // Calcula novo estoque
        const newStock = product.stock - quantity;

        // Atualiza o estoque
        await prisma.product.update({
            where: { id: productId },
            data: {
                stock: newStock,
                // Se estoque chegou a 0, desabilita o produto
                available: newStock > 0,
            },
        });
    }
}

export { UpdateOrderItemsService };

