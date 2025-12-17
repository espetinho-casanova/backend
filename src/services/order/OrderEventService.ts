// Serviço para gerenciar eventos SSE de pedidos
type SSEConnection = {
  id: string;
  response: any; // Express Response
};

class OrderEventService {
  private connections: SSEConnection[] = [];

  // Adicionar nova conexão SSE
  addConnection(connectionId: string, response: any) {
    // Configurar headers para SSE
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    response.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
    response.setHeader("Access-Control-Allow-Credentials", "true");

    // Enviar mensagem inicial para manter conexão viva
    response.write(": connected\n\n");

    this.connections.push({
      id: connectionId,
      response,
    });

    // Remover conexão quando cliente desconectar
    response.on("close", () => {
      this.removeConnection(connectionId);
    });
  }

  // Remover conexão
  removeConnection(connectionId: string) {
    this.connections = this.connections.filter((conn) => conn.id !== connectionId);
  }

  // Enviar atualização para todos os clientes conectados
  broadcast(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    this.connections.forEach((connection) => {
      try {
        connection.response.write(message);
      } catch (error) {
        // Se houver erro ao escrever, remover a conexão
        this.removeConnection(connection.id);
      }
    });
  }

  // Enviar atualização de pedidos
  notifyOrdersUpdate(orders: any[]) {
    this.broadcast("orders-update", { orders });
  }
}

// Singleton
export const orderEventService = new OrderEventService();

