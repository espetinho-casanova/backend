/**
 * Script para resetar o estoque diariamente às 16:30 (4:30 PM)
 * 
 * Executar via cron job ou agendador de tarefas:
 * 
 * Linux/Mac (cron):
 * 30 16 * * * cd /path/to/backend && npm run reset-stock
 * 
 * Windows (Task Scheduler):
 * Criar tarefa agendada para executar às 16:30: npm run reset-stock
 * 
 * Ou executar manualmente:
 * npm run reset-stock
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
    console.log("🔄 Iniciando reset de estoque às 16:30...");

    // Importar constante de estoque padrão
    const { DEFAULT_STOCK } = await import("../utils/constants");
    
    // Reseta o estoque de todos os produtos para o valor padrão (ingredientes não têm estoque)
    const productsResult = await prisma.product.updateMany({
        data: {
            stock: DEFAULT_STOCK,
        },
    });

    // Reabilita todos os produtos que estavam desabilitados por falta de estoque
    const enabledProducts = await prisma.product.updateMany({
        where: {
            available: false,
        },
        data: {
            available: true,
        },
    });

    console.log(`✅ ${enabledProducts.count} produto(s) reabilitado(s)`);
    console.log("🎉 Reset de estoque concluído com sucesso!");

    await prisma.$disconnect();
    process.exit(0);
} catch (error) {
    console.error("❌ Erro ao resetar estoque:", error);
    await prisma.$disconnect();
    process.exit(1);
}
