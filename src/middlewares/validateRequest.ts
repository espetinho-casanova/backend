import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          error: "Dados de entrada inválidos",
          details: errors,
        });
      }

      return res.status(500).json({
        error: "Erro interno na validação",
      });
    }
  };
}

