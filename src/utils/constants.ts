// Enums e constantes para evitar magic numbers

export enum OrderStatus {
  DRAFT = 0,
  IN_PREPARATION = 1,
  READY = 2,
  FINISHED = 3,
}

export const DEFAULT_STOCK = 999;

export const POLLING_INTERVAL_MS = 10000; // 10 segundos

export const SSE_HEARTBEAT_INTERVAL_MS = 30000; // 30 segundos

