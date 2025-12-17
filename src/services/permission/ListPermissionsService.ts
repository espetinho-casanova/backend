import { prismaClient } from "../../prisma";

class ListPermissionsService {
  async execute() {
    const permissions = await prismaClient.permission.findMany({
      orderBy: [
        { resource: "asc" },
        { action: "asc" },
      ],
    });

    // Agrupar por resource
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return {
      all: permissions,
      grouped,
    };
  }
}

export { ListPermissionsService };

