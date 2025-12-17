import { prismaClient } from "../../prisma";

class ListUsersService {
  async execute() {
    const users = await prismaClient.user.findMany({
      select: {
        id: true,
        name: true,
        login: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }
}

export { ListUsersService };

