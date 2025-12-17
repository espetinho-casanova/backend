import prismaClient from "../../prisma";

class DetailUserService {
  async execute(userId: string) {
    const user = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
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
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    resource: true,
                    action: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return user;
  }
}

export { DetailUserService };
