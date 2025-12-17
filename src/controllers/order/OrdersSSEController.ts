import { Request, Response } from "express";
import { orderEventService } from "../../services/order/OrderEventService";
import { ListOrdersService } from "../../services/order/ListOrdersService";
import { SSE_HEARTBEAT_INTERVAL_MS } from "../../utils/constants";

class OrdersSSEController {
  async handle(req: Request, res: Response) {
    const connectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Adicionar conexão SSE
    orderEventService.addConnection(connectionId, res);

    // Enviar lista inicial de pedidos
    try {
      const listOrdersService = new ListOrdersService();
      const orders = await listOrdersService.execute();
      orderEventService.broadcast("orders-update", { orders });
    } catch (error) {
      // Erro silencioso - não quebrar conexão SSE por erro na busca inicial
      // Os pedidos serão enviados na próxima atualização
    }

    // Manter conexão viva com heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch (error) {
        clearInterval(heartbeat);
        orderEventService.removeConnection(connectionId);
      }
    }, SSE_HEARTBEAT_INTERVAL_MS);

    // Limpar heartbeat quando conexão fechar
    res.on("close", () => {
      clearInterval(heartbeat);
      orderEventService.removeConnection(connectionId);
    });
  }
}

export { OrdersSSEController };

