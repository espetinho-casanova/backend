import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../prisma";

export function hasPermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      if (!user.role) {
        return res.status(403).json({
          error: "Usuário não possui cargo. Entre em contato com o administrador."
        });
      }

      const hasPermission = user.role.permissions.some(
        (rp) => rp.permission.name === permissionName
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: "Você não tem permissão para realizar esta ação"
        });
      }

      req.user = user;
      return next();
    } catch (err: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Erro ao verificar permissões:", err);
      }
      if (err.code === "P2021" || err.code === "P2001" || err.message?.includes("does not exist")) {
        return res.status(500).json({
          error: "Banco de dados não configurado. Execute as migrations primeiro."
        });
      }
      return res.status(500).json({
        error: "Erro ao verificar permissões",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  };
}

