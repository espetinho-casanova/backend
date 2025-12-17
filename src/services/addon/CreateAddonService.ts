import prismaClient from "../../prisma";

interface CreateAddonRequest {
  name: string;
  price: number;
  image?: string;
}

class CreateAddonService {
  async execute({ name, price, image }: CreateAddonRequest) {
    const addon = await prismaClient.addon.create({
      data: {
        name: name,
        price: price,
        image: image,
      },
    });

    return addon;
  }
}

export { CreateAddonService };

