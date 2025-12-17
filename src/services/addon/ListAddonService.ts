import prismaClient from "../../prisma";

class ListAddonService {
  async execute() {
    const addons = await prismaClient.addon.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return addons;
  }
}

export { ListAddonService };

