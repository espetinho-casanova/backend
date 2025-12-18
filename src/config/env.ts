import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string({ message: "DATABASE_URL é obrigatória" })
    .url("DATABASE_URL deve ser uma URL válida (ex: postgresql://user:password@localhost:5432/dbname)"),

  JWT_SECRET: z
    .string({ message: "JWT_SECRET é obrigatória" })
    .min(8, "JWT_SECRET deve ter pelo menos 8 caracteres para segurança"),

  CORS_ORIGIN: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const origins = val.split(',').map(origin => origin.trim());
        return origins.every(origin => {
          try {
            new URL(origin);
            return true;
          } catch {
            return false;
          }
        });
      },
      {
        message: "CORS_ORIGIN deve conter URLs válidas separadas por vírgula (ex: http://localhost:3000,http://192.168.1.100:3000)"
      }
    )
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => {
        const path = err.path.join(".");
        return `  - ${path}: ${err.message}`;
      }).join("\n");

      throw new Error(
        `❌ Variáveis de ambiente inválidas ou faltando:\n${missingVars}\n\n` +
        `Por favor, verifique seu arquivo .env e certifique-se de que todas as variáveis estão configuradas corretamente.`
      );
    }
    throw error;
  }
}

export const env = validateEnv();

