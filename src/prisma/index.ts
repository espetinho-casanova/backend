import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
});

export { prismaClient };
export default prismaClient;