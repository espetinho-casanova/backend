/**
 * Utilitário para cálculo de preços dos pedidos
 * 
 * REGRA DE NEGÓCIO IMPORTANTE:
 * - O preço do produto principal (ex: Xis Churrasco) JÁ INCLUI a carne escolhida
 * - O meatChoice é obrigatório para saber qual espeto vai dentro, mas NÃO é cobrado separadamente
 * - Apenas os adicionais (additions) são somados ao preço base
 */

interface OrderItemWithRelations {
    amount: number;
    product: {
        price: number;
    };
    meatChoice?: {
        price: number;
    } | null;
    additions?: Array<{
        addon: {
            price: number;
        };
    }>;
}

export class PriceCalculator {
    /**
     * Calcula o preço total de um item do pedido
     * 
     * @param item - O item do pedido com seus relacionamentos
     * @returns O preço total do item (base + adicionais) * quantidade
     * 
     * @example
     * // Xis Churrasco (R$ 25) + Ovo Extra (R$ 3) + Bacon (R$ 5) = R$ 33
     * const item = {
     *   amount: 1,
     *   product: { price: 25.00 },
     *   meatChoice: { price: 15.00 }, // IGNORADO - já está incluído no Xis
     *   additions: [
     *     { product: { price: 3.00 } },  // Ovo
     *     { product: { price: 5.00 } }   // Bacon
     *   ]
     * };
     * const total = PriceCalculator.calculateItemTotal(item); // 33.00
     */
    static calculateItemTotal(item: OrderItemWithRelations): number {
        // 1. Preço Base: Produto Principal (ex: Xis Churrasco)
        const basePrice = item.product.price;

        // 2. Carne Escolhida: IGNORADA no cálculo (já está embutida no preço do Xis)
        // O meatChoice existe apenas para registro de qual espeto vai dentro do lanche
        const meatPrice = 0;

        // 3. Adicionais: Somados normalmente (ex: Ovo Extra, Bacon Extra)
        const additionsPrice = item.additions
            ? item.additions.reduce((sum, addon) => sum + addon.addon.price, 0)
            : 0;

        // 4. Total do Item = (Base + Adicionais) * Quantidade
        const itemTotal = (basePrice + meatPrice + additionsPrice) * item.amount;

        return itemTotal;
    }

    /**
     * Calcula o preço total de um pedido completo
     * 
     * @param items - Array de itens do pedido com seus relacionamentos
     * @returns O preço total do pedido (soma de todos os itens)
     * 
     * @example
     * const orderTotal = PriceCalculator.calculateOrderTotal(order.items);
     */
    static calculateOrderTotal(items: OrderItemWithRelations[]): number {
        return items.reduce((total, item) => {
            return total + this.calculateItemTotal(item);
        }, 0);
    }

    /**
     * Formata o preço em reais brasileiros
     * 
     * @param price - O preço a ser formatado
     * @returns String formatada (ex: "R$ 25,00")
     */
    static formatPrice(price: number): string {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price);
    }
}

