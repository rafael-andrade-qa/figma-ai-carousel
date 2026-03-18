import { randomUUID } from "crypto";

export function createGenerationId() {
  return `gen_${randomUUID()}`;
}

export function createRefundSourceId(generationId: string) {
  return `refund_${generationId}`;
}