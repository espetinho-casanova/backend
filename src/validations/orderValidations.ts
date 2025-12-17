import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.number().int().positive("ID do produto deve ser um número positivo"),
  amount: z.number().int().positive("Quantidade deve ser um número positivo"),
  meatChoiceId: z.number().int().positive().optional(),
  meatPoint: z.enum(["mal", ". pra mal", "ao ponto", ". pra bem", "bem"]).optional(),
  removals: z.array(z.string()).optional(),
  additions: z.array(z.number().int().positive()).optional(),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  table: z.string().min(1, "Mesa/Nome é obrigatório"),
  status: z.number().int().min(0).max(3).optional(),
  draft: z.boolean().optional(),
  items: z.array(orderItemSchema).optional(),
});

export const addItemSchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  productId: z.number().int().positive("ID do produto deve ser um número positivo"),
  amount: z.number().int().positive("Quantidade deve ser um número positivo"),
  meatChoiceId: z.number().int().positive().optional(),
  meatPoint: z.enum(["mal", ". pra mal", "ao ponto", ". pra bem", "bem"]).optional(),
  removals: z.array(z.string()).optional(),
  additions: z.array(z.number().int().positive()).optional(),
  notes: z.string().optional(),
});

export const removeItemSchema = z.object({
  orderItemId: z.string().uuid("ID do item do pedido deve ser um UUID válido"),
});

export const updateOrderSchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  table: z.string().min(1).optional(),
});

export const updateOrderItemsSchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  items: z.array(orderItemSchema).min(1, "Deve ter pelo menos um item"),
});

