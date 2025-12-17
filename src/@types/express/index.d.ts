import { User, Role, Permission } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      user?: User & {
        role: (Role & {
          permissions: Array<{
            permission: Permission;
          }>;
        }) | null;
      };
    }
  }
}

export {};
