import prismaClient from "../prisma";

interface ValidateMeatChoiceRequest {
  meatChoiceId: number;
  amount: number;
  productName?: string; // Nome do produto principal para mensagens de erro
}

/**
 * Valida se o espetinho escolhido pode ser usado no lanche
 * @param meatChoiceId ID do espetinho escolhido
 * @param amount Quantidade necessária
 * @param productName Nome do produto principal (opcional, para mensagens)
 * @returns O produto do espetinho validado
 * @throws Error se a validação falhar
 */
export async function validateMeatChoice({
  meatChoiceId,
  amount,
  productName,
}: ValidateMeatChoiceRequest) {
  const meatChoice = await prismaClient.product.findUnique({
    where: { id: meatChoiceId },
  });

  if (!meatChoice) {
    throw new Error(`Espetinho com ID ${meatChoiceId} não encontrado`);
  }

  if (!meatChoice.canBeUsedInSandwich) {
    throw new Error(
      `O espetinho "${meatChoice.name}" não pode ser usado no lanche (Xis/Ká)`
    );
  }

  if (!meatChoice.available) {
    throw new Error(`Espetinho "${meatChoice.name}" não está disponível`);
  }

  if (meatChoice.stock < amount) {
    throw new Error(
      `Estoque insuficiente para espetinho "${meatChoice.name}". Disponível: ${meatChoice.stock}, Solicitado: ${amount}`
    );
  }

  return meatChoice;
}

/**
 * Valida múltiplos meatChoices de uma vez usando findMany
 * @param meatChoiceIds Array de IDs de espetinhos
 * @param amounts Map de quantidade por meatChoiceId
 * @returns Map de produtos validados
 */
export async function validateMeatChoicesBatch(
  meatChoiceIds: number[],
  amounts: Map<number, number>
): Promise<Map<number, any>> {
  if (meatChoiceIds.length === 0) {
    return new Map();
  }

  const products = await prismaClient.product.findMany({
    where: { id: { in: meatChoiceIds } },
  });

  const productsMap = new Map(products.map((p) => [p.id, p]));

  // Validar cada espetinho
  for (const meatChoiceId of meatChoiceIds) {
    const meatChoice = productsMap.get(meatChoiceId);
    const amount = amounts.get(meatChoiceId) || 0;

    if (!meatChoice) {
      throw new Error(`Espetinho com ID ${meatChoiceId} não encontrado`);
    }

    if (!meatChoice.canBeUsedInSandwich) {
      throw new Error(
        `O espetinho "${meatChoice.name}" não pode ser usado no lanche (Xis/Ká)`
      );
    }

    if (!meatChoice.available) {
      throw new Error(`Espetinho "${meatChoice.name}" não está disponível`);
    }

    if (meatChoice.stock < amount) {
      throw new Error(
        `Estoque insuficiente para espetinho "${meatChoice.name}". Disponível: ${meatChoice.stock}, Solicitado: ${amount}`
      );
    }
  }

  return productsMap;
}

