import prismaClient from "../../prisma";

interface UpdateAddonRequest {
  id: number;
  name: string;
  price: number;
}

class UpdateAddonService {
  async execute({ id, name, price }: UpdateAddonRequest) {
    // Verificar se o adicional existe
    const addonExists = await prismaClient.addon.findUnique({
      where: { id },
    });

    if (!addonExists) {
      throw new Error("Adicional não encontrado");
    }

    // Verificar se já existe outro adicional com o mesmo nome
    const addonWithSameName = await prismaClient.addon.findFirst({
      where: {
        name: name,
        id: { not: id }, // Excluir o próprio adicional da busca
      },
    });

    if (addonWithSameName) {
      throw new Error("Adicional com este nome já existe!");
    }

    // Atualizar o adicional
    const addon = await prismaClient.addon.update({
      where: { id },
      data: {
        name,
        price,
      },
    });

    return addon;
  }
}

export { UpdateAddonService };

