import { prismaClient } from "../../prisma";

class ListRolesService {
  async execute() {
    const roles = await prismaClient.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return roles;
  }
}

export { ListRolesService };

