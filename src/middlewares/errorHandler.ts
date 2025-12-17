import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProduction = process.env.NODE_ENV === "production";

  if (err instanceof ZodError) {
    if (!isProduction) {
      console.error("ZodError:", JSON.stringify(err.errors, null, 2));
    }

    const errors = Array.isArray(err.errors) && err.errors.length > 0
      ? err.errors.map((error) => ({
        field: Array.isArray(error.path) && error.path.length > 0
          ? error.path.join(".")
          : error.path || "unknown",
        message: error.message || "Erro de validação",
      }))
      : [{ field: "unknown", message: err.message || "Erro de validação" }];

    return res.status(400).json({
      error: "Dados de entrada inválidos",
      details: errors,
    });
  }

  if (err instanceof Error) {
    if (isProduction) {
      console.error("Erro:", err.message);
    } else {
      console.error("Erro:", err.message);
      console.error("Stack:", err.stack);
    }

    return res.status(400).json({
      error: isProduction ? "Erro ao processar requisição" : err.message,
    });
  }

  if (!isProduction) {
    console.error("Erro desconhecido:", err);
  }
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error.",
  });
}

