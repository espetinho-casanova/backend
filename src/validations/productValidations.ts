import { z } from "zod";

// Schema para multipart/form-data (dados vêm como strings)
export const createProductSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Preço deve ser um número positivo"),
  description: z.string().optional(),
  categoryId: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0;
  }, "ID da categoria deve ser um número positivo"),
  ingredientIds: z.string().optional(),
  addonIds: z.string().optional(),
  canBeUsedInSandwich: z.string().optional(),
  hasMeatPoint: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório").optional(),
  price: z.number().positive("Preço deve ser um número positivo").optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive("ID da categoria deve ser um número positivo").optional(),
  ingredientIds: z.array(z.number().int().positive()).optional(),
  addonIds: z.array(z.number().int().positive()).optional(),
  canBeUsedInSandwich: z.boolean().optional(),
  hasMeatPoint: z.boolean().optional(),
});

